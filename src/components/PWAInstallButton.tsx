import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed by user
  if (isInstalled || dismissed) {
    return null;
  }

  // Android / Chromium / Desktop Install
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161a26] hover:bg-gold-gradient text-[#f7e7a9] hover:text-black border border-[#d4af37]/40 hover:border-[#d4af37] text-xs font-semibold transition-all shadow-md cursor-pointer group"
        title="Instalar App de FullStock en tu dispositivo"
      >
        <Download className="w-3.5 h-3.5 text-[#d4af37] group-hover:text-black transition-colors" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161a26] hover:bg-gold-gradient text-[#f7e7a9] hover:text-black border border-[#d4af37]/40 hover:border-[#d4af37] text-xs font-semibold transition-all shadow-md cursor-pointer group"
          title="Instalar App en iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#d4af37] group-hover:text-black transition-colors" />
          <span className="hidden sm:inline">Instalar en iOS</span>
          <span className="sm:hidden">App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-[#0e1017] border border-[#d4af37]/50 p-6 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-gradient p-0.5 mx-auto">
                <div className="w-full h-full bg-[#090a0e] rounded-[14px] flex items-center justify-center font-serif-luxury font-bold text-[#f5e3a9]">
                  FS
                </div>
              </div>

              <div>
                <h3 className="text-base font-serif-luxury font-bold text-white">
                  Instalar FullStock en tu iPhone / iPad
                </h3>
                <p className="text-xs text-[#9aa2b8] mt-1">
                  Accede a la tienda boutique directamente desde tu pantalla de inicio sin descargas pesadas.
                </p>
              </div>

              <div className="bg-[#141622] rounded-2xl p-4 border border-[#232738] text-xs text-left space-y-3 text-[#cbd2e6]">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Toca el botón</span>
                    <strong className="text-white flex items-center gap-1 bg-[#1d2130] px-2 py-0.5 rounded">
                      <Share2 className="w-3.5 h-3.5 text-[#3b82f6]" /> Compartir
                    </strong>
                    <span>en Safari.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Desliza y selecciona</span>
                    <strong className="text-white flex items-center gap-1 bg-[#1d2130] px-2 py-0.5 rounded">
                      <PlusSquare className="w-3.5 h-3.5 text-[#d4af37]" /> Agregar a Inicio
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
