import React, { useRef } from 'react';
import { Phone, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenOwnerMode?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenOwnerMode }) => {
  const tapCountRef = useRef<number>(0);
  const lastTapRef = useRef<number>(0);

  const handleSecretTrigger = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    // Allow up to 3 seconds between clicks
    if (now - lastTapRef.current > 3000) {
      tapCountRef.current = 1;
    } else {
      tapCountRef.current += 1;
      if (tapCountRef.current >= 5) {
        tapCountRef.current = 0;
        if (onOpenOwnerMode) {
          onOpenOwnerMode();
        }
      }
    }
    lastTapRef.current = now;
  };

  return (
    <footer className="bg-[#050608] border-t border-[#181c2b] text-[#9098b0] text-xs pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#141826]">
          
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span 
                onClick={handleSecretTrigger}
                onTouchEnd={handleSecretTrigger}
                className="font-serif-luxury text-xl font-extrabold text-gold-gradient select-none cursor-default"
              >
                FULLSTOCK
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#828a9e]">
              Artículos de bazar, cocina y regalería pensados para tu día a día. Calidad, variedad y la seguridad de pagar recién al tenerlo en tus manos.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-serif-luxury text-xs font-bold text-white uppercase tracking-wider">
              Categorías
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              {['Bazar', 'Cocina', 'Cerámica', 'Vidrio', 'Mates y sets', 'Productos térmicos', 'Deco'].map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-[#d4af37] transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-serif-luxury text-xs font-bold text-white uppercase tracking-wider">
              Atención al Cliente
            </h4>
            <div className="space-y-2 text-[11px] text-[#828a9e]">
              <a
                href="https://wa.me/5491148882362?text=Hola%20FullStock%2C%20tengo%20una%20consulta"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#25d366] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#25d366]" />
                <span>WhatsApp: +54 9 11 4888-2362</span>
              </a>
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Atención Personalizada</span>
              </p>
            </div>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="font-serif-luxury text-xs font-bold text-white uppercase tracking-wider">
              Métodos de Pago
            </h4>
            <p className="text-[11px] text-[#828a9e]">
              Pago contra entrega en efectivo o transferencia bancaria al recibir tu paquete en mano.
            </p>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#636b80] gap-4">
          <p>
            © {new Date().getFullYear()}{' '}
            <span
              onClick={handleSecretTrigger}
              onTouchEnd={handleSecretTrigger}
              className="font-bold text-[#636b80] cursor-default select-none"
            >
              FULLSTOCK
            </span>{' '}
            Bazar & Regalería. Todos los derechos reservados.
          </p>
          <p className="text-[#636b80]">
            Compra fácil, segura y transparente.
          </p>
        </div>
      </div>
    </footer>
  );
};
