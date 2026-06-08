import React from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  translate: (key: string) => string;
  ratingQuality: number;
  setRatingQuality: (val: number) => void;
  ratingPunctuality: number;
  setRatingPunctuality: (val: number) => void;
  ratingPrice: number;
  setRatingPrice: (val: number) => void;
  reviewText: string;
  setReviewText: (val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReviewModal({ 
  isOpen, onClose, translate, ratingQuality, setRatingQuality, 
  ratingPunctuality, setRatingPunctuality, ratingPrice, setRatingPrice, 
  reviewText, setReviewText, onSubmit, isSubmitting 
}: ReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 text-xl hover:text-orange-500 transition-colors">×</button>
        <h2 className="font-black text-[20px] mb-2">{translate('modal_review_title')}</h2>
        <p className="text-[12px] text-gray-500 mb-6">{translate('modal_review_desc')}</p>
        
        <div className="space-y-4 mb-6">
          {[
            { label: 'modal_review_quality', val: ratingQuality, set: setRatingQuality, color: 'orange' },
            { label: 'modal_review_punctuality', val: ratingPunctuality, set: setRatingPunctuality, color: 'blue' },
            { label: 'modal_review_price', val: ratingPrice, set: setRatingPrice, color: 'emerald' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{translate(item.label)}</span>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => item.set(star)} className={`text-3xl transition-transform hover:scale-110 ${star <= item.val ? `text-${item.color}-400 drop-shadow-md` : 'text-gray-200'}`}>★</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <textarea 
          className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 text-[13px] outline-none focus:border-[#11a95e] focus:bg-white transition-all resize-none h-20 mb-6"
          placeholder={translate('ph_review')}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />

        <button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white py-3.5 rounded-xl font-bold text-[14px] transition-all shadow-md shadow-emerald-500/30 disabled:bg-gray-400"
        >
          {isSubmitting ? "..." : translate('btn_send_review')}
        </button>
      </div>
    </div>
  );
}