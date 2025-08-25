#!/usr/bin/env tsx

/**
 * Challenge Seed Script for The AM Project
 * 
 * Usage: npx tsx scripts/seed-challenges.ts
 * 
 * Seeds the database with production-ready challenges according to 
 * The AM Project brand guidelines and challenge specifications.
 */

import { db } from "../server/db";
import { challenges, type InsertChallenge } from "../shared/schema";

const challengeSeeds: InsertChallenge[] = [
  {
    text: "Reach out to someone you've lost touch with.",
    description: "Reconnect. Ask how life has really been for them—listen without agenda.",
    stage: "connection",
    tags: ["connection", "outreach"]
  },
  {
    text: "Take a cold shower. Commit, even if it's uncomfortable.",
    description: "Notice your thoughts as you do it. Don't flinch away from discomfort.",
    stage: "discipline",
    tags: ["discipline", "discomfort"]
  },
  {
    text: "Turn off all screens an hour before bed.",
    description: "Spend the last hour of your day with a book or in reflection.",
    stage: "self-control",
    tags: ["habits", "focus"]
  },
  {
    text: "Ask a friend or family member for honest feedback.",
    description: "Let them know you want to grow. Don't defend—just listen.",
    stage: "accountability",
    tags: ["feedback", "growth"]
  },
  {
    text: "Leave your phone at home for an hour-long walk.",
    description: "Walk with just your thoughts. Notice what comes up.",
    stage: "presence",
    tags: ["presence", "disconnection"]
  },
  {
    text: "Write a short note of thanks to someone who's impacted your life.",
    description: "Be specific. Let them know exactly what they did and why it mattered.",
    stage: "gratitude",
    tags: ["gratitude", "connection"]
  },
  {
    text: "Finish something you've been putting off for more than a week.",
    description: "Big or small. Notice the feeling after you finish.",
    stage: "completion",
    tags: ["action", "follow-through"]
  },
  {
    text: "Eat a meal with zero distractions.",
    description: "No TV, phone, or music. Just eat. Pay attention to the experience.",
    stage: "mindfulness",
    tags: ["mindfulness", "habits"]
  },
  {
    text: "Do a physical workout today—no matter how short.",
    description: "Prove to yourself you can show up. Consistency beats intensity.",
    stage: "discipline",
    tags: ["fitness", "discipline"]
  },
  {
    text: "Reflect on a recent mistake. Write what you would do differently.",
    description: "No excuses. Own it, learn from it, and let it go.",
    stage: "reflection",
    tags: ["reflection", "growth"]
  },
  {
    text: "Have a difficult conversation you've been avoiding.",
    description: "Approach it with honesty and respect. Don't delay any longer.",
    stage: "courage",
    tags: ["courage", "communication"]
  },
  {
    text: "Spend 20 minutes in complete silence.",
    description: "No inputs. Just you and your thoughts. Notice the resistance.",
    stage: "stillness",
    tags: ["meditation", "presence"]
  },
  {
    text: "Do something kind for someone without them knowing it was you.",
    description: "No recognition needed. Just the act itself.",
    stage: "service",
    tags: ["service", "humility"]
  },
  {
    text: "Call your parents or someone who raised you.",
    description: "Ask them about their life, not yours. Really listen.",
    stage: "connection",
    tags: ["family", "connection"]
  },
  {
    text: "Clean and organize one area of your living space completely.",
    description: "Start small. Notice how it affects your mindset.",
    stage: "order",
    tags: ["organization", "discipline"]
  }
];

async function seedChallenges() {
  try {
    console.log("🌱 Seeding challenges...");
    
    // Check if challenges already exist
    const existingChallenges = await db.select().from(challenges);
    if (existingChallenges.length > 0) {
      console.log(`📋 Found ${existingChallenges.length} existing challenges. Skipping seed.`);
      return;
    }
    
    // Insert challenges
    const insertedChallenges = await db
      .insert(challenges)
      .values(challengeSeeds)
      .returning();
    
    console.log(`✅ Successfully seeded ${insertedChallenges.length} challenges`);
    
    // Display seeded challenges
    console.log("\n📋 Seeded Challenges:");
    insertedChallenges.forEach((challenge, index) => {
      console.log(`${index + 1}. [${challenge.stage}] ${challenge.text}`);
    });
    
  } catch (error) {
    console.error("❌ Error seeding challenges:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedChallenges()
    .then(() => {
      console.log("\n🎯 Challenge seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

export { seedChallenges };