#!/usr/bin/env tsx

/**
 * Generate Daily Prompt using OpenAI
 * Creates evidence-based daily journal prompts
 */

import OpenAI from "openai";
import { storage } from '../server/storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const themes = [
  "resilience",
  "discipline", 
  "purpose",
  "relationships",
  "leadership",
  "balance"
];

async function generateDailyPrompt() {
  console.log('🤖 Generating daily prompt...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if prompt already exists for today
    const existing = await storage.getDailyPrompt(today);
    if (existing) {
      console.log('✅ Daily prompt already exists for today');
      return;
    }

    // Select random theme
    const theme = themes[Math.floor(Math.random() * themes.length)];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `Write a single-sentence journaling question (≤25 words) about ${theme} for masculine development. Include a brief study citation (Author YYYY). Format: "Question text" - Author YYYY`
      }],
      max_tokens: 100,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse prompt and citation
    const parts = content.split(' - ');
    const prompt = parts[0].replace(/"/g, '');
    const citation = parts[1] || `Research ${new Date().getFullYear()}`;

    // Save to database
    await storage.createDailyPrompt({
      date: today,
      prompt,
      theme,
      citation
    });

    console.log(`✅ Generated daily prompt: "${prompt}"`);
    console.log(`📚 Theme: ${theme} | Citation: ${citation}`);
    
  } catch (error) {
    console.error('❌ Failed to generate daily prompt:', error);
    process.exit(1);
  }
}

// Run if called directly
generateDailyPrompt().then(() => process.exit(0));

export { generateDailyPrompt };