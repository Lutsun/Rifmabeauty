// cron.js
require('dotenv').config();
const cron = require('node-cron');
const WeeklyNewsletter = require('./scripts/weeklyNewsletter');

console.log('⏰ Initialisation du système de newsletters automatiques...');

// Planifier l'envoi tous les lundis à 10h
cron.schedule('0 10 * * 1', () => {
  console.log('📅 CRON: Début de l\'envoi hebdomadaire (Lundi 10h)');
  
  const newsletter = new WeeklyNewsletter();
  
  newsletter.sendWeeklyDigestToAll()
    .then(result => {
      console.log('✅ CRON: Newsletter hebdo terminée:', result);
    })
    .catch(error => {
      console.error('❌ CRON: Erreur newsletter:', error);
    });
});

// Planifier un test tous les jours à 11h (pour développement)
if (process.env.NODE_ENV === 'development') {
  cron.schedule('0 11 * * *', () => {
    console.log('🧪 CRON DEV: Test quotidien activé');
    // Ici vous pouvez ajouter un test léger
  });
}

console.log('✅ Système cron démarré !');
console.log('📅 Prochain envoi: Tous les lundis à 10h');