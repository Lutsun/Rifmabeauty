// src/services/emailService.js
require('dotenv').config();

class EmailService {
  constructor() {
    // Initialise le service basé sur la configuration
    this.service = this.createService();
  }

  createService() {
    const serviceType = process.env.EMAIL_SERVICE || 'brevo';
    
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
    
    console.log('📩 DEBUT sendContactMessage ===========');
    
    let allSuccess = true;
    let errors = [];
    
    // 1. Email au propriétaire
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
      console.log('📧 Email propriétaire:', ownerResult.success ? 'OK' : 'ÉCHEC');
      
    } catch (ownerError) {
      allSuccess = false;
      errors.push(`Propriétaire: ${ownerError.message}`);
      console.error('❌ Erreur email propriétaire:', ownerError.message);
    }
    
    // 2. Accusé de réception au client
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
      console.log('📧 Email client:', clientResult.success ? 'OK' : 'ÉCHEC');
      
    } catch (clientError) {
      allSuccess = false;
      errors.push(`Client: ${clientError.message}`);
      console.error('❌ Erreur email client:', clientError.message);
    }
    
    // Si au moins un email a été envoyé (email au propriétaire), considérer comme succès
    const ownerEmailSent = !errors.some(e => e.includes('Propriétaire'));
    
    if (ownerEmailSent) {
      console.log('✅ sendContactMessage - Succès partiel (propriétaire notifié)');
      return { 
        success: true, 
        warning: errors.length > 0 ? `Email client non envoyé: ${errors.join(', ')}` : undefined
      };
    } else {
      console.log('❌ sendContactMessage - Échec complet');
      return { 
        success: false, 
        error: `Aucun email envoyé: ${errors.join(', ')}` 
      };
    }
    
  } catch (error) {
    console.error('❌ ERREUR inattendue dans sendContactMessage:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
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
              <p><strong>Livraison estimée:</strong> 1-2 jours ouvrables</p>
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
                  <td style="padding: 12px; text-align: right;">Tarif flexible selon la zone</td>
                </tr>
                <tr style="font-weight: bold; font-size: 18px;">
                  <td colspan="3" style="padding: 12px; text-align: right;">TOTAL:</td>
                  <td style="padding: 12px; text-align: right; color: #e91e63;">${order.total_amount.toLocaleString()} FCFA</td>
                </tr>
              </tbody>
            </table>
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
              <p><strong>Livraison estimée:</strong> 1-2 jours ouvrables</p>
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
Livraison estimée: 1-2 jours ouvrables

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
- Livraison estimée: 1-2 jours ouvrables

Pour suivre votre commande ou toute question:
📧 Email: contact@rifmabeauty.com
📱 WhatsApp: +221 78 717 10 10

Merci pour votre confiance !
L'équipe RIFMA Beauty
    `.trim();
  }

  // Envoyer une confirmation de newsletter
async sendNewsletterConfirmation(email, name = null) {
  try {
    const html = this.generateNewsletterEmailHTML(email, name);
    const text = this.generateNewsletterEmailText(email, name);
    
    const result = await this.service.sendEmail({
      to: email,
      subject: `🎉 Bienvenue dans la newsletter RIFMA Beauty!`,
      html,
      text,
      replyTo: process.env.OWNER_EMAIL
    });
    
    console.log(`📧 Confirmation newsletter envoyée à: ${email}`);
    return result;
  } catch (error) {
    console.error('❌ Erreur confirmation newsletter:', error.message);
    // Ne JAMAIS bloquer l'inscription si l'email échoue
    return { 
      success: true,  // Toujours retourner success
      simulated: true,
      error: error.message,
      message: 'Inscription enregistrée, email simulé'
    };
  }
}

// Générer le HTML pour la newsletter
generateNewsletterEmailHTML(email, name) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  
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
        .welcome-box { background: #f8f9fa; border-radius: 10px; padding: 25px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .highlight { color: #e91e63; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-weight: 300;">🎉 BIENVENUE !</h1>
        </div>
        
        <div class="content">
          <div class="welcome-box">
            <h2 style="color: #e91e63;">Bonjour ${firstName} !</h2>
            <p>Merci de vous être inscrit(e) à la newsletter <span class="highlight">RIFMA Beauty</span>.</p>
            
            <p>Vous recevrez :</p>
            <ul>
              <li>Nos dernières nouveautés produits</li>
              <li>Conseils beauté et tutoriels</li>
              <li>Offres exclusives</li>
            </ul>
            
            <p><strong>Votre email :</strong> ${email}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>RIFMA Beauty - Votre beauté, notre passion 💄</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Générer le texte pour la newsletter
generateNewsletterEmailText(email, name) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  
  return `
BIENVENUE À LA NEWSLETTER RIFMA BEAUTY COSMETICS

Bonjour ${firstName},

Merci de vous être inscrit(e) à notre newsletter !

Vous recevrez :
- Nos dernières nouveautés produits
- Conseils beauté et tutoriels  
- Offres exclusives et promotions

Votre email : ${email}

Merci pour votre confiance !
L'équipe RIFMA Beauty
  `.trim();
}


// Ajoutez ces méthodes à la fin de la classe EmailService (avant module.exports)

/**
 * Envoie une notification de nouveau produit à un abonné
 */
async sendNewProductNotification(email, name, productData) {
  try {
    console.log(`📦 Notification produit à ${email}: ${productData.name}`);
    
    const html = this.generateNewProductEmailHTML(email, name, productData);
    const text = this.generateNewProductEmailText(email, name, productData);
    
    const result = await this.service.sendEmail({
      to: email,
      subject: `🎉 Nouveau produit RIFMA Beauty : ${productData.name} !`,
      html,
      text,
      replyTo: process.env.OWNER_EMAIL
    });
    
    console.log(`✅ Notification produit envoyée à: ${email}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur notification produit à ${email}:`, error.message);
    return { 
      success: false, 
      error: error.message,
      to: email
    };
  }
}

/**
 * Envoie une newsletter personnalisée
 */
async sendCustomNewsletter(email, name, subject, content) {
  try {
    console.log(`📰 Newsletter à ${email}: ${subject.substring(0, 30)}...`);
    
    const html = this.generateCustomNewsletterHTML(email, name, subject, content);
    const text = this.generateCustomNewsletterText(email, name, subject, content);
    
    const result = await this.service.sendEmail({
      to: email,
      subject: subject,
      html,
      text,
      replyTo: process.env.OWNER_EMAIL
    });
    
    console.log(`✅ Newsletter envoyée à: ${email}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur newsletter à ${email}:`, error.message);
    return { 
      success: false, 
      error: error.message,
      to: email
    };
  }
}

/**
 * Envoie un digest hebdomadaire des nouveautés
 */
async sendWeeklyDigest(email, name, newProducts) {
  try {
    console.log(`📅 Digest hebdo à ${email}: ${newProducts.length} produits`);
    
    const html = this.generateWeeklyDigestHTML(email, name, newProducts);
    const text = this.generateWeeklyDigestText(email, name, newProducts);
    
    const result = await this.service.sendEmail({
      to: email,
      subject: `📦 Vos nouveautés RIFMA de la semaine !`,
      html,
      text,
      replyTo: process.env.OWNER_EMAIL
    });
    
    console.log(`✅ Digest hebdo envoyé à: ${email}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur digest hebdo à ${email}:`, error.message);
    return { 
      success: false, 
      error: error.message,
      to: email
    };
  }
}

/**
 * Envoie une notification d'abandon de panier
 */
async sendCartReminder(email, name, cartItems) {
  try {
    console.log(`🛒 Rappel panier à ${email}: ${cartItems.length} articles`);
    
    const html = this.generateCartReminderHTML(email, name, cartItems);
    const text = this.generateCartReminderText(email, name, cartItems);
    
    const result = await this.service.sendEmail({
      to: email,
      subject: `👀 Vous avez oublié quelque chose chez RIFMA Beauty...`,
      html,
      text,
      replyTo: process.env.OWNER_EMAIL
    });
    
    console.log(`✅ Rappel panier envoyé à: ${email}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur rappel panier à ${email}:`, error.message);
    return { 
      success: false, 
      error: error.message,
      to: email
    };
  }
}

// ======================
// GÉNÉRATEURS HTML/TEXT
// ======================

generateNewProductEmailHTML(email, name, productData) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .product-card { background: #f8f9fa; border-radius: 15px; padding: 25px; margin: 25px 0; text-align: center; }
        .product-image { max-width: 250px; height: auto; border-radius: 10px; margin: 20px auto; display: block; }
        .product-name { color: #e91e63; font-size: 24px; margin: 15px 0; }
        .price-tag { background: #e91e63; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
        .button { display: inline-block; background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
        .emoji { font-size: 20px; margin-right: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-weight: 300;">🎀 NOUVEAUTÉ EXCLUSIVE</h1>
          <p style="opacity: 0.9; margin: 10px 0 0;">RIFMA Beauty vous présente...</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${firstName} ! 👋</h2>
          <p>Nous sommes tellement excités de vous présenter notre dernière création ! On l'a préparée avec amour rien que pour vous 💕</p>
          
          <div class="product-card">
            <span class="emoji">✨</span>
            <h3 class="product-name">${productData.name}</h3>
            
            ${productData.image ? `<img src="${productData.image}" alt="${productData.name}" class="product-image" />` : ''}
            
            <div style="margin: 20px 0;">
              <p>${productData.description}</p>
              <div class="price-tag">${productData.price.toLocaleString()} FCFA</div>
            </div>
            
            ${productData.custom_message ? `
              <div style="background: #fff8f8; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p><strong>✨ Message spécial :</strong> ${productData.custom_message}</p>
              </div>
            ` : ''}
            
            <p style="margin: 25px 0;">Prêt(e) à essayer cette pépite ?</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${productData.id}" class="button">
              🛍️ Découvrir ce produit
            </a>
          </div>
          
          <p><strong>🎁 Bonus exclusif :</strong> Utilisez le code <strong>BIENVENUE10</strong> pour 10% de réduction sur votre première commande avec ce produit !</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>À très vite sur RIFMA Beauty,<br>
            <span style="color: #e91e63;">L'équipe qui pense à votre beauté 💄</span></p>
          </div>
        </div>
        
        <div class="footer">
          <p><span class="emoji">💕</span> Merci de faire partie de la famille RIFMA Beauty</p>
          <p><small>Vous recevez cet email car vous êtes inscrit(e) à notre newsletter.</small></p>
          <p><small><a href="${process.env.BACKEND_URL || 'http://localhost:5000'}/api/newsletter/unsubscribe" style="color: #666;">Se désinscrire</a></small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

generateWeeklyDigestHTML(email, name, newProducts) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  const today = new Date();
  const weekNumber = Math.ceil((today.getDate() + 32 - today.getDay()) / 7);
  
  const productCards = newProducts.map(product => `
    <div style="background: white; border-radius: 12px; padding: 20px; margin: 15px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
      <div style="display: flex; align-items: center; gap: 20px;">
        ${product.image_url ? `
          <div style="flex-shrink: 0;">
            <img src="${product.image_url}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" />
          </div>
        ` : ''}
        <div style="flex-grow: 1;">
          <h4 style="margin: 0 0 10px; color: #e91e63;">${product.name}</h4>
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">${product.description?.substring(0, 100)}${product.description?.length > 100 ? '...' : ''}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: #e91e63;">${product.price.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #fffafb, #fff); }
        .header { background: linear-gradient(135deg, #000000 0%, #2d2d2d 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 0 0 20px 20px; }
        .content { padding: 30px; }
        .week-badge { background: #e91e63; color: white; padding: 5px 15px; border-radius: 15px; font-size: 14px; display: inline-block; }
        .tip-box { background: #fff8f8; border-left: 4px solid #e91e63; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; margin: 15px 0; font-weight: bold; box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3); }
        .footer { background: #f8f9fa; padding: 25px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
        .social-icons { margin: 20px 0; }
        .social-icons a { margin: 0 10px; color: #e91e63; text-decoration: none; font-size: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-weight: 300; font-size: 32px;">💌 Votre rendez-vous beauté de la semaine</h1>
          <p style="opacity: 0.9; margin: 10px 0 0; font-size: 18px;">Semaine ${weekNumber} • ${today.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="content">
          <h2 style="color: #e91e63;">Bonjour ${firstName} ! 🌸</h2>
          <p>Comme chaque semaine, on est là pour vous gâter ! Voici ce qui vous attend chez RIFMA Beauty...</p>
          
          <div class="week-badge">📦 NOUVEAUTÉS DE LA SEMAINE</div>
          
          ${newProducts.length > 0 ? `
            <p>Notre équipe a déniché ${newProducts.length > 1 ? 'ces pépites' : 'cette pépite'} rien que pour vous :</p>
            ${productCards}
          ` : `
            <div style="text-align: center; padding: 40px 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 20px;">✨</p>
              <p>Aucun nouveau produit cette semaine, mais pas d'inquiétude !</p>
              <p>Notre équipe prépare quelque chose d'extra pour la prochaine édition 💕</p>
            </div>
          `}
          
          <div class="tip-box">
            <h4 style="margin-top: 0; color: #e91e63;">💡 ASTUCE BEAUTÉ DE LA SEMAINE</h4>
            <p>${this.getRandomBeautyTip()}</p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <p style="font-size: 18px; margin-bottom: 20px;">Envie de découvrir tous nos produits ?</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">
              🛍️ Explorer la boutique
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
            <h4 style="color: #e91e63; margin-top: 0;">🎁 OFFRE SPÉCIALE</h4>
            <p>Cette semaine, bénéficiez de <strong>10% de réduction</strong> avec le code :</p>
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0; border: 2px dashed #e91e63;">
              <p style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #e91e63; margin: 0;">SEMAINE${weekNumber}</p>
            </div>
            <p><small>Valable jusqu'au ${this.getEndOfWeekDate()} sur tout le site !</small></p>
          </div>
          
          <div class="social-icons">
            <p>Suivez-nous pour plus de conseils :</p>
            <a href="https://www.instagram.com/rifma_beauty/">📸 Instagram</a>
            <a href="https://www.snapchat.com/add/rifma_beauty">👻 Snapchat</a>
            <a href="https://www.tiktok.com/@rifma.beauty">🎵 TikTok</a>
          </div>
        </div>
        
        <div class="footer">
          <p><span style="color: #e91e63;">💄</span> Avec toute notre affection, l'équipe RIFMA Beauty</p>
          <p><small>123 Dakar plateau, 75008 Dakar, Sénégal • +221 78 717 10 10</small></p>
          <p><small><a href="${process.env.BACKEND_URL || 'http://localhost:5000'}/api/newsletter/unsubscribe" style="color: #999;">Se désinscrire de cette newsletter</a></small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Ajoutez ces méthodes utilitaires à la classe
getRandomBeautyTip() {
  const tips = [
    "💧 N'oubliez pas de bien démaquiller votre peau chaque soir pour la laisser respirer !",
    "🌸 Appliquez votre crème hydratante sur peau légèrement humide pour une meilleure absorption.",
    "✨ Pour un effet glow naturel, mélangez votre fond de teint avec une goutte d'illuminateur.",
    "💕 Un gommage doux une fois par semaine révèle une peau toute neuve !",
    "🫒 Les huiles végétales sont vos alliées pour nourrir en profondeur sans graisser.",
    "🌞 Toujours appliquer de la crème solaire, même quand il ne fait pas beau !",
    "💄 Pour un rouge à lèvres qui tient, appliquez, essuyez avec un mouchoir, puis réappliquez.",
    "👁️ Commencez votre maquillage des yeux AVANT le teint pour éviter les retombées.",
    "🌟 Un spray d'eau thermale rafraîchit et fixe le maquillage en fin de routine.",
    "🥒 Les patches pour les yeux au réfrigérateur sont parfaits pour dégonfler le matin !"
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

getEndOfWeekDate() {
  const today = new Date();
  const daysUntilSunday = 7 - today.getDay();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + daysUntilSunday);
  return endOfWeek.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

generateNewProductEmailText(email, name, productData) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  return `
NOUVELLE CRÉATION RIFMA BEAUTY ✨

Bonjour ${firstName},

Nous sommes ravis de vous présenter notre dernier-né :

🎀 ${productData.name}
💵 ${productData.price.toLocaleString()} FCFA
📝 ${productData.description}

${productData.custom_message ? `✨ Message spécial : ${productData.custom_message}` : ''}

Découvrez-le dès maintenant :
${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${productData.id}

🎁 BONUS : Utilisez le code BIENVENUE10 pour 10% de réduction !

À très vite sur RIFMA Beauty,
L'équipe qui pense à votre beauté 💄
  `.trim();
}

generateWeeklyDigestText(email, name, newProducts) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  const today = new Date();
  const weekNumber = Math.ceil((today.getDate() + 32 - today.getDay()) / 7);
  
  let productsText = '';
  if (newProducts.length > 0) {
    productsText = 'NOUVEAUTÉS DE LA SEMAINE :\n' +
      newProducts.map(p => `• ${p.name} - ${p.price.toLocaleString()} FCFA`).join('\n');
  } else {
    productsText = 'Aucun nouveau produit cette semaine, mais préparez-vous pour la prochaine édition !';
  }
  
  return `
VOTRE RENDEZ-VOUS HEBDOMADAIRE RIFMA BEAUTY 💌

Bonjour ${firstName},

Semaine ${weekNumber} • ${today.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}

${productsText}

💡 ASTUCE BEAUTÉ :
${this.getRandomBeautyTip()}

🎁 OFFRE EXCLUSIVE :
Code : SEMAINE${weekNumber}
→ 10% de réduction valable jusqu'au ${this.getEndOfWeekDate()}

🛍️ Explorer la boutique :
${process.env.FRONTEND_URL || 'http://localhost:5173'}/products

Suivez-nous :
📸 Instagram : https://www.instagram.com/rifma_beauty/
👻 Snapchat : https://www.snapchat.com/add/rifma_beauty
🎵 TikTok : https://www.tiktok.com/@rifma.beauty

Merci de faire partie de la famille RIFMA Beauty 💕

Pour vous désinscrire :
${process.env.BACKEND_URL || 'http://localhost:5000'}/api/newsletter/unsubscribe
  `.trim();
}

// Dans emailService.js - Ajoutez ces méthodes

/**
 * Génère le HTML pour une newsletter personnalisée
 */
generateCustomNewsletterHTML(email, name, subject, content) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .custom-content { background: #f8f9fa; border-radius: 10px; padding: 25px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
        .button { display: inline-block; background: #e91e63; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-weight: 300;">${subject}</h1>
          <p style="opacity: 0.9; margin: 10px 0 0;">RIFMA Beauty Newsletter</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${firstName} ! 👋</h2>
          <p>Comme promis, voici votre newsletter personnalisée :</p>
          
          <div class="custom-content">
            ${content}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>Restons en contact :</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
              🛍️ Visiter la boutique
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>RIFMA Beauty - Votre beauté, notre passion 💄</p>
          <p><small>Vous recevez cet email car vous êtes inscrit(e) à notre newsletter.</small></p>
          <p><small><a href="${process.env.BACKEND_URL || 'http://localhost:5000'}/api/newsletter/unsubscribe" style="color: #666;">Se désinscrire</a></small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Génère le texte pour une newsletter personnalisée
 */
generateCustomNewsletterText(email, name, subject, content) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  
  // Extraire le texte du HTML (simplifié)
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  return `
${subject}
${'='.repeat(subject.length)}

Bonjour ${firstName},

Voici votre newsletter personnalisée RIFMA Beauty :

${textContent}

Visitez notre boutique : ${process.env.FRONTEND_URL || 'http://localhost:5173'}

Merci de faire partie de la famille RIFMA Beauty !

Pour vous désinscrire : ${process.env.BACKEND_URL || 'http://localhost:5000'}/api/newsletter/unsubscribe
  `.trim();
}

/**
 * Génère le HTML pour un rappel de panier
 */
generateCartReminderHTML(email, name, cartItems) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const itemsHTML = cartItems.map(item => `
    <div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee;">
      <div style="flex-grow: 1;">
        <p style="margin: 0; font-weight: bold;">${item.name}</p>
        <p style="margin: 5px 0; color: #666;">Qté: ${item.quantity} × ${item.price.toLocaleString()} FCFA</p>
      </div>
      <div style="font-weight: bold; color: #e91e63;">
        ${(item.price * item.quantity).toLocaleString()} FCFA
      </div>
    </div>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); color: #721c24; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .cart-items { background: white; border-radius: 10px; border: 1px solid #eee; margin: 20px 0; }
        .total { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; font-size: 18px; }
        .button { display: inline-block; background: #e91e63; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin: 10px 0; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-weight: 300;">👀 Votre panier vous attend...</h1>
          <p style="opacity: 0.9; margin: 10px 0 0;">Ne laissez pas ces trésors vous échapper !</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Nous avons remarqué que vous aviez laissé quelques articles dans votre panier RIFMA Beauty.</p>
          <p>Ils sont toujours disponibles et n'attendent que vous ! 💕</p>
          
          <div class="cart-items">
            ${itemsHTML}
          </div>
          
          <div class="total">
            <p style="margin: 0;">Total du panier :</p>
            <p style="font-size: 28px; font-weight: bold; color: #e91e63; margin: 10px 0;">${total.toLocaleString()} FCFA</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>Terminez votre commande en quelques clics :</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart" class="button">
              🛒 Reprendre mon panier
            </a>
          </div>
          
          <div style="background: #fff8f8; padding: 20px; border-radius: 10px; margin: 30px 0;">
            <h3 style="color: #e91e63; margin-top: 0;">✨ Offre spéciale</h3>
            <p>Pour vous aider à finaliser votre commande, utilisez le code :</p>
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 2px dashed #e91e63;">
              <p style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #e91e63; margin: 0;">PANIER10</p>
              <p style="margin: 10px 0 0; color: #666;">10% de réduction valable 24h</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>RIFMA Beauty - Votre beauté, notre passion 💄</p>
          <p><small>Cet email est envoyé automatiquement suite à l'abandon de votre panier.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Génère le texte pour un rappel de panier
 */
generateCartReminderText(email, name, cartItems) {
  const firstName = name ? name.split(' ')[0] : 'cher client';
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const itemsText = cartItems.map(item => 
    `- ${item.name} (x${item.quantity}) : ${(item.price * item.quantity).toLocaleString()} FCFA`
  ).join('\n');
  
  return `
RAPPEL DE PANIER RIFMA BEAUTY

Bonjour ${firstName},

Nous avons remarqué que vous aviez laissé quelques articles dans votre panier :

${itemsText}

Total : ${total.toLocaleString()} FCFA

Terminez votre commande en quelques clics :
${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart

✨ OFFRE SPÉCIALE : Utilisez le code PANIER10 pour 10% de réduction valable 24h !

À bientôt sur RIFMA Beauty,
L'équipe 💄
  `.trim();
}

}

module.exports = new EmailService();