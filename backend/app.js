const express = require('express');
const cors = require('cors');
const supabase = require('./src/config/supabase');

const app = express();

app.use(cors());
app.use(express.json());

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
  try {
    const { category, featured } = req.query;
    
    let query = supabase.from('products').select('*');
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (featured === 'true') {
      query = query.eq('featured', true);
    }
    
    const { data, error } = await query;
    
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
        featured: p.featured,
        stock: p.stock,
        inStock: p.in_stock
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
        inStock: data.in_stock
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
// Route pour la newsletter
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
    
    // 1. Sauvegarder dans Supabase
    let dbResult = null;
    let dbError = null;
    
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .upsert([{ 
          email, 
          name: name || null,
          subscribed_at: new Date(),
          source: 'website_form',
          active: true
        }], { 
          onConflict: 'email',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        dbError = error;
        console.error('❌ Erreur Supabase newsletter:', error.message);
        
        // Si la table n'existe pas, la créer automatiquement
        if (error.message.includes('relation "newsletter_subscribers" does not exist')) {
          console.log('⚠️ Table newsletter_subscribers non trouvée');
          // Vous pourriez créer la table ici avec une requête SQL directe
        }
      } else {
        dbResult = data;
        console.log('✅ Inscription sauvegardée dans Supabase:', email);
      }
    } catch (dbError) {
      console.log('ℹ️ Erreur base de données:', dbError.message);
    }
    
    // 2. Envoyer un email de confirmation (simulé si Brevo non configuré)
    let emailResult = null;
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
    
    // 3. Log dans la console
    console.log(`🎉 Nouvel inscrit newsletter: ${email} ${name ? '(' + name + ')' : ''}`);
    
    // Toujours retourner un succès même si l'email échoue
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
    
  } catch (error) {
    console.error('🔥 Erreur newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription. Réessayez plus tard.'
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