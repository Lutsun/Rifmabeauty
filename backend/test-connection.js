// Crée un fichier test-connection.js
const { testConnection } = require('./src/config/supabase');

async function test() {
  console.log('🔄 Test de connexion...');
  const connected = await testConnection();
  console.log(connected ? '✅ Connecté' : '❌ Échec');
  process.exit(connected ? 0 : 1);
}

test();