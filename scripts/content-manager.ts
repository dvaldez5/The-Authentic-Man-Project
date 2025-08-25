#!/usr/bin/env tsx

/**
 * Interactive Content Management Tool
 * 
 * Usage: npx tsx scripts/content-manager.ts
 * 
 * This tool provides an interactive interface for:
 * - Uploading new courses from JSON files
 * - Validating course data structure
 * - Managing existing course content
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { db } from '../server/db';
import { learningCourse, learningLesson } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface CourseData {
  course: {
    title: string;
    description: string;
    stages: string[];
  };
  lessons: {
    order: number;
    stage: string;
    title: string;
    content: string;
    quiz: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }[];
  }[];
}

async function validateCourseData(courseData: CourseData): Promise<string[]> {
  const errors: string[] = [];
  
  // Validate course structure
  if (!courseData.course) {
    errors.push('Missing course object');
    return errors;
  }
  
  if (!courseData.lessons) {
    errors.push('Missing lessons array');
    return errors;
  }
  
  // Validate course properties
  if (!courseData.course.title?.trim()) {
    errors.push('Course title is required');
  }
  
  if (!courseData.course.description?.trim()) {
    errors.push('Course description is required');
  }
  
  if (!Array.isArray(courseData.course.stages) || courseData.course.stages.length !== 5) {
    errors.push('Course must have exactly 5 stages');
  }
  
  // Validate lessons
  if (!Array.isArray(courseData.lessons) || courseData.lessons.length !== 5) {
    errors.push('Course must have exactly 5 lessons');
  }
  
  // Check each lesson
  courseData.lessons.forEach((lesson, index) => {
    const lessonNum = index + 1;
    
    if (lesson.order !== lessonNum) {
      errors.push(`Lesson ${lessonNum}: order should be ${lessonNum}, got ${lesson.order}`);
    }
    
    if (!courseData.course.stages.includes(lesson.stage)) {
      errors.push(`Lesson ${lessonNum}: stage "${lesson.stage}" not found in course stages`);
    }
    
    if (!lesson.title?.trim()) {
      errors.push(`Lesson ${lessonNum}: title is required`);
    }
    
    if (!lesson.content?.trim()) {
      errors.push(`Lesson ${lessonNum}: content is required`);
    }
    
    if (!Array.isArray(lesson.quiz) || lesson.quiz.length === 0) {
      errors.push(`Lesson ${lessonNum}: must have at least 1 quiz question`);
    }
    
    lesson.quiz.forEach((question, qIndex) => {
      if (!question.question?.trim()) {
        errors.push(`Lesson ${lessonNum}, Quiz ${qIndex + 1}: question text is required`);
      }
      
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        errors.push(`Lesson ${lessonNum}, Quiz ${qIndex + 1}: must have exactly 4 options`);
      }
      
      if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer > 3) {
        errors.push(`Lesson ${lessonNum}, Quiz ${qIndex + 1}: correctAnswer must be 0, 1, 2, or 3`);
      }
      
      if (!question.explanation?.trim()) {
        errors.push(`Lesson ${lessonNum}, Quiz ${qIndex + 1}: explanation is required`);
      }
    });
  });
  
  return errors;
}

async function uploadCourse(filePath: string): Promise<void> {
  console.log(`\n📁 Loading course data from: ${filePath}`);
  
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const fileContent = readFileSync(filePath, 'utf-8');
  let courseData: CourseData;
  
  try {
    courseData = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error.message}`);
  }
  
  console.log('🔍 Validating course data...');
  const errors = await validateCourseData(courseData);
  
  if (errors.length > 0) {
    console.error('\n❌ Validation errors found:');
    errors.forEach(error => console.error(`  • ${error}`));
    throw new Error('Course data validation failed');
  }
  
  console.log('✅ Course data validation passed');
  
  // Check for duplicate course title
  const existingCourse = await db
    .select()
    .from(learningCourse)
    .where(eq(learningCourse.title, courseData.course.title))
    .limit(1);
  
  if (existingCourse.length > 0) {
    throw new Error(`Course with title "${courseData.course.title}" already exists`);
  }
  
  console.log(`\n📚 Creating course: "${courseData.course.title}"`);
  
  // Create course
  const [course] = await db
    .insert(learningCourse)
    .values({
      title: courseData.course.title,
      description: courseData.course.description,
      stages: courseData.course.stages,
      published: true
    })
    .returning();
  
  console.log(`✅ Course created with ID: ${course.id}`);
  
  // Create lessons
  console.log('\n📝 Creating lessons...');
  for (const lessonData of courseData.lessons) {
    await db
      .insert(learningLesson)
      .values({
        courseId: course.id,
        order: lessonData.order,
        stage: lessonData.stage,
        title: lessonData.title,
        content: lessonData.content,
        quiz: lessonData.quiz,
        published: true
      });
    
    console.log(`  ✅ Lesson ${lessonData.order}: "${lessonData.title}"`);
  }
  
  console.log('\n🎉 Course upload completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   Course: ${courseData.course.title}`);
  console.log(`   Lessons: ${courseData.lessons.length}`);
  console.log(`   Stages: ${courseData.course.stages.join(' → ')}`);
  console.log(`   Course ID: ${course.id}`);
}

async function listCourses(): Promise<void> {
  console.log('\n📋 Existing courses:');
  
  const courses = await db
    .select()
    .from(learningCourse)
    .orderBy(learningCourse.id);
  
  if (courses.length === 0) {
    console.log('   No courses found');
    return;
  }
  
  for (const course of courses) {
    const lessons = await db
      .select()
      .from(learningLesson)
      .where(eq(learningLesson.courseId, course.id));
    
    console.log(`   ${course.id}. ${course.title} (${lessons.length} lessons)`);
  }
}

async function createTemplate(): Promise<void> {
  const templatePath = 'new-course-template.json';
  
  if (existsSync(templatePath)) {
    console.log(`\n⚠️  Template already exists: ${templatePath}`);
    return;
  }
  
  const template = {
    course: {
      title: "New Course Title",
      description: "A comprehensive description of what this course teaches and the transformation it provides.",
      stages: ["Foundation", "Building", "Testing", "Integration", "Mastery"]
    },
    lessons: [
      {
        order: 1,
        stage: "Foundation",
        title: "Setting the Foundation",
        content: "## Welcome to Your Journey\n\nThis lesson establishes the foundational concepts...\n\n### Key Concepts\n- Important principle 1\n- Important principle 2\n\n### Reflection\n- What resonates with you?\n- How will you apply this?",
        quiz: [
          {
            question: "What is the main focus of this foundation lesson?",
            options: [
              "Building confidence",
              "Learning techniques", 
              "Understanding principles",
              "Taking action"
            ],
            correctAnswer: 2,
            explanation: "This lesson focuses on understanding the core principles that everything else builds upon."
          }
        ]
      },
      {
        order: 2,
        stage: "Building",
        title: "Building Your Skills",
        content: "## Developing Your Capabilities\n\nNow we build upon the foundation...",
        quiz: [
          {
            question: "How does this lesson connect to the foundation?",
            options: ["It doesn't", "It expands on principles", "It replaces them", "It questions them"],
            correctAnswer: 1,
            explanation: "This lesson expands on the foundational principles with practical application."
          }
        ]
      },
      {
        order: 3,
        stage: "Testing",
        title: "Testing Your Understanding",
        content: "## Putting Knowledge to the Test\n\nTime to test what you've learned...",
        quiz: [
          {
            question: "What is the purpose of testing your understanding?",
            options: ["To judge yourself", "To find gaps", "To impress others", "To finish quickly"],
            correctAnswer: 1,
            explanation: "Testing helps identify gaps in understanding so you can strengthen your knowledge."
          }
        ]
      },
      {
        order: 4,
        stage: "Integration",
        title: "Integrating Into Daily Life",
        content: "## Making It Part of You\n\nIntegration is where real transformation happens...",
        quiz: [
          {
            question: "What makes integration crucial for transformation?",
            options: ["It's required", "It creates lasting change", "It impresses others", "It finishes the course"],
            correctAnswer: 1,
            explanation: "Integration creates lasting change by making new patterns part of your daily life."
          }
        ]
      },
      {
        order: 5,
        stage: "Mastery",
        title: "Achieving Mastery",
        content: "## The Journey to Mastery\n\nMastery is not a destination but a way of being...",
        quiz: [
          {
            question: "What characterizes true mastery?",
            options: ["Perfection", "Continuous growth", "Knowing everything", "Never failing"],
            correctAnswer: 1,
            explanation: "True mastery is characterized by continuous growth and refinement, not perfection."
          }
        ]
      }
    ]
  };
  
  writeFileSync(templatePath, JSON.stringify(template, null, 2));
  console.log(`\n📄 Template created: ${templatePath}`);
  console.log('   Edit this file with your course content and run:');
  console.log(`   npx tsx scripts/content-manager.ts upload ${templatePath}`);
}

// Main execution
async function main() {
  const command = process.argv[2];
  const filePath = process.argv[3];
  
  try {
    switch (command) {
      case 'upload':
        if (!filePath) {
          console.error('Usage: npx tsx scripts/content-manager.ts upload <course-file.json>');
          process.exit(1);
        }
        await uploadCourse(filePath);
        break;
        
      case 'list':
        await listCourses();
        break;
        
      case 'template':
        await createTemplate();
        break;
        
      default:
        console.log('\n🎓 AM Learning Content Manager\n');
        console.log('Commands:');
        console.log('  upload <file.json>  - Upload a new course from JSON file');
        console.log('  list               - List all existing courses');
        console.log('  template           - Create a new course template');
        console.log('\nExamples:');
        console.log('  npx tsx scripts/content-manager.ts template');
        console.log('  npx tsx scripts/content-manager.ts upload my-course.json');
        console.log('  npx tsx scripts/content-manager.ts list');
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();