import { Mail, MapPin, Phone, Instagram, Facebook, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // États pour la newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<{ 
    type: 'success' | 'error' | 'info', 
    message: string 
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Réponse HTTP:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📡 Données reçues:', data);

      if (data.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Message envoyé avec succès! Nous vous répondrons rapidement.' 
        });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: data.message || 'Erreur lors de l\'envoi du message' 
        });
      }
    } catch (error) {
      console.error('🔥 Erreur fetch:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newsletterEmail)) {
    setNewsletterStatus({
      type: 'error',
      message: 'Veuillez entrer une adresse email valide.'
    });
    return;
  }

  setIsNewsletterSubmitting(true);
  setNewsletterStatus(null);

  try {
    // Appel unique à l'API qui gère tout
    const response = await fetch('http://localhost:5000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: newsletterEmail,
        name: newsletterName || ''
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      if (data.alreadySubscribed) {
        setNewsletterStatus({
          type: 'info',
          message: '✅ Vous êtes déjà inscrit(e) à notre newsletter!'
        });
      } else {
        setNewsletterStatus({
          type: 'success',
          message: '🎉 Merci pour votre inscription à notre newsletter!'
        });
      }
      
      setNewsletterEmail('');
      setNewsletterName('');
      
      setTimeout(() => setNewsletterStatus(null), 5000);
    } else {
      setNewsletterStatus({
        type: 'error',
        message: data.message || 'Erreur lors de l\'inscription.'
      });
    }
  } catch (error) {
    setNewsletterStatus({
      type: 'error',
      message: '❌ Erreur de connexion. Réessayez plus tard.'
    });
  } finally {
    setIsNewsletterSubmitting(false);
  }
};

  return (
    <div className="min-h-screen pt-20 bg-white">
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/assets/images/lipbalm4.JPG)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-light tracking-wider text-white">
            Contactez-nous
          </h1>
          <p className="text-lg font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
            Notre équipe est à votre écoute pour répondre à toutes vos questions
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-light tracking-wide text-gray-900 mb-8">
                  Envoyez-nous un message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-light tracking-wider uppercase text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors"
                      placeholder="Votre nom"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-light tracking-wider uppercase text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors"
                      placeholder="votre@email.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-light tracking-wider uppercase text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors"
                      placeholder="+221 xx xx xx xx"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-light tracking-wider uppercase text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors resize-none"
                      placeholder="Votre message..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {submitStatus && (
                    <div className={`p-4 rounded flex items-start space-x-3 ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {submitStatus.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{submitStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-4 px-8 hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-light tracking-widest uppercase">
                          Envoi en cours...
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-light tracking-widest uppercase">
                        Envoyer le message
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-light tracking-wide text-gray-900 mb-8">
                  Informations de contact
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-gray-900 mb-1">
                        Adresse
                      </h3>
                      <p className="text-gray-600 font-light">
                        123 Dakar plateau<br />
                        75008 Dakar, Senegal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-gray-900 mb-1">
                        Téléphone
                      </h3>
                      <p className="text-gray-600 font-light">
                        +221 78 717 10 10
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-gray-900 mb-1">
                        Email
                      </h3>
                      <p className="text-gray-600 font-light">
                        contact@rifmabeauty.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-light tracking-wide text-gray-900 mb-6">
                  Suivez-nous
                </h3>
                <div className="flex space-x-4">
                  <a
                    href="https://instagram.com/rifmabeauty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-stone-100 hover:bg-rose-100 rounded-full flex items-center justify-center transition-colors group"
                  >
                    <Instagram className="w-5 h-5 text-gray-600 group-hover:text-rose-600 transition-colors" />
                  </a>
                  <a
                    href="https://facebook.com/rifmabeauty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-stone-100 hover:bg-rose-100 rounded-full flex items-center justify-center transition-colors group"
                  >
                    <Facebook className="w-5 h-5 text-gray-600 group-hover:text-rose-600 transition-colors" />
                  </a>
                  <a
                    href="mailto:contact@rifmabeauty.com"
                    className="w-12 h-12 bg-stone-100 hover:bg-rose-100 rounded-full flex items-center justify-center transition-colors group"
                  >
                    <Mail className="w-5 h-5 text-gray-600 group-hover:text-rose-600 transition-colors" />
                  </a>
                </div>
              </div>

              <div className="bg-stone-50 p-8 space-y-4">
                <h3 className="text-xl font-light tracking-wide text-gray-900">
                  Newsletter
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Inscrivez-vous à notre newsletter pour recevoir nos dernières nouveautés
                  et offres exclusives.
                </p>
                
                {/* Messages de statut de la newsletter */}
                {newsletterStatus && (
                  <div className={`p-4 rounded flex items-start space-x-3 ${newsletterStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : newsletterStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                    {newsletterStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : newsletterStatus.type === 'error' ? (
                      <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{newsletterStatus.message}</span>
                  </div>
                )}
                
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="newsletter-name" className="block text-sm font-light text-gray-700 mb-2">
                      Nom (optionnel)
                    </label>
                    <input
                      id="newsletter-name"
                      type="text"
                      value={newsletterName}
                      onChange={(e) => setNewsletterName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors"
                      disabled={isNewsletterSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newsletter-email" className="block text-sm font-light text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors"
                      required
                      disabled={isNewsletterSubmitting}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isNewsletterSubmitting}
                    className="w-full bg-black text-white py-3 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isNewsletterSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-light tracking-wider">
                          Inscription...
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-light tracking-wider">
                        S'inscrire à la newsletter
                      </span>
                    )}
                  </button>
                </form>
                
                <p className="text-xs text-gray-500 font-light pt-2">
                  En vous inscrivant, vous acceptez de recevoir nos newsletters. Vous pouvez vous désinscrire à tout moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl font-light tracking-wide text-gray-900">
              Horaires d'ouverture
            </h2>
            <div className="max-w-md mx-auto space-y-3 text-gray-600 font-light">
              <div className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span>10h00 - 19h00</span>
              </div>
              <div className="flex justify-between">
                <span>Samedi</span>
                <span>10h00 - 18h00</span>
              </div>
              <div className="flex justify-between">
                <span>Dimanche</span>
                <span>Fermé</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}