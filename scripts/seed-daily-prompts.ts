import { db } from "../server/db";
import { dailyPrompts } from "../shared/schema";
import type { InsertDailyPrompt } from "../shared/schema";

// Daily prompts for AM Project - Masculine Development
const promptSeeds: Omit<InsertDailyPrompt, 'date'>[] = [
  {
    prompt: "What's one area where you've been playing it safe? What would courage look like there?",
    theme: "courage"
  },
  {
    prompt: "When did you last truly push yourself physically? What held you back from going further?",
    theme: "discipline"
  },
  {
    prompt: "Who in your life needs you to step up right now? What's stopping you?",
    theme: "leadership"
  },
  {
    prompt: "What promise to yourself have you broken repeatedly? Why do you keep breaking it?",
    theme: "integrity"
  },
  {
    prompt: "Where are you seeking comfort when you should be seeking growth?",
    theme: "growth"
  },
  {
    prompt: "What fear is disguised as 'being practical' in your life?",
    theme: "courage"
  },
  {
    prompt: "When did you last admit you were wrong? How did it feel?",
    theme: "humility"
  },
  {
    prompt: "What habit is slowly weakening you? Name it honestly.",
    theme: "discipline"
  },
  {
    prompt: "Who are you trying to impress? What would happen if you stopped?",
    theme: "authenticity"
  },
  {
    prompt: "What hard conversation are you avoiding? Write the first sentence you'd say.",
    theme: "courage"
  },
  {
    prompt: "Where is pride blocking your progress? Be specific.",
    theme: "humility"
  },
  {
    prompt: "What would your father say about the man you've become?",
    theme: "legacy"
  },
  {
    prompt: "When do you feel most alive? Why don't you chase that feeling more?",
    theme: "purpose"
  },
  {
    prompt: "What excuse do you use most often? What truth does it hide?",
    theme: "accountability"
  },
  {
    prompt: "Where are you still a boy pretending to be a man?",
    theme: "maturity"
  },
  {
    prompt: "What sacrifice are you unwilling to make for your growth? Why?",
    theme: "commitment"
  },
  {
    prompt: "Who depends on you to be strong? Are you failing them?",
    theme: "responsibility"
  },
  {
    prompt: "What part of your past still controls your present?",
    theme: "healing"
  },
  {
    prompt: "When did you last do something that scared you? What did you learn?",
    theme: "courage"
  },
  {
    prompt: "What weakness are you hiding behind your strengths?",
    theme: "self-awareness"
  },
  {
    prompt: "If you died tomorrow, what would be left undone?",
    theme: "purpose"
  },
  {
    prompt: "What are you tolerating that you shouldn't?",
    theme: "standards"
  },
  {
    prompt: "Where is comfort killing your potential?",
    theme: "growth"
  },
  {
    prompt: "What lie do you tell yourself most often?",
    theme: "truth"
  },
  {
    prompt: "Who needs to hear 'I'm sorry' from you?",
    theme: "repair"
  },
  {
    prompt: "What battle are you fighting that no one knows about?",
    theme: "vulnerability"
  },
  {
    prompt: "Where are you playing not to lose instead of playing to win?",
    theme: "courage"
  },
  {
    prompt: "What would the best version of you do today?",
    theme: "vision"
  },
  {
    prompt: "What pain are you avoiding that holds the key to your growth?",
    theme: "healing"
  },
  {
    prompt: "Who are you becoming when no one's watching?",
    theme: "character"
  }
];

async function seedDailyPrompts() {
  console.log("🌱 Starting daily prompts seed...");
  
  try {
    // Generate prompts for the next 30 days
    const today = new Date();
    const prompts: InsertDailyPrompt[] = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      // Cycle through prompts
      const promptIndex = i % promptSeeds.length;
      const prompt = promptSeeds[promptIndex];
      
      prompts.push({
        ...prompt,
        date: date
      });
    }
    
    // Insert prompts (ignore conflicts for existing dates)
    for (const prompt of prompts) {
      try {
        await db.insert(dailyPrompts).values(prompt);
        console.log(`✅ Added prompt for ${prompt.date.toDateString()}`);
      } catch (error: any) {
        if (error.message.includes('duplicate')) {
          console.log(`⏭️  Prompt already exists for ${prompt.date.toDateString()}`);
        } else {
          console.error(`❌ Failed to add prompt for ${prompt.date.toDateString()}:`, error.message);
        }
      }
    }
    
    console.log("✅ Daily prompts seed completed!");
    
  } catch (error) {
    console.error("❌ Daily prompts seed failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDailyPrompts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}