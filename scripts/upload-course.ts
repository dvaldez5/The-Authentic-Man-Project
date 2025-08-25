#!/usr/bin/env tsx

/**
 * Course Content Upload Script
 * 
 * Usage: npx tsx scripts/upload-course.ts course-data.json
 * 
 * Expected JSON format:
 * {
 *   "course": {
 *     "title": "Course Title",
 *     "description": "Course description",
 *     "stages": ["Stage1", "Stage2", "Stage3", "Stage4", "Stage5"]
 *   },
 *   "lessons": [
 *     {
 *       "order": 1,
 *       "stage": "Stage1",
 *       "title": "Lesson Title",
 *       "content": "Lesson content in markdown format...",
 *       "quiz": [
 *         {
 *           "question": "Quiz question?",
 *           "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
 *           "correctAnswer": 0,
 *           "explanation": "Why this answer is correct"
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../server/db';
import { learningCourse, learningLesson } from '../shared/schema';

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

async function uploadCourse(filePath: string) {
  try {
    console.log(`Loading course data from: ${filePath}`);
    
    const fileContent = readFileSync(filePath, 'utf-8');
    const courseData: CourseData = JSON.parse(fileContent);
    
    // Validate course data
    if (!courseData.course || !courseData.lessons) {
      throw new Error('Invalid course data format. Must contain "course" and "lessons" properties.');
    }
    
    if (courseData.course.stages.length !== 5) {
      throw new Error('Course must have exactly 5 stages.');
    }
    
    if (courseData.lessons.length !== 5) {
      throw new Error('Course must have exactly 5 lessons.');
    }
    
    console.log(`Creating course: ${courseData.course.title}`);
    
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
    
    console.log(`Course created with ID: ${course.id}`);
    
    // Create lessons
    for (const lessonData of courseData.lessons) {
      console.log(`Creating lesson ${lessonData.order}: ${lessonData.title}`);
      
      // Validate stage exists in course
      if (!courseData.course.stages.includes(lessonData.stage)) {
        throw new Error(`Lesson stage "${lessonData.stage}" not found in course stages.`);
      }
      
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
      
      console.log(`✓ Lesson ${lessonData.order} created successfully`);
    }
    
    console.log('\n🎉 Course upload completed successfully!');
    console.log(`Course: ${courseData.course.title}`);
    console.log(`Lessons: ${courseData.lessons.length}`);
    console.log(`Course ID: ${course.id}`);
    
  } catch (error) {
    console.error('❌ Course upload failed:', error.message);
    process.exit(1);
  }
}

// Main execution
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: npx tsx scripts/upload-course.ts <course-data.json>');
  process.exit(1);
}

const fullPath = join(process.cwd(), filePath);
uploadCourse(fullPath).then(() => {
  console.log('Upload process completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Upload process failed:', error);
  process.exit(1);
});