// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL et Anon Key requis dans .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction de test de connexion
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erreur Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Exception Supabase:', error.message);
    return false;
  }
}

module.exports = { supabase, testConnection };