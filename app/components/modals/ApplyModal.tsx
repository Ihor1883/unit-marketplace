import React from 'react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  setMessage: (val: string) => void;
  onSubmit: () => void;
  translate: (key: string) => string; // Добавили пропс перевода
}

export default function ApplyModal({ isOpen, onClose, message, setMessage, onSubmit, translate }: ApplyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 text-xl hover:text-orange-500 transition-colors">×</button>
        <h2 className="font-black text-[18px] mb-4">{translate('apply_title') || 'Оставить отклик'}</h2>
        <textarea 
          className="w-full border border-gray-200 bg-gray-50 rounded-xl p-4 text-[13px] outline-none focus:border-[#11a95e] focus:bg-white h-28 mb-4 resize-none transition-colors"
          placeholder={translate('apply_ph') || 'Опишите, почему вы справитесь с этим заданием...'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={onSubmit} className="w-full bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white py-3 rounded-xl font-bold shadow-md transition-all">
          {translate('apply_submit') || 'Отправить отклик'}
        </button>
      </div>
    </div>
  );
}