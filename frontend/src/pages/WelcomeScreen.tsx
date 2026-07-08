import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();

    // Animation du logo
    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.2)' }
    );

    // Création des lettres du titre "RIFMA"
    if (titleRef.current) {
      titleRef.current.innerHTML = '';
      const text = 'RIFMA';
      const letters: HTMLSpanElement[] = [];

      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(40px)';
        span.style.fontSize = 'clamp(3rem, 12vw, 5rem)';
        span.style.fontWeight = '600';
        span.style.letterSpacing = '0.05em';
        span.style.color = '#1a1a1a';
        span.style.pointerEvents = 'none';

        titleRef.current.appendChild(span);
        letters.push(span);
      }

      tl.to(letters, {
        duration: 0.6,
        opacity: 1,
        y: 0,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2,
      });
    }

    // Animation du sous-titre "BEAUTY"
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    );

    // Ligne décorative
    tl.fromTo(
      lineRef.current,
      { width: 0, opacity: 0 },
      { width: '4rem', opacity: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.1'
    );

    // Bouton ENTER
    tl.fromTo(
      buttonRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)' },
      '-=0.1'
    );

    // Animation de pulsation du bouton
    gsap.to(buttonRef.current, {
      scale: 1.05,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.5,
    });

    return () => {
      tl.kill();
    };
  }, []);

  const handleEnter = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isExiting) return;
    
    setIsExiting(true);

    // Créer une nouvelle timeline pour la sortie
    const tl = gsap.timeline({
      onComplete: () => {
        // Appeler onEnter APRÈS que l'animation est terminée
        onEnter();
      },
    });

    // Animation de sortie des lettres
    if (titleRef.current?.children) {
      tl.to(titleRef.current.children, {
        duration: 0.3,
        opacity: 0,
        y: -20,
        stagger: 0.05,
        ease: 'power2.in',
      });
    }

    tl.to(
      subtitleRef.current,
      { opacity: 0, y: -15, duration: 0.2 },
      '-=0.2'
    );

    tl.to(
      lineRef.current,
      { width: 0, opacity: 0, duration: 0.2 },
      '-=0.15'
    );

    tl.to(
      buttonRef.current,
      { opacity: 0, scale: 0.8, duration: 0.2 },
      '-=0.15'
    );

    tl.to(
      logoRef.current,
      { opacity: 0, scale: 0.9, duration: 0.3 },
      '-=0.1'
    );

    tl.to(
      containerRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      },
      '-=0.1'
    );
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #faf5f5 100%)',
        touchAction: 'pan-y',
      }}
    >
      {/* Dégradé décoratif rose */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(232, 160, 183, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Éléments décoratifs flous */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-slow-pulse pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-rose-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-slow-pulse pointer-events-none" />

      <div className="relative z-10 text-center px-4 w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            ref={logoRef}
            src="https://ucliznuennmgiyjsxgrk.supabase.co/storage/v1/object/public/images/RB_logo2.JPG"
            alt="RIFMA Beauty"
            className="w-24 h-auto object-contain"
            style={{ opacity: 0 }}
          />
        </div>

        {/* Titre RIFMA */}
        <div
          ref={titleRef}
          className="mb-1 leading-none tracking-wide"
          style={{
            fontFamily: "'Playfair Display', 'Times New Roman', serif",
            fontWeight: 500,
            letterSpacing: '0.03em',
            pointerEvents: 'none',
          }}
        />

        {/* Sous-titre BEAUTY */}
        <p
          ref={subtitleRef}
          className="text-rose-400 text-sm sm:text-base tracking-[0.3em] uppercase mt-2 opacity-0"
          style={{
            fontFamily: "'Montserrat', 'Helvetica Neue', sans-serif",
            fontWeight: 300,
            letterSpacing: '0.3em',
            textIndent: '0.3em',
            pointerEvents: 'none',
          }}
        >
          BEAUTY
        </p>

        {/* Ligne décorative */}
        <div
          ref={lineRef}
          className="h-px bg-rose-300 mx-auto mt-6 mb-8 opacity-0"
          style={{ width: 0, pointerEvents: 'none' }}
        />

        {/* Bouton ENTER */}
        <div className="px-4" style={{ touchAction: 'manipulation' }}>
          <button
            ref={buttonRef}
            onClick={handleEnter}
            onTouchStart={(e) => {
              e.preventDefault();
              handleEnter(e);
            }}
            disabled={isExiting}
            className="px-10 py-3 bg-black text-white text-xs font-light tracking-[0.3em] rounded-full
                     hover:bg-gray-900 transition-all duration-300 opacity-0
                     focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '0.3em',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              minHeight: '44px',
              minWidth: '44px',
            }}
          >
            ENTER
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p
          className="text-[10px] text-gray-300 tracking-[0.3em] uppercase"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
        >
          RIFMA BEAUTY COSMETICS
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');

        @keyframes slowPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }

        @keyframes slowPulseRight {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }

        .animate-slow-pulse {
          animation: slowPulse 8s ease-in-out infinite;
        }

        .animate-slow-pulse:last-child {
          animation-name: slowPulseRight;
        }

        @media (hover: none) and (pointer: coarse) {
          button {
            cursor: default;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;