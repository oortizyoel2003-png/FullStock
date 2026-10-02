import React, { useState } from 'react';
import { X, Star, Upload, Image as ImageIcon, CheckCircle2, Sparkles } from 'lucide-react';
import { CustomerReview, addCustomerReviewToCloud } from '../utils/firebase';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewAdded: (review: CustomerReview) => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewAdded,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [productName, setProductName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen no debe superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);
      setPhotoUrl(base64);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim() || !productName.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const newReviewData: Omit<CustomerReview, 'id'> = {
      customerName: customerName.trim(),
      city: city.trim() || 'Buenos Aires',
      productName: productName.trim(),
      rating,
      comment: comment.trim(),
      photoUrl: photoUrl || photoPreview || undefined,
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    const docId = await addCustomerReviewToCloud(newReviewData);

    const completeReview: CustomerReview = {
      ...newReviewData,
      id: docId || 'review_' + Date.now(),
    };

    onReviewAdded(completeReview);
    setIsSubmitting(false);

    // Reset Form
    setCustomerName('');
    setCity('');
    setProductName('');
    setRating(5);
    setComment('');
    setPhotoUrl('');
    setPhotoPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#11131c] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8e95aa] hover:text-white bg-[#181a28] rounded-full hover:bg-[#23273a] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1b10] border border-[#d4af37]/50 text-[#f5e3a9] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Compartir Tu Experiencia</span>
          </div>
          <h3 className="font-serif-luxury text-2xl font-bold text-white">
            Subir Reseña con Fotografía Real
          </h3>
          <p className="text-xs text-[#8e95aa] mt-1">
            Tu opinión ayuda a otros compradores a elegir la pieza o regalo ideal.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#2a1215] border border-red-500/50 text-red-200 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Name & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#b2b9ce] font-semibold mb-1">
                Nombre o Apodo *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej. Sofía M."
                className="w-full bg-[#181a28] border border-[#23273a] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-white placeholder-[#5d647a] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[#b2b9ce] font-semibold mb-1">
                Ciudad / Provincia
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Córdoba, Argentina"
                className="w-full bg-[#181a28] border border-[#23273a] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-white placeholder-[#5d647a] outline-none transition-all"
              />
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-[#b2b9ce] font-semibold mb-1">
              Producto o Colección Adquirida *
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej. Copas Cristal Bohemia / Set Cuchillería Dorada"
              className="w-full bg-[#181a28] border border-[#23273a] focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-white placeholder-[#5d647a] outline-none transition-all"
            />
          </div>

          {/* Star Rating selector */}
          <div>
            <label className="block text-[#b2b9ce] font-semibold mb-1.5">
              Calificación *
            </label>
            <div className="flex items-center gap-2 bg-[#181a28] border border-[#23273a] p-3 rounded-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-[#d4af37] hover:scale-125 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-[#d4af37] text-[#d4af37]'
                        : 'text-[#383e54]'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-[#f5e3a9]">
                {hoverRating || rating} / 5
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[#b2b9ce] font-semibold mb-1">
              Tu Reseña o Historia de Experiencia *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Cómo lucen tus piezas en la mesa o qué le pareció el regalo al destinatario?"
              className="w-full bg-[#181a28] border border-[#23273a] focus:border-[#d4af37] rounded-xl p-3 text-white placeholder-[#5d647a] outline-none transition-all resize-none"
            />
          </div>

          {/* Photo Upload or URL */}
          <div>
            <label className="block text-[#b2b9ce] font-semibold mb-1">
              Fotografía Real de tu Mesa / Regalo (Opcional)
            </label>
            
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2.5 w-full bg-[#181a28] hover:bg-[#202336] border border-dashed border-[#d4af37]/50 hover:border-[#d4af37] p-4 rounded-2xl cursor-pointer transition-all text-center">
                <Upload className="w-5 h-5 text-[#d4af37]" />
                <span className="text-[#d4af37] font-semibold">Subir Foto desde tu Dispositivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>

              {/* Photo Preview */}
              {photoPreview && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#d4af37]/40 bg-black">
                  <img src={photoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setPhotoUrl(''); }}
                    className="absolute top-2 right-2 bg-black/80 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 rounded-2xl bg-gold-gradient text-black font-bold uppercase tracking-wider text-xs shadow-xl hover:shadow-[#d4af37]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publicar Reseña Verificada</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
