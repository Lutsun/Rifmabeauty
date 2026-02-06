const express = require('express');
const cors = require('cors');
const { supabase } = require('./src/config/supabase');

const app = express();

// Configuration CORS détaillée
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Appliquer CORS avant toutes les routes
app.use(cors(corsOptions));

// Middleware pour logger les requêtes CORS (utile pour le débogage)
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

// Gérer spécifiquement les pré-vols OPTIONS
app.options('*', cors(corsOptions));

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({
    message: 'API RIFMA Beauty',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        updateStock: 'PATCH /api/products/:id/stock'
      },
      orders: {
        create: 'POST /api/orders',
        getOrder: 'GET /api/orders/:identifier',
        getCustomerOrders: 'GET /api/orders/customer/:email',
        updateStatus: 'PATCH /api/orders/:id/status',
        adminGetAll: 'GET /api/admin/orders'
      },
      contact: 'POST /api/contact',
      newsletter: 'POST /api/newsletter/subscribe'
    }
  });
});

// Route santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'rifma-beauty-api'
  });
});

// API Products
app.get('/api/products', async (req, res) => {
  console.log('📦 API Products appelée avec query:', req.query);
  try {
    const { category, featured } = req.query;
    
    console.log('🔍 Exécution de la requête Supabase...');
    console.log('Table products existe?');
    
    // Test simple d'abord
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ ERREUR Supabase (test):', testError);
      console.error('Message:', testError.message);
      console.error('Details:', testError.details);
      console.error('Hint:', testError.hint);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur Supabase: ' + testError.message,
        error: testError 
      });
    }
    
    console.log('✅ Test réussi, données:', testData);
    
    // Nouvelle version avec tri par sort_order :
let query = supabase
  .from('products')
  .select('*')
  .order('sort_order', { ascending: true })    // TRI PAR VOTRE NOUVELLE COLONNE
  .order('category', { ascending: true })     
  .order('name', { ascending: true });         

if (category && category !== 'all') {
  query = query.eq('category', category);
}

