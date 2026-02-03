import { Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen pt-20 bg-white">
      <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-stone-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            // Image plus adaptée pour "Contact"
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
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-light tracking-wider uppercase text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light tracking-wider uppercase text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light tracking-wider uppercase text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors"
                      placeholder="+221 xx xx xx xx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light tracking-wider uppercase text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors resize-none"
                      placeholder="Votre message..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 px-8 hover:bg-gray-900 transition-all duration-300"
                  >
                    <span className="text-sm font-light tracking-widest uppercase">
                      Envoyer le message
                    </span>
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
                        +211 78 717 10 10
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
                    href="#"
                    className="w-12 h-12 bg-stone-100 hover:bg-rose-100 rounded-full flex items-center justify-center transition-colors group"
                  >
                    <Instagram className="w-5 h-5 text-gray-600 group-hover:text-rose-600 transition-colors" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-stone-100 hover:bg-rose-100 rounded-full flex items-center justify-center transition-colors group"
                  >
                    <Facebook className="w-5 h-5 text-gray-600 group-hover:text-rose-600 transition-colors" />
                  </a>
                  <a
                    href="#"
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
                <form className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Votre email"
                    className="flex-1 px-4 py-3 border border-gray-300 focus:border-rose-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 hover:bg-gray-900 transition-colors"
                  >
                    <span className="text-sm font-light tracking-wider uppercase">
                      OK
                    </span>
                  </button>
                </form>
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
