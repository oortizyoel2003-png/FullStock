import React from 'react';

export const TopTrustBar: React.FC = () => {
  return (
    <aside aria-label="Información de pago" className="bg-gradient-to-r from-[#171305] via-[#2a2108] to-[#171305] border-b border-[#d4af37]/35 py-1.5 px-3 text-center text-xs text-[#f6e5ad] overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="font-semibold text-[11px] sm:text-xs tracking-wide uppercase">
          <span>pagas recien cuando lo tenes en tus manos</span>
        </div>
      </div>
    </aside>
  );
};
