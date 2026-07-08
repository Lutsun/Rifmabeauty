const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/supabase');

const app = express();

// Configuration CORS détaillée
const corsOptions = {
  origin: ['https://rifmabeauty.com','https://www.rifmabeauty.com','https://rifmabeauty-frontend.vercel.app','https://api.rifmabeauty.com', 'https://rifmabeauty-backend.vercel.app','http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Route de debug email service
app.get('/api/debug-email-service', async (req, res) => {
  console.log('🔍 Debug email service endpoint called');
  
  try {
    const env = {
      EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'NOT SET',
      OWNER_EMAIL: process.env.OWNER_EMAIL || 'NOT SET',
      BREVO_API_KEY: process.env.BREVO_API_KEY ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
    
    console.log('📋 Environment:', env);
    
    console.log('🔄 Attempting to load emailService...');
    let emailService;
    try {
      emailService = require('./services/emailService');
      console.log('✅ emailService loaded successfully');
    } catch (loadError) {
      console.error('❌ Failed to load emailService:', loadError.message);
      
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

// Middleware pour logger les requêtes CORS
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
      contact: 'POST /api/contact'
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
    
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ ERREUR Supabase (test):', testError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur Supabase: ' + testError.message,
        error: testError 
      });
    }
    
    console.log('✅ Test réussi, données:', testData);
    
    let query = supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })    
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
        collection: p.collection,
        price: p.price,
        image: p.image_url,
        description: p.description,
        shade: p.shade,
        featured: p.featured,
        stock: p.stock,
        inStock: p.in_stock,
        detailImage: p.detail_image_url || p.image_url,
        discount_percent: p.discount_percent,
        original_price: p.original_price,
        promotion_type: p.promotion_type,
        promotion_message: p.promotion_message,
        promotion_end_date: p.promotion_end_date
      }))
    });
  } catch (error) {
    console.error('🔥 ERREUR serveur non gérée:', error);
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
    console.log(`🔍 Recherche produit avec ID: ${id}`);
    
    let query = supabase.from('products').select('*');
    
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUuid) {
      console.log('🔑 Recherche par UUID');
      query = query.eq('id', id);
    } else {
      console.log('🔑 Recherche par product_id');
      query = query.eq('product_id', id);
    }
    
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
    
    console.log(`✅ Produit trouvé: ${data.name}`);
    
    res.json({
      success: true,
      data: {
        id: data.id,
        productId: data.product_id,
        name: data.name,
        category: data.category,
        collection: data.collection,
        price: data.price,
        image: data.image_url,
        description: data.description,
        shade: data.shade,
        featured: data.featured,
        stock: data.stock,
        inStock: data.in_stock,
        detailImage: data.detail_image_url || data.image_url,
        discount_percent: data.discount_percent,
        original_price: data.original_price,
        promotion_type: data.promotion_type,
        promotion_message: data.promotion_message,
        promotion_end_date: data.promotion_end_date
      }
    });
  } catch (error) {
    console.error('🔥 Erreur dans /api/products/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur: ' + error.message
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
      promo_code
    } = req.body;

    if (!customer_email || !customer_name || !items || !shipping_address || !subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Email, nom, articles, adresse et sous-total requis'
      });
    }

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

    let discount_amount = 0;
    let final_subtotal = subtotal;
    let discount_details = null;

    if (promo_code) {
      console.log(`🎫 Application du code promo: ${promo_code}`);
      
      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('active', true)
        .single();

      if (!promoError && promo) {
        const now = new Date();
        const isValid = (!promo.valid_until || new Date(promo.valid_until) >= now) &&
                       (!promo.valid_from || new Date(promo.valid_from) <= now) &&
                       (!promo.max_uses || promo.used_count < promo.max_uses) &&
                       (!promo.min_purchase || subtotal >= promo.min_purchase);

        if (isValid) {
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
          
          await supabase
            .from('promo_codes')
            .update({ used_count: promo.used_count + 1 })
            .eq('id', promo.id);
        }
      }
    }

    const total_amount = final_subtotal + shipping_fee;
    const order_number = 'RIFMA-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const customer = await manageCustomer(
      customer_email,
      customer_name,
      customer_phone,
      shipping_address
    );

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

    await updateCustomerStats(customer_email, total_amount);

    try {
      const emailService = require('./services/emailService');
      await emailService.sendOrderNotification(order);
      await emailService.sendOrderConfirmation(order);
    } catch (emailError) {
      console.log('⚠️ Emails non envoyés:', emailError.message);
    }

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
        items: items,
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

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Code promo invalide'
      });
    }

    const now = new Date();
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return res.status(400).json({
        success: false,
        message: 'Ce code promo a expiré'
      });
    }

    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return res.status(400).json({
        success: false,
        message: 'Ce code promo n\'est pas encore valide'
      });
    }

    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return res.status(400).json({
        success: false,
        message: 'Ce code promo a atteint sa limite d\'utilisations'
      });
    }

    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = promo.discount_value;
    } else if (promo.discount_type === 'fixed') {
      discountAmount = promo.discount_value;
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

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    console.log('📩 API Contact appelée avec:', { name, email });
    
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et message sont requis'
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide'
      });
    }
    
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
    const result = await emailService.sendContactMessage(contactData);
    
    console.log('📩 Résultat sendContactMessage:', result);
    
    if (result && result.success === true) {
      res.json({
        success: true,
        message: 'Message envoyé avec succès! Nous vous répondrons rapidement.'
      });
    } else {
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
    res.status(500).json({
      success: false,
      message: 'Erreur serveur: ' + (error.message || 'Erreur inconnue')
    });
  }
});

// ======================
// ROUTES CATÉGORIES
// ======================

app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category');
    
    if (error) throw error;
    
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

// ======================
// ROUTES RECHERCHE
// ======================

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
        id: p.id,
        productId: p.product_id,
        name: p.name,
        category: p.category,
        collection: p.collection,
        price: p.price,
        image: p.image_url,
        description: p.description,
        shade: p.shade,
        stock: p.stock,
        featured: p.featured,
        inStock: p.in_stock,
        discount_percent: p.discount_percent,
        original_price: p.original_price,
        promotion_type: p.promotion_type,
        promotion_message: p.promotion_message,
        promotion_end_date: p.promotion_end_date
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

app.get('/api/customers/:email', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', req.params.email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
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

app.get('/api/customers/:email/full-profile', async (req, res) => {
  try {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', req.params.email)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      throw customerError;
    }

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
// FONCTIONS UTILITAIRES
// ======================

async function manageCustomer(email, name, phone, address) {
  try {
    console.log(`👤 Gestion automatique du client: ${email}`);
    
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingCustomer) {
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

async function updateCustomerStats(email, orderAmount) {
  try {
    console.log(`📊 Mise à jour stats pour: ${email}, montant: ${orderAmount}`);
    
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