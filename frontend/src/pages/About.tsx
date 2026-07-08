import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Heart, Leaf, Star, Quote } from 'lucide-react';

export default function About() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const carouselImages = [
    {
      url: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/RBhome1.JPG',
      alt: 'RIFMA Beauty Collection',
      title: 'Collection Signature',
      subtitle: 'L\'élégance à l\'état pur'
    },
    {
      url: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/RBhome3.JPG',
      alt: 'RIFMA Beauty Lipstick',
      title: 'Couleurs Infinies',
      subtitle: 'Des nuances qui racontent votre histoire'
    },
    {
      url: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image3.JPG',
      alt: 'RIFMA Beauty Nature',
      title: 'Beauté Naturelle',
      subtitle: 'La nature révélée'
    },
    {
      url: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/RBhome2.JPG',
      alt: 'RIFMA Beauty Glamour',
      title: 'Luxe Absolu',
      subtitle: 'Le raffinement à portée de main'
    },
    {
      url: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image10.JPG',
      alt: 'RIFMA Beauty Body Care',
      title: 'Soin Corporel',
      subtitle: 'Des rituels de beauté pour une peau sublimée'
    },
    {
      url: 'https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image6.JPG',
      alt: 'RIFMA Beauty Liners',
      title: 'L\'art du trait parfait',
      subtitle: 'Des liners qui subliment vos levres avec précision et élégance'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - CORRIGÉ POUR MOBILE */}
      <section className="relative h-[70vh] min-h-[500px] md:min-h-[600px] overflow-hidden">
        {/* Image de fond - sans bg-fixed pour mobile */}
        <div className="absolute inset-0">
          <img
            src="https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image2.JPG"
            alt="RIFMA Beauty Story"
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: 'center 30%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
                </span>
                <span className="text-xs font-light tracking-[0.2em] uppercase text-white">
                  NOTRE HISTOIRE
                </span>
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-light tracking-wide text-white mb-6 drop-shadow-2xl">
              Our Story
            </h1>
            <p className="text-base md:text-lg lg:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              L'excellence cosmétique au cœur de notre ADN
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Le reste du code About.tsx reste identique... */}
      
      {/* Histoire Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 rounded-full">
                <Heart className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-light tracking-wider text-rose-600 uppercase">
                  Notre Passion
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-light tracking-wide text-gray-900">
                Endless
                <span className="block text-rose-400 mt-2">Bliss</span>
              </h2>
              <div className="space-y-6 text-gray-600 font-light leading-relaxed text-lg">
                <p className="relative pl-6 border-l-2 border-rose-200">
                  Chez Rifma Beauty, nous croyons que chaque sourire mérite une
                  touche de douceur et de magie. Nos gloss, crayons, baumes
                  et huiles sont pensés pour sublimer vos lèvres et révéler votre
                  éclat naturel, tout en ajoutant un petit moment de luxe à votre quotidien.
                </p>
                <p>
                  Des teintes délicates aux couleurs audacieuses, chaque produit est créé 
                  pour accompagner toutes vos envies et toutes vos histoires. Avec Rifma Beauty, 
                  laissez vos lèvres parler pour vous, tout en douceur et en éclat.
                </p>
                <p>
                  Notre engagement envers la qualité et l'élégance se reflète dans chaque
                  détail, du packaging raffiné aux textures somptueuses de nos produits.
                </p>
              </div>
            </div>

            <div className="relative group order-1 lg:order-2">
              <div className="absolute -inset-4 bg-gradient-to-r from-rose-200 to-amber-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <img
                src="https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image4.JPG"
                alt="RIFMA BEAUTY"
                className="relative w-full aspect-square object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Carrousel Style Bannière Pleine Largeur */}
      <section className="w-full overflow-hidden">
        <div className="relative h-[450px] md:h-[550px] lg:h-[750px] w-full">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="absolute inset-0">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              <div className="relative z-20 h-full flex items-center justify-center text-center px-4">
                <div className="max-w-3xl mx-auto">
                  <span className="inline-block text-rose-300 text-sm font-light tracking-[0.3em] uppercase mb-4">
                    RIFMA BEAUTY
                  </span>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-white mb-4 drop-shadow-2xl">
                    {image.title}
                  </h2>
                  <p className="text-sm md:text-base lg:text-lg text-white/80 font-light leading-relaxed drop-shadow-md">
                    {image.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Flèches de navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/20"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/20"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>

          {/* Dots indicateurs */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 10000);
                }}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-6 md:w-8 h-1 bg-rose-400 rounded-full'
                    : 'w-4 md:w-6 h-1 bg-white/40 rounded-full hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Valeurs Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mb-4">
              Nos Valeurs
            </h2>
            <div className="w-20 h-px bg-rose-300 mx-auto mb-6"></div>
            <p className="text-gray-500 font-light max-w-2xl mx-auto">
              Des principes qui guident chacune de nos créations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center space-y-4 p-8 rounded-2xl bg-stone-50 hover:bg-rose-50 transition-all duration-300 hover:shadow-xl">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Sparkles className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-2xl font-light tracking-wide text-gray-900">
                Confiance & Éclat
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Sublimez votre beauté naturelle avec des produits qui révèlent votre meilleur visage
              </p>
            </div>

            <div className="group text-center space-y-4 p-8 rounded-2xl bg-stone-50 hover:bg-rose-50 transition-all duration-300 hover:shadow-xl">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Heart className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-2xl font-light tracking-wide text-gray-900">
                Douceur & Qualité
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Des lèvres luxueuses et délicates, des textures qui caressent et protègent
              </p>
            </div>

            <div className="group text-center space-y-4 p-8 rounded-2xl bg-stone-50 hover:bg-rose-50 transition-all duration-300 hover:shadow-xl">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Star className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-2xl font-light tracking-wide text-gray-900">
                Magie & Plaisir
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Des moments girly qui font sourire, une routine beauté qui devient un rituel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <div className="absolute inset-0">
            <img
              src="https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/image6.JPG"
              alt="RIFMA Beauty Engagement"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="w-12 h-12 text-rose-300 mx-auto mb-8 opacity-60" />
          <h2 className="text-3xl md:text-5xl font-light tracking-wider text-white mb-6">
            Notre Engagement
          </h2>
          <p className="text-base md:text-lg lg:text-xl font-light text-white/90 leading-relaxed mb-8">
            Nous nous engageons à créer des produits respectueux de votre peau et de
            l'environnement. Nos formules sont testées dermatologiquement et nos emballages
            sont conçus dans une démarche éco-responsable.
          </p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <Leaf className="w-5 h-5 md:w-6 md:h-6 text-rose-300 mx-auto mb-2" />
              <p className="text-white/70 text-xs md:text-sm font-light">Éco-responsable</p>
            </div>
            <div className="text-center">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-rose-300 mx-auto mb-2" />
              <p className="text-white/70 text-xs md:text-sm font-light">Cruelty Free</p>
            </div>
            <div className="text-center">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-rose-300 mx-auto mb-2" />
              <p className="text-white/70 text-xs md:text-sm font-light">Haute Qualité</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}