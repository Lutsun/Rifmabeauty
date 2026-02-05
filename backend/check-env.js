// check-env.js
require('dotenv').config();
console.log('🔍 Vérification configuration email:');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'Non défini');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Non défini');
console.log('EMAIL_NAME:', process.env.EMAIL_NAME || 'Non défini');
console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Configuré (' + process.env.BREVO_API_KEY.length + ' chars)' : '✗ Non configuré');
console.log('OWNER_EMAIL:', process.env.OWNER_EMAIL || 'Non défini');

// Vérification spécifique
if (process.env.EMAIL_FROM === 'sergedasylva0411@gmail.com') {
  console.log('\n✅ EMAIL_FROM correct!');
} else {
  console.log('\n❌ EMAIL_FROM incorrect, devrait être: sergedasylva0411@gmail.com');
}