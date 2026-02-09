// services/mockEmailService.js
console.log('✅ MockEmailService chargé - RIFMA Beauty Production');

class MockEmailService {
  async sendEmail({ to, subject, html, text, replyTo }) {
    console.log('='.repeat(50));
    console.log('📧 [PRODUCTION MOCK] EMAIL SIMULÉ');
    console.log('='.repeat(50));
    console.log(`À: ${to}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Reply-To: ${replyTo || 'Non spécifié'}`);
    console.log(`Date: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
    
    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: 'Email simulé avec succès (mode production)',
      simulated: true,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new MockEmailService();