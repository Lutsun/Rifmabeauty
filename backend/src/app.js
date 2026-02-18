const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/supabase');

const app = express();

// Configuration CORS détaillée
const corsOptions = {
  origin: ['https://rifmabeauty.com','https://www.rifmabeauty.com','https://rifmabeauty-frontend.vercel.app','https://api.rifmabeauty.com', 'https://rifmabeauty-backend.vercel.app','http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Route de debug email service
app.get('/api/debug-email-service', async (req, res) => {
  console.log('🔍 Debug email service endpoint called');
  
  try {
    // Test 1: Variables d'environnement
    const env = {
      EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'NOT SET',
      OWNER_EMAIL: process.env.OWNER_EMAIL || 'NOT SET',
      BREVO_API_KEY: process.env.BREVO_API_KEY ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
    
    console.log('📋 Environment:', env);
    
    // Test 2: Essayons de charger le service
    console.log('🔄 Attempting to load emailService...');
    let emailService;
    try {
      emailService = require('./services/emailService');
      console.log('✅ emailService loaded successfully');
    } catch (loadError) {
      console.error('❌ Failed to load emailService:', loadError.message);
      console.error('Stack:', loadError.stack);
      
      // Vérifier les fichiers
      const fs = require('fs');
      const path = require('path');
      
      const servicesPath = path.join(__dirname, 'services');
      console.log('📁 Services path:', servicesPath);
      console.log('📁 Exists?', fs.existsSync(servicesPath));
      
      if (fs.existsSync(servicesPath)) {
        const files = fs.readdirSync(servicesPath);
        console.log('📄 Files in services:', files);
      }
      
      return res.status(500).json({
        success: false,
        error: 'Failed to load emailService',
        details: loadError.message,
        env: env
      });
    }
    
    // Test 3: Tester sendContactMessage
    console.log('🧪 Testing sendContactMessage...');
    const testData = {
      name: "Debug Test",
      email: "debug@example.com",
      phone: "+221 78 717 10 10",
      message: "Test message from debug endpoint"
    };
    
    const result = await emailService.sendContactMessage(testData);
    
    res.json({
      success: true,
      message: 'Email service test completed',
      env: env,
      testResult: result,
      serviceType: emailService.service ? emailService.service.constructor.name : 'Unknown'
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

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
        id: p.id,
        productId: p.product_id,
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
    const { id } = req.params;
    console.log(`🔍 Recherche produit avec ID: ${id} (longueur: ${id.length})`);
    
    let query = supabase.from('products').select('*');
    
    // Déterminer si c'est un UUID ou un product_id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUuid) {
      console.log('🔑 Recherche par UUID (colonne id)');
      query = query.eq('id', id);
    } else {
      console.log('🔑 Recherche par product_id');
      query = query.eq('product_id', id);
    }
    
    // Utiliser maybeSingle() au lieu de single() pour éviter l'erreur
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('❌ Erreur recherche produit:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur base de données: ' + error.message
      });
    }
    
    if (!data) {
      console.log('❌ Produit non trouvé avec ID:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Produit non trouvé' 
      });
    }
    
    console.log(`✅ Produit trouvé: ${data.name} (ID: ${data.id})`);
    
    res.json({
      success: true,
      data: {
        id: data.id,
        productId: data.product_id,
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
    console.error('🔥 Erreur dans /api/products/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
      notes,
      promo_code // Nouveau champ pour le code promo
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
        .select('stock, name, product_id')
        .eq('id', item.id)
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

    // 2. Gérer le code promo si présent
    let discount_amount = 0;
    let final_subtotal = subtotal;
    let discount_details = null;

    if (promo_code) {
      console.log(`🎫 Application du code promo: ${promo_code}`);
      
      // Récupérer le code promo
      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('active', true)
        .single();

      if (!promoError && promo) {
        // Vérifier les conditions
        const now = new Date();
        const isValid = (!promo.valid_until || new Date(promo.valid_until) >= now) &&
                       (!promo.valid_from || new Date(promo.valid_from) <= now) &&
                       (!promo.max_uses || promo.used_count < promo.max_uses) &&
                       (!promo.min_purchase || subtotal >= promo.min_purchase);

        if (isValid) {
          // Calculer la réduction
          if (promo.discount_type === 'percentage') {
            discount_amount = Math.round(subtotal * (promo.discount_value / 100));
          } else if (promo.discount_type === 'fixed') {
            discount_amount = Math.min(promo.discount_value, subtotal);
          }
          
          final_subtotal = subtotal - discount_amount;
          
          discount_details = {
            code: promo.code,
            type: promo.discount_type,
            value: promo.discount_value,
            amount: discount_amount
          };
          
          // Incrémenter le compteur d'utilisations DIRECTEMENT
          await supabase
            .from('promo_codes')
            .update({ used_count: promo.used_count + 1 })
            .eq('id', promo.id);
        }
      }
    }

    // 3. Calculer le total final
    const total_amount = final_subtotal + shipping_fee;
    
    // 4. Générer un numéro de commande unique
    const order_number = 'RIFMA-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // 5. Gérer le client
    const customer = await manageCustomer(
      customer_email,
      customer_name,
      customer_phone,
      shipping_address
    );

    // 6. Créer la commande avec les infos de réduction (SANS promo_id)
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
        discount_amount,
        discount_details,
        promo_code: promo_code || null,
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        notes,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // 7. Mettre à jour les stocks
    try {
      for (const item of items) {
        let productUuid = item.id;
        
        if (!productUuid || productUuid.length < 36) {
          const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('product_id', item.productId)
            .single();
          
          if (product) {
            productUuid = product.id;
          }
        }
        
        if (productUuid) {
          await supabase.rpc('decrement_stock', {
            product_uuid: productUuid,
            decrement_by: item.quantity
          });
        }
      }
    } catch (stockError) {
      console.error('🔥 Erreur mise à jour stock:', stockError);
    }

    // 8. Mettre à jour les stats du client
    await updateCustomerStats(customer_email, total_amount);

    // 9. Envoyer les emails
    try {
      const emailService = require('./services/emailService');
      await emailService.sendOrderNotification(order);
      await emailService.sendOrderConfirmation(order);
    } catch (emailError) {
      console.log('⚠️ Emails non envoyés:', emailError.message);
    }

    // 10. Réponse avec les infos de réduction
    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès!',
      data: {
        order_id: order.id,
        order_number: order.order_number,
        original_subtotal: subtotal,
        discount_amount: discount_amount,
        final_subtotal: final_subtotal,
        total_amount: order.total_amount,
        discount_details: discount_details,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        created_at: order.created_at,
        estimated_delivery: '1-2 jours ouvrables',
        customer: {
          email: customer_email,
          has_customer_record: !!customer
        }
      }
    });

  } catch (error) {
    console.error('🔥 Erreur création commande:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour vérifier et valider un code promo
app.post('/api/promo/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code promo requis'
      });
    }

    console.log(`🎫 Validation du code promo: ${code}`);

    // Récupérer le code promo depuis la base de données
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.error('❌ Erreur lors de la récupération du code promo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la validation du code'
      });
    }

    // Si le code n'existe pas
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Code promo invalide'
      });
    }

    // Vérifier si le code a expiré
    const now = new Date();
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return res.status(400).json({
        success: false,
        message: 'Ce code promo a expiré'
      });
    }

    // Vérifier si le code n'a pas encore commencé
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return res.status(400).json({
        success: false,
        message: 'Ce code promo n\'est pas encore valide'
      });
    }

    // Vérifier le nombre d'utilisations maximum
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return res.status(400).json({
        success: false,
        message: 'Ce code promo a atteint sa limite d\'utilisations'
      });
    }

    // Calculer la réduction en fonction du type
    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = promo.discount_value; // Ex: 10 pour 10%
    } else if (promo.discount_type === 'fixed') {
      discountAmount = promo.discount_value; // Montant fixe en FCFA
    }

    res.json({
      success: true,
      message: 'Code promo valide!',
      data: {
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discountAmount,
        description: promo.description,
        min_purchase: promo.min_purchase || 0
      }
    });

  } catch (error) {
    console.error('🔥 Erreur validation code promo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
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

// route api/contact
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
      emailService = require('./services/emailService');
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
    
    const emailService = require('./services/emailService');
    
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
        const emailService = require('./services/emailService');
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

    if (error) {
      console.error('❌ Erreur recherche:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur recherche: ' + error.message 
      });
    }

    res.json({
      success: true,
      count: data?.length || 0,
      data: (data || []).map(p => ({
        id: p.id, // <-- Ajouter l'UUID
        productId: p.product_id, // <-- Ajouter product_id
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image_url,
        description: p.description,
        shade: p.shade,
        stock: p.stock,
        featured: p.featured,
        inStock: p.in_stock
      }))
    });
  } catch (error) {
    console.error('🔥 Erreur recherche produits:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ======================
// ROUTES CLIENTS
// ======================

// Route pour récupérer les infos d'un client par email
app.get('/api/customers/:email', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', req.params.email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Pas trouvé
        return res.status(404).json({
          success: false,
          message: 'Client non trouvé'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour récupérer les commandes d'un client avec ses infos
app.get('/api/customers/:email/full-profile', async (req, res) => {
  try {
    // 1. Récupérer le client
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', req.params.email)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      throw customerError;
    }

    // 2. Récupérer ses commandes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', req.params.email)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    res.json({
      success: true,
      data: {
        customer: customer || null,
        orders: orders || [],
        order_count: orders?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// ROUTES MARKETING / NOTIFICATIONS
// ======================

// Route pour notifier d'un nouveau produit (admin)
app.post('/api/admin/notify-new-product', async (req, res) => {
  try {
    const { product_id, custom_message } = req.body;
    
    // Vérification basique (dans un vrai système, ajouter une authentification admin)
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'ID produit requis'
      });
    }
    
    // Récupérer les infos du produit
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', product_id)
      .single();
    
    if (error) throw error;
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    // Préparer les données du produit
    const productData = {
      id: product.product_id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image_url,
      description: product.description,
      custom_message: custom_message || `Nouveau produit disponible : ${product.name}!`
    };
    
    // Envoyer les notifications
    const result = await sendProductNotificationToSubscribers(productData);
    
    res.json({
      success: result.success,
      message: result.message,
      data: {
        product: productData,
        notification_result: result
      }
    });
  } catch (error) {
    console.error('🔥 Erreur notification produit:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour envoyer une newsletter personnalisée (admin)
app.post('/api/admin/send-newsletter', async (req, res) => {
  try {
    const { subject, content, segment } = req.body;
    
    // Vérification admin
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sujet et contenu requis'
      });
    }
    
    // Récupérer les abonnés selon le segment
    let query = supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('active', true);
    
    if (segment === 'recent_customers') {
      // Clients ayant commandé récemment (dernier mois)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      // Note: Cette requête nécessite une jointure
      // Pour simplifier, on prend tous les abonnés
      console.log('📧 Segment: clients récents (simplifié)');
    }
    
    const { data: subscribers, error } = await query;
    
    if (error) throw error;
    
    if (!subscribers || subscribers.length === 0) {
      return res.json({
        success: true,
        message: 'Aucun abonné à notifier',
        count: 0
      });
    }
    
    console.log(`📧 Envoi newsletter à ${subscribers.length} abonnés...`);
    
    const emailService = require('./services/emailService');
    let sentCount = 0;
    
    // Envoyer en batch limité
    for (const subscriber of subscribers.slice(0, 30)) {
      try {
        const result = await emailService.sendCustomNewsletter(
          subscriber.email,
          subscriber.name,
          subject,
          content
        );
        
        if (result && result.success) {
          sentCount++;
          console.log(`✅ Newsletter envoyée à: ${subscriber.email}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (emailError) {
        console.error(`❌ Erreur pour ${subscriber.email}:`, emailError.message);
      }
    }
    
    res.json({
      success: true,
      message: `Newsletter envoyée à ${sentCount}/${subscribers.length} abonnés`,
      data: {
        total_subscribers: subscribers.length,
        sent: sentCount,
        subject,
        preview: content.substring(0, 100) + '...'
      }
    });
  } catch (error) {
    console.error('🔥 Erreur envoi newsletter:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour désinscrire de la newsletter
app.post('/api/newsletter/unsubscribe', async (req, res) => {
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
    
    // Désactiver l'abonné
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({
        active: false,
        unsubscribed_at: new Date(),
        updated_at: new Date()
      })
      .eq('email', email)
      .select();
    
    if (error) {
      console.error('❌ Erreur désinscription:', error.message);
    }
    
    res.json({
      success: true,
      message: 'Vous avez été désinscrit de notre newsletter avec succès.',
      data: {
        email,
        unsubscribed: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🔥 Erreur désinscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désinscription'
    });
  }
});

// Route pour déclencher manuellement la newsletter hebdomadaire
app.post('/api/admin/send-weekly-newsletter', async (req, res) => {
  try {
    // Vérification admin
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    const WeeklyNewsletter = require('./scripts/weeklyNewsletter');
    const newsletter = new WeeklyNewsletter();
    
    // Lancer en arrière-plan
    newsletter.sendWeeklyDigestToAll()
      .then(result => {
        console.log('✅ Newsletter hebdo terminée en arrière-plan:', result);
      })
      .catch(error => {
        console.error('❌ Erreur newsletter hebdo:', error);
      });
    
    res.json({
      success: true,
      message: 'Newsletter hebdomadaire lancée en arrière-plan !',
      data: {
        started: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🔥 Erreur lancement newsletter:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour tester un email individuel
app.post('/api/admin/test-weekly-email', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email de test requis'
      });
    }
    
    
    const result = await emailService.sendWeeklyDigest(
      email,
      'Client Test',
      testProducts
    );
    
    res.json({
      success: result.success,
      message: result.success ? 'Email de test envoyé !' : 'Erreur',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// FONCTIONS UTILITAIRES
// ======================

/**
 * Fonction pour gérer automatiquement les clients
 */
async function manageCustomer(email, name, phone, address) {
  try {
    console.log(`👤 Gestion automatique du client: ${email}`);
    
    // Vérifier si le client existe déjà
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingCustomer) {
      // Mettre à jour le client existant
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: name || existingCustomer.name,
          phone: phone || existingCustomer.phone,
          address: address || existingCustomer.address,
          last_order_at: new Date(),
          updated_at: new Date()
        })
        .eq('email', email)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erreur mise à jour client:', error.message);
        return null;
      }
      
      console.log(`✅ Client mis à jour: ${email}`);
      return data;
    } else {
      // Créer un nouveau client
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          email,
          name,
          phone,
          address,
          total_orders: 0,
          total_spent: 0,
          created_at: new Date(),
          last_order_at: new Date()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erreur création client:', error.message);
        return null;
      }
      
      console.log(`✅ Nouveau client créé: ${email}`);
      return data;
    }
  } catch (error) {
    console.error('🔥 Erreur dans manageCustomer:', error.message);
    return null;
  }
}

/**
 * Fonction pour incrémenter les stats d'un client après une commande
 */
async function updateCustomerStats(email, orderAmount) {
  try {
    console.log(`📊 Mise à jour stats pour: ${email}, montant: ${orderAmount}`);
    
    // Appeler la fonction RPC
    const { error } = await supabase.rpc('increment_customer_stats', {
      customer_email: email,
      order_amount: orderAmount
    });
    
    if (error) {
      console.error('❌ Erreur RPC increment_customer_stats:', error.message);
      return false;
    }
    
    console.log(`✅ Stats mises à jour pour: ${email}`);
    return true;
  } catch (error) {
    console.error('🔥 Erreur dans updateCustomerStats:', error.message);
    return false;
  }
}

/**
 * Fonction pour envoyer une notification de nouveau produit aux abonnés
 */
async function sendProductNotificationToSubscribers(productData) {
  try {
    console.log(`📢 Notification nouveau produit: ${productData.name}`);
    
    // Récupérer tous les abonnés actifs à la newsletter
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('active', true);
    
    if (error) {
      console.error('❌ Erreur récupération abonnés:', error.message);
      return { success: false, error: error.message };
    }
    
    if (!subscribers || subscribers.length === 0) {
      console.log('ℹ️ Aucun abonné à la newsletter');
      return { success: true, count: 0, message: 'Aucun abonné' };
    }
    
    console.log(`📧 Envoi à ${subscribers.length} abonnés...`);
    
    const emailService = require('./services/emailService');
    let sentCount = 0;
    
    // Envoyer à chaque abonné (en batch pour éviter de surcharger)
    for (const subscriber of subscribers.slice(0, 50)) { // Limite à 50 pour le test
      try {
        const result = await emailService.sendNewProductNotification(
          subscriber.email,
          subscriber.name,
          productData
        );
        
        if (result && result.success) {
          sentCount++;
          console.log(`✅ Email envoyé à: ${subscriber.email}`);
        }
        
        // Petite pause pour éviter le spam
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (emailError) {
        console.error(`❌ Erreur email pour ${subscriber.email}:`, emailError.message);
      }
    }
    
    return {
      success: true,
      count: sentCount,
      total: subscribers.length,
      message: `Notifications envoyées à ${sentCount}/${subscribers.length} abonnés`
    };
  } catch (error) {
    console.error('🔥 Erreur dans sendProductNotificationToSubscribers:', error);
    return { success: false, error: error.message };
  }
}

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