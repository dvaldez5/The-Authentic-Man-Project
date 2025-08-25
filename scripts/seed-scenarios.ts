#!/usr/bin/env tsx

/**
 * Scenario Seed Script for The AM Project
 * 
 * Usage: npx tsx scripts/seed-scenarios.ts
 * 
 * Seeds the database with production-ready scenarios according to 
 * The AM Project brand guidelines and scenario specifications.
 */

import { db } from "../server/db";
import { scenarios } from "../shared/schema";

const productionScenarios = [
  {
    title: "She Said It Was 'Fine'… But You Know It's Not",
    prompt: "You're about to head out for your workout when your wife, clearly upset, says, 'It's fine—go if you want.' You pause. You know this tone. You also know you've missed the last couple check-ins at home. What do you do?",
    options: [
      {
        text: "Go anyway. She said it was fine.",
        feedback: "You chose comfort over presence. This doesn't mean you're selfish—it means you're avoiding tension. But avoiding tension is how trust erodes."
      },
      {
        text: "Pause, ask her directly: 'Are we good?'",
        feedback: "You stepped toward discomfort. Even if it doesn't fix it instantly, this move signals you're present and engaged. That's rare—and it matters."
      },
      {
        text: "Cancel the gym. Stay home to talk.",
        feedback: "Sometimes stepping up means stepping back. But make sure you're not trying to 'fix' her or overcompensate out of guilt. Stay curious, not controlling."
      }
    ],
    stage: "Relationship",
    tags: ["conflict", "communication", "presence"]
  },
  {
    title: "The Boss Wants You to Stay Late Again",
    prompt: "It's 5:30 PM. You promised your kids you'd be at their game tonight. Your boss drops a 'urgent' project on your desk—the third time this month. Everyone's watching to see what you do.",
    options: [
      {
        text: "Stay late without saying anything.",
        feedback: "You avoided conflict but sacrificed your word. Your kids notice when dad doesn't show up. This pattern teaches them work comes first—always."
      },
      {
        text: "Say you have a commitment and leave.",
        feedback: "You honored your word, but without context, this might create workplace tension. Boundaries matter, but so does how you set them."
      },
      {
        text: "Explain the commitment and offer an alternative.",
        feedback: "You're learning to hold both—professional responsibility and personal integrity. This isn't always possible, but when it is, it's powerful."
      }
    ],
    stage: "Work",
    tags: ["boundaries", "integrity", "work-life"]
  },
  {
    title: "Your Friend Won't Stop Complaining",
    prompt: "Your buddy calls again—the fourth time this week. Same problems, same complaints, zero action. You care about him, but you're starting to dread these calls. He's draining your energy.",
    options: [
      {
        text: "Listen like always. He needs support.",
        feedback: "Loyalty matters, but enabling doesn't help anyone. You're teaching him that venting without action is acceptable. That's not friendship—it's codependence."
      },
      {
        text: "Tell him to stop calling if he won't change.",
        feedback: "Direct, but harsh. Real friendship sometimes requires tough love, but this approach might just push him away without helping him grow."
      },
      {
        text: "Set a boundary: 'I care, but I need to see you taking action.'",
        feedback: "You're showing up as a friend while protecting your own energy. This is how you help without enabling. It's uncomfortable, but it's real love."
      }
    ],
    stage: "Relationships",
    tags: ["boundaries", "friendship", "enabling"]
  },
  {
    title: "The Temptation at 2 AM",
    prompt: "You're alone. Everyone's asleep. Your phone is right there. That app you deleted is just a download away. You've been clean for 30 days, but tonight feels different. The urge is strong.",
    options: [
      {
        text: "Just this once won't hurt anything.",
        feedback: "This is the lie addiction tells. 'Just once' is never just once. You know this pattern. The shame tomorrow isn't worth the temporary escape tonight."
      },
      {
        text: "Put the phone in another room and go to sleep.",
        feedback: "You removed the temptation and chose discomfort over compromise. This is what strength looks like—not fighting the urge, but removing the opportunity."
      },
      {
        text: "Call someone from your accountability group.",
        feedback: "You reached out instead of reaching down. This takes courage. Real men ask for help when they need it. Your future self will thank you."
      }
    ],
    stage: "Personal",
    tags: ["temptation", "addiction", "accountability"]
  },
  {
    title: "Your Son Asks Why You Look Sad",
    prompt: "Work has been brutal. Money's tight. Your marriage feels distant. You're sitting at the dinner table, lost in worry, when your 8-year-old asks, 'Dad, why do you always look sad?' The table goes quiet.",
    options: [
      {
        text: "Say 'I'm fine, buddy' and change the subject.",
        feedback: "You protected him from adult problems, but you also taught him that feelings don't get talked about. Kids learn more from what we model than what we say."
      },
      {
        text: "Explain all your problems so he understands.",
        feedback: "Honesty matters, but this burdens him with adult worries. Children need security, not transparency about every struggle. There's a middle path here."
      },
      {
        text: "Say 'Dad's working through some tough stuff, but I'm okay.'",
        feedback: "You acknowledged the reality without burdening him. You showed him that men can struggle and still be stable. This is emotional intelligence in action."
      }
    ],
    stage: "Fatherhood",
    tags: ["fatherhood", "emotional-intelligence", "modeling"]
  },
  {
    title: "The Argument That's Getting Too Heated",
    prompt: "The discussion with your wife about money just escalated. Voices are raised. You feel your anger building. She just said something that hit below the belt. You want to fire back with something you know will hurt.",
    options: [
      {
        text: "Say what you're thinking. She started it.",
        feedback: "You chose winning over loving. Those words can't be taken back. Relationships die not from big betrayals, but from small cruelties that accumulate over time."
      },
      {
        text: "Walk away without saying anything.",
        feedback: "You avoided escalation, but you also avoided resolution. Silent treatment can be its own form of punishment. She's left hanging, and the issue remains."
      },
      {
        text: "Say 'I need a minute' and step outside.",
        feedback: "You recognized your limits and communicated them. This isn't weakness—it's wisdom. You're learning that taking space isn't abandoning the conversation."
      }
    ],
    stage: "Relationship",
    tags: ["conflict", "anger", "communication"]
  }
];

async function seedScenarios() {
  try {
    console.log("🌱 Seeding production scenarios...");
    
    // Clear existing scenarios
    await db.delete(scenarios);
    console.log("   Cleared existing scenarios");
    
    // Insert production scenarios
    for (const scenario of productionScenarios) {
      await db.insert(scenarios).values(scenario);
      console.log(`   ✓ Added: ${scenario.title}`);
    }
    
    console.log(`\n🎯 Successfully seeded ${productionScenarios.length} production scenarios`);
    console.log("   Ready for immersive decision-point learning");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding scenarios:", error);
    process.exit(1);
  }
}

// Run if called directly
seedScenarios();

export { seedScenarios };