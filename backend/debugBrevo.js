// debugBrevo.js
require('dotenv').config();
const path = require('path');

console.log('🔍 DEBUG BREVO - Diagnostic complet\n');

// ============================================
// 1. VÉRIFICATION DU FICHIER .env
// ============================================
console.log('1. 📂 Vérification du fichier .env');
console.log('==================================');

const envPath = path.join(__dirname, '.env');
console.log(`Emplacement .env: ${envPath}`);

try {
  const fs = require('fs');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Fichier .env trouvé');
    
    // Extraire les variables importantes
    const envVars = {
      EMAIL_SERVICE: null,
      EMAIL_FROM: null,
      EMAIL_NAME: null,
      BREVO_API_KEY: null,
      OWNER_EMAIL: null
    };
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        
        if (envVars.hasOwnProperty(key)) {
          envVars[key] = value;
        }
      }
    });
    
    console.log('📊 Variables extraites:');
    Object.entries(envVars).forEach(([key, value]) => {
      const status = value ? '✓' : '✗';
      const displayValue = key === 'BREVO_API_KEY' 
        ? (value ? `[${value.length} caractères] ${value.substring(0, 15)}...` : 'Non défini')
        : value || 'Non défini';
      console.log(`   ${status} ${key}=${displayValue}`);
    });
  } else {
    console.log('❌ Fichier .env NON TROUVÉ à:', envPath);
    console.log('Créé à la racine du backend ?');
  }
} catch (error) {
  console.log('❌ Erreur lecture .env:', error.message);
}

console.log('\n2. 🔧 Configuration Node.js');
console.log('==========================');

// Vérifier les variables chargées
console.log('Variables process.env:');
const checkVars = ['EMAIL_SERVICE', 'EMAIL_FROM', 'EMAIL_NAME', 'BREVO_API_KEY', 'OWNER_EMAIL'];
checkVars.forEach(key => {
  const value = process.env[key];
  if (value) {
    if (key === 'BREVO_API_KEY') {
      console.log(`   ✓ ${key}=[${value.length} caractères] ${value.substring(0, 10)}...`);
      
      // Vérifier le format de la clé API
      if (!value.startsWith('xkeysib-')) {
        console.log('   ⚠️  La clé API ne commence pas par "xkeysib-", format suspect');
      }
    } else if (key === 'EMAIL_FROM') {
      console.log(`   ✓ ${key}=${value}`);
      
      // Vérifier le format de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value.includes('<')) {
        console.log(`   ❌ FORMAT INVALIDE: "${value}" contient "<"`);
        console.log('   → Brevo attend juste l\'email: "sergedasylva0411@gmail.com"');
        console.log('   → Pas: "Nom <email@domain.com>"');
        
        // Extraire l'email s'il est dans <>
        const match = value.match(/<([^>]+)>/);
        if (match) {
          const extractedEmail = match[1];
          console.log(`   💡 Email extrait: "${extractedEmail}"`);
          console.log(`   → Utilisez: EMAIL_FROM=${extractedEmail}`);
        }
      } else if (!emailRegex.test(value)) {
        console.log(`   ❌ FORMAT INVALIDE: "${value}" n\'est pas un email valide`);
      } else {
        console.log(`   ✅ Format email OK: "${value}"`);
      }
    } else {
      console.log(`   ✓ ${key}=${value}`);
    }
  } else {
    console.log(`   ✗ ${key}=NON DÉFINI`);
  }
});

console.log('\n3. 🧪 Test direct Brevo API');
console.log('===========================');

