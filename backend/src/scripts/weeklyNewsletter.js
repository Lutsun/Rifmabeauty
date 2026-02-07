// scripts/weeklyNewsletter.js
require('dotenv').config();
const { supabase } = require('../config/supabase');
const emailService = require('../services/emailService');

class WeeklyNewsletter {
  constructor() {
    this.emailService = emailService;
  }

  /**
   * Récupère les nouveaux produits de la semaine
   */
  async getNewProducts() {
    try {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gte('created_at', lastWeek.toISOString())
        .order('created_at', { ascending: false })
        .limit(5); // Limiter à 5 produits maximum
      
      if (error) {
        console.error('❌ Erreur récupération produits:', error.message);
        return [];
      }
      
      console.log(`📦 ${data?.length || 0} nouveaux produits cette semaine`);
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getNewProducts:', error.message);
      return [];
    }
  }

  /**
   * Récupère les abonnés actifs
   */
  async getActiveSubscribers(batchSize = 50) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email, name')
        .eq('active', true)
        .order('subscribed_at', { ascending: false })
        .limit(batchSize);
      
      if (error) {
        console.error('❌ Erreur récupération abonnés:', error.message);
        return [];
      }
      
      console.log(`📧 ${data?.length || 0} abonnés actifs`);
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getActiveSubscribers:', error.message);
      return [];
    }
  }

  /**
   * Envoie le digest hebdomadaire à tous les abonnés
   */
  async sendWeeklyDigestToAll() {
    try {
      console.log('📅 DÉBUT - Envoi digest hebdomadaire');
      
      // 1. Récupérer les nouveaux produits
      const newProducts = await this.getNewProducts();
      
      // 2. Récupérer les abonnés (par batch pour éviter la surcharge)
      const subscribers = await this.getActiveSubscribers();
      
      if (subscribers.length === 0) {
        console.log('ℹ️ Aucun abonné à notifier');
        return { success: true, count: 0 };
      }
      
      console.log(`📤 Envoi à ${subscribers.length} abonnés...`);
      
      // 3. Envoyer à chaque abonné
      let successCount = 0;
      let failCount = 0;
      const failedEmails = [];
      
      for (let i = 0; i < subscribers.length; i++) {
        const subscriber = subscribers[i];
        
        try {
          // Petite pause pour éviter le spam
          if (i > 0 && i % 10 === 0) {
            console.log(`⏳ Pause... ${i}/${subscribers.length} envoyés`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          const result = await this.emailService.sendWeeklyDigest(
            subscriber.email,
            subscriber.name,
            newProducts
          );
          
          if (result.success) {
            successCount++;
            console.log(`✅ ${i + 1}/${subscribers.length}: ${subscriber.email}`);
          } else {
            failCount++;
            failedEmails.push(subscriber.email);
            console.log(`❌ ${i + 1}/${subscribers.length}: ${subscriber.email} - ${result.error}`);
          }
          
          // Petite pause entre chaque email
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          failCount++;
          failedEmails.push(subscriber.email);
          console.error(`🔥 Erreur pour ${subscriber.email}:`, error.message);
        }
      }
      
      console.log('📅 FIN - Digest hebdomadaire terminé');
      console.log(`✅ ${successCount} envoyés avec succès`);
      console.log(`❌ ${failCount} échecs`);
      
      if (failedEmails.length > 0) {
        console.log('📋 Emails en échec:', failedEmails.join(', '));
      }
      
      // Envoyer un rapport au propriétaire
      await this.sendReportToOwner(successCount, failCount, newProducts.length);
      
      return {
        success: true,
        sent: successCount,
        failed: failCount,
        newProducts: newProducts.length,
        totalSubscribers: subscribers.length
      };
      
    } catch (error) {
      console.error('🔥 ERREUR CRITIQUE sendWeeklyDigestToAll:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie un rapport au propriétaire
   */
  async sendReportToOwner(successCount, failCount, productCount) {
    try {
      const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;}</style></head>
        <body>
          <h2>📊 RAPPORT NEWSLETTER HEBDOMADAIRE</h2>
          <p>Date : ${today}</p>
          
          <div style="background:#f8f9fa;padding:20px;border-radius:10px;margin:20px 0;">
            <h3>📈 Statistiques</h3>
            <p><strong>📧 Emails envoyés :</strong> ${successCount}</p>
            <p><strong>❌ Échecs :</strong> ${failCount}</p>
            <p><strong>📦 Nouveaux produits :</strong> ${productCount}</p>
            <p><strong>📅 Prochain envoi :</strong> ${this.getNextSendDate()}</p>
          </div>
          
          <p>💡 Conseil : Vérifiez régulièrement votre compte email pour les réponses automatiques (bounce).</p>
          
          <p style="color:#666;font-size:14px;">Ce rapport a été généré automatiquement par le système RIFMA Beauty.</p>
        </body>
        </html>
      `;
      
      const ownerEmail = process.env.OWNER_EMAIL || 'sergedasylva0411@gmail.com';
      
      await this.emailService.sendCustomNewsletter(
        ownerEmail,
        'Administrateur',
        '📊 Rapport newsletter hebdomadaire',
        html
      );
      
      console.log(`📊 Rapport envoyé à: ${ownerEmail}`);
      
    } catch (error) {
      console.error('❌ Erreur envoi rapport:', error.message);
    }
  }

  getNextSendDate() {
    const now = new Date();
    const daysUntilNextMonday = (8 - now.getDay()) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilNextMonday);
    
    return nextMonday.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const newsletter = new WeeklyNewsletter();
  newsletter.sendWeeklyDigestToAll()
    .then(result => {
      console.log('🎉 Newsletter hebdomadaire terminée:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('🔥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = WeeklyNewsletter;