import { Mail,Phone, Instagram, Loader2, CheckCircle, XCircle, Send, User, MessageSquare } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnapchat, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { useState } from 'react';

// URL de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.rifmabeauty.com';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
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
        message: 'Erreur de connexion. Veuillez réessayer plus tard.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section avec image de shooting */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {/* Image de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/RBhome3.JPG)',
            backgroundPosition: 'center 46%',
          }}
        >
          {/* Overlay élégant */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>

        {/* Contenu hero */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
                </span>
                <span className="text-xs font-light tracking-[0.2em] uppercase text-white">
                  PRÊT À VOUS SERVIR
                </span>
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-light tracking-wide text-white mb-6 drop-shadow-2xl">
              Contactez-nous
            </h1>
            <p className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Une question ? Un projet ? Notre équipe est à votre écoute pour vous offrir une expérience unique
            </p>
          </div>
        </div>

        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Section Contact principale */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête de section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mb-4">
              Entrons en <span className="text-rose-400">contact</span>
            </h2>
            <div className="w-20 h-px bg-rose-300 mx-auto mb-6"></div>
            <p className="text-gray-500 font-light max-w-2xl mx-auto">
              Que vous ayez une question sur nos produits ou simplement envie de partager votre expérience, nous sommes là pour vous
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Formulaire de contact - Côté gauche */}
            <div className="order-2 lg:order-1">
              <div className="bg-stone-50 p-8 md:p-10 rounded-2xl shadow-sm">
                <h3 className="text-2xl font-light tracking-wide text-gray-900 mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5 text-rose-400" />
                  Envoyez-nous un message
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-light text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-rose-400" />
                        Nom complet *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                        placeholder="Sophie Diop"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-light text-gray-700 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-rose-400" />
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                        placeholder="sophie@email.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-light text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-rose-400" />
                      Téléphone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                      placeholder="+221 78 717 10 10"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-light text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-rose-400" />
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all resize-none"
                      placeholder="Votre message..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {submitStatus && (
                    <div className={`p-4 rounded-xl flex items-start space-x-3 ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {submitStatus.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm">{submitStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 px-8 rounded-xl hover:from-rose-600 hover:to-rose-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-light tracking-widest uppercase">
                          Envoi en cours...
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span className="text-sm font-light tracking-widest uppercase">
                          Envoyer le message
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Informations de contact + Image - Côté droit */}
            <div className="order-1 lg:order-2 space-y-8">
              {/* Image de shooting */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl h-64 md:h-80">
                <img
                  src="https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/RBhome2.JPG"
                  alt="RIFMA Beauty Shooting"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-light drop-shadow-md">Notre univers, votre beauté</p>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-stone-900 text-white p-8 rounded-2xl text-center">
                <h3 className="text-xl font-light tracking-wide mb-6">Suivez notre univers</h3>
                <p className="text-white/70 text-sm font-light mb-6">
                    Plongez dans l'univers RIFMA BEAUTY et découvrez nos coulisses
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://www.instagram.com/rifma_beauty/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/10 hover:bg-rose-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  >
                    <Instagram className="w-5 h-5 text-white transition-colors" />
                  </a>
                  <a
                    href="https://www.snapchat.com/add/rifma_beauty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/10 hover:bg-rose-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  >
                    <FontAwesomeIcon icon={faSnapchat} className="w-5 h-5 text-white transition-colors" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@rifma.beauty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/10 hover:bg-rose-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  >
                    <FontAwesomeIcon icon={faTiktok} className="w-5 h-5 text-white transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
    </div>
  );
}