if (featured !== undefined) {
  const isFeatured = featured === 'true';
  query = query.eq('featured', isFeatured);
}
    
    console.log('🔍 Exécution de la requête finale...');
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ ERREUR Supabase (finale):', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur Supabase: ' + error.message,
        error: error 
      });
    }
    
    console.log(`✅ ${data.length} produits récupérés`);
    
    res.json({
      success: true,
      count: data.length,
      data: data.map(p => ({
        id: p.product_id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image_url,
        description: p.description,
        shade: p.shade,
        featured: p.featured,
        stock: p.stock,
        inStock: p.in_stock,
        detailImage: p.detail_image_url || p.image_url 
      }))
    });
  } catch (error) {
    console.error('🔥 ERREUR serveur non gérée:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur: ' + error.message,
      stack: error.stack 
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    
    res.json({
      success: true,
      data: {
        id: data.product_id,
        name: data.name,
        category: data.category,
        price: data.price,
        image: data.image_url,
        description: data.description,
        shade: data.shade,
        featured: data.featured,
        stock: data.stock,
        inStock: data.in_stock,
        detailImage: data.detail_image_url || data.image_url
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .update({ stock })
      .eq('product_id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: {
        id: data.product_id,
        stock: data.stock,
        inStock: data.in_stock
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// ROUTES COMMANDES
// ======================

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customer_email,
      customer_name,
      customer_phone,
      shipping_address,
      items,
      subtotal,
      shipping_fee = 0,
      notes
    } = req.body;

    // Validation
    if (!customer_email || !customer_name || !items || !shipping_address || !subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Email, nom, articles, adresse et sous-total requis'
      });
    }

    // 1. Vérifier le stock pour tous les produits
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock, name')
        .eq('product_id', item.productId)
        .single();
      
      if (productError) {
        return res.status(400).json({
          success: false,
          message: `Produit ${item.productId} non trouvé`
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour ${item.name}. Disponible: ${product.stock}, Demandé: ${item.quantity}`
        });
      }
    }

    // 2. Calculer le total
    const total_amount = subtotal + shipping_fee;
    
    // 3. Générer un numéro de commande unique
    const order_number = 'RIFMA-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // 4. Créer la commande
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        order_number,
        customer_email,
        customer_name,
        customer_phone,
        shipping_address,
        items,
        subtotal,
        shipping_fee,
        total_amount,
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        notes,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // 5. Mettre à jour les stocks
    for (const item of items) {
      await supabase.rpc('decrement_stock', {
        product_id: item.productId,
        decrement_by: item.quantity
      });
    }

    // 6. Envoyer les emails (si le service email est configuré)
    try {
      const emailService = require('./src/services/emailService');
      await emailService.sendOrderNotification(order);
      await emailService.sendOrderConfirmation(order);
      console.log(`📧 Emails envoyés pour la commande #${order.order_number}`);
    } catch (emailError) {
      console.log('⚠️ Emails non envoyés (service non configuré):', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès! Paiement à la livraison.',
      data: {
        order_id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        created_at: order.created_at,
        estimated_delivery: '2-3 jours ouvrables'
      }
    });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/orders/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let query = supabase.from('orders').select('*');
    
    if (identifier.includes('-') && identifier.length > 20) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('order_number', identifier);
    }
    
    const { data, error } = await query.single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/orders/customer/:email', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', req.params.email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, admin_note } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Utilisez: ${validStatuses.join(', ')}`
      });
    }

    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('notes')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    const updatedNotes = admin_note ? 
      `[Admin - ${new Date().toLocaleDateString()}]: ${admin_note}\n${currentOrder?.notes || ''}`.trim() :
      currentOrder?.notes;

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date(),
        notes: updatedNotes
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Si la commande est livrée, marquer le paiement comme effectué
    if (status === 'delivered') {
      await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', req.params.id);
    }

    res.json({
      success: true,
      message: `Statut mis à jour: ${status}`,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// ROUTES EMAIL / CONTACT
// ======================

// Dans app.js, modifiez la route /api/contact
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    console.log('📩 API Contact appelée avec:', { name, email });
    
    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et message sont requis'
      });
    }
    
    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide'
      });
    }
    
    // Vérifier si le service email est disponible
    let emailService;
    try {
      emailService = require('./src/services/emailService');
    } catch (err) {
      console.error('❌ Service email non trouvé:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Service email non configuré'
      });
    }
    
    const contactData = { name, email, phone, message };
    
    console.log('📤 Tentative d\'envoi des emails...');
    
    // Envoyer les emails
    const result = await emailService.sendContactMessage(contactData);
    
    console.log('📩 Résultat sendContactMessage:', result);
    
    // CORRECTION ICI : Vérifiez correctement le résultat
    if (result && result.success === true) {
      res.json({
        success: true,
        message: 'Message envoyé avec succès! Nous vous répondrons rapidement.'
      });
    } else {
      // Si result.error existe, l'inclure dans le message
      const errorMsg = result && result.error 
        ? `Erreur: ${result.error}`
        : 'Erreur lors de l\'envoi du message';
      
      console.error('❌ Erreur dans sendContactMessage:', errorMsg);
      res.status(500).json({
        success: false,
        message: errorMsg
      });
    }
    
  } catch (error) {
    console.error('🔥 Erreur dans /api/contact:', error);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur: ' + (error.message || 'Erreur inconnue')
    });
  }
});

// Route pour tester les emails (admin seulement)
app.post('/api/test-email', async (req, res) => {
  try {
    const testOrder = {
      order_number: 'TEST-' + Date.now(),
      customer_name: 'Client Test',
      customer_email: 'test@example.com',
      customer_phone: '+221 78 717 10 10',
      shipping_address: {
        street: '123 Rue Test',
        city: 'Dakar',
        zip: '75000',
        country: 'Sénégal'
      },
      items: [
        { name: 'Candy Rose Gloss', price: 6000, quantity: 2 },
        { name: 'Lip Balm', price: 4500, quantity: 1 }
      ],
      subtotal: 16500,
      shipping_fee: 1000,
      total_amount: 17500,
      status: 'pending',
      created_at: new Date(),
      notes: 'Commande de test'
    };
    
    const emailService = require('./src/services/emailService');
    
    // Envoyer au propriétaire
    await emailService.sendOrderNotification(testOrder);
    
    // Envoyer au client
    await emailService.sendOrderConfirmation(testOrder);
    
    res.json({
      success: true,
      message: 'Emails de test envoyés! Vérifie ta boîte mail.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Service email non configuré ou erreur: ' + error.message
    });
  }
});

// Route pour la newsletter
// Route pour la newsletter - VERSION CORRIGÉE
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    console.log('📧 Newsletter subscription attempt:', { email, name });
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }
    
    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide'
      });
    }
    
    // 1. VÉRIFIER D'ABORD si l'email existe déjà (approche plus robuste)
    let emailExists = false;
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email, active')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Erreur vérification email:', error.message);
      } else if (data) {
        emailExists = true;
        console.log(`ℹ️ Email ${email} existe déjà dans la base`);
        
        // Si l'email existe déjà et est actif, retourner un message
        if (data.active) {
          return res.json({
            success: true,
            alreadySubscribed: true,
            message: 'Cet email est déjà inscrit à notre newsletter!'
          });
        } else {
          // Si l'email existe mais n'est pas actif, le réactiver
          console.log(`🔄 Réactivation de l'email ${email}`);
        }
      }
    } catch (dbError) {
      console.log('ℹ️ Erreur base de données:', dbError.message);
    }
    
    // 2. Insérer ou mettre à jour l'abonné
    let dbResult = null;
    let dbError = null;
    
    try {
      const subscriberData = { 
        email, 
        name: name || null,
        subscribed_at: new Date(),
        source: 'website_form',
        active: true,
        updated_at: new Date()
      };
      
      // Utiliser upsert avec onConflict pour gérer les doublons proprement
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .upsert(subscriberData, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        dbError = error;
        console.error('❌ Erreur Supabase upsert:', error.message);
        
        // Si la table n'existe pas, donner des instructions
        if (error.message.includes('relation "newsletter_subscribers" does not exist')) {
          console.log('⚠️ Table newsletter_subscribers non trouvée');
          return res.status(500).json({
            success: false,
            message: 'La table newsletter n\'est pas configurée. Contactez l\'administrateur.',
            technical: error.message
          });
        }
        
        // Si c'est une erreur de contrainte unique (doublon)
        if (error.message.includes('duplicate key value')) {
          return res.json({
            success: true,
            alreadySubscribed: true,
            message: 'Cet email est déjà inscrit à notre newsletter!'
          });
        }
      } else {
        dbResult = data;
        console.log(`✅ Inscription sauvegardée dans Supabase: ${email}`);
      }
    } catch (dbError) {
      console.log('ℹ️ Erreur base de données upsert:', dbError.message);
    }
    
    // 3. Envoyer un email de confirmation (seulement si nouvel inscrit)
    let emailResult = null;
    if (!emailExists) {
      try {
        const emailService = require('./src/services/emailService');
        emailResult = await emailService.sendNewsletterConfirmation(email, name);
        
        if (emailResult && emailResult.success) {
          console.log('📧 Email de confirmation newsletter:', emailResult.simulated ? 'SIMULÉ' : 'ENVOYÉ');
        } else {
          console.log('ℹ️ Email de confirmation non envoyé');
        }
      } catch (emailError) {
        console.log('ℹ️ Erreur email de confirmation:', emailError.message);
      }
    }
    
    // 4. Log dans la console
    console.log(`🎉 ${emailExists ? 'Email déjà inscrit' : 'Nouvel inscrit'}: ${email} ${name ? '(' + name + ')' : ''}`);
    
    // Retourner la réponse
    if (emailExists) {
      res.json({
        success: true,
        alreadySubscribed: true,
        message: 'Cet email est déjà inscrit à notre newsletter!'
      });
    } else {
      res.json({
        success: true,
        message: 'Merci pour votre inscription à notre newsletter!',
        data: {
          email,
          name: name || null,
          subscribed: true,
          savedToDb: !!dbResult,
          emailSent: emailResult ? emailResult.success : false,
          emailSimulated: emailResult ? emailResult.simulated : true,
          timestamp: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('🔥 Erreur newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription. Réessayez plus tard.'
    });
  }
});

