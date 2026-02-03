require('dotenv').config();
const { supabase } = require('./src/config/supabase'); // CORRECTION IMPORTANTE

const productsData = [
  {
    product_id: '1',
    name: 'Candy Rose Gloss',
    category: 'Glosses',
    price: 6000,
    image_url: '/public/assets/images/gloss1.jpg',
    description: 'Un gloss luxueux à la texture veloutée qui offre une brillance intense et un confort longue durée. Enrichi en huiles précieuses pour des lèvres sublimées.',
    shade: 'Rose Nude',
    featured: true,
    stock: 15
  },
  {
    product_id: '2',
    name: 'Satin Lip Liner',
    category: 'Lip liners',
    price: 3500,
    image_url: '/public/assets/images/crayon1.jpg',
    description: 'Crayon à lèvres ultra-précis pour un tracé parfait. Sa texture satinée glisse délicatement sur les lèvres pour un résultat impeccable.',
    shade: 'Nude Perfection',
    featured: true,
    stock: 10
  },
  {
    product_id: '3',
    name: 'Lip Balm Strawberry',
    category: 'Lip Balms',
    price: 4500,
    image_url: '/public/assets/images/lipbalm2.jpg',
    description: 'Lip Balm strawberry hydratant et nourrissant. Formule enrichie en actifs hydratants.',
    shade: 'Strawberry Kiss',
    featured: true,
    stock: 12   
  },
  {
    product_id: '4',
    name: 'Lip oil',
    category: 'Glosses',
    price: 3800,
    image_url: '/public/assets/images/gloss6.jpg',
    description: 'Lip oil ultra-lumineux avec une texture non collante et un fini éclatant.',
    shade: 'Champagne Silk',
    stock: 8
  },
  {
    product_id: '5',
    name: 'Gloss Brillant',
    category: 'Glosses',
    price: 4500,
    image_url: '/public/assets/images/gloss5.jpg',
    description: 'Gloss brillant à la couleur intense, avec un confort absolu et une tenue longue durée.',
    shade: 'Berry Divine',
    stock: 10
  },
  {
    product_id: '6',
    name: 'Lip Liner',
    category: 'Lip liners',
    price: 3500,
    image_url: '/public/assets/images/crayon2.jpg',
    description: 'Crayon à lèvres ultra-précis pour un tracé parfait. Sa texture satinée glisse délicatement sur les lèvres pour un résultat impeccable.',
    shade: 'Nude Perfection',
    stock: 15
  },
  {
    product_id: '7',
    name: 'Luscious Red Gloss',
    category: 'Glosses',
    price: 4500,
    image_url: '/public/assets/images/gloss2.jpg',
    description: 'Gloss riche en actifs hydratants. Effet volume immédiat et brillance éclatante.',
    shade: 'Crystal Pink',
    stock: 10
  },
  {
    product_id: '8',
    name: 'Lip Balm Vanilla',
    category: 'Lip Balms',
    price: 4500,
    image_url: '/public/assets/images/lipbalm1.jpg',
    description: 'Lip Balm vanilla hydratant et nourrissant. Formule enrichie en actifs hydratants.',
    shade: 'Vanilla Dream',
    stock: 12
  },
   {
    product_id: '9',
    name: 'Mocha Gloss',
    category: 'Glosses',
    price: 4500,
    image_url: '/public/assets/images/gloss4.jpg',
    description: 'Gloss marron avec un effet volume immédiat et brillance éclatante.',
    shade: 'Mocha Brown',
    stock: 10
  },
  {
    product_id: '10',
    name: 'White Lip Balm',
    category: 'Lip Balms',
    price: 4500,
    image_url: '/public/assets/images/lipbalm3.jpg',
    description: 'Lip Balm blanc hydratant et nourrissant. Formule enrichie en actifs hydratants.',
    shade: 'White Dream',
    stock: 12
  },
  {
    product_id: '11',
    name: 'strawberry Lip Balm',
    category: 'Lip Balms',
    price: 4500,
    image_url: '/public/assets/images/lipbalm5.jpg',
    description: 'Lip Balm rose hydratant et nourrissant. Formule enrichie en actifs hydratants.',
    shade: 'Pink Dream',
    stock: 12
  },
  {
    product_id: '12',
    name: 'Miss Lady',
    category: 'Glosses',
    price: 3200,
    image_url: '/public/assets/images/gloss3.jpg',
    description: 'Gloss rose avec un effet volume immédiat et brillance éclatante. Texture crémeuse et tenue impeccable.',
    shade: 'Rose Wood',
    stock: 10
  },
  {
    product_id: '13',
    name: 'Satin Luxe Lipstick',
    category: 'Lip liners',
    price: 4500,
    image_url: '/public/assets/images/rougealevre1.jpg',
    description: 'Rouge à lèvres satin lumineux offrant le parfait équilibre entre couleur vibrante et confort hydratant.',
    shade: 'Coral Bliss',
    stock: 10
  },
  {
    product_id: '14',
    name: 'Brown Lipstick',
    category: 'Lip liners',
    price: 4500,
    image_url: '/public/assets/images/rougealevre2.jpg',
    description: 'Rouge à lèvres marron offrant le parfait équilibre entre couleur vibrante et confort hydratant.',
    shade: 'Caramel Brown',
    stock: 10
  }
];

