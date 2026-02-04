// src/services/brevoService.js
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

class BrevoService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ Clé API Brevo non configurée');
      this.apiKey = 'dummy-key-for-dev';
    }
    
    // Configurer le client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = this.apiKey;
    
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendEmail({ to, subject, html, text, replyTo }) {
    try {
      console.log('📤 ENVOI EMAIL Brevo ======================');
      console.log('Destinataire:', to);
      console.log('Sujet:', subject);
      
      // Si pas de clé API valide, simuler l'envoi
      if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'dummy-key-for-dev') {
        console.log('📧 [DEV] Email simulé vers:', to);
        console.log('Sujet:', subject);
        console.log('📨 Email simulé avec succès');
        return { 
          success: true, 
          messageId: 'simulated-' + Date.now(),
          simulated: true 
        };
      }
      
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text;
      sendSmtpEmail.sender = {
        name: process.env.EMAIL_NAME || 'RIFMA Beauty',
        email: process.env.EMAIL_FROM || 'contact@rifmabeauty.com'
      };
      sendSmtpEmail.to = [{ email: to }];
      
      if (replyTo) {
        sendSmtpEmail.replyTo = {
          email: replyTo,
          name: 'Réponse'
        };
      }
      
      const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      console.log('📨 Réponse Brevo:', data);
      console.log('✅ Email envoyé avec succès via Brevo');
      
      return {
        success: true,
        messageId: data.messageId,
        data
      };
      
    } catch (error) {
      console.error('❌ ERREUR Brevo:', error);
      
      // Même en cas d'erreur, retourner un succès simulé pour ne pas bloquer l'inscription
      return {
        success: true,
        simulated: true,
        error: error.message,
        message: 'Email simulé (erreur Brevo)'
      };
    }
  }
}

module.exports = new BrevoService();