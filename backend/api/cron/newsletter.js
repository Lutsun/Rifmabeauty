// api/cron/newsletter.js
const { supabase } = require('../../config/supabase');
const WeeklyNewsletter = require('../../scripts/weeklyNewsletter');

module.exports = async (req, res) => {
  // 🔒 Sécurité : Vérifier que c'est Vercel qui appelle
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (process.env.NODE_ENV === 'production' && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Tentative non autorisée');
      return res.status(401).json({ success: false, error: 'Non autorisé' });
    }
  }

  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();

  console.log(`⏰ Cron exécuté - Jour: ${day}, Heure: ${hour}`);

  // Déterminer quel type de newsletter envoyer
  let newsletterType = null;
  
  if (day === 1 && hour === 10) newsletterType = 'weekly';      // Lundi
  else if (day === 4 && hour === 10) newsletterType = 'promo';  // Jeudi
  else if (req.query.type) newsletterType = req.query.type;     // Test manuel

  if (!newsletterType) {
    return res.status(200).json({ 
      success: true, 
      message: 'Pas d\'envoi programmé'
    });
  }

  try {
    console.log(`🚀 Envoi newsletter ${newsletterType}...`);
    
    const newsletter = new WeeklyNewsletter();
    const result = await newsletter.sendToAll(newsletterType);

    return res.status(200).json({
      success: true,
      type: newsletterType,
      result
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};