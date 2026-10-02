import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for full offline capabilities
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[FullStock PWA] Nuevo contenido disponible, actualizando...');
      },
      onOfflineReady() {
        console.log('[FullStock PWA] Aplicación lista para funcionar 100% offline.');
      },
    });
  }).catch(() => {
    // Ignore register error in unsupported environments
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
