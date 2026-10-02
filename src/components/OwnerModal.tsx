import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Clock, 
  Sliders, 
  Package, 
  ShieldCheck,
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { Product, OwnerConfig } from '../types';
import { 
  verifyOwnerPassword, 
  isOwnerSessionActive, 
  setOwnerSessionActive,
  persistOwnerConfig,
  syncSupplierProducts
} from '../utils/supplierSync';
import { formatCurrency } from '../utils/formatters';

interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  ownerConfig: OwnerConfig;
  onUpdateOwnerConfig: (config: OwnerConfig) => void;
  onProductsUpdated: (products: Product[]) => void;
}

export const OwnerModal: React.FC<OwnerModalProps> = ({
  isOpen,
  onClose,
  products,
  ownerConfig,
  onUpdateOwnerConfig,
  onProductsUpdated,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isOwnerSessionActive());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'supplier' | 'visibility'>('supplier');

  // Supplier Form State
  const [supplierUrlInput, setSupplierUrlInput] = useState(ownerConfig.supplierUrl || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error' | null; message: string | null }>({
    type: null,
    message: null,
  });

  // Visibility Search & Filters
  const [visibilitySearch, setVisibilitySearch] = useState('');
  const [visibilityCategory, setVisibilityCategory] = useState<string>('Todos');

  // Keep input in sync with ownerConfig
  useEffect(() => {
    if (ownerConfig.supplierUrl) {
      setSupplierUrlInput(ownerConfig.supplierUrl);
    }
  }, [ownerConfig.supplierUrl]);

  if (!isOpen) return null;

  // Handle password submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyOwnerPassword(passwordInput)) {
      setIsAuthenticated(true);
      setOwnerSessionActive(true);
      setAuthError(null);
      setPasswordInput('');
    } else {
      setAuthError('Contraseña incorrecta. Recuerda que la clave es riverplate2003');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setOwnerSessionActive(false);
    setPasswordInput('');
    setAuthError(null);
  };

  // Trigger Supplier Sync
  const handleSyncNow = async () => {
    const url = supplierUrlInput.trim();
    if (!url) {
      setSyncStatus({ type: 'error', message: 'Por favor ingresa la URL de tu proveedor.' });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ type: null, message: null });

    const result = await syncSupplierProducts(url);
    setIsSyncing(false);

    if (result.success && result.products.length > 0) {
      setSyncStatus({ type: 'success', message: result.message });
      onProductsUpdated(result.products);
      
      const newConfig: OwnerConfig = {
        ...ownerConfig,
        supplierUrl: url,
        lastSyncTime: new Date().toISOString(),
      };
      onUpdateOwnerConfig(newConfig);
      persistOwnerConfig(newConfig);
    } else {
      setSyncStatus({ 
        type: 'error', 
        message: result.message || 'No se pudieron extraer productos. Revisa la URL ingresada.' 
      });
    }
  };

  // Toggle Visibility for a single Product
  const handleToggleProductVisibility = (productId: string) => {
    const currentHidden = new Set(ownerConfig.hiddenProductIds);
    if (currentHidden.has(productId)) {
      currentHidden.delete(productId);
    } else {
      currentHidden.add(productId);
    }

    const updatedConfig: OwnerConfig = {
      ...ownerConfig,
      hiddenProductIds: Array.from(currentHidden),
    };
    onUpdateOwnerConfig(updatedConfig);
    persistOwnerConfig(updatedConfig);
  };

  // Toggle Visibility for an entire Category
  const handleToggleCategoryVisibility = (cat: string) => {
    const currentHidden = new Set(ownerConfig.hiddenCategories);
    if (currentHidden.has(cat)) {
      currentHidden.delete(cat);
    } else {
      currentHidden.add(cat);
    }

    const updatedConfig: OwnerConfig = {
      ...ownerConfig,
      hiddenCategories: Array.from(currentHidden),
    };
    onUpdateOwnerConfig(updatedConfig);
    persistOwnerConfig(updatedConfig);
  };

  // Toggle Auto-Hide Out of Stock
  const handleToggleAutoHideOutOfStock = () => {
    const updatedConfig: OwnerConfig = {
      ...ownerConfig,
      autoHideOutOfStock: !ownerConfig.autoHideOutOfStock,
    };
    onUpdateOwnerConfig(updatedConfig);
    persistOwnerConfig(updatedConfig);
  };

  // Unique categories from products
  const uniqueCategories = Array.from(
    new Set(products.map(p => p.category).filter(Boolean))
  );

  // Filter products for visibility manager
  const filteredManagerProducts = products.filter(p => {
    if (visibilityCategory !== 'Todos' && p.category !== visibilityCategory) return false;
    if (visibilitySearch.trim()) {
      const q = visibilitySearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate statistics
  const totalCount = products.length;
  const hiddenByCategoryCount = products.filter(p => ownerConfig.hiddenCategories.includes(p.category)).length;
  const hiddenIndividualCount = products.filter(p => ownerConfig.hiddenProductIds.includes(p.id)).length;
  const hiddenByStockCount = ownerConfig.autoHideOutOfStock 
    ? products.filter(p => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0)).length 
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col sm:items-center sm:justify-center sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Backdrop (Desktop only click-to-close) */}
      <div className="hidden sm:block fixed inset-0" onClick={onClose} />

      {/* Main Container - Fullscreen on mobile, rounded modal on desktop */}
      <div className="relative z-10 w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-4xl bg-[#0c0e15] sm:border sm:border-[#d4af37]/50 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header Bar - Optimized for mobile touch */}
        <div className="bg-[#121520] px-4 py-3 sm:px-6 sm:py-4 border-b border-[#212538] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gold-gradient flex items-center justify-center text-black font-black shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-base sm:text-lg font-black text-white tracking-wide">
                  MODO DUEÑO
                </h3>
                {isAuthenticated && (
                  <span className="text-[10px] bg-[#22c55e]/20 text-[#86efac] border border-[#22c55e]/40 px-2 py-0.5 rounded-full font-bold">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8e95ac] hidden sm:block">
                Administración de proveedor, catálogo masivo y visibilidad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-[#9ba2b6] hover:text-white px-3 py-1.5 rounded-xl border border-[#23273a] hover:border-[#d4af37]/40 transition-colors cursor-pointer min-h-[38px] flex items-center justify-center active:scale-95"
              >
                Bloquear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#1b1f2e] hover:bg-[#d4af37] text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* PASSWORD GATE (if not authenticated) */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto my-auto py-8 px-4 sm:p-6 bg-[#11131e] border border-[#d4af37]/40 rounded-3xl shadow-2xl space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1b2033] border border-[#d4af37]/40 flex items-center justify-center mx-auto text-[#d4af37] shadow-lg shadow-[#d4af37]/10">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-serif-luxury text-xl font-black text-white">
                  Acceso Exclusivo de Dueño
                </h4>
                <p className="text-xs text-[#9098af] mt-1.5 leading-relaxed">
                  Ingresa tu contraseña para conectar con tu proveedor, sincronizar miles de productos y gestionar qué piezas se muestran en tu tienda.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#cbd2e6] mb-1.5 uppercase tracking-wider">
                    Contraseña de Acceso
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Ingresa la clave..."
                      autoFocus
                      className="w-full bg-[#08090e] border border-[#272b3e] focus:border-[#d4af37] text-white px-4 py-3.5 rounded-2xl text-base outline-none transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#767d94] hover:text-white p-2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full min-h-[50px] rounded-2xl bg-gold-gradient hover:bg-gold-gradient-hover text-black font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Desbloquear Panel</span>
                </button>
              </form>
            </div>
          ) : (
            /* AUTHENTICATED OWNER DASHBOARD */
            <div className="space-y-4 sm:space-y-6">
              
              {/* Hourly Auto-Sync Status Card - Mobile Friendly */}
              <div className="bg-[#111422] border border-[#d4af37]/40 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1b2034] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Sincronización Automática
                      </span>
                      <span className="text-[10px] bg-[#d4af37]/20 text-[#f5e3a9] px-2 py-0.5 rounded-full font-bold">
                        Cada 1 Hora
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8e95aa] mt-0.5">
                      {ownerConfig.lastSyncTime ? (
                        <>Última sincronización: <strong>{new Date(ownerConfig.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs</strong></>
                      ) : (
                        <>Listo para la primera sincronización masiva.</>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gold-gradient hover:brightness-110 text-black text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md min-h-[42px] active:scale-98"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando (+1000 productos)...' : 'Sincronizar Ahora'}</span>
                </button>
              </div>

              {/* Mobile Touch-Optimized Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#090b12] rounded-2xl border border-[#1f2436]">
                <button
                  type="button"
                  onClick={() => setActiveTab('supplier')}
                  className={`py-3 px-3 text-xs font-bold tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-center ${
                    activeTab === 'supplier'
                      ? 'bg-gold-gradient text-black shadow-md font-extrabold'
                      : 'text-[#828a9e] hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">Proveedor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('visibility')}
                  className={`py-3 px-3 text-xs font-bold tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-center ${
                    activeTab === 'visibility'
                      ? 'bg-gold-gradient text-black shadow-md font-extrabold'
                      : 'text-[#828a9e] hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span className="truncate">Visibilidad ({ownerConfig.hiddenProductIds.length + ownerConfig.hiddenCategories.length})</span>
                </button>
              </div>

              {/* TAB 1: SUPPLIER URL & AUTOMATED SYNC */}
              {activeTab === 'supplier' && (
                <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                  
                  {/* Supplier URL Input Box */}
                  <div className="bg-[#10121a] border border-[#232738] rounded-2xl p-4 sm:p-5 space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-[#d4af37]" />
                        <span>URL de la Tienda de tu Proveedor</span>
                      </label>
                      <p className="text-[11px] text-[#8e95ab] mt-1">
                        Compatible con Empretienda, Shopify, Tiendanube y catálogos online masivos (+1000 productos con fotos múltiples).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="url"
                        value={supplierUrlInput}
                        onChange={(e) => setSupplierUrlInput(e.target.value)}
                        placeholder="https://regaleriapaz.empretienda.com.ar/"
                        className="w-full bg-[#08090e] border border-[#272b3c] focus:border-[#d4af37] text-white px-4 py-3.5 rounded-xl text-base outline-none transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSyncNow}
                        disabled={isSyncing}
                        className="w-full py-3.5 rounded-xl bg-gold-gradient text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-lg shadow-[#d4af37]/20 min-h-[48px] active:scale-98"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Extrayendo catálogo completo (+1000 piezas)...' : 'Conectar y Sincronizar Catálogo Completo'}</span>
                      </button>
                    </div>

                    <div className="p-3 bg-[#0a0c13] rounded-xl border border-[#1b2030] text-[11px] text-[#939bb2] space-y-1.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Sincronización Inteligente de Alta Precisión:</span>
                      </div>
                      <p>
                        • <strong>Galería Completa de Fotos:</strong> Si un producto tiene 2, 3 o más fotos, se extraen todas en alta resolución (CloudFront CDN).
                      </p>
                      <p>
                        • <strong>Precios y Stock en Tiempo Real:</strong> Importa los precios oficiales en pesos y detecta unidades en stock.
                      </p>
                      <p>
                        • <strong>Actualización Automática cada 1 Hora:</strong> Mantiene tu catálogo sincronizado periódicamente sin que tengas que hacer nada.
                      </p>
                    </div>
                  </div>

                  {/* Sync Status Banner */}
                  {syncStatus.message && (
                    <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
                      syncStatus.type === 'success'
                        ? 'bg-[#14532d]/30 border-green-500/50 text-green-200'
                        : 'bg-red-950/40 border-red-500/40 text-red-200'
                    }`}>
                      {syncStatus.type === 'success' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-sm">{syncStatus.type === 'success' ? '¡Sincronización Exitosa!' : 'Aviso de Sincronización'}</p>
                        <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{syncStatus.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Products Catalog Live Preview */}
                  <div className="bg-[#10121a] border border-[#232738] rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#d4af37]" />
                        <span>Catálogo en tu Tienda ({products.length} productos)</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setActiveTab('visibility')}
                        className="text-[11px] text-[#d4af37] font-bold hover:underline cursor-pointer"
                      >
                        Ocultar productos →
                      </button>
                    </div>

                    {/* Mobile swipeable preview */}
                    <div className="flex sm:grid sm:grid-cols-4 gap-2.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                      {products.slice(0, 12).map(p => (
                        <div key={p.id} className="min-w-[170px] sm:min-w-0 bg-[#08090e] border border-[#212435] rounded-xl p-2.5 flex items-center gap-2.5 shrink-0">
                          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-black shrink-0 border border-[#23273a]" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-white truncate">{p.name}</p>
                            <p className="text-[10px] text-gold-gradient font-bold">{formatCurrency(p.price)}</p>
                            <span className="text-[9px] text-[#7d849a] block">
                              {p.images && p.images.length > 1 ? `📸 ${p.images.length} fotos` : '1 foto'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VISIBILITY & HIDING OF PRODUCTS AND CATEGORIES */}
              {activeTab === 'visibility' && (
                <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                  
                  {/* Automatic Out-Of-Stock Rule Toggle */}
                  <div className="bg-[#131623] border border-[#d4af37]/40 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-md">
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Ocultar Automáticamente Sin Stock
                        </span>
                        <span className="text-[9px] bg-[#d4af37] text-black font-black px-1.5 py-0.2 rounded uppercase">
                          Regla Activa
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8e95aa] leading-tight">
                        Los productos de tu proveedor con stock = 0 se ocultan solos de la tienda para que ningún cliente pueda comprarlos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleAutoHideOutOfStock}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        ownerConfig.autoHideOutOfStock ? 'bg-[#22c55e]' : 'bg-[#374151]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          ownerConfig.autoHideOutOfStock ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Category-Level Visibility Controls - Mobile Horizontal Scroll */}
                  <div className="bg-[#10121a] border border-[#232738] rounded-2xl p-3.5 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#d4af37]" />
                          <span>Ocultar Categorías Enteras</span>
                        </h4>
                        <p className="text-[11px] text-[#8e95aa] mt-0.5">
                          Toca una categoría para ocultar todos sus productos a la vez.
                        </p>
                      </div>
                      <span className="text-[10px] text-[#d4af37] font-bold shrink-0">
                        {ownerConfig.hiddenCategories.length} ocultas
                      </span>
                    </div>

                    {/* Category Pills (Touch friendly, horizontal scroll on mobile) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none flex-nowrap sm:flex-wrap">
                      {uniqueCategories.map(cat => {
                        const isHidden = ownerConfig.hiddenCategories.includes(cat);
                        const catProductsCount = products.filter(p => p.category === cat).length;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleToggleCategoryVisibility(cat)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 active:scale-95 ${
                              isHidden
                                ? 'bg-[#2a1215] border-red-500/50 text-red-300'
                                : 'bg-[#151825] border-[#292f44] text-white hover:border-[#d4af37]/60'
                            }`}
                          >
                            {isHidden ? (
                              <EyeOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                            )}
                            <span className="truncate max-w-[140px] sm:max-w-none">{cat}</span>
                            <span className="text-[10px] font-mono opacity-60">({catProductsCount})</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-black tracking-wider bg-black/40">
                              {isHidden ? 'Oculta' : 'Visible'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Products Visibility Manager */}
                  <div className="bg-[#10121a] border border-[#232738] rounded-2xl p-3.5 sm:p-5 space-y-3.5">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#d4af37]" />
                        <span>Ocultar o Mostrar Productos Individuales ({filteredManagerProducts.length})</span>
                      </h4>

                      {/* Mobile Filter Controls */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-[#7c8397] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={visibilitySearch}
                            onChange={(e) => setVisibilitySearch(e.target.value)}
                            placeholder="Buscar por nombre, código o categoría..."
                            className="w-full bg-[#08090e] border border-[#232738] text-white pl-10 pr-3 py-2.5 rounded-xl text-base sm:text-xs outline-none focus:border-[#d4af37]"
                          />
                          {visibilitySearch && (
                            <button
                              type="button"
                              onClick={() => setVisibilitySearch('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <select
                          value={visibilityCategory}
                          onChange={(e) => setVisibilityCategory(e.target.value)}
                          className="bg-[#08090e] border border-[#232738] text-white px-3 py-2.5 rounded-xl text-xs outline-none focus:border-[#d4af37] cursor-pointer"
                        >
                          <option value="Todos">Todas las categorías</option>
                          {uniqueCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Products Visibility List - Mobile Optimized Cards */}
                    <div className="space-y-2 max-h-[46vh] sm:max-h-96 overflow-y-auto overscroll-contain pr-1">
                      {filteredManagerProducts.map(product => {
                        const isDirectlyHidden = ownerConfig.hiddenProductIds.includes(product.id);
                        const isCategoryHidden = ownerConfig.hiddenCategories.includes(product.category);
                        const isStockHidden = ownerConfig.autoHideOutOfStock && (!product.inStock || (product.stockCount !== undefined && product.stockCount <= 0));
                        
                        const isHiddenFromStore = isDirectlyHidden || isCategoryHidden || isStockHidden;

                        return (
                          <div
                            key={product.id}
                            className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-colors ${
                              isHiddenFromStore
                                ? 'bg-[#181114] border-red-900/40 text-[#9ba0b4]'
                                : 'bg-[#090b10] border-[#1d2130] text-white'
                            }`}
                          >
                            {/* Product Info Left */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-[#232738]">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                {product.images && product.images.length > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-black/85 text-[#f5e3a9] text-[8px] font-bold px-1 rounded-tl">
                                    {product.images.length}📸
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] uppercase font-bold text-[#d4af37] truncate max-w-[120px]">
                                    {product.category}
                                  </span>
                                  <span className="text-[9px] font-mono text-[#626980]">
                                    {product.sku}
                                  </span>
                                </div>
                                <h5 className={`text-xs font-semibold truncate ${isHiddenFromStore ? 'text-gray-300' : 'text-white'}`}>
                                  {product.name}
                                </h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-gold-gradient">
                                    {formatCurrency(product.price)}
                                  </span>
                                  <span className={`text-[10px] font-bold ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                                    {product.inStock ? `Stock: ${product.stockCount ?? 'OK'}` : 'Sin stock'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Visibility Toggle Action Button (Large touch target) */}
                            <button
                              type="button"
                              onClick={() => handleToggleProductVisibility(product.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border min-h-[42px] min-w-[90px] shrink-0 active:scale-95 ${
                                isDirectlyHidden
                                  ? 'bg-[#dc2626] text-white border-red-500 shadow-md shadow-red-900/30'
                                  : isHiddenFromStore
                                  ? 'bg-[#291316] text-red-300 border-red-800'
                                  : 'bg-[#151928] text-white border-[#272d42] hover:border-[#d4af37]'
                              }`}
                            >
                              {isDirectlyHidden ? (
                                <>
                                  <EyeOff className="w-4 h-4 text-white" />
                                  <span>Oculto</span>
                                </>
                              ) : isHiddenFromStore ? (
                                <>
                                  <EyeOff className="w-4 h-4 text-red-400" />
                                  <span>Oculto</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 text-[#22c55e]" />
                                  <span>Visible</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Sticky Action Bar on Mobile */}
              <div className="pt-3 border-t border-[#1e2334] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#8e95ab] gap-2.5 shrink-0">
                <div className="flex items-center justify-between sm:justify-start gap-3 text-[11px]">
                  <span>Total: <strong className="text-white">{totalCount}</strong></span>
                  <span>Ocultos: <strong className="text-red-400">{hiddenByCategoryCount + hiddenIndividualCount + hiddenByStockCount}</strong></span>
                  <span>En tienda: <strong className="text-green-400">{totalCount - (hiddenByCategoryCount + hiddenIndividualCount + hiddenByStockCount)}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gold-gradient text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#d4af37]/20 min-h-[44px] flex items-center justify-center active:scale-98"
                >
                  Guardar y Ver Tienda
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
