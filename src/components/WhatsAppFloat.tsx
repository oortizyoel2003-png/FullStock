import React from 'react';

export const WhatsAppFloat: React.FC = () => {
  const STORE_WHATSAPP = '5491148882362';
  const defaultText = encodeURIComponent('¡Hola FullStock! Me gustaría consultar por productos del catálogo y coordinar una compra.');

  return (
    <a
      href={`https://wa.me/${STORE_WHATSAPP}?text=${defaultText}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-green-900/60 hover:shadow-green-500/40 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border border-[#4ade80]/50"
      aria-label="Contactar por WhatsApp al +54 9 11 4888-2362"
      title="Atención por WhatsApp (+54 9 11 4888-2362)"
    >
      {/* Official WhatsApp Icon Vector */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow"
          aria-hidden="true"
        >
          <path d="M16 2a13.9 13.9 0 0 0-12 20.9L2 30l7.3-1.9A13.9 13.9 0 1 0 16 2zm0 25.5c-2.3 0-4.5-.6-6.4-1.7l-.5-.3-4.7 1.2 1.3-4.6-.3-.5A11.5 11.5 0 1 1 27.5 16 11.5 11.5 0 0 1 16 27.5zm6.3-8.6c-.3-.2-2-.1-2.3-1.1s-.6-.9-.8-.9h-.7a1.4 1.4 0 0 0-1 .5c-.3.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.8c.2.3 2.6 4 6.3 5.6 3.7 1.6 3.7 1.1 4.4 1 .7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.1-.3-.2-.7-.4z" />
          <path d="M19.1 19.9c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.7.8-.1.1-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.3-.4.1-.1.2-.3.2-.4.1-.1 0-.3 0-.4s-.5-1.2-.7-1.6c-.2-.4-.4-.3-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.6 2.5 3.9 3.5 2.3 1 2.3.7 2.7.6.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.5-.3z" fill="white" />
        </svg>

        {/* Pulse indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full animate-ping opacity-75 pointer-events-none" />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full border-2 border-[#25D366]" />
      </div>

      {/* Text Label on Desktop */}
      <div className="hidden sm:flex flex-col text-left pr-1 leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-wider text-green-100/90">
          ¿Dudas o Pedidos?
        </span>
        <span className="text-xs font-black text-white">
          WhatsApp Directo
        </span>
      </div>
    </a>
  );
};
