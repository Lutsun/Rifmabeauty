require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { supabase } = require('../config/supabase');
const emailService = require('../services/emailService');

class WeeklyNewsletter {
  constructor() {
    this.emailService = emailService;
    this.batchSize = 30; // Nombre d'emails par lot
    this.delayBetweenEmails = 200; // ms entre chaque email
    this.delayBetweenBatches = 3000; // ms entre chaque lot
  }

  /**
   * Récupère les nouveaux produits (avec meilleure gestion)
   */
  async getNewProducts(days = 7) {
    try {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('products')
        .select('id, product_id, name, description, price, image_url, category, created_at')
        .gte('created_at', sinceDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération produits:', error.message);
        return [];
      }
      
      console.log(`📦 ${data?.length || 0} nouveaux produits ces ${days} derniers jours`);
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getNewProducts:', error.message);
      return [];
    }
  }

  /**
   * Récupère les produits populaires (best-sellers)
   */
  async getPopularProducts(limit = 3) {
    try {
      // Récupérer les produits les plus commandés via les commandes récentes
      const { data: orders, error } = await supabase
        .from('orders')
        .select('items')
        .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString()) // 30 derniers jours
        .limit(50);

      if (error) throw error;

      // Compter les occurrences des produits
      const productCounts = {};
      orders?.forEach(order => {
        order.items?.forEach(item => {
          productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
        });
      });

      // Récupérer les infos des produits populaires
      const popularProductIds = Object.keys(productCounts)
        .sort((a, b) => productCounts[b] - productCounts[a])
        .slice(0, limit);

      if (popularProductIds.length === 0) return [];

      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, product_id, name, description, price, image_url, category')
        .in('product_id', popularProductIds);

      if (productError) throw productError;

      return products || [];
    } catch (error) {
      console.error('❌ Erreur récupération produits populaires:', error.message);
      return [];
    }
  }

  /**
   * Récupère les abonnés actifs avec pagination
   */
  async getActiveSubscribers(page = 1, pageSize = 100) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('newsletter_subscribers')
        .select('email, name, subscribed_at', { count: 'exact' })
        .eq('active', true)
        .order('subscribed_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('❌ Erreur récupération abonnés:', error.message);
        return { data: [], count: 0 };
      }
      
      return { 
        data: data || [], 
        count: count || 0,
        hasMore: (from + pageSize) < (count || 0)
      };
    } catch (error) {
      console.error('❌ Erreur getActiveSubscribers:', error.message);
      return { data: [], count: 0, hasMore: false };
    }
  }

  /**
   * Génère le contenu HTML selon le type de newsletter
   */
  async generateContent(type = 'weekly', newProducts = [], popularProducts = []) {
    const weekNumber = this.getWeekNumber();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });

    // Conseils beauté
    const beautyTips = this.getRandomBeautyTips(3);
    const tipsHTML = beautyTips.map(tip => 
      `<li style="margin: 12px 0; list-style: none; padding-left: 28px; position: relative;">
         <span style="position: absolute; left: 0;">✨</span>
         ${tip}
       </li>`
    ).join('');

    // Produits nouveaux
    const newProductsHTML = newProducts.slice(0, 4).map(product => `
      <div style="background: white; border-radius: 12px; padding: 15px; margin: 15px 0; border: 1px solid #f0e9e9; box-shadow: 0 2px 8px rgba(233,30,99,0.05);">
        <div style="display: flex; align-items: center; gap: 15px;">
          ${product.image_url ? `
            <img src="${product.image_url}" alt="${product.name}" 
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
          ` : ''}
          <div style="flex: 1;">
            <h4 style="margin: 0 0 8px; color: #e91e63; font-size: 16px;">${product.name}</h4>
            <p style="margin: 0 0 8px; color: #666; font-size: 13px;">${product.description?.substring(0, 80)}...</p>
            <span style="font-weight: bold; color: #e91e63; font-size: 15px;">${product.price.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>
    `).join('');

    // Produits populaires
    const popularHTML = popularProducts.slice(0, 3).map(product => `
      <div style="background: #fff8f8; border-radius: 8px; padding: 12px; margin: 8px 0;">
        <p style="margin: 0 0 5px; font-weight: bold;">${product.name}</p>
        <p style="margin: 0; color: #e91e63;">${product.price.toLocaleString()} FCFA</p>
      </div>
    `).join('');

    if (type === 'weekly') {
      return {
        subject: `✨ Votre rendez-vous beauté RIFMA - ${formattedDate}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <!-- EN-TÊTE -->
            <div style="background: linear-gradient(135deg, #000000 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 0 0 20px 20px;">
              <h1 style="margin: 0; font-weight: 300; font-size: 28px;">💌 RIFMA BEAUTY</h1>
              <p style="opacity: 0.9; margin: 10px 0 0; font-size: 16px;">${formattedDate}</p>
            </div>
            
            <div style="padding: 30px;">
              <!-- TITRE -->
              <h2 style="color: #e91e63; text-align: center; margin: 0 0 20px;">Votre dose beauté de la semaine</h2>
              
              <!-- CONSEILS -->
              <div style="background: #fdf2f5; border-radius: 15px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #e91e63; margin-top: 0;">💡 3 CONSEILS BEAUTÉ</h3>
                <ul style="padding: 0;">
                  ${tipsHTML}
                </ul>
              </div>
              
              <!-- NOUVEAUTÉS -->
              ${newProducts.length > 0 ? `
                <div style="margin: 30px 0;">
                  <h3 style="color: #e91e63; border-bottom: 2px solid #e91e63; padding-bottom: 10px;">🆕 NOUVEAUTÉS DE LA SEMAINE</h3>
                  ${newProductsHTML}
                </div>
              ` : ''}
              
              <!-- PRODUITS POPULAIRES -->
              ${popularHTML ? `
                <div style="margin: 30px 0; background: #f8f9fa; padding: 20px; border-radius: 15px;">
                  <h3 style="color: #e91e63; margin-top: 0;">🔥 LES PLUS POPULAIRES</h3>
                  ${popularHTML}
                </div>
              ` : ''}
              
              <!-- OFFRE SPÉCIALE -->
              <div style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: white; border-radius: 15px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="color: white; margin-top: 0;">🎁 OFFRE EXCLUSIVE ABONNÉS</h3>
                <p style="font-size: 18px;">10% de réduction avec le code :</p>
                <div style="background: white; padding: 15px; border-radius: 10px; margin: 15px auto; max-width: 200px;">
                  <p style="font-size: 24px; font-weight: bold; color: #e91e63; letter-spacing: 2px; margin: 0;">WEEK${weekNumber}</p>
                </div>
                <p><small>Valable 7 jours sur tout le site</small></p>
              </div>
              
              <!-- BOUTON -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.VITE_API_URL || 'https://rifmabeauty.com'}/products" 
                   style="display: inline-block; background: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">
                  🛍️ DÉCOUVRIR LA BOUTIQUE
                </a>
              </div>
            </div>
            
            <!-- FOOTER -->
            <div style="background: #f8f9fa; padding: 25px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #eee;">
              <p>RIFMA Beauty - Dakar, Sénégal</p>
              <p>📧 contact@rifmabeauty.com | 📱 +221 78 717 10 10</p>
              <p><a href="${process.env.VITE_API_URL || 'https://api.rifmabeauty.com'}/api/newsletter/unsubscribe?email=[email]" style="color: #999;">Se désinscrire</a></p>
            </div>
          </div>
        `
      };
    } else {
      // Newsletter PROMO
      return {
        subject: `🔥 Offres flash RIFMA Beauty - ${formattedDate}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: white; padding: 40px 30px; text-align: center;">
              <p style="font-size: 48px; margin: 0;">🎁</p>
              <h1 style="margin: 10px 0;">OFFRES FLASH</h1>
              <p style="font-size: 18px; opacity: 0.9;">Réservé aux abonnés RIFMA</p>
            </div>
            
            <div style="padding: 30px;">
              <div style="border: 3px dashed #e91e63; border-radius: 20px; padding: 30px; text-align: center; margin: 20px 0;">
                <h2 style="color: #e91e63; margin-top: 0;">🔥 PROMO EXCLUSIVE</h2>
                <p style="font-size: 20px;">-15% sur toute la boutique</p>
                <div style="background: #000; color: white; padding: 15px; border-radius: 10px; font-size: 30px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
                  FLASH${weekNumber}
                </div>
                <p>⏰ Valable 48h uniquement</p>
              </div>
              
              ${newProducts.length > 0 ? `
                <div style="margin: 30px 0;">
                  <h3>✨ En ce moment chez RIFMA :</h3>
                  ${newProducts.slice(0, 2).map(p => `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0;">
                      <p style="font-weight: bold; margin: 0;">${p.name}</p>
                      <p style="color: #e91e63;">${p.price.toLocaleString()} FCFA</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://rifmabeauty.com'}/products" 
                   style="display: inline-block; background: #e91e63; color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: bold;">
                  JE PROFITE DE L'OFFRE
                </a>
              </div>
            </div>
          </div>
        `
      };
    }
  }

  /**
   * Envoie la newsletter à tous les abonnés
   */
  async sendToAll(type = 'weekly') {
    const startTime = Date.now();
    console.log(`📧 DÉBUT - Envoi newsletter ${type} - ${new Date().toLocaleString('fr-FR')}`);
    
    try {
      // 1. Récupérer les données
      const [newProducts, popularProducts] = await Promise.all([
        this.getNewProducts(type === 'weekly' ? 7 : 3),
        type === 'weekly' ? this.getPopularProducts(3) : Promise.resolve([])
      ]);

      // 2. Générer le contenu
      const content = await this.generateContent(type, newProducts, popularProducts);

      // 3. Statistiques
      let page = 1;
      let sentCount = 0;
      let failCount = 0;
      const failedEmails = [];
      let hasMore = true;

      // 4. Envoyer par lots
      while (hasMore) {
        console.log(`📑 Récupération page ${page}...`);
        const { data: subscribers, count: total, hasMore: more } = 
          await this.getActiveSubscribers(page, this.batchSize);
        
        hasMore = more;

        if (subscribers.length === 0) {
          console.log('ℹ️ Aucun abonné dans ce lot');
          page++;
          continue;
        }

        console.log(`📤 Envoi du lot ${page} (${subscribers.length} abonnés)...`);

        // Envoyer le lot
        for (let i = 0; i < subscribers.length; i++) {
          const sub = subscribers[i];
          
          try {
            const result = await this.emailService.sendCustomNewsletter(
              sub.email,
              sub.name,
              content.subject,
              content.html
            );

            if (result && result.success) {
              sentCount++;
              console.log(`✅ [${sentCount}/${total}] ${sub.email}`);
            } else {
              failCount++;
              failedEmails.push(sub.email);
              console.log(`❌ [${sentCount + failCount}/${total}] ${sub.email}`);
            }

            // Pause entre les emails
            await new Promise(r => setTimeout(r, this.delayBetweenEmails));

          } catch (err) {
            failCount++;
            failedEmails.push(sub.email);
            console.error(`🔥 Erreur ${sub.email}:`, err.message);
          }
        }

        // Pause entre les lots
        if (hasMore) {
          console.log(`⏸️ Pause de ${this.delayBetweenBatches/1000}s avant prochain lot...`);
          await new Promise(r => setTimeout(r, this.delayBetweenBatches));
        }

        page++;
      }

      // 5. Rapport final
      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
      console.log(`
══════════════════════════════════════
📊 RAPPORT FINAL - ${type}
══════════════════════════════════════
✅ Envoyés: ${sentCount}
❌ Échecs: ${failCount}
📦 Nouveautés: ${newProducts.length}
⏱️ Durée: ${duration} minutes
📅 ${new Date().toLocaleString('fr-FR')}
══════════════════════════════════════
      `);

      // 6. Sauvegarder le rapport
      await this.saveReport(type, sentCount, failCount, failedEmails);

      return {
        success: true,
        type,
        sent: sentCount,
        failed: failCount,
        total: sentCount + failCount,
        duration: `${duration} minutes`,
        newProducts: newProducts.length
      };

    } catch (error) {
      console.error('🔥 ERREUR CRITIQUE:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sauvegarde le rapport d'envoi
   */
  async saveReport(type, sent, failed, failedEmails) {
    try {
      // Vérifier si la table existe, sinon la créer
      const { error: createError } = await supabase.rpc('create_newsletter_logs_if_not_exists');
      
      const { error } = await supabase
        .from('newsletter_logs')
        .insert([{
          type,
          sent_count: sent,
          failed_count: failed,
          failed_emails: failedEmails.slice(0, 50), // Limiter pour éviter les gros JSON
          created_at: new Date()
        }]);

      if (error) console.error('❌ Erreur sauvegarde rapport:', error.message);
    } catch (error) {
      console.error('❌ Erreur sauvegarde rapport:', error.message);
    }
  }

  /**
   * Conseils beauté aléatoires
   */
  getRandomBeautyTips(count = 3) {
    const tips = [
      "Hydratez vos lèvres avec notre baume nourrissant avant de dormir",
      "Un gommage doux une fois par semaine pour une peau éclatante",
      "Appliquez votre crème de jour du bout des doigts pour activer la microcirculation",
      "Le sérum visage s'applique toujours avant la crème hydratante",
      "Buvez assez d'eau pour une peau hydratée de l'intérieur",
      "Le contour des yeux mérite une attention particulière quotidienne",
      "Exfoliez vos lèvres avec un gommage doux pour un rouge à lèvres parfait",
      "L'huile végétale est parfaite pour démaquiller en douceur",
      "Massez votre cuir chevelu pour stimuler la pousse des cheveux",
      "Appliquez toujours votre parfum sur les points de pulsation"
    ];
    
    return tips.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  /**
   * Numéro de la semaine
   */
  getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek) + 1;
  }
}

// Point d'entrée principal
if (require.main === module) {
  const newsletter = new WeeklyNewsletter();
  const type = process.argv[2] || 'weekly'; // 'weekly' ou 'promo'
  
  console.log(`🚀 Démarrage newsletter ${type}...`);
  
  newsletter.sendToAll(type)
    .then(result => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('🔥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = WeeklyNewsletter;