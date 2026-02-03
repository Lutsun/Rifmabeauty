// src/services/resendService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html, text, replyTo }) {
  try {
    const from = process.env.EMAIL_FROM || 'RIFMA Beauty <onboarding@resend.dev>';
    
    const response = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo: replyTo || process.env.REPLY_TO_EMAIL,
      headers: {
        'X-Entity-Ref-ID': Date.now().toString(),
      },
    });

    console.log(`✅ Email envoyé via Resend: ${response.id}`);
    return { success: true, id: response.id };
  } catch (error) {
    console.error('❌ Erreur Resend:', error);
    throw error;
  }
}

module.exports = { sendEmail };