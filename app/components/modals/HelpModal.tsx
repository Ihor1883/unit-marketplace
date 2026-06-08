import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  translate: (key: string) => string;
}

export default function HelpModal({ isOpen, onClose, translate }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h2 className="font-black text-[18px] text-[#111] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            {translate('help_title')}
          </h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-orange-500 leading-none transition-colors">×</button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-2 hide-scrollbar">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[14px] text-[#222] mb-1.5 flex items-center gap-2">
                <span className="text-orange-500">{i}.</span> {translate(`help_q${i}`)}
              </h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">{translate(`help_a${i}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}