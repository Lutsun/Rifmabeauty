export default function About() {
  return (
    <div className="min-h-screen pt-20 bg-white">
  <section className="relative py-32 overflow-hidden">
      {/* Background avec fallback */}
      <div className="absolute inset-0 bg-stone-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2530775/pexels-photo-2530775.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dégradé pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-light tracking-wider text-white">
          Our Story
        </h1>
        <p className="text-lg font-light text-white/90 max-w-2xl mx-auto leading-relaxed">
          L'excellence cosmétique au cœur de notre ADN
        </p>
      </div>
</section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src="assets/images/RB_logo.JPG"
                alt="RIFMA BEAUTY"
                className="w-full aspect-square object-cover"
              />
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-light tracking-wide text-gray-900">
                Endless
                <span className="block text-rose-400 mt-2">Bliss</span>
              </h2>
              <div className="space-y-6 text-gray-600 font-light leading-relaxed">
                <p>
                  Chez Rifma Beauty, nous croyons que chaque sourire mérite une
                  touche de douceur et de magie 🌸. Nos gloss, crayons, baumes
                  et huiles sont pensés pour sublimer vos lèvres et révéler votre
                  éclat naturel, tout en ajoutant un petit moment de luxe à votre
                uotidien 💕.
                </p>
                <p>
                  Des teintes délicates aux couleurs audacieuses, 
                  chaque produit est créé pour accompagner toutes 
                  vos envies et toutes vos histoires 💗. Avec Rifma Beauty,
                  laissez vos lèvres parler pour vous, tout en douceur et en
                  éclat 💖✨.
                </p>
                <p>
                  Notre engagement envers la qualité et l'élégance se reflète dans chaque
                  détail, du packaging raffiné aux textures somptueuses de nos produits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light tracking-wide text-gray-900 mb-6">
              Nos Valeurs
            </h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Des principes qui guident chacune de nos créations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-10 h-10 bg-rose-300 rounded-full" />
              </div>
              <h3 className="text-2xl font-light tracking-wide text-gray-900">
                Confiance & Éclat 
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Sublimez votre beauté naturelle 
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-10 h-10 bg-rose-300 rounded-full" />
              </div>
              <h3 className="text-2xl font-light tracking-wide text-gray-900">
                Douceur & Qualité
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Des lèvres luxueuses et délicates 
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <div className="w-10 h-10 bg-rose-300 rounded-full" />
              </div>
              <h3 className="text-2xl font-light tracking-wide text-gray-900">
                Magie & Plaisir 
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Des moments girly qui font sourire 🎀
              </p>
            </div>
          </div>
        </div>
      </section>

    <section className="relative py-32 overflow-hidden">
        {/* Background avec fallback */}
        <div className="absolute inset-0 bg-stone-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/assets/images/lipbalm4.JPG)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay pour lisibilité */}
            <div className="absolute inset-0 bg-black/70" />
          </div>
        </div>

        {/* Contenu */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
          <h2 className="text-4xl md:text-5xl font-light tracking-wider leading-tight">
            Notre Engagement
          </h2>
          <p className="text-lg md:text-xl font-light text-white/90 leading-relaxed">
            Nous nous engageons à créer des produits respectueux de votre peau et de
            l'environnement. Nos formules sont testées dermatologiquement et nos emballages
            sont conçus dans une démarche éco-responsable.
          </p>
        </div>
      </section>
    </div>
  );
}
