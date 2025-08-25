#!/usr/bin/env tsx

/**
 * Seed Core Badges
 * Seeds the 10 core badges for the gamification system
 */

import { db } from '../server/db';
import { badges } from '../shared/schema';

const coreBadges = [
  {
    name: "First Step",
    description: "Complete your first lesson",
    icon: "👟",
    criteria: { type: "lesson_complete", count: 1 },
    xpReward: 50,
    rarity: "common" as const
  },
  {
    name: "Scholar",
    description: "Complete 5 lessons",
    icon: "📚",
    criteria: { type: "lesson_complete", count: 5 },
    xpReward: 100,
    rarity: "common" as const
  },
  {
    name: "Dedicated",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    criteria: { type: "streak", count: 7 },
    xpReward: 200,
    rarity: "rare" as const
  },
  {
    name: "Challenger",
    description: "Complete 10 daily challenges",
    icon: "⚡",
    criteria: { type: "challenge_complete", count: 10 },
    xpReward: 150,
    rarity: "common" as const
  },
  {
    name: "Scenario Master",
    description: "Complete 5 weekly scenarios",
    icon: "🎭",
    criteria: { type: "scenario_complete", count: 5 },
    xpReward: 250,
    rarity: "rare" as const
  },
  {
    name: "Reflective Mind",
    description: "Write 20 journal entries",
    icon: "🧠",
    criteria: { type: "journal_entry", count: 20 },
    xpReward: 175,
    rarity: "common" as const
  },
  {
    name: "Consistent Growth",
    description: "Complete weekly reflections for 4 weeks",
    icon: "📈",
    criteria: { type: "weekly_reflection", count: 4 },
    xpReward: 300,
    rarity: "rare" as const
  },
  {
    name: "Level Up",
    description: "Reach level 5",
    icon: "⬆️",
    criteria: { type: "level", count: 5 },
    xpReward: 500,
    rarity: "epic" as const
  },
  {
    name: "Milestone Crusher",
    description: "Reach 1000 total XP",
    icon: "💪",
    criteria: { type: "total_xp", count: 1000 },
    xpReward: 100,
    rarity: "epic" as const
  },
  {
    name: "AM Legend",
    description: "Reach level 10 and maintain 30-day streak",
    icon: "👑",
    criteria: { type: "compound", level: 10, streak: 30 },
    xpReward: 1000,
    rarity: "legendary" as const
  }
];

async function seedBadges() {
  console.log('🏆 Seeding Core Badges...');
  
  try {
    for (const badge of coreBadges) {
      await db.insert(badges).values(badge).onConflictDoNothing();
      console.log(`✅ Seeded badge: ${badge.name}`);
    }
    
    const count = await db.select().from(badges);
    console.log(`🎯 Total badges in system: ${count.length}`);
    
  } catch (error) {
    console.error('❌ Badge seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
seedBadges().then(() => process.exit(0));

export { seedBadges };