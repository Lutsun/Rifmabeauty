import { useState } from 'react';
import { useCart } from '../components/CartContext';
import { Loader2, Truck, Shield } from 'lucide-react'; // Ajout de Shield et CreditCard

// Ajoutez l'interface pour les props
interface CheckoutPageProps {
  onNavigate?: (page: string, id?: string) => void; 
}

export default function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const {
    items,
    getCartTotal,
    clearCart,
    setShippingAddress
  } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
    country: 'Sénégal',
    additionalInfo: ''
  });

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const subtotal = getCartTotal();
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const shippingAddressData = {
        street: formData.street,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
        additionalInfo: formData.additionalInfo
      };

      const orderItems = items.map(item => ({
        id: item.id, // UUID - pour decrement_stock
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        shade: item.shade
      }));
      

      const orderPayload = {
        customer_email: formData.email,
        customer_name: formData.name,
        customer_phone: formData.phone,
        shipping_address: shippingAddressData,
        items: orderItems,
        subtotal: subtotal,
        shipping_fee: shippingFee,
        notes: formData.additionalInfo
      };

      setShippingAddress(shippingAddressData);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();

      if (result.success) {
        setOrderSuccess(true);
        setOrderData(result.data);
        clearCart();
      } else {
        alert(`Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Modifiez cette partie pour utiliser onNavigate si disponible
  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  if (orderSuccess && orderData) {
    return (
      <div className="min-h-screen pt-20 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-light tracking-wide text-gray-900">
              Commande Confirmée!
            </h1>
            
            <p className="text-gray-600">
              Merci pour votre commande, {orderData.customer_name}!
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Numéro de commande</p>
                <p className="text-lg font-light text-gray-900">{orderData.order_number}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Montant total</p>
                <p className="text-2xl font-light text-gray-900">{orderData.total_amount} FCFA</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Mode de paiement</p>
                <p className="font-light text-gray-900">Paiement à la livraison</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-light text-green-600">En attente de confirmation</p>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm">
              Un email de confirmation vous a été envoyé à {orderData.customer_email}
            </p>
            
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleBackToHome}
                className="px-6 py-3 bg-black text-white hover:bg-gray-900 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Bouton Retour avec l'icône Truck pour plus de cohérence */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate ? onNavigate('shop') : window.history.back()}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 group"
          >
            <Truck className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-light tracking-wide">Retour à la boutique</span>
          </button>
        </div>
        
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-8">
          Finaliser la commande
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulaire */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-light tracking-wide text-gray-900">
                  Informations personnelles
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-light tracking-wide text-gray-900">
                  Adresse de livraison
                </h2>
                
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Rue et numéro *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    placeholder="123 Rue Exemple"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                      placeholder="Dakar"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                      placeholder="12500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2">
                      Pays *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Informations complémentaires
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
                    placeholder="Instructions de livraison, code immeuble, etc."
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-black text-white py-4 hover:bg-gray-900 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <span className="text-sm font-light tracking-widest uppercase">
                    Confirmer la commande
                  </span>
                )}
              </button>
            </form>
          </div>
          
          {/* Récapitulatif */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-light tracking-wide text-gray-900 mb-6">
                Votre commande
              </h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-light text-gray-900">
                        {item.name} × {item.quantity}
                      </p>
                      {item.shade && (
                        <p className="text-xs text-gray-500">{item.shade}</p>
                      )}
                    </div>
                    <p className="text-sm font-light text-gray-900">
                      {item.price * item.quantity} FCFA
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-light">{subtotal} FCFA</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-light text-green-600 flex items-center gap-1">
                    Tarif flexible selon votre zone - Nous consulter
                  </span>
                </div>
                
                <div className="flex justify-between text-lg pt-4 border-t border-gray-200">
                  <span className="font-light">Total</span>
                  <span className="font-light">{total} FCFA</span>
                </div>
              </div>
            </div>
            
            {/* Section Paiement améliorée - Complétée pour correspondre à ProductDetail */}
            <div className="border-t border-gray-200 pt-8 space-y-6">
              <div className="flex items-start space-x-4">
                <Truck className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-light tracking-wider text-gray-900 mb-1">
                    Paiement à la livraison
                  </h3>
                  <p className="text-gray-600 text-sm font-light mb-4">
                    Payez directement à la réception de votre commande en toute sécurité
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Shield className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-light tracking-wide text-gray-900 mb-3">
                      Moyens de paiement acceptés
                    </h4>
                    <p className="text-gray-600 text-sm font-light mb-4">
                      Vous pouvez régler votre commande avec :
                    </p>
                    
                    {/* Icônes de paiement */}
                    <div className="flex flex-wrap gap-4 items-center mt-4">
                      {/* Wave */}
                      <div className="flex flex-col items-center group">
                        <div className="w-16 h-10 bg-[#00B2A9] rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                          <span className="text-white font-bold text-sm tracking-wide">WAVE</span>
                        </div>
                        <span className="text-xs text-gray-500 font-light">Mobile Money</span>
                      </div>
                      
                      {/* Orange Money */}
                      <div className="flex flex-col items-center group">
                        <div className="w-16 h-10 bg-[#FF6600] rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                          <span className="text-white font-bold text-xs tracking-wide">ORANGE</span>
                        </div>
                        <span className="text-xs text-gray-500 font-light">Mobile Money</span>
                      </div>
                      
                      {/* Visa */}
                      <div className="flex flex-col items-center group">
                        <div className="w-16 h-10 bg-gradient-to-r from-[#1A1F71] to-[#2A3284] rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                          <span className="text-white font-bold text-xl tracking-tighter">VISA</span>
                        </div>
                        <span className="text-xs text-gray-500 font-light">Carte bancaire</span>
                      </div>
                      
                      {/* Mastercard */}
                      <div className="flex flex-col items-center group">
                        <div className="w-16 h-10 bg-gradient-to-r from-[#EB001B] to-[#FF5F00] rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                          <span className="text-white font-bold text-sm tracking-wide">Mastercard</span>
                        </div>
                        <span className="text-xs text-gray-500 font-light">Carte bancaire</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message d'information */}
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-700 font-light">
                  <span className="font-medium text-rose-700">💡 Bon à savoir : </span>
                  Vous pouvez également payer en espèces si vous le souhaitez. 
                  Notre livreur vous apportera votre commande avec une machine de paiement mobile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}