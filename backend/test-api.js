// test-api.js - Version corrigée
const http = require('http');

const testEndpoints = [
  { path: '/api/health', name: 'Santé' },
  { path: '/api/products', name: 'Tous les produits' },
  { path: '/api/products/1', name: 'Produit ID 1' },
  { path: '/api/categories', name: 'Catégories' }
];

async function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ ${name} - Status: ${res.statusCode}`);
          resolve({ success: true, data: jsonData });
        } catch (e) {
          console.log(`⚠️  ${name} - Status: ${res.statusCode} (Non-JSON)`);
          console.log(`   Réponse: ${data.substring(0, 100)}...`);
          resolve({ success: false, data });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ ${name} - Erreur: ${e.message}`);
      resolve({ success: false, error: e.message });
    });

    req.on('timeout', () => {
      console.error(`⏰ ${name} - Timeout`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Test du backend RIFMA Beauty');
  console.log('================================\n');
  
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint.path, endpoint.name);
    await new Promise(resolve => setTimeout(resolve, 500)); // Pause entre les tests
  }
  
  console.log('\n🎉 Tests terminés!');
}

runTests();