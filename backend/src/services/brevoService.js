require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

console.log('📧 Initialisation BrevoService...');

class BrevoService {
  constructor() {
    try {
      console.log('🔧 Construction BrevoService...');
      
      // Vérifier la clé API
      if (!process.env.BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY non définie dans l\'environnement');
      }
      
      // Configurer l'API client
      this.defaultClient = SibApiV3Sdk.ApiClient.instance;
      this.apiKey = this.defaultClient.authentications['api-key'];
      this.apiKey.apiKey = process.env.BREVO_API_KEY;
      
      // Créer l'instance API
      this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      
      console.log('✅ BrevoService initialisé avec succès');
      console.log('📧 Email expéditeur: contact@rifmabeauty.com');
      
    } catch (error) {
      console.error('❌ ERREUR initialisation BrevoService:', error.message);
      throw error; // Propager l'erreur pour que EmailService passe au mock
    }
  }

  async sendEmail({ to, subject, html, text, replyTo }) {
    try {
      console.log(`📤 Envoi Brevo à: ${to}`);
      console.log(`   Sujet: ${subject}`);
      
      // Créer l'email
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text || html.replace(/<[^>]*>/g, ' ').substring(0, 500);
      
      // Expéditeur
      sendSmtpEmail.sender = { 
        name: 'RIFMA Beauty', 
        email: 'contact@rifmabeauty.com' 
      };
      
      // Destinataire
      sendSmtpEmail.to = [{ email: to }];
      
      // Répondre à
      if (replyTo) {
        sendSmtpEmail.replyTo = { email: replyTo };
      }
      
      // Envoyer l'email
      console.log('🔄 Envoi via Brevo API...');
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      console.log(`✅ Email envoyé via Brevo! Message ID: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        service: 'brevo',
        to: to
      };
      
    } catch (error) {
      console.error('❌ ERREUR envoi Brevo:', error.message);
      
      // Log détaillé pour le débogage
      if (error.response) {
        console.error('📋 Réponse erreur:', error.response.text);
        console.error('🔧 Code erreur:', error.response.code);
      }
      
      throw error; // Propager pour gestion dans EmailService
    }
  }
}

module.exports = new BrevoService();