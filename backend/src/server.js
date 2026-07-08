const app = require('./app');
const { testConnection } = require('./config/supabase');

const PORT = process.env.PORT || 5173;

async function startServer() {
  try {
    console.log('🚀 Démarrage du serveur RIFMA Beauty...');
    console.log('🔗 Test de connexion à Supabase...');
    
    // Teste la connexion Supabase
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Impossible de se connecter à Supabase');
      console.error('💡 Vérifie ton fichier .env avec SUPABASE_URL et SUPABASE_ANON_KEY');
      process.exit(1);
    }
    
    console.log('✅ Connexion Supabase établie');
    
    // Démarre également cron si activé
    if (process.env.ENABLE_CRON === 'true') {
      console.log('⏰ Démarrage du système cron...');
      require('./cron');
      console.log('✅ Système cron démarré !');
    } else {
      console.log('⏸️  Système cron désactivé (ENABLE_CRON ≠ true)');
    }
    // ================================================
    
    // Démarre le serveur Express
    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('✅ SERVEUR RIFMA BEAUTY DÉMARRÉ');
      console.log('='.repeat(50));
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🔧 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      
      // ======== Verification du cron ========
      if (process.env.ENABLE_CRON === 'true') {
        console.log('⏰ Cron: Activé - Newsletter tous les lundis 10h');
      }
      // ==========================================
      
      console.log('\n📦 ENDPOINTS DISPONIBLES:');
      console.log('   📍 GET  /                     - Page d\'accueil API');
      console.log('   📍 GET  /api/health           - Vérification santé');
      console.log('   📍 GET  /api/products         - Tous les produits');
      console.log('   📍 GET  /api/products/:id     - Produit par ID');
      console.log('   📍 PATCH /api/products/:id/stock - Mettre à jour stock');
      console.log('\n🔍 Exemples:');
      console.log(`   curl http://localhost:${PORT}/api/products`);
      console.log(`   curl http://localhost:${PORT}/api/products/1`);
      console.log('='.repeat(50) + '\n');
    });

    
    // Gestion propre de l'arrêt
    process.on('SIGINT', () => {
      console.log('\n🔻 Arrêt du serveur...');
      server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
      });
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🔻 Arrêt du serveur (SIGTERM)...');
      server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('💥 Erreur démarrage serveur:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Démarre le serveur
startServer();