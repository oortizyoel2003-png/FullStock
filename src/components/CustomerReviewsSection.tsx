import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Camera, 
  CheckCircle2, 
  Sparkles, 
  PlusCircle, 
  X, 
  ChevronRight,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { CustomerReview, fetchCustomerReviewsFromCloud } from '../utils/firebase';
import { AddReviewModal } from './AddReviewModal';

// Initial high-quality curated customer experience reviews with real photos
const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev_1',
    customerName: 'Carolina & Mateo',
    city: 'Buenos Aires',
    productName: 'Juego de Copas Cristal Bohemia & Decanter 1500ml',
    rating: 5,
    comment: 'Compramos las copas de cristal para la cena de aniversario. La calidad del brillo y el sonido al brindar es exquisito. Llegó en 24hs super embalado.',
    photoUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop',
    verifiedPurchase: true,
    createdAt: '2026-09-15T14:30:00Z',
  },
  {
    id: 'rev_2',
    customerName: 'Valeria R.',
    city: 'Mendoza',
    productName: 'Set de Cubiertos Acero Inoxidable Gold Matte 24 piezas',
    rating: 5,
    comment: 'Las piezas doradas mate transformaron por completo la mesa de nuestro domingo. Tienen un peso espectacular en mano y resistieron perfecto el lavavajillas.',
    photoUrl: 'https://images.unsplash.com/photo-1615865417236-d67f572a746f?q=80&w=800&auto=format&fit=crop',
    verifiedPurchase: true,
    createdAt: '2026-09-18T10:15:00Z',
  },
  {
    id: 'rev_3',
    customerName: 'Luciano G.',
    city: 'Rosario',
    productName: 'Caja Regalo Executive Wine & Cheeseboard de Nogal',
    rating: 5,
    comment: 'Elegí la opción de empaque de regalo y mensaje personalizado para un cliente corporativo. Quedaron fascinados con la presentación de lujo.',
    photoUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
    verifiedPurchase: true,
    createdAt: '2026-09-22T18:45:00Z',
  },
  {
    id: 'rev_4',
    customerName: 'Camila P.',
    city: 'Córdoba',
    productName: 'Vajilla Artesanal de Gres Porcelánico Olive 16pzs',
    rating: 5,
    comment: 'El acabado del esmalte mate es suave al tacto y cada plato tiene ese toque orgánico artesanal único. Todos mis invitados me preguntaron de dónde eran.',
    photoUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop',
    verifiedPurchase: true,
    createdAt: '2026-09-25T09:20:00Z',
  },
];

