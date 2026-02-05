// src/services/brevoService.js
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

class BrevoService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    
    if (!this.apiKey || this.apiKey === 'dummy-key-for-dev') {
      console.warn('⚠️ Clé API Brevo non configurée - mode simulation activé');
      this.apiKey = 'dummy-key-for-dev';
      this.simulationMode = true;
      return;
    }
    
    this.simulationMode = false;
    
    // Configurer le client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = this.apiKey;
    
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    console.log('✅ Service Brevo initialisé avec:', process.env.EMAIL_FROM);
  }

  // src/services/brevoService.js - Modifiez la méthode sendEmail()

async sendEmail({ to, subject, html, text, replyTo }) {
  try {
    console.log('📤 ENVOI EMAIL Brevo ======================');
    console.log('Destinataire:', to);
    console.log('Sujet:', subject);
    
    // Mode simulation si pas de clé API
    if (this.simulationMode) {
      console.log('📧 [DEV] Email simulé vers:', to);
      console.log('📨 Email simulé avec succès');
      return { 
        success: true, 
        messageId: 'simulated-' + Date.now(),
        simulated: true 
      };
    }
    
    // EXTRACTION DE L'EMAIL (nouveau code)
    let fromEmail = process.env.EMAIL_FROM;
    let fromName = process.env.EMAIL_NAME || 'RIFMA Beauty';
    
    // Si le format est "Nom <email@domaine.com>", extraire seulement l'email
    const emailMatch = fromEmail.match(/<([^>]+)>/);
    if (emailMatch) {
      fromEmail = emailMatch[1]; // Prend seulement l'email entre <>
    }
    
    // Vérification que c'est un email valide
    if (!fromEmail || !fromEmail.includes('@')) {
      console.error('❌ EMAIL_FROM invalide:', process.env.EMAIL_FROM);
      throw new Error('EMAIL_FROM doit être un email valide (ex: sergedasylva0411@gmail.com)');
    }
    
    console.log('📧 Email expéditeur:', fromEmail);
    console.log('📧 Nom expéditeur:', fromName);
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = text;
    
    // CONFIGURATION CORRECTE DE L'EXPÉDITEUR
    sendSmtpEmail.sender = {
      name: fromName,
      email: fromEmail  // Email vérifié dans Brevo
    };
    
    sendSmtpEmail.to = [{ email: to }];
    
    if (replyTo) {
      sendSmtpEmail.replyTo = {
        email: replyTo,
        name: 'Réponse'
      };
    }
    
    // Ajoutez des headers DKIM/DMARC (important sans domaine)
    sendSmtpEmail.headers = {
      'List-Unsubscribe': '<mailto:unsubscribe@brevo.com>',
      'X-Report-Abuse': 'Please report abuse to <mailto:contact@brevo.com>',
      'X-Mailer': 'Brevo-API'
    };
    
    console.log('📧 Envoi en cours via Brevo...');
    const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('📨 Réponse Brevo:', data.messageId);
    console.log('✅ Email envoyé avec succès via Brevo');
    
    return {
      success: true,
      messageId: data.messageId,
      data
    };
    
  } catch (error) {
    console.error('❌ ERREUR Brevo:', error.message);
    console.error('Détails:', error.response?.body || error);
    
    // Pour les erreurs spécifiques
    if (error.message.includes('valid sender email') || error.message.includes('invalid_parameter')) {
      console.error('⚠️ SOLUTION RAPIDE :');
      console.error('1. Connectez-vous à Brevo');
      console.error('2. Allez dans SMTP & API → Senders');
      console.error('3. Ajoutez "sergedasylva0411@gmail.com" comme sender');
      console.error('4. Vérifiez-le via l\'email de confirmation');
      console.error('5. Redémarrez votre serveur');
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response?.body,
      simulated: false
    };
  }
}
}

module.exports = new BrevoService();