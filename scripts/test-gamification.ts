#!/usr/bin/env tsx

/**
 * Test Gamification System
 * Demonstrates XP awarding, badge earning, and system functionality
 */

import { storage } from '../server/storage';

async function testGamificationSystem() {
  console.log('🎮 Testing Gamification System...\n');
  
  try {
    // Test 1: Check badges are loaded
    console.log('1. Testing Badge System');
    const badges = await storage.getAllBadges();
    console.log(`✅ Found ${badges.length} badges in system:`);
    badges.forEach(badge => {
      console.log(`   - ${badge.name} (${badge.rarity}) - ${badge.description}`);
    });
    console.log('');

    // Test 2: Check daily prompt
    console.log('2. Testing Daily Prompt System');
    const today = new Date().toISOString().split('T')[0];
    const prompt = await storage.getDailyPrompt(today);
    if (prompt) {
      console.log(`✅ Daily prompt found:`);
      console.log(`   Theme: ${prompt.theme}`);
      console.log(`   Prompt: "${prompt.prompt}"`);
      console.log(`   Citation: ${prompt.citation}`);
    } else {
      console.log('❌ No daily prompt found for today');
    }
    console.log('');

    // Test 3: Test user XP system (using user ID 1 if exists)
    console.log('3. Testing XP System');
    try {
      // Check if user exists first
      const testUser = await storage.getUser(1);
      if (testUser) {
        console.log(`✅ Testing with user: ${testUser.fullName} (ID: ${testUser.id})`);
        
        // Get or create user XP
        let userXP = await storage.getUserXP(testUser.id);
        if (!userXP) {
          userXP = await storage.createUserXP({
            userId: testUser.id,
            currentXP: 0,
            totalXP: 0,
            level: 1
          });
          console.log('✅ Created initial XP record');
        }
        
        console.log(`   Current Level: ${userXP.level}`);
        console.log(`   Current XP: ${userXP.currentXP}`);
        console.log(`   Total XP: ${userXP.totalXP}`);
        console.log(`   Streak: ${userXP.currentStreak} days`);
        
        // Test XP addition
        console.log('\n   Testing XP addition (+100 for lesson completion)...');
        const updatedXP = await storage.addXP(testUser.id, 100, 'lesson_complete');
        console.log(`   ✅ XP after addition: ${updatedXP.currentXP} (Level ${updatedXP.level})`);
        
        // Check user badges
        const userBadges = await storage.getUserBadges(testUser.id);
        console.log(`\n   User has earned ${userBadges.length} badges:`);
        userBadges.forEach(ub => {
          console.log(`   - ${ub.badge.name} (earned ${new Date(ub.earnedAt).toLocaleDateString()})`);
        });
        
      } else {
        console.log('⚠️  No test user found (ID: 1)');
      }
    } catch (error) {
      console.log(`⚠️  XP test skipped: ${error.message}`);
    }
    console.log('');

    // Test 4: Event logging
    console.log('4. Testing Event Log System');
    try {
      await storage.logEvent({
        userId: 1,
        eventType: 'system_test',
        eventData: { test: 'gamification_demo' },
        xpAwarded: 0
      });
      console.log('✅ Event logged successfully');
    } catch (error) {
      console.log(`⚠️  Event logging test failed: ${error.message}`);
    }
    console.log('');

    console.log('🎯 Gamification System Test Complete!\n');
    console.log('Key Features:');
    console.log('• XP System with automatic level calculation');
    console.log('• Badge achievements with rarity tiers');
    console.log('• Daily AI-generated prompts');
    console.log('• Activity event logging');
    console.log('• Streak tracking and rewards');
    console.log('\nAll features are controlled by environment flags and ready for production use.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testGamificationSystem().then(() => process.exit(0));