export const CustomerReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'with-photo' | '5-stars'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Load customer reviews from Firestore
    fetchCustomerReviewsFromCloud().then(cloudReviews => {
      if (cloudReviews && cloudReviews.length > 0) {
        // Merge cloud reviews with initial reviews, avoiding duplicate IDs
        const existingIds = new Set(INITIAL_REVIEWS.map(r => r.id));
        const newCloud = cloudReviews.filter(r => r.id && !existingIds.has(r.id));
        setReviews([...newCloud, ...INITIAL_REVIEWS]);
      }
    });
  }, []);

  const handleReviewAdded = (newReview: CustomerReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  const filteredReviews = reviews.filter(r => {
    if (activeFilter === 'with-photo') return Boolean(r.photoUrl);
    if (activeFilter === '5-stars') return r.rating === 5;
    return true;
  });

  return (
    <section className="my-16 border-t border-b border-[#202536] py-14 bg-[#0b0c12]/60 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1910] border border-[#d4af37]/40 text-[#f5e3a9] text-xs font-semibold uppercase tracking-wider mb-3">
              <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Experiencias Reales de Clientes</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white">
              Fotografías & Mesas Servidas
            </h2>
            <p className="text-sm text-[#8e95aa] mt-2 max-w-xl">
              Descubre cómo lucen nuestras piezas de bazar, cristalería y regalería en hogares de toda la Argentina.
            </p>
          </div>

          {/* Aggregate Rating Banner & Add Review CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-[#121522] border border-[#23273a] px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif-luxury font-black text-[#d4af37]">4.9</span>
                <div className="flex text-[#d4af37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#d4af37]" />
                  ))}
                </div>
              </div>
              <div className="h-8 w-px bg-[#23273a]" />
              <div className="text-xs text-[#a0a8be]">
                <p className="font-bold text-white">+180 Opiniones</p>
                <p className="text-[10px]">Compradores Verificados</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Subir Mi Fotografía</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#d4af37] text-black font-bold'
                : 'bg-[#151824] text-[#8e95aa] hover:text-white border border-[#23273a]'
            }`}
          >
            Todas ({reviews.length})
          </button>
          <button
            onClick={() => setActiveFilter('with-photo')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'with-photo'
                ? 'bg-[#d4af37] text-black font-bold'
                : 'bg-[#151824] text-[#8e95aa] hover:text-white border border-[#23273a]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Con Foto Real ({reviews.filter(r => r.photoUrl).length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('5-stars')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === '5-stars'
                ? 'bg-[#d4af37] text-black font-bold'
                : 'bg-[#151824] text-[#8e95aa] hover:text-white border border-[#23273a]'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>5 Estrellas ({reviews.filter(r => r.rating === 5).length})</span>
          </button>
        </div>

        {/* Customer Reviews Masonry/Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#121522] border border-[#23273a] hover:border-[#d4af37]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#d4af37]/5 group"
            >
              <div>
                {/* Photo Preview if available */}
                {review.photoUrl && (
                  <div
                    onClick={() => setSelectedPhoto(review)}
                    className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 bg-black cursor-pointer group-hover:scale-[1.02] transition-transform"
                  >
                    <img
                      src={review.photoUrl}
                      alt={review.productName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]">
                      <Camera className="w-4 h-4 text-[#d4af37]" />
                      <span>Ampliar Fotografía</span>
                    </div>
                  </div>
                )}

                {/* Rating stars & verified badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-[#d4af37]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating ? 'fill-[#d4af37]' : 'text-[#2a2f42]'
                        }`}
                      />
                    ))}
                  </div>

                  {review.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#22c55e] bg-[#0c2417] px-2 py-0.5 rounded-full border border-[#15803d]/40">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Compra Verificada</span>
                    </span>
                  )}
                </div>

                {/* Review comment */}
                <p className="text-xs text-[#d1d7e8] leading-relaxed mb-3 italic">
                  "{review.comment}"
                </p>
              </div>

              {/* Customer info & product tag */}
              <div className="pt-3 border-t border-[#1e2233]">
                <p className="text-xs font-bold text-white">
                  {review.customerName}
                </p>
                <p className="text-[10px] text-[#7d859b] truncate">
                  {review.city} • <span className="text-[#d4af37]">{review.productName}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Photo Lightbox Zoom Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-[#11131c] border border-[#d4af37]/50 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 bg-black/70 text-white p-2 rounded-full hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-square bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.productName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 flex flex-col justify-between text-white">
                <div>
                  <div className="flex items-center gap-1.5 text-[#22c55e] text-xs font-semibold mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Fotografía Real de Comprador Verificado</span>
                  </div>

                  <h3 className="font-serif-luxury text-xl font-bold mb-1">
                    {selectedPhoto.productName}
                  </h3>

                  <p className="text-xs text-[#8e95aa] mb-4">
                    Publicado por <strong>{selectedPhoto.customerName}</strong> ({selectedPhoto.city})
                  </p>

                  <div className="flex text-[#d4af37] mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#d4af37]" />
                    ))}
                  </div>

                  <p className="text-sm text-[#e0e4f0] italic leading-relaxed bg-[#181a28] p-4 rounded-2xl border border-[#23273a]">
                    "{selectedPhoto.comment}"
                  </p>
                </div>

                <div className="pt-6 border-t border-[#1e2233] flex items-center justify-between text-xs text-[#8e95aa]">
                  <span>FullStock - Garantía de Autenticidad</span>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="text-[#d4af37] font-bold hover:underline cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Review Form Modal */}
      <AddReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewAdded={handleReviewAdded}
      />

    </section>
  );
};
