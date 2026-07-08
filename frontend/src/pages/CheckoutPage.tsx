import { useState } from 'react';
import { useCart } from '../components/CartContext';
import { Loader2, X, ChevronRight, ChevronLeft, Check, MapPin, Phone, Mail, User, Package, CreditCard, Clock } from 'lucide-react';

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

  const [currentStep, setCurrentStep] = useState(1);
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

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const subtotal = getCartTotal();
  const shippingFee = 0;
  
  const discountAmount = appliedPromo ? 
    appliedPromo.discount_type === 'percentage' ? 
      Math.round(subtotal * (appliedPromo.discount_value / 100)) : 
      Math.min(appliedPromo.discount_value, subtotal) 
    : 0;
  
  const finalSubtotal = subtotal - discountAmount;
  const total = finalSubtotal + shippingFee;

  const steps = [
    { id: 1, name: 'Panier', icon: Package },
    { id: 2, name: 'Informations', icon: User },
    { id: 3, name: 'Paiement', icon: CreditCard }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/promo/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode })
      });

      const result = await response.json();

      if (result.success) {
        setAppliedPromo(result.data);
        setPromoError('');
        setPromoCode('');
      } else {
        setPromoError(result.message);
        setAppliedPromo(null);
      }
    } catch (error) {
      console.error('Erreur validation code promo:', error);
      setPromoError('Erreur lors de la validation du code');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  const handleNextStep = () => {
    if (currentStep === 1 && items.length === 0) return;
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
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
        id: item.id,
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
        notes: formData.additionalInfo,
        promo_code: appliedPromo?.code
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

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  if (orderSuccess && orderData) {
    const orderItems = orderData.items || [];
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-light tracking-wide text-gray-900">
              Commande Confirmée !
            </h1>
            
            <p className="text-gray-500 font-light">
              Merci pour votre confiance, <span className="text-gray-700">{orderData.customer_name}</span>
            </p>
          </div>
          
          <div className="bg-stone-50 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-500">Numéro de commande</span>
              <span className="text-lg font-light text-gray-900">{orderData.order_number}</span>
            </div>
            
            {/* SECTION PRODUITS COMMANDÉS */}
            <div className="pb-3 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Produits commandés</p>
              <div className="space-y-3">
                {orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      {item.shade && <p className="text-xs text-gray-400">Teinte: {item.shade}</p>}
                      <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-light text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {orderData.discount_amount > 0 && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-500">Réduction appliquée</span>
                <span className="text-lg font-light text-green-600">-{orderData.discount_amount.toLocaleString()} FCFA</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-500">Total</span>
              <div className="text-right">
                <span className="text-2xl font-light text-gray-900">
                  {orderData.total_amount.toLocaleString()} FCFA
                </span>
                {orderData.discount_amount > 0 && orderData.original_subtotal && (
                  <div className="text-xs text-gray-400 line-through">
                    {orderData.original_subtotal.toLocaleString()} FCFA
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-rose-50 rounded-xl p-4">
            <p className="text-sm text-gray-700 font-light">
              <span className="font-medium text-rose-700">📱 Prochaines étapes :</span><br />
              Envoyez votre reçu de paiement Mobile Money (Wave ou Orange Money) 
              par WhatsApp au <span className="font-bold">+221 78 717 10 10</span>
            </p>
          </div>
          
          <button
            onClick={handleBackToHome}
            className="w-full px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-full transition-all duration-300 text-sm font-light tracking-wider"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

  if (items.length === 0 && currentStep === 1) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-rose-400" />
            </div>
            <h2 className="text-2xl font-light text-gray-900 mb-4">Votre panier est vide</h2>
            <p className="text-gray-500 mb-8">Découvrez nos collections et trouvez votre bonheur</p>
            <button
              onClick={() => onNavigate?.('shop')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300"
            >
              Découvrir la boutique
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicateur d'étapes */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${currentStep >= step.id 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                      : 'bg-gray-200 text-gray-400'
                    }
                  `}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-light ${currentStep >= step.id ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 ${currentStep > step.id ? 'bg-rose-300' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire principal qui englobe tout */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-xl font-light tracking-wide text-gray-900 mb-6">
                      Votre panier
                    </h2>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100">
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h3 className="font-light text-gray-900">{item.name}</h3>
                            {item.shade && <p className="text-xs text-gray-400">Teinte: {item.shade}</p>}
                            <p className="text-sm text-gray-500 mt-1">Quantité: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-light text-gray-900">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sous-total</span>
                          <span className="font-light">{subtotal.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Livraison</span>
                          <span className="font-light text-green-600">À définir</span>
                        </div>
                        <div className="flex justify-between text-lg pt-3 border-t border-gray-100">
                          <span className="font-light">Total</span>
                          <span className="font-light">{subtotal.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={items.length === 0}
                      className="w-full mt-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      Continuer
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {currentStep === 2 && (
                  <>
                    <h2 className="text-xl font-light tracking-wide text-gray-900 mb-6">
                      Informations de livraison
                    </h2>
                    
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-light text-gray-700 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-rose-400" />
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                            placeholder="Votre nom"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-light text-gray-700 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-rose-400" />
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-light text-gray-700 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-rose-400" />
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                          placeholder="+221 XX XXX XX XX"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-light text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-400" />
                          Adresse *
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                          placeholder="Rue et numéro"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-light text-gray-700 mb-2">Ville *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                            placeholder="Dakar"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-light text-gray-700 mb-2">Code postal</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                            placeholder="12500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-light text-gray-700 mb-2">Informations complémentaires</label>
                        <textarea
                          name="additionalInfo"
                          value={formData.additionalInfo}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all resize-none"
                          placeholder="Instructions de livraison, code immeuble, etc."
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-8">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Retour
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <div>
                    <h2 className="text-xl font-light tracking-wide text-gray-900 mb-6">
                      Paiement
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="bg-rose-50 rounded-xl p-5">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-rose-500" />
                          Mobile Money
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Après validation de votre commande, vous recevrez un email avec les instructions de paiement.
                        </p>
                        <div className="flex gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#00B2A9] rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-xs">WAVE</span>
                            </div>
                            <span className="text-sm">78 717 10 10</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#FF6600] rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-xs">ORANGE</span>
                            </div>
                            <span className="text-sm">78 717 10 10</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-stone-50 rounded-xl p-5">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-rose-500" />
                          Paiement à la livraison
                        </h3>
                        <p className="text-sm text-gray-600">
                          Payez directement à la livraison de votre commande en espèces ou par Mobile Money.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-8">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Retour
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            Confirmer
                            <Check className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h3 className="text-lg font-light tracking-wide text-gray-900 mb-4">
                  Récapitulatif
                </h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} × {item.quantity}</span>
                      <span className="font-light">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
                
                {/* Code promo */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  {appliedPromo ? (
                    <div className="bg-green-50 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-green-700 font-medium text-sm">{appliedPromo.code}</span>
                        <p className="text-xs text-green-600 mt-1">
                          {appliedPromo.discount_type === 'percentage' 
                            ? `${appliedPromo.discount_value}% de réduction` 
                            : `${appliedPromo.discount_value} FCFA de réduction`}
                        </p>
                      </div>
                      <button onClick={removePromoCode} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Code promo"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={validatePromoCode}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm hover:bg-gray-800 disabled:opacity-50"
                      >
                        {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Appliquer'}
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                </div>
                
                {/* Totaux */}
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sous-total</span>
                    <span>{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction</span>
                      <span>-{discountAmount.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livraison</span>
                    <span className="text-green-600">À définir</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="font-light">Total</span>
                    <div className="text-right">
                      <span className="text-xl font-light">{total.toLocaleString()} FCFA</span>
                      {discountAmount > 0 && (
                        <div className="text-xs text-gray-400">Économie: {discountAmount.toLocaleString()} FCFA</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}