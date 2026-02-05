// test-email-final.js
require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

console.log('🧪 Test d\'email avec configuration actuelle');
console.log('============================================\n');

// 1. Affichez la configuration
console.log('📋 Configuration:');
console.log('- EMAIL_FROM :', process.env.EMAIL_FROM);
console.log('- EMAIL_NAME :', process.env.EMAIL_NAME);
console.log('- BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ OK' : '❌ MANQUANT');

// 2. Configurez Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// 3. Nettoyez l'email FROM (au cas où)
let fromEmail = process.env.EMAIL_FROM;
// Enlevez les guillemets et chevrons
fromEmail = fromEmail.replace(/["<>]/g, '').trim();

async function sendTestEmail() {
  try {
    console.log('\n📤 Envoi de l\'email test...');
    console.log('- De:', process.env.EMAIL_NAME, `<${fromEmail}>`);
    console.log('- À:', 'sergedasylva0411@gmail.com');
    
    const sendSmtpEmail = {
      sender: {
        name: process.env.EMAIL_NAME || 'RIFMA Beauty',
        email: fromEmail
      },
      to: [{
        email: 'sergedasylva0411@gmail.com'
      }],
      subject: `✅ Test Brevo - ${new Date().toLocaleString()}`,
      htmlContent: `
        <h1>Test Brevo RÉUSSI ! 🎉</h1>
        <p>Si vous recevez ceci, votre configuration est correcte.</p>
        <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 10px;">
          <h3>Détails:</h3>
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>
          <p><strong>De:</strong> ${fromEmail}</p>
          <p><strong>Vers:</strong> sergedasylva0411@gmail.com</p>
        </div>
        <p>RIFMA Beauty - Votre beauté, notre passion 💄</p>
      `,
      textContent: `Test Brevo réussi!\nDate: ${new Date().toISOString()}\nDe: ${fromEmail}`
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('\n✅ SUCCÈS !');
    console.log('Message ID:', data.messageId);
    console.log('👉 Vérifiez dans:');
    console.log('   1. Votre boîte de réception Gmail');
    console.log('   2. Le dossier SPAM (regardez bien!)');
    console.log('   3. Les logs Brevo: https://app.brevo.com/smtp/log');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    
    if (error.message.includes('valid sender email') || error.message.includes('invalid_parameter')) {
      console.error('\n⚠️ SOLUTION:');
      console.error('1. Connectez-vous à Brevo: https://app.brevo.com/');
      console.error('2. Allez dans: SMTP & API → Senders');
      console.error(`3. Ajoutez "${fromEmail}" comme nouveau sender`);
      console.error('4. Vérifiez-le via l\'email de confirmation');
      console.error('5. Réessayez ce test');
    }
    
    if (error.response?.body) {
      console.error('Détails:', error.response.body);
    }
    
    return false;
  }
}

sendTestEmail();