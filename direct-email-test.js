// Direct email test to dvaldez5@gmail.com
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendDirectEmail() {
  console.log('Sending direct test email to dvaldez5@gmail.com...');
  
  try {
    const result = await resend.emails.send({
      from: 'The AM Project <support@theamproject.com>',
      to: ['dvaldez5@gmail.com'],
      replyTo: 'The AM Project <support@theamproject.com>',
      subject: 'Test Email - The AM Project Welcome',
      text: 'Hi Daniel,\n\nThis is a test email to verify delivery to your Gmail account.\n\nIf you receive this, the email system is working correctly.\n\nBest,\nThe AM Project Team',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a;">Test Email - The AM Project</h2>
          <p>Hi Daniel,</p>
          <p>This is a test email to verify delivery to your Gmail account.</p>
          <p>If you receive this, the email system is working correctly.</p>
          <p><strong>Email details:</strong></p>
          <ul>
            <li>From: The AM Project <support@theamproject.com></li>
            <li>Reply-to: The AM Project <support@theamproject.com></li>
            <li>Domain: theamproject.com (verified)</li>
            <li>Time: ${new Date().toISOString()}</li>
          </ul>
          <p>Best,<br>The AM Project Team</p>
        </div>
      `
    });

    if (result.data?.id || result.id) {
      console.log('✓ Email sent successfully');
      console.log('Message ID:', result.data?.id || result.id);
      console.log('Check your inbox (and spam folder) for the test email');
    } else {
      console.log('✗ Email failed');
      console.log('Result:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('Email error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

sendDirectEmail();