async function seedSupabase() {
  try {
    console.log('🌱 Début du seed vers Supabase...');
    console.log(`📦 Nombre de produits à insérer: ${productsData.length}`);
    
    // Test de connexion d'abord
    console.log('🔗 Test de connexion à Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Impossible de se connecter à Supabase:', testError.message);
      console.error('🔧 Vérifie:');
      console.error('   1. Ton fichier .env avec SUPABASE_URL et SUPABASE_ANON_KEY');
      console.error('   2. Que la table "products" existe dans Supabase');
      process.exit(1);
    }
    
    console.log('✅ Connexion à Supabase réussie!');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insérer un par un pour meilleur contrôle
    for (const product of productsData) {
      console.log(`\n🔹 Traitement: ${product.name} (ID: ${product.product_id})`);
      
      try {
        // CORRECTION : upsert() attend un tableau [product]
        const { data, error } = await supabase
          .from('products')
          .upsert([product], { 
            onConflict: 'product_id'
          });
        
        if (error) {
          console.error(`❌ Erreur sur ${product.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ ${product.name} inséré/mis à jour`);
          successCount++;
        }
      } catch (singleError) {
        console.error(`💥 Exception sur ${product.name}:`, singleError.message);
        errorCount++;
      }
      
      // Petite pause pour éviter les rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 ========== RÉSUMÉ ==========');
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📈 Total traité: ${productsData.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Seed Supabase terminé avec succès !');
    } else {
      console.log(`\n⚠️ Seed terminé avec ${errorCount} erreur(s)`);
    }
    
    // Vérification finale
    console.log('\n🔍 Vérification finale des données...');
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('product_id, name, category, stock')
      .order('product_id');
    
    if (fetchError) {
      console.error('❌ Erreur lors de la vérification:', fetchError.message);
    } else {
      console.log(`📊 Total produits en base: ${allProducts.length}`);
      
      // Afficher par catégorie
      console.log('\n📋 Distribution par catégorie:');
      const categories = {};
      allProducts.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
      });
      
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`   - ${category}: ${count} produit(s)`);
      });
      
      // Afficher les 5 premiers produits
      console.log('\n📝 Exemple de produits:');
      allProducts.slice(0, 5).forEach(p => {
        console.log(`   ${p.product_id}: ${p.name} (Stock: ${p.stock})`);
      });
    }
    
    process.exit(errorCount === 0 ? 0 : 1);
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

seedSupabase();