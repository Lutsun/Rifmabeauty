// src/services/emailService.js
require('dotenv').config();

class EmailService {
  constructor() {
    // Initialise le service basé sur la configuration
    this.service = this.createService();
  }

  createService() {
    const serviceType = process.env.EMAIL_SERVICE || 'resend';
    
    switch(serviceType) {
      case 'resend':
        return require('./resendService');
      case 'brevo':
        return require('./brevoService');
      default:
        console.warn('⚠️ Service email non configuré, mode simulation activé');
        return require('./mockEmailService');
    }
  }

  // Envoyer une notification de nouvelle commande
  async sendOrderNotification(order, ownerEmail = null) {
    try {
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
      
      console.log(`📧 Email commande envoyé à: ${email}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi email commande:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer une confirmation au client
  async sendOrderConfirmation(order) {
    try {
      const html = this.generateCustomerEmailHTML(order);
      const text = this.generateCustomerEmailText(order);
      
      const result = await this.service.sendEmail({
        to: order.customer_email,
        subject: `✅ Confirmation commande RIFMA #${order.order_number}`,
        html,
        text,
        replyTo: process.env.OWNER_EMAIL
      });
      
      console.log(`📧 Confirmation envoyée à: ${order.customer_email}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  // Envoyer un message de contact
  async sendContactMessage(contactData) {
    try {
      const { name, email, phone, message } = contactData;
      
      // 1. Email au propriétaire
      const ownerHtml = this.generateContactEmailHTML(contactData, 'owner');
      await this.service.sendEmail({
        to: process.env.OWNER_EMAIL || 'sergedasylva0411@gmail.com',
        subject: `📩 Nouveau message de ${name}`,
        html: ownerHtml,
        text: `Nouveau message de ${name} (${email}): ${message}`,
        replyTo: email
      });
      
      // 2. Accusé de réception au client
      const clientHtml = this.generateContactEmailHTML(contactData, 'client');
      await this.service.sendEmail({
        to: email,
        subject: `✅ Message reçu - RIFMA Beauty`,
        html: clientHtml,
        text: `Merci pour votre message ${name}. Nous vous répondrons dans les 24h.`,
        replyTo: process.env.OWNER_EMAIL
      });
      
      console.log(`📧 Message contact traité pour: ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur message contact:', error);
      return { success: false, error: error.message };
    }
  }