// Route pour vérifier si un email existe déjà
app.post('/api/newsletter/check', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }
    
    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide'
      });
    }
    
    // Vérifier dans la base de données
    let exists = false;
    
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('email', email)
        .eq('active', true)
        .maybeSingle(); // maybeSingle retourne null si aucun résultat
      
      if (error) {
        console.error('Erreur Supabase check:', error.message);
      } else {
        exists = !!data; // true si data existe, false sinon
      }
    } catch (dbError) {
      console.log('ℹ️ Erreur base de données check:', dbError.message);
    }
    
    res.json({
      success: true,
      exists,
      message: exists ? 'Email déjà inscrit' : 'Email disponible'
    });
    
  } catch (error) {
    console.error('🔥 Erreur newsletter check:', error);
    res.status(500).json({
      success: false,
      exists: false,
      message: 'Erreur lors de la vérification'
    });
  }
});


// Route pour récupérer toutes les catégories
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category');
    
    if (error) throw error;
    
    // Extraire les catégories uniques
    const categories = [...new Set(data.map(p => p.category))];
    
    res.json({ 
      success: true, 
      count: categories.length,
      data: categories 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour rechercher des produits
app.get('/api/products/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Requête de recherche trop courte (minimum 2 caractères)'
      });
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,shade.ilike.%${query}%`)
      .order('name');

    if (error) throw error;

    res.json({
      success: true,
      count: data.length,
      data: data.map(p => ({
        id: p.product_id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image_url,
        description: p.description,
        shade: p.shade,
        stock: p.stock,
        featured: p.featured
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.url}`
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('🔥 Erreur globale:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;