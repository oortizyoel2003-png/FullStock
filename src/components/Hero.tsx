import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#07080a] via-[#10121d] to-[#07080a] border-b border-[#1f2333] py-10 sm:py-16">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-black text-white leading-tight">
          Todo para tu Hogar <br />
          <span className="text-gold-gradient">En un Solo Lugar</span>
        </h1>

        <p className="text-sm sm:text-base text-[#a0a8be] max-w-2xl mx-auto font-normal leading-relaxed">
          Selección de bazar, cocina, termos y regalería para renovar cada rincón de tu casa con diseño y practicidad. <span className="text-white font-medium">Pagalo únicamente cuando lo recibas en tu domicilio.</span>
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={onExploreClick}
            className="px-8 py-4 rounded-2xl bg-gold-gradient text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition-all duration-200 shadow-xl shadow-[#d4af37]/20 flex items-center gap-2.5 cursor-pointer"
          >
            <span>Explorar Colección</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