// Tester directement l'API Brevo sans passer par notre service
async function testDirectBrevoAPI() {
  try {
    const SibApiV3Sdk = require('sib-api-v3-sdk');
    
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey || apiKey === 'dummy-key-for-dev') {
      console.log('⚠️  Clé API non configurée ou mode simulation');
      return;
    }
    
    console.log('🔗 Connexion à l\'API Brevo...');
    
    // Configurer le client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;
    
    const apiInstance = new SibApiV3Sdk.AccountApi();
    
    // 1. Tester la connexion en récupérant les infos du compte
    console.log('📡 Test 1: Récupération infos compte...');
    try {
      const accountInfo = await apiInstance.getAccount();
      console.log(`   ✅ Compte Brevo OK`);
      console.log(`   📧 Plan: ${accountInfo.plan?.[0]?.type || 'Inconnu'}`);
      console.log(`   💰 Crédits: ${accountInfo.plan?.[0]?.credits || 'Inconnu'}`);
    } catch (accountError) {
      console.log(`   ❌ Erreur compte: ${accountError.message}`);
      if (accountError.response?.body) {
        console.log(`   Détails: ${JSON.stringify(accountError.response.body)}`);
      }
    }
    
    // 2. Tester l'envoi d'email
    console.log('\n📡 Test 2: Envoi d\'email test...');
    
    const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    // Préparer l'email
    sendSmtpEmail.subject = '🔧 Debug Brevo - Test direct';
    sendSmtpEmail.htmlContent = '<h1>Test Debug</h1><p>Ceci est un test direct de l\'API Brevo</p>';
    sendSmtpEmail.textContent = 'Test debug - API Brevo directe';
    
    // Utiliser l'email FROM correctement
    const emailFrom = process.env.EMAIL_FROM;
    let cleanEmailFrom = emailFrom;
    
    // Nettoyer l'email si format "Nom <email>"
    if (emailFrom && emailFrom.includes('<')) {
      const match = emailFrom.match(/<([^>]+)>/);
      if (match) {
        cleanEmailFrom = match[1];
        console.log(`   🔧 Email nettoyé: "${cleanEmailFrom}" (original: "${emailFrom}")`);
      }
    }
    
    sendSmtpEmail.sender = {
      name: process.env.EMAIL_NAME || 'RIFMA Beauty',
      email: cleanEmailFrom || 'test@example.com'
    };
    
    sendSmtpEmail.to = [{
      email: process.env.OWNER_EMAIL || 'sergedasylva0411@gmail.com'
    }];
    
    console.log(`   📤 Expéditeur: ${sendSmtpEmail.sender.name} <${sendSmtpEmail.sender.email}>`);
    console.log(`   📨 Destinataire: ${sendSmtpEmail.to[0].email}`);
    
    try {
      const result = await transactionalApi.sendTransacEmail(sendSmtpEmail);
      console.log(`   ✅ Email envoyé avec succès!`);
      console.log(`   🆔 Message ID: ${result.messageId}`);
    } catch (emailError) {
      console.log(`   ❌ Erreur envoi email: ${emailError.message}`);
      
      if (emailError.response?.body) {
        const errorBody = emailError.response.body;
        console.log(`   📋 Code erreur: ${errorBody.code}`);
        console.log(`   📋 Message: ${errorBody.message}`);
        
        // Suggestions selon l'erreur
        if (errorBody.message.includes('valid sender email')) {
          console.log('\n💡 SOLUTION:');
          console.log('   1. Allez sur: https://app.brevo.com/senders');
          console.log('   2. Ajoutez/vérifiez:', cleanEmailFrom);
          console.log('   3. Cliquez sur le lien de vérification dans vos emails');
          console.log('   4. Attendez 5-10 minutes');
          console.log('   5. Réessayez');
        } else if (errorBody.message.includes('unauthorized')) {
          console.log('\n💡 SOLUTION: Clé API invalide ou expirée');
          console.log('   1. Générez une nouvelle clé sur Brevo');
          console.log('   2. Mettez à jour BREVO_API_KEY dans .env');
        }
      }
    }
    
  } catch (error) {
    console.log(`🔥 Erreur générale: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// ============================================
// 4. VÉRIFICATION DES SENDERS BREVO
// ============================================
console.log('\n4. 📋 Senders vérifiés sur Brevo');
console.log('==============================');

async function checkBrevoSenders() {
  try {
    const SibApiV3Sdk = require('sib-api-v3-sdk');
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey || apiKey === 'dummy-key-for-dev') {
      console.log('⚠️  Clé API non configurée - impossible de vérifier');
      return;
    }
    
    // Configurer le client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;
    
    const apiInstance = new SibApiV3Sdk.SendersApi();
    
    try {
      const senders = await apiInstance.getSenders();
      console.log(`✅ ${senders.senders?.length || 0} sender(s) configuré(s):`);
      
      if (senders.senders && senders.senders.length > 0) {
        senders.senders.forEach((sender, index) => {
          console.log(`   ${index + 1}. ${sender.name} <${sender.email}>`);
          console.log(`      Statut: ${sender.active ? '✅ Actif' : '❌ Inactif'}`);
          console.log(`      Vérifié: ${sender.ips ? '✅ Oui' : '❌ Non'}`);
          console.log(`      ID: ${sender.id}`);
        });
        
        // Vérifier si notre email est dans la liste
        const emailFrom = process.env.EMAIL_FROM;
        let cleanEmail = emailFrom;
        if (emailFrom && emailFrom.includes('<')) {
          const match = emailFrom.match(/<([^>]+)>/);
          if (match) cleanEmail = match[1];
        }
        
        const foundSender = senders.senders.find(s => 
          s.email === cleanEmail || 
          (emailFrom && s.email === emailFrom)
        );
        
        if (foundSender) {
          console.log(`\n🎯 VOTRE EMAIL TROUVÉ: ${foundSender.email}`);
          console.log(`   Statut: ${foundSender.active ? '✅ Actif' : '❌ Inactif'}`);
          console.log(`   Vérifié: ${foundSender.ips ? '✅ Oui' : '❌ Non (problème ici!)'}`);
          
          if (!foundSender.ips) {
            console.log('\n🚨 PROBLÈME: Votre email n\'est pas vérifié!');
            console.log('   Allez sur: https://app.brevo.com/senders');
            console.log('   Cherchez:', cleanEmail);
            console.log('   Cliquez sur "Resend validation"');
          }
        } else {
          console.log(`\n❌ VOTRE EMAIL NON TROUVÉ: ${cleanEmail || emailFrom}`);
          console.log('   Vous devez l\'ajouter comme sender dans Brevo');
        }
      } else {
        console.log('   ❌ Aucun sender configuré');
        console.log('   → Ajoutez un sender: https://app.brevo.com/senders');
      }
    } catch (error) {
      console.log(`❌ Erreur récupération senders: ${error.message}`);
    }
  } catch (error) {
    console.log(`❌ Impossible de vérifier les senders: ${error.message}`);
  }
}

// ============================================
// EXÉCUTION DES TESTS
// ============================================
(async () => {
  console.log('\n🔍 LANCEMENT DES TESTS...\n');
  
  await checkBrevoSenders();
  console.log('\n' + '='.repeat(50));
  await testDirectBrevoAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 RÉSUMÉ DIAGNOSTIC');
  console.log('='.repeat(50));
  
  // Résumé final
  const issues = [];
  
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'dummy-key-for-dev') {
    issues.push('❌ Clé API Brevo non configurée');
  }
  
  if (!process.env.EMAIL_FROM) {
    issues.push('❌ EMAIL_FROM non défini');
  } else if (process.env.EMAIL_FROM.includes('<')) {
    issues.push('❌ EMAIL_FROM a mauvais format (contient "<")');
  }
  
  if (issues.length === 0) {
    console.log('✅ Configuration de base OK');
    console.log('🔍 Le problème est probablement:');
    console.log('   1. Email non vérifié dans Brevo Senders');
    console.log('   2. Délai de validation (attendre 5-10 min)');
    console.log('   3. Clé API expirée/invalide');
  } else {
    console.log('🚨 Problèmes détectés:');
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  console.log('\n💡 ACTIONS RECOMMANDÉES:');
  console.log('   1. Vérifiez https://app.brevo.com/senders');
  console.log('   2. Assurez-vous que votre email est "Validated" (pas "Pending")');
  console.log('   3. Vérifiez le format dans .env: EMAIL_FROM=votre@email.com');
  console.log('   4. Redémarrez le serveur après corrections');
  
  console.log('\n🔧 COMMANDES UTILES:');
  console.log('   # Vérifier la configuration');
  console.log('   node debugBrevo.js');
  console.log('   # Redémarrer le serveur');
  console.log('   npm run dev');
  console.log('   # Tester un email simple');
  console.log('   curl -X POST http://localhost:5000/api/test-email');
})();