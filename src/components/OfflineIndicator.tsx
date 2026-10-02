import React, { useState, useEffect } from 'react';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-[#1e1507] border-b border-[#d4af37]/50 py-2 px-4 text-center text-xs font-bold text-[#f5e3a9] flex items-center justify-center gap-2 animate-fadeIn z-50 sticky top-0">
      <WifiOff className="w-4 h-4 text-[#d4af37]" />
      <span>Modo Offline Activo: Estás navegando el catálogo guardado en caché local sin conexión.</span>
      <Database className="w-3.5 h-3.5 text-[#d4af37]" />
    </div>
  );
};
