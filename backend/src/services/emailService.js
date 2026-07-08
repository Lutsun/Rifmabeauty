require('dotenv').config();

class EmailService {
  constructor() {
    this.service = this.createService();
  }

  createService() {
    try {
      console.log('🔍 Configuration email service...');
      console.log('📋 EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'NON DÉFINI');
      console.log('📋 OWNER_EMAIL:', process.env.OWNER_EMAIL || 'NON DÉFINI');
      
      const serviceType = (process.env.EMAIL_SERVICE || 'mock').toLowerCase();
      
      switch(serviceType) {
        case 'resend':
          return this.loadServiceSafely('./resendService', 'Resend');
        case 'brevo':
          return this.loadServiceSafely('./brevoService', 'Brevo');
        case 'mock':
        default:
          return this.loadServiceSafely('./mockEmailService', 'Mock');
      }
    } catch (error) {
      console.error('❌ Erreur création service email:', error.message);
      return this.createFallbackService();
    }
  }

  loadServiceSafely(servicePath, serviceName) {
    try {
      const service = require(servicePath);
      if (typeof service.sendEmail !== 'function') {
        throw new Error(`Le service ${serviceName} n'a pas de méthode sendEmail`);
      }
      console.log(`✅ ${serviceName} chargé avec succès`);
      return service;
    } catch (error) {
      console.error(`❌ Erreur chargement ${serviceName}:`, error.message);
      if (serviceName === 'Mock') return this.createFallbackService();
      try {
        return require('./mockEmailService');
      } catch (mockError) {
        return this.createFallbackService();
      }
    }
  }

  createFallbackService() {
    console.log('🛡️ Création service fallback...');
    return {
      sendEmail: async ({ to, subject, html, text, replyTo }) => {
        console.log('📧 [FALLBACK] Email à:', to);
        console.log('   Sujet:', subject);
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, message: 'Email traité (mode fallback)', simulated: true };
      }
    };
  }

