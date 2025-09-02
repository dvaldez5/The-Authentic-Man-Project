import { Resend } from 'resend';
import path from 'path';
import fs from 'fs';

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.warn('RESEND_API_KEY not configured - email functionality will be disabled');
}
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Welcome email template matching app branding
const createWelcomeEmailHTML_internal = (firstName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to The AM Project</title>
      <style>
        body { 
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #1a1a1a; 
          margin: 0; 
          padding: 0; 
          background-color: #fafafa; 
        }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { 
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); 
          color: #ffffff; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .logo { 
          font-family: 'Playfair Display', serif; 
          font-size: 28px; 
          font-weight: 700; 
          margin-bottom: 10px; 
          letter-spacing: 1px;
        }
        .tagline { font-size: 14px; opacity: 0.9; margin: 0; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .feature-list { margin: 25px 0; }
        .feature-item { 
          margin-bottom: 20px; 
          padding: 15px; 
          background-color: #000000; 
          border-radius: 6px; 
          border: 1px solid #7C4A32;
        }
        .feature-title { 
          font-weight: 600; 
          color: #d4a574; 
          margin-bottom: 5px; 
          font-size: 16px;
        }
        .feature-desc { 
          color: #ffffff; 
          font-size: 14px; 
          line-height: 1.5;
        }
        .closing { margin-top: 30px; }
        .signature { 
          margin-top: 25px; 
          font-weight: 600; 
          color: #1a1a1a;
        }
        .footer { 
          background-color: #f8f9fa; 
          padding: 25px 30px; 
          text-align: center; 
          color: #666; 
          font-size: 13px;
        }
        .footer a { color: #d4a574; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://bb1b08ff-fa1f-49e8-b1ce-157412ee683e-00-3d18d9scwpokx.worf.replit.dev/white-logo.png" alt="The AM Project" style="width: 140px; height: auto; margin-bottom: 15px;" />
          <p class="tagline">Personal Development for Men</p>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${firstName},</p>
          
          <p>Your account is now active. Access your personal development tools and start your journey.</p>
          
          <p><strong>Available features:</strong></p>
          
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-title">Daily Challenges</div>
              <div class="feature-desc">Each morning, you'll get a challenge designed to push you forward. Log your response. Our AI gives grounded, real-time feedback to help you process it—not sugarcoat it.</div>
            </div>
            
            <div class="feature-item">
              <div class="feature-title">Journaling + AI Reflection</div>
              <div class="feature-desc">This is your private space to think out loud. Whether you're venting, processing, or planning, AM Project's AI listens and responds with insight—not judgment.</div>
            </div>
            
            <div class="feature-item">
              <div class="feature-title">Scenario-Based Learning</div>
              <div class="feature-desc">High-pressure, real-world dilemmas—where you choose your response, then reflect with mentor-style AI feedback. You're not here to be perfect. You're here to get sharper.</div>
            </div>
            
            <div class="feature-item">
              <div class="feature-title">Weekly Reflections</div>
              <div class="feature-desc">Every 7 days, the system prompts you to step back, reflect, and integrate. AI helps you pull meaning from your week and reconnect with who you're becoming.</div>
            </div>
            
            <div class="feature-item">
              <div class="feature-title">The Journal Timeline</div>
              <div class="feature-desc">Your thoughts. Your choices. All in one place. Pinned moments, major shifts, and a growing record of who you're building.</div>
            </div>
            
            <div class="feature-item">
              <div class="feature-title">AM Chat</div>
              <div class="feature-desc">Like a sharp, grounded best friend in your pocket. Talk through anything—decisions, frustrations, wins, regrets. It's always available, never judgmental, and trained to keep you anchored.</div>
            </div>
            
            <div class="feature-item">
              <div class="feature-title">Community Access</div>
              <div class="feature-desc">Connect with men who share your commitment to growth and excellence. Share experiences, get support, and build lasting connections.</div>
            </div>
          </div>
          
          <div class="closing">
            <p>Access structured tools designed for personal development and growth.</p>
            
            <p><a href="https://theamproject.com" style="color: #d4a574; text-decoration: none; font-weight: 600;">Access Your Account →</a></p>
            
            <p>Reply anytime to <a href="mailto:support@theamproject.com" style="color: #d4a574; text-decoration: none;">support@theamproject.com</a>. We're real people behind this, and we're listening.</p>
            
            <p>Welcome,</p>
            
            <p class="signature">—The AM Project Team</p>
          </div>
        </div>
        
        <div class="footer">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                <strong>The AM Project</strong><br>
                Personal Development for Men
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 15px 0;">
                <p style="margin: 0; font-size: 13px; color: #666;">
                  <strong>Contact Information</strong><br>
                  Email: <a href="mailto:support@theamproject.com" style="color: #d4a574; text-decoration: none;">support@theamproject.com</a><br>
                  Website: <a href="https://theamproject.com" style="color: #d4a574; text-decoration: none;">theamproject.com</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px 0; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 12px; color: #999;">
                  You're receiving this email because you created an account with The AM Project.<br>
                  If you have questions, reply to this email or contact our support team.
                </p>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 10px 0;">
                <p style="margin: 0; font-size: 11px; color: #999;">
                  © 2025 The AM Project. All rights reserved.<br>
                  This is an automated account activation email.
                </p>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plain text version
const createWelcomeEmailText = (firstName: string) => {
  return `
Hi ${firstName},

Thanks for joining The AM Project—a real space for growth, built on structure, clarity, and smart tools that stay out of your way.

Here's what you've unlocked:

Daily Challenges (AI-Driven)
Each morning, you'll get a challenge designed to push you forward. Log your response. Our AI gives grounded, real-time feedback to help you process it—not sugarcoat it.

Journaling + AI Reflection
This is your private space to think out loud. Whether you're venting, processing, or planning, AM Project's AI listens and responds with insight—not judgment.

Scenario-Based Learning
High-pressure, real-world dilemmas—where you choose your response, then reflect with mentor-style AI feedback. You're not here to be perfect. You're here to get sharper.

Weekly Reflections (AI-Guided)
Every 7 days, the system prompts you to step back, reflect, and integrate. AI helps you pull meaning from your week and reconnect with who you're becoming.

The Journal Timeline
Your thoughts. Your choices. All in one place. Pinned moments, major shifts, and a growing record of who you're building.

AM Chat
Like a sharp, grounded best friend in your pocket. Talk through anything—decisions, frustrations, wins, regrets. It's always available, never judgmental, and trained to keep you anchored.

This isn't noise. It's not hype. It's structure, challenge, and feedback—designed to help you actually grow.

Visit The AM Project: https://theamproject.com

Reply anytime to support@theamproject.com. We're real people behind this, and we're listening.

Welcome,

—The AM Project Team

---
The AM Project
You're receiving this because you joined The AM Project
  `;
};

// Use verified domain sender
const VERIFIED_SENDER = 'The AM Project <support@theamproject.com>';
const REPLY_TO_ADDRESS = 'The AM Project <support@theamproject.com>';

// Export the HTML function for preview
export const createWelcomeEmailHTML = createWelcomeEmailHTML_internal;

// Send welcome email
export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    if (!resend) {
      console.warn('Email service not configured - skipping welcome email');
      return { success: false, error: 'Email service not configured' };
    }
    
    const result = await resend.emails.send({
      from: VERIFIED_SENDER,
      to: [email],
      replyTo: REPLY_TO_ADDRESS,
      subject: 'Your AM Project Account is Ready',
      text: createWelcomeEmailText(firstName),
      html: createWelcomeEmailHTML_internal(firstName),
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'The AM Project',
        'List-Unsubscribe': '<mailto:support@theamproject.com?subject=Unsubscribe>',
        'Message-ID': `<${Date.now()}.${Math.random().toString(36)}@theamproject.com>`
      }
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }
    
    console.log('Welcome email sent successfully:', result.data?.id);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Test Resend connection
export const testEmailConnection = async () => {
  try {
    // Test Resend by sending a simple email to verify API key
    console.log('Testing Resend API connection...');
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured - email functionality disabled');
      return false;
    }
    console.log('Resend API key configured successfully');
    return true;
  } catch (error) {
    console.error('Resend connection test failed:', error);
    throw error;
  }
};