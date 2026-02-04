// debugResend.js
require('dotenv').config();
const { Resend } = require('resend');

console.log('🔍 Configuration .env:');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***' + process.env.RESEND_API_KEY.slice(-4) : 'NON DÉFINI');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('OWNER_EMAIL:', process.env.OWNER_EMAIL);

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('📤 Test d\'envoi d\'email...');
    
    const response = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',  // Important: ce format
      to: process.env.OWNER_EMAIL || 'sergedasylva0411@gmail.com',
      subject: 'Test email from Resend',
      html: '<p>Ceci est un test</p>',
      text: 'Ceci est un test',
    });

    console.log('✅ Email envoyé avec succès!');
    console.log('ID:', response.id);
    console.log('Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur détaillée:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

testEmail();