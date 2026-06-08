"use client";
import React, { useState } from 'react';
import ChatModal from '../ChatModal'; // Убедитесь, что путь правильный

interface TrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userOrders: any[];
  userEmail: string; // Добавили email пользователя для чата
  trackingLoading: boolean;
  translate: (key: string) => string;
  getStatusStyle: (status: string) => string;
  onRate: (orderId: string, serviceId: string) => void;
}

export default function TrackerModal({ 
  isOpen, onClose, userOrders, userEmail, trackingLoading, translate, getStatusStyle, onRate 
}: TrackerModalProps) {
  
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
            <h2 className="font-bold text-[20px] text-[#111]">{translate('track_orders')}</h2>
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-orange-500 leading-none transition-colors">×</button>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {trackingLoading ? (
              <div className="text-center py-4 text-[13px] text-gray-500">Loading...</div>
            ) : userOrders.length > 0 ? (
              userOrders.map(o => (
                <div key={o.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <span className="font-bold text-[13px] text-[#333] w-full sm:w-48 truncate">{o.services?.title}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(o.status)}`}>{o.status}</span>
                    
                    {/* Кнопка Чат */}
                    <button 
                      onClick={() => setChatOrderId(o.id)}
                      className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1.5 rounded-[6px] border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      Чат
                    </button>

                    {(o.status === 'Done' || o.status === 'Completed') && !o.rating && (
                      <button 
                        onClick={() => onRate(o.id, o.service_id)}
                        className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-1.5 rounded-[6px] border border-orange-100 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                      >
                        {translate('btn_rate')}
                      </button>
                    )}
                    {o.rating && <span className="text-[12px] text-orange-400 font-bold tracking-widest">{'⭐'.repeat(o.rating)}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[13px] text-gray-400 font-medium">{translate('no_orders')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Модалка чата */}
      {chatOrderId && (
        <ChatModal 
          isOpen={!!chatOrderId} 
          onClose={() => setChatOrderId(null)} 
          orderId={chatOrderId} 
          userEmail={userEmail} 
        />
      )}
    </>
  );
}