  // ======================
  // NOTIFICATION COMMANDE POUR LE PROPRIÉTAIRE
  // ======================
  async sendOrderNotification(order, ownerEmail = null) {
    try {
      console.log(`📦 Notification commande #${order.order_number}`);
      const email = ownerEmail || process.env.OWNER_EMAIL || 'contact@rifmabeauty.com';
      const html = this.generateOrderEmailHTML(order);
      const text = this.generateOrderEmailText(order);
      const result = await this.service.sendEmail({
        to: email,
        subject: `🎉 Nouvelle commande RIFMA #${order.order_number}`,
        html,
        text,
        replyTo: order.customer_email
      });
      console.log(`✅ Email commande envoyé à: ${email}`);
      if (result.simulated) console.warn(`⚠️ Email simulé pour ${email}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi email commande:', error.message);
      return { success: false, error: error.message, simulated: true };
    }
  }

  // ======================
  // CONFIRMATION COMMANDE POUR LE CLIENT
  // ======================
  async sendOrderConfirmation(order) {
    try {
      console.log(`📧 Confirmation commande #${order.order_number} à: ${order.customer_email}`);
      const html = this.generateCustomerEmailHTML(order);
      const text = this.generateCustomerEmailText(order);
      const result = await this.service.sendEmail({
        to: order.customer_email,
        subject: `✅ Confirmation commande RIFMA #${order.order_number}`,
        html,
        text,
        replyTo: process.env.OWNER_EMAIL
      });
      console.log(`✅ Confirmation envoyée à: ${order.customer_email}`);
      if (result.simulated) console.warn(`⚠️ Email simulé pour ${order.customer_email}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi confirmation:', error.message);
      return { success: false, error: error.message, simulated: true };
    }
  }

  // ======================
  // MESSAGE DE CONTACT
  // ======================
  async sendContactMessage(contactData) {
    try {
      const { name, email, phone, message } = contactData;
      console.log('📩 Nouveau message de contact de:', name);
      
      let allSuccess = true;
      let errors = [];

      // Email au propriétaire
      try {
        const ownerHtml = this.generateContactEmailHTML(contactData, 'owner');
        const ownerResult = await this.service.sendEmail({
          to: process.env.OWNER_EMAIL || 'sergedasylva0411@gmail.com',
          subject: `📩 Nouveau message de ${name}`,
          html: ownerHtml,
          text: `Nouveau message de ${name} (${email}): ${message}`,
          replyTo: email
        });
        if (!ownerResult.success) {
          allSuccess = false;
          errors.push(`Propriétaire: ${ownerResult.error}`);
        }
      } catch (ownerError) {
        allSuccess = false;
        errors.push(`Propriétaire: ${ownerError.message}`);
      }

      // Accusé réception au client
      try {
        const clientHtml = this.generateContactEmailHTML(contactData, 'client');
        const clientResult = await this.service.sendEmail({
          to: email,
          subject: `✅ Message reçu - RIFMA Beauty`,
          html: clientHtml,
          text: `Merci pour votre message ${name}. Nous vous répondrons dans les 24h.`,
          replyTo: process.env.OWNER_EMAIL
        });
        if (!clientResult.success) {
          allSuccess = false;
          errors.push(`Client: ${clientResult.error}`);
        }
      } catch (clientError) {
        allSuccess = false;
        errors.push(`Client: ${clientError.message}`);
      }

      return { 
        success: allSuccess, 
        message: 'Message traité avec succès',
        warning: errors.length > 0 ? `Problèmes: ${errors.join(', ')}` : undefined
      };
    } catch (error) {
      console.error('❌ ERREUR dans sendContactMessage:', error.message);
      return { success: false, error: error.message, simulated: true };
    }
  }

  // ======================
  // GÉNÉRATEURS HTML - DESIGN MODERNE ET PROFESSIONNEL
  // ======================

  generateOrderEmailHTML(order) {
    const itemsHTML = order.items.map(item => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 14px 8px; color: #4a4a4a;">${item.name}${item.shade ? `<br><span style="font-size: 12px; color: #999;">Teinte: ${item.shade}</span>` : ''}</td>
        <td style="padding: 14px 8px; text-align: center; color: #4a4a4a;">${item.quantity}</td>
        <td style="padding: 14px 8px; text-align: right; color: #4a4a4a;">${item.price.toLocaleString()} FCFA</td>
        <td style="padding: 14px 8px; text-align: right; font-weight: 500; color: #2d2d2d;">${(item.price * item.quantity).toLocaleString()} FCFA</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle commande RIFMA</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #2d2d2d; background-color: #faf6f5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 24px; font-weight: 400; letter-spacing: 1px; margin: 0; }
          .header p { color: #e91e63; font-size: 14px; margin-top: 8px; letter-spacing: 2px; }
          .content { padding: 32px 24px; }
          .section { margin-bottom: 32px; }
          .section-title { font-size: 16px; font-weight: 600; color: #e91e63; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #f0e0e0; }
          .info-card { background: #faf6f5; border-radius: 16px; padding: 20px; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .info-label { color: #888; font-weight: 400; }
          .info-value { color: #2d2d2d; font-weight: 500; }
          .badge { display: inline-block; background: #e91e63; color: white; font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 12px 8px; background: #faf6f5; font-weight: 600; font-size: 13px; color: #888; }
          .total-row { background: #faf6f5; border-radius: 12px; margin-top: 16px; }
          .footer { background: #faf6f5; padding: 24px; text-align: center; border-top: 1px solid #f0e0e0; }
          .footer p { color: #999; font-size: 12px; margin: 5px 0; }
          .highlight { color: #e91e63; font-weight: 600; }
        </style>
      </head>
      <body style="background-color: #faf6f5; padding: 20px;">
        <div class="container">
          <div class="header">
            <h1>✨ NOUVELLE COMMANDE ✨</h1>
            <p>RIFMA BEAUTY COSMETICS</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">📋 Détails de la commande</div>
              <div class="info-card">
                <div class="info-row"><span class="info-label">Numéro de commande</span><span class="info-value">#${order.order_number}</span></div>
                <div class="info-row"><span class="info-label">Date</span><span class="info-value">${new Date(order.created_at).toLocaleString('fr-FR')}</span></div>
                <div class="info-row"><span class="info-label">Statut</span><span class="badge">${order.status}</span></div>
                <div class="info-row"><span class="info-label">Mode de paiement</span><span class="info-value">Mobile Money (Wave/Orange)</span></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">👤 Informations client</div>
              <div class="info-card">
                <div class="info-row"><span class="info-label">Nom complet</span><span class="info-value">${order.customer_name}</span></div>
                <div class="info-row"><span class="info-label">Email</span><span class="info-value">${order.customer_email}</span></div>
                <div class="info-row"><span class="info-label">Téléphone</span><span class="info-value">${order.customer_phone || 'Non fourni'}</span></div>
                <div class="info-row"><span class="info-label">Adresse</span><span class="info-value">${order.shipping_address.street}<br>${order.shipping_address.city}, ${order.shipping_address.zip}<br>${order.shipping_address.country}</span></div>
                ${order.notes ? `<div class="info-row"><span class="info-label">Notes</span><span class="info-value">${order.notes}</span></div>` : ''}
              </div>
            </div>

            <div class="section">
              <div class="section-title">🛍️ Articles commandés</div>
              <table>
                <thead><tr><th>Produit</th><th style="text-align:center">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Total</th></tr></thead>
                <tbody>${itemsHTML}</tbody>
              </table>
              <div style="margin-top: 20px; background: #faf6f5; border-radius: 12px; padding: 16px;">
                <div class="info-row"><span class="info-label">Sous-total</span><span class="info-value">${order.subtotal.toLocaleString()} FCFA</span></div>
                <div class="info-row"><span class="info-label">Livraison</span><span class="info-value">Tarif flexible selon zone</span></div>
                <div class="info-row" style="font-size: 18px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0c0c0;"><span class="info-label" style="font-weight: 600;">TOTAL</span><span class="highlight" style="font-size: 20px;">${order.total_amount.toLocaleString()} FCFA</span></div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>💄 RIFMA Beauty - Votre beauté, notre passion</p>
            <p>📍 Dakar, Sénégal | 📞 +221 78 717 10 10</p>
            <p style="font-size: 11px;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateCustomerEmailHTML(order) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation commande RIFMA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #2d2d2d; background-color: #faf6f5; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
        
        <!-- HEADER avec styles inline -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 400; margin: 0;">COMMANDE CONFIRMÉE</h1>
          <p style="color: #e91e63; font-size: 14px; margin-top: 8px; letter-spacing: 2px; margin-bottom: 0;">Merci pour votre confiance</p>
        </div>
        
        <!-- CONTENT -->
        <div style="padding: 32px 24px;">
          <div style="font-size: 22px; font-weight: 400; color: #2d2d2d; margin-bottom: 8px;">
            Bonjour <span style="color: #e91e63;">${order.customer_name.split(' ')[0]}</span> ! 💕
          </div>
          <p style="color: #666; margin-top: 8px; margin-bottom: 0;">Votre commande a été enregistrée avec succès. Voici les détails :</p>
          
          <!-- Order Card -->
          <div style="background: linear-gradient(135deg, #faf6f5 0%, #fff 100%); border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #f0e0e0; text-align: center;">
            <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin: 0 0 8px 0;">NUMÉRO DE COMMANDE</p>
            <div style="font-size: 32px; font-weight: 600; color: #e91e63; letter-spacing: 2px; margin: 8px 0;">${order.order_number}</div>
            <p style="color: #888; margin-top: 16px; margin-bottom: 8px;">Date : ${new Date(order.created_at).toLocaleString('fr-FR')}</p>
            <p style="margin-top: 16px; margin-bottom: 0;"><strong>Total : ${order.total_amount.toLocaleString()} FCFA</strong></p>
          </div>

          <!-- Payment Box -->
          <div style="background: #f0f7ff; border-left: 4px solid #00B2A9; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <div style="font-size: 18px; font-weight: 600; color: #00B2A9; margin-bottom: 16px;">📱 COMMENT PAYER ?</div>
            
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <div style="width: 32px; height: 32px; background: #e91e63; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 16px; flex-shrink: 0;">1</div>
              <div>Effectuez le paiement de <strong>${order.total_amount.toLocaleString()} FCFA</strong> sur :</div>
            </div>
            
            <div style="background: #ffffff; border: 2px solid #e91e63; border-radius: 12px; padding: 12px; text-align: center; margin: 16px 0; font-size: 20px; font-weight: 600; color: #e91e63;">
              📱 Wave : 78 717 10 10<br>📱 Orange Money : 78 717 10 10
            </div>
            
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <div style="width: 32px; height: 32px; background: #e91e63; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 16px; flex-shrink: 0;">2</div>
              <div>Envoyez le reçu de paiement par WhatsApp au <strong>+221 78 717 10 10</strong></div>
            </div>
            
            <div style="display: flex; align-items: center; margin-bottom: 0;">
              <div style="width: 32px; height: 32px; background: #e91e63; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 16px; flex-shrink: 0;">3</div>
              <div>Confirmation sous 24h et expédition immédiate 🚀</div>
            </div>
          </div>

          <!-- Livraison Info -->
          <div style="background: #faf6f5; border-radius: 12px; padding: 20px; text-align: center;">
            <p style="color: #666; margin: 0 0 12px 0;">✨ Livraison à Dakar ✨</p>
            <p style="color: #888; font-size: 13px; margin: 0 0 8px 0;">Les frais de livraison sont à la charge du client.</p>
            <p style="color: #888; font-size: 13px; margin: 0;">Une question ? Contactez-nous au +221 78 717 10 10</p>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background: #faf6f5; padding: 24px; text-align: center; border-top: 1px solid #f0e0e0;">
          <p style="color: #999; font-size: 12px; margin: 5px 0;">💄 RIFMA Beauty - Votre beauté, notre passion</p>
          <p style="color: #999; font-size: 12px; margin: 5px 0;">📍 Dakar, Sénégal | 📞 +221 78 717 10 10</p>
          <p style="color: #999; font-size: 11px; margin: 5px 0;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

  generateContactEmailHTML(contactData, recipient) {
    if (recipient === 'owner') {
      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}</style></head>
        <body style="background:#faf6f5;padding:20px;">
          <div style="max-width:600px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:30px;text-align:center;">
              <h1 style="color:white;font-weight:400;">📩 Nouveau message</h1>
              <p style="color:#e91e63;">RIFMA Beauty - Contact</p>
            </div>
            <div style="padding:30px;">
              <div style="background:#faf6f5;border-radius:16px;padding:20px;">
                <p><strong>👤 Nom :</strong> ${contactData.name}</p>
                <p><strong>📧 Email :</strong> ${contactData.email}</p>
                <p><strong>📞 Téléphone :</strong> ${contactData.phone || 'Non fourni'}</p>
                <p><strong>📅 Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <hr style="margin:20px 0;border-color:#f0e0e0;">
                <p><strong>💬 Message :</strong></p>
                <p style="color:#666;">${contactData.message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            <div style="background:#faf6f5;padding:20px;text-align:center;color:#999;font-size:12px;">
              <p>RIFMA Beauty - Formulaire de contact</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}</style></head>
        <body style="background:#faf6f5;padding:20px;">
          <div style="max-width:600px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:30px;text-align:center;">
              <div style="font-size:48px;">✅</div>
              <h1 style="color:white;font-weight:400;">Message reçu !</h1>
            </div>
            <div style="padding:30px;">
              <h2 style="color:#e91e63;">Bonjour ${contactData.name},</h2>
              <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
              <div style="background:#faf6f5;border-radius:16px;padding:20px;margin:20px 0;">
                <p><strong>📝 Votre message :</strong></p>
                <p style="color:#666;">${contactData.message.substring(0, 200)}${contactData.message.length > 200 ? '...' : ''}</p>
              </div>
              <p>Notre équipe vous répondra dans les plus brefs délais (sous 24h).</p>
              <p style="margin-top:20px;">Cordialement,<br><strong>L'équipe RIFMA Beauty</strong> 💄</p>
            </div>
            <div style="background:#faf6f5;padding:20px;text-align:center;color:#999;font-size:12px;">
              <p>RIFMA Beauty - Votre beauté, notre passion</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  }

  generateOrderEmailText(order) {
    return `
NOUVELLE COMMANDE RIFMA BEAUTY
===============================
Numéro: ${order.order_number}
Date: ${new Date(order.created_at).toLocaleString('fr-FR')}
Client: ${order.customer_name}
Email: ${order.customer_email}
Téléphone: ${order.customer_phone || 'Non fourni'}
Total: ${order.total_amount.toLocaleString()} FCFA
Paiement: Mobile Money (Wave/Orange Money)

ARTICLES COMMANDÉS:
${order.items.map(item => `- ${item.name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} FCFA`).join('\n')}

ADRESSE DE LIVRAISON:
${order.shipping_address.street}
${order.shipping_address.city}, ${order.shipping_address.zip}
${order.shipping_address.country}

Notes: ${order.notes || 'Aucune'}
---
RIFMA Beauty - Votre beauté, notre passion 💄
    `.trim();
  }

  generateCustomerEmailText(order) {
    return `
CONFIRMATION COMMANDE - RIFMA BEAUTY
=====================================
Bonjour ${order.customer_name},

Merci pour votre commande #${order.order_number} !

RÉCAPITULATIF:
- Total à payer: ${order.total_amount.toLocaleString()} FCFA
- Paiement: Mobile Money (Wave/Orange Money)

COMMENT PAYER ?
----------------
1. Effectuez le paiement de ${order.total_amount.toLocaleString()} FCFA sur:
   • Wave: 78 717 10 10
   • Orange Money: 78 717 10 10

2. Envoyez le reçu de paiement par WhatsApp au +221 78 717 10 10

⚠️ Votre commande sera expédiée dès réception du reçu.

Pour toute question:
📧 Email: contact@rifmabeauty.com
📱 WhatsApp: +221 78 717 10 10

Merci pour votre confiance ! 💕
L'équipe RIFMA Beauty
    `.trim();
  }
}

module.exports = new EmailService();