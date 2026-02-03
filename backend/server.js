// server.js - À la racine de backend/
const app = require('./app');
const { testConnection } = require('./src/config/supabase');

const PORT = process.env.PORT || 5000;

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
    
    // Démarre le serveur Express
    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('✅ SERVEUR RIFMA BEAUTY DÉMARRÉ');
      console.log('='.repeat(50));
      console.log(`🌐 Port: ${PORT}`);
      console.log(`🔧 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
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