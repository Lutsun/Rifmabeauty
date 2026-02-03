const express = require('express');
const cors = require('cors');
const supabase = require('./src/config/supabase');

const app = express();

app.use(cors());
app.use(express.json());

// API Products - Utilise l'API REST auto-générée de Supabase
// Ou tu peux utiliser directement le client JS :

// 1. Récupérer tous les produits (avec filtres)
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
        // Transforme pour garder la compatibilité frontend
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

// 2. Récupérer un produit par ID
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

// 3. Mettre à jour le stock (pour admin)
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

// 5. Créer une nouvelle commande (paiement à la livraison)
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

    // 4. Créer la commande (paiement à la livraison)
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

    // 6. Envoyer un email au propriétaire (simulé pour l'instant)
    console.log(`📧 EMAIL À ENVOYER AU PROPRIÉTAIRE:`);
    console.log(`   Nouvelle commande #${order.order_number}`);
    console.log(`   Client: ${customer_name} (${customer_email})`);
    console.log(`   Total: ${total_amount} FCFA`);
    console.log(`   Articles: ${items.length}`);
    console.log(`   Paiement: À la livraison`);

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

// 6. Récupérer une commande par ID ou numéro
app.get('/api/orders/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Chercher par ID UUID ou par order_number
    let query = supabase.from('orders').select('*');
    
    // Si c'est un UUID (format avec tirets)
    if (identifier.includes('-') && identifier.length > 20) {
      query = query.eq('id', identifier);
    } else {
      // Sinon c'est probablement un order_number
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

// 7. Récupérer les commandes d'un client
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

// 8. Mettre à jour le statut d'une commande (admin)
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

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date(),
        notes: admin_note ? `[Admin]: ${admin_note}\n${data?.notes || ''}` : data?.notes
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

// 9. Récupérer toutes les commandes (admin avec pagination)
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

// Dans app.js, après les autres routes
const emailService = require('./src/services/emailService');

// ======================
// ROUTES EMAIL / CONTACT
// ======================

// Route pour le formulaire de contact
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
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
    
    const contactData = { name, email, phone, message };
    
    // Envoyer les emails
    const result = await emailService.sendContactMessage(contactData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Message envoyé avec succès! Nous vous répondrons rapidement.'
      });
    } else {
      throw new Error(result.error || 'Erreur envoi email');
    }
  } catch (error) {
    console.error('Erreur contact:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
});

// Route test email
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
      message: error.message
    });
  }
});

// Route pour la newsletter
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }
    
    // Ici tu pourrais sauvegarder dans une table newsletter
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert([{ email, subscribed_at: new Date() }], { onConflict: 'email' });
    
    if (error) throw error;
    
    // Envoyer un email de bienvenue
    // await emailService.sendNewsletterWelcome(email);
    
    res.json({
      success: true,
      message: 'Merci pour votre inscription à notre newsletter!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur inscription newsletter'
    });
  }
});


module.exports = app;