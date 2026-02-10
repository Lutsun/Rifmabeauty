# 🌸 RIFMA BEAUTY COSMETICS - E-commerce Full Stack

## 📋 Description du Projet

RIFMA BEAUTY COSMETICS est une plateforme e-commerce full stack dédiée à la vente de produits cosmétiques haut de gamme. Le site permet aux clients de découvrir et commander une sélection exclusive de **glosses**, **baumes à lèvres** et **contours des lèvres**. L'application gère le processus de commande complet avec création automatique de compte client et notification par email.

## ✨ Fonctionnalités Principales

### 🛒 Frontend (React + TypeScript)
- **Interface utilisateur moderne et responsive**
- Catalogue produit avec filtres par catégorie
- Détails des produits avec galerie d'images
- Panier d'achat interactif
- Formulaire de commande intuitif
- Design élégant et féminin adapté aux cosmétiques

### ⚙️ Backend (Node.js + Express)
- API RESTful sécurisée
- Gestion des produits et catégories
- Traitement des commandes
- Création automatique de comptes clients
- Système de notifications par email

### 📧 Système de Notification
- Email automatique à **rifmabeauty** pour chaque nouvelle commande
- Email de confirmation au client avec validation de commande
- Création de compte client automatique via l'adresse email

## 🛠️ Stack Technologique

### **Frontend**
- React 18 avec TypeScript
- Tailwind CSS pour le styling
- React Router pour la navigation
- Context API ou Redux pour la gestion d'état
- Axios pour les requêtes API

### **Backend**
- Node.js avec Express.js
- TypeScript pour la sécurité du typage
- Supabase Client pour l'interaction avec la base de données
- Brevo pour l'envoi d'emails
- CORS et sécurité des endpoints

### **Base de Données & Services**
- **Supabase** (PostgreSQL) - Base de données principale
- Storage Supabase pour les images produits

## 📁 Structure du Projet

```
rifma-beauty-cosmetics/
│
├── frontend/                    # Application Frontend
│   ├── src/
│   │   ├── components/       # Composants React réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/        # Services API
│   └── package.json
│
├── backend/                   # Application Backend
│   ├── src/
│   │   ├── services/        # Services (email, etc.)
│   │   └── config/          # Configuration
|   └── app.js               # app backend
│   └── package.json
│
├── .env.example             # Variables d'environnement
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn
- Compte Supabase

### Étapes d'Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/rifma-beauty-cosmetics.git
cd rifma-beauty-cosmetics
```

2. **Configuration Backend**
```bash
cd server
npm install
cp .env.example .env
# Remplir les variables d'environnement dans .env
```

3. **Configuration Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
# Configurer les variables d'environnement
```

4. **Configuration Supabase**
- Créer un nouveau projet sur Supabase
- Importer le schéma SQL fourni
- Configurer l'authentification et le storage
- Récupérer les clés API

5. **Lancer l'application**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

## 🔧 Configuration Supabase

### Schéma de Base de Données
```sql
-- Tables principales
products (id, name, description, price, category, images, stock)
categories (id, name, slug)
orders (id, customer_email, total_amount, status, created_at)
order_items (id, order_id, product_id, quantity, price)
customers (email, first_name, last_name, created_at)
```

### Variables d'Environnement
```env
# Backend
SUPABASE_URL=votre_url_supabase
SUPABASE_KEY=votre_clé_anon
DATABASE_URL=votre_url_de_connexion
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email
EMAIL_PASS=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_KEY=votre_clé_anon
```

## 📱 Pages du Site

1. **🏠 Accueil** - Présentation et produits phares
2. **🛍️ Boutique** - Catalogue complet avec filtres
3. **👄 Produits** - Détails des produits
4. **🛒 Panier** - Gestion des articles
5. **📝 Commande** - Formulaire de commande
6. **✅ Confirmation** - Page de confirmation

## ✉️ Système d'Emails

### Email au Propriétaire (rifmabeauty)
```
Sujet: Nouvelle commande #{{order_id}}

Contenu:
- Détails de la commande
- Informations client
- Produits commandés
- Total de la commande
```

### Email au Client
```
Sujet: Confirmation de votre commande #{{order_id}}

Contenu:
- Remerciement pour la commande
- Résumé des articles
- Numéro de commande
- Message de confirmation
- Instructions de suivi
```

## 🎨 Design et UX

- Palette de couleurs douce et féminine
- Interface intuitive et facile à naviguer
- Images produits haute qualité
- Expérience mobile-first
- Animations subtiles pour l'engagement

## 🔒 Sécurité

- Validation des données côté serveur
- Protection contre les injections SQL
- Sanitization des inputs
- Gestion sécurisée des tokens
- HTTPS en production

## 📈 Fonctionnalités Futures

- [ ] Système de paiement en ligne
- [ ] Espace client personnel
- [ ] Suivi des commandes
- [ ] Système de révisions produits
- [ ] Programme de fidélité
- [ ] Blog beauté et conseils

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Push vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Contact

- **Email de contact:** contact@rifmabeauty.com
- **Site web:** https://rifmabeauty.com
- **Instagram:** @rifma_beauty

## 🙏 Remerciements

- Équipe Supabase pour l'excellent service
- Communauté React et Node.js
- Tous les contributeurs et testeurs

---

*RIFMA BEAUTY COSMETICS - Votre beauté, notre passion* 💄✨

---

<div align="center">
  <p>Made with ❤️ by Serge Da Sylva</p>
  <p>© 2026 RIFMA BEAUTY COSMETICS. Tous droits réservés.</p>
</div>