  // Générer le HTML pour le propriétaire
  generateOrderEmailHTML(order) {
    const itemsHTML = order.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;">${item.name}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">${item.price.toLocaleString()} FCFA</td>
        <td style="padding: 12px; text-align: right;">${(item.price * item.quantity).toLocaleString()} FCFA</td>
      </tr>
    `).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .order-info { background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .order-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-items th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; }
          .customer-info { background: #fff8f8; border-left: 4px solid #e91e63; padding: 20px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-weight: 300;">🎉 NOUVELLE COMMANDE</h1>
            <p style="opacity: 0.9; font-size: 18px;">#${order.order_number}</p>
          </div>
          
          <div class="content">
            <div class="order-info">
              <h3 style="color: #e91e63; margin-top: 0;">💰 Détails de la commande</h3>
              <p><strong>Numéro:</strong> ${order.order_number}</p>
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString('fr-FR')}</p>
              <p><strong>Total:</strong> ${order.total_amount.toLocaleString()} FCFA</p>
              <p><strong>Paiement:</strong> À la livraison</p>
              <p><strong>Statut:</strong> <span style="color: #e91e63;">${order.status}</span></p>
            </div>
            
            <div class="customer-info">
              <h3 style="margin-top: 0;">👤 Informations client</h3>
              <p><strong>Nom:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email}</p>
              <p><strong>Téléphone:</strong> ${order.customer_phone || 'Non fourni'}</p>
              <p><strong>Adresse:</strong><br>
                ${order.shipping_address.street}<br>
                ${order.shipping_address.city}, ${order.shipping_address.zip}<br>
                ${order.shipping_address.country}
              </p>
              ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
            </div>
            
            <h3>🛍️ Articles commandés</h3>
            <table class="order-items">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th style="text-align: center;">Qté</th>
                  <th style="text-align: right;">Prix unitaire</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr style="font-weight: bold;">
                  <td colspan="3" style="padding: 12px; text-align: right;">Sous-total:</td>
                  <td style="padding: 12px; text-align: right;">${order.subtotal.toLocaleString()} FCFA</td>
                </tr>
                <tr style="font-weight: bold;">
                  <td colspan="3" style="padding: 12px; text-align: right;">Livraison:</td>
                  <td style="padding: 12px; text-align: right;">${order.shipping_fee.toLocaleString()} FCFA</td>
                </tr>
                <tr style="font-weight: bold; font-size: 18px;">
                  <td colspan="3" style="padding: 12px; text-align: right;">TOTAL:</td>
                  <td style="padding: 12px; text-align: right; color: #e91e63;">${order.total_amount.toLocaleString()} FCFA</td>
                </tr>
              </tbody>
            </table>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin'}" class="button">
                👁️ Voir dans l'admin
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>RIFMA Beauty - Votre beauté, notre passion 💄</p>
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
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
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .thank-you { text-align: center; padding: 30px; }
          .order-summary { background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .highlight { color: #e91e63; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-weight: 300;">✅ COMMANDE CONFIRMÉE</h1>
            <p style="opacity: 0.9; font-size: 18px;">Merci pour votre confiance !</p>
          </div>
          
          <div class="content">
            <div class="thank-you">
              <h2 style="color: #e91e63;">Merci ${order.customer_name} !</h2>
              <p>Votre commande <span class="highlight">#${order.order_number}</span> a été enregistrée avec succès.</p>
            </div>
            
            <div class="order-summary">
              <h3>📋 Récapitulatif</h3>
              <p><strong>Numéro de commande:</strong> ${order.order_number}</p>
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString('fr-FR')}</p>
              <p><strong>Total:</strong> ${order.total_amount.toLocaleString()} FCFA</p>
              <p><strong>Mode de paiement:</strong> Paiement à la livraison</p>
              <p><strong>Livraison estimée:</strong> 2-3 jours ouvrables</p>
            </div>
            
            <div style="background: #fff8f8; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>📞 Suivi de commande</h3>
              <p>Vous pouvez suivre votre commande à tout moment avec ce numéro :</p>
              <p style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #e91e63;">
                ${order.order_number}
              </p>
              <p>Pour toute question, contactez-nous :</p>
              <ul>
                <li>📧 Email: contact@rifmabeauty.com</li>
                <li>📱 WhatsApp: +221 78 717 10 10</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>RIFMA Beauty<br>123 Dakar plateau, 75008 Dakar, Sénégal</p>
            <p>💄 Votre beauté, notre passion</p>
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
        <head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;}</style></head>
        <body>
          <h2>📩 Nouveau message de contact</h2>
          <div style="background:#f8f9fa;padding:20px;border-radius:10px;">
            <p><strong>De:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Téléphone:</strong> ${contactData.phone || 'Non fourni'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${contactData.message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color:#666;font-size:14px;margin-top:20px;">
            RIFMA Beauty - Formulaire de contact
          </p>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;}</style></head>
        <body>
          <h2 style="color:#e91e63;">✅ Message bien reçu !</h2>
          <p>Bonjour ${contactData.name},</p>
          <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
          <p>Notre équipe vous répondra dans les plus brefs délais (sous 24h).</p>
          <div style="background:#f8f9fa;padding:15px;border-radius:10px;margin:20px 0;">
            <p><strong>Récapitulatif:</strong></p>
            <p>📝 <strong>Votre message:</strong><br>${contactData.message.substring(0, 200)}${contactData.message.length > 200 ? '...' : ''}</p>
          </div>
          <p>Cordialement,<br>L'équipe <strong>RIFMA Beauty</strong> 💄</p>
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
Client: ${order.customer_name} (${order.customer_email})
Téléphone: ${order.customer_phone || 'Non fourni'}
Total: ${order.total_amount} FCFA
Paiement: À la livraison

ARTICLES:
${order.items.map(item => `- ${item.name} x${item.quantity} = ${item.price * item.quantity} FCFA`).join('\n')}

ADRESSE DE LIVRAISON:
${order.shipping_address.street}
${order.shipping_address.city}, ${order.shipping_address.zip}
${order.shipping_address.country}

Notes: ${order.notes || 'Aucune'}

---
RIFMA Beauty - Votre beauté, notre passion
    `.trim();
  }

  generateCustomerEmailText(order) {
    return `
CONFIRMATION DE COMMANDE - RIFMA BEAUTY
=======================================

Bonjour ${order.customer_name},

Merci pour votre commande #${order.order_number} !

DÉTAILS DE LA COMMANDE:
- Numéro: ${order.order_number}
- Date: ${new Date(order.created_at).toLocaleString('fr-FR')}
- Total: ${order.total_amount} FCFA
- Paiement: À la livraison
- Livraison estimée: 2-3 jours ouvrables

Pour suivre votre commande ou toute question:
📧 Email: contact@rifmabeauty.com
📱 WhatsApp: +221 78 717 10 10

Merci pour votre confiance !
L'équipe RIFMA Beauty
    `.trim();
  }
}

module.exports = new EmailService();