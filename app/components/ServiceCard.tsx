"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface ServiceCardProps {
  service: any;
  isAdmin?: boolean;
  displayPrice: (price: number) => string;
  translate: (key: string) => string;
  handleOrder?: () => void;
  deleteService?: (id: string) => void;
  isFavorite?: boolean;
  toggleFavorite?: () => void;
  isTop?: boolean;
  viewMode?: 'grid' | 'list';
  isOnline?: boolean;
}

export default function ServiceCard({
  service,
  isAdmin = false,
  displayPrice,
  translate,
  handleOrder,
  deleteService,
  isFavorite = false,
  toggleFavorite,
  isTop = false,
  viewMode = 'grid',
  isOnline = false
}: ServiceCardProps) {
  const router = useRouter();

  if (!service) return null;

  // Логика отображения имени продавца
  const sellerName = service.seller_name === "Новый пользователь" 
    ? translate('unit_seller') 
    : (service.seller_name || translate('unit_seller'));

  const navigateToDetails = () => {
    router.push(`/service/${service.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    if (action) action();
  };

  const isListView = viewMode === 'list';

  return (
    <div 
      onClick={navigateToDetails}
      className={`bg-white transition-all duration-300 group cursor-pointer flex ${
        isTop 
          ? 'border-2 border-amber-500 shadow-lg shadow-amber-500/15 bg-gradient-to-br from-amber-50/50 via-white to-transparent' 
          : 'border border-gray-100 shadow-sm'
      } ${
        isListView 
          ? 'flex-col sm:flex-row p-5 gap-6 rounded-2xl hover:shadow-xl items-center hover:-translate-y-1.5' 
          : 'flex-col rounded-2xl hover:-translate-y-1.5 hover:shadow-xl'
      }`}
    >
      {/* Картинка */}
      <div className={`bg-gray-50 relative overflow-hidden shrink-0 ${
        isListView 
          ? 'w-full sm:w-[220px] aspect-[4/3] rounded-2xl border border-gray-100' 
          : 'w-full aspect-[4/3] rounded-t-xl border-b border-gray-50'
      }`}>
        {service.image_url ? (
          <img src={service.image_url} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-110 transition-transform duration-500">📷</div>
        )}

        {isTop && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md shadow-orange-500/20 z-10">
            {translate('top_badge') || 'TOP'}
          </div>
        )}

        {toggleFavorite && (
          <button onClick={(e) => handleButtonClick(e, toggleFavorite)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center border border-gray-100 hover:bg-white hover:scale-110 active:scale-95 transition-all z-10 group/fav">
            <svg className={`w-[18px] h-[18px] transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 group-hover/fav:text-red-500'}`} fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        )}
      </div>

      {/* Контент карточки */}
      <div className={`flex flex-col flex-1 ${isListView ? 'w-full py-2' : 'p-5'}`}>
        <div className="flex items-center justify-between mb-2.5 text-[12px] font-medium text-gray-400">
          <div className="flex items-center gap-2 max-w-[70%]">
            <div className="flex items-center gap-1.5 min-w-0 relative">
                <div className="w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                  {(service.seller_name || 'U')[0].toUpperCase()}
                </div>
                <span className="truncate text-gray-600 font-bold">{sellerName}</span>
                
                {isOnline && (
                  <span title={translate('online') || "Online"} className="relative flex h-2 w-2 shrink-0 ml-0.5 mt-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#11a95e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#11a95e]"></span>
                  </span>
                )}
                
                {service.sellerProfile?.seller_level === 2 && (
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-widest shrink-0 ml-1">
                    {translate('pro') || 'Pro'}
                  </span>
                )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-orange-400 font-bold">
            <span>★</span>
            <span className="text-gray-700">{service.rating_avg || '5.0'}</span>
          </div>
        </div>

        {/* Заголовок услуги с бейджем языка */}
        <div className="flex items-start gap-2 mb-4">
          <h3 className={`font-bold text-[#111] leading-snug tracking-tight group-hover:text-[#11a95e] transition-colors line-clamp-2 flex-1 ${isListView ? 'text-[18px] sm:text-[20px]' : 'text-[15px] min-h-[44px]'}`}>
            {service.title}
          </h3>
          
          {/* Значок языка (берет значение из базы, если пусто - RU) */}
          <span className="shrink-0 text-[10px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded uppercase tracking-wider select-none shadow-sm mt-0.5 min-w-[20px] flex items-center justify-center">
            {service.language || 'RU'}
          </span>
        </div>

        {/* Цена и кнопка */}
        <div className={`mt-auto flex items-center justify-between border-t border-gray-50 pt-4 ${isListView ? 'sm:justify-end sm:gap-8' : ''}`}>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{translate('from')}</span>
            <span className="text-[18px] font-bold text-[#111] leading-none tracking-tight">{displayPrice(service.price)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && deleteService && (
              <button 
                onClick={(e) => handleButtonClick(e, () => deleteService(service.id))} 
                className="text-gray-400 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-red-50" 
                title={translate('delete')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
            
            {handleOrder && !isAdmin && (
              <button 
                onClick={(e) => handleButtonClick(e, handleOrder)} 
                className="bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white text-[12px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                {translate('order')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}