#!/usr/bin/env tsx

/**
 * Bootstrap Gamification Schema
 * Creates all new tables for the gamification system
 */

import { db } from '../server/db';

async function bootstrapGamification() {
  console.log('🎮 Bootstrapping Gamification Schema...');
  
  try {
    // Add evidence_byte column to learning_lesson
    await db.execute(`
      ALTER TABLE learning_lesson 
      ADD COLUMN IF NOT EXISTS evidence_byte TEXT;
    `);

    // Add ignored_tags column to users
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ignored_tags JSONB DEFAULT '[]';
    `);

    // Add tags column to scenarios
    await db.execute(`
      ALTER TABLE scenarios 
      ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
    `);

    // Add tags column to challenges
    await db.execute(`
      ALTER TABLE challenges 
      ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
    `);

    // Create user_xp table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_xp (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        current_xp INTEGER DEFAULT 0 NOT NULL,
        total_xp INTEGER DEFAULT 0 NOT NULL,
        level INTEGER DEFAULT 1 NOT NULL,
        current_streak INTEGER DEFAULT 0 NOT NULL,
        longest_streak INTEGER DEFAULT 0 NOT NULL,
        last_activity_date DATE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create badges table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        criteria JSONB NOT NULL,
        xp_reward INTEGER DEFAULT 0 NOT NULL,
        rarity TEXT DEFAULT 'common' NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create user_badges table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create user_scenarios table for weekly persistence
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_scenarios (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scenario_id INTEGER NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
        week_start_date DATE NOT NULL,
        assigned_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create event_log table for analytics
    await db.execute(`
      CREATE TABLE IF NOT EXISTS event_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        event_data JSONB,
        xp_awarded INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create daily_prompts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS daily_prompts (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        prompt TEXT NOT NULL,
        theme TEXT NOT NULL,
        citation TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create indexes for performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON user_xp(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_scenarios_user_week ON user_scenarios(user_id, week_start_date);
      CREATE INDEX IF NOT EXISTS idx_event_log_user_id ON event_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_event_log_created_at ON event_log(created_at);
      CREATE INDEX IF NOT EXISTS idx_daily_prompts_date ON daily_prompts(date);
    `);

    console.log('✅ Gamification schema bootstrap complete!');
    
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
}

// Run if called directly
bootstrapGamification().then(() => process.exit(0));

export { bootstrapGamification };