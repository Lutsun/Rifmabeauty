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
    
    if (this.simulationMode) {
      console.log('📧 [DEV] Email simulé vers:', to);
      return { 
        success: true, 
        messageId: 'simulated-' + Date.now(),
        simulated: true 
      };
    }
    
    // Vérification stricte de l'expéditeur
    let fromEmail = process.env.EMAIL_FROM || 'contact@rifmabeauty.com';
    let fromName = process.env.EMAIL_NAME || 'RIFMA Beauty';
    
    // Nettoyer l'email (enlever les chevrons si présents)
    fromEmail = fromEmail.replace(/.*<([^>]+)>.*/, '$1').trim();
    
    // Vérifier que c'est un email vérifié dans Brevo
    if (!fromEmail.includes('@rifmabeauty.com') && !fromEmail.includes('@brevo.com')) {
      console.warn('⚠️ Email expéditeur non vérifié dans Brevo');
    }
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = text;
    
    // IMPORTANT : Utiliser un sender vérifié dans Brevo
    sendSmtpEmail.sender = {
      name: fromName,
      email: fromEmail
    };
    
    sendSmtpEmail.to = [{ email: to }];
    
    if (replyTo) {
      sendSmtpEmail.replyTo = {
        email: replyTo,
        name: 'Réponse'
      };
    }
    
    // Ajouter des headers pour améliorer la délivrabilité
    sendSmtpEmail.headers = {
      'X-Mailer': 'Brevo-API-Node',
      'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>`,
      'X-Report-Abuse': `Please report abuse to <mailto:${fromEmail}>`,
      'X-Sender-Domain': 'rifmabeauty.com'
    };
    
    // Paramètres SMTP supplémentaires
    sendSmtpEmail.params = {
      'email_service': 'brevo',
      'domain': 'rifmabeauty.com'
    };
    
    console.log('📧 Configuration:', {
      from: sendSmtpEmail.sender,
      to: sendSmtpEmail.to,
      subject: sendSmtpEmail.subject.substring(0, 50) + '...'
    });
    
    const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email envoyé avec succès:', data.messageId);
    
    return {
      success: true,
      messageId: data.messageId,
      data
    };
    
  } catch (error) {
    console.error('❌ ERREUR Brevo détaillée:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Response:', error.response?.body);
    
    // Diagnostics spécifiques
    if (error.response?.body) {
      const body = error.response.body;
      console.error('🔍 Diagnostic Brevo:');
      
      if (body.code === 'invalid_parameter') {
        console.error('➡️ Problème: Paramètre invalide');
        console.error('➡️ Solution: Vérifiez que contact@rifmabeauty.com est un sender vérifié dans Brevo');
      }
      
      if (body.code === 'unauthorized') {
        console.error('➡️ Problème: Clé API invalide');
        console.error('➡️ Solution: Regénérez votre clé API dans Brevo');
      }
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