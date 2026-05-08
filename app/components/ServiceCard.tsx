"use client";

import Link from 'next/link';

export default function ServiceCard({
  service,
  isAdmin,
  displayPrice,
  translate,
  handleOrder,
  deleteService,
  isFavorite, // <-- ДОБАВЛЕН ПРОП
  toggleFavorite // <-- ДОБАВЛЕН ПРОП
}: any) {
  return (
    <div className="bg-white rounded-[8px] border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-[#11a95e]/40 transition-all duration-300 relative group">
      
      {/* ПРАВЫЙ ВЕРХНИЙ УГОЛ: СЕРДЕЧКО И ЦЕНА */}
      <div className="absolute top-5 right-5 flex items-center gap-3">
        {/* Кнопка "В избранное" */}
        <button 
          onClick={(e) => { e.preventDefault(); toggleFavorite(); }} 
          className={`transition-all duration-200 hover:scale-110 active:scale-95 ${
            isFavorite ? 'text-red-500 hover:text-red-600 drop-shadow-sm' : 'text-gray-300 hover:text-red-400'
          }`}
          title="В закладки"
        >
          <svg className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? "1" : "2"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </button>

        {/* Badge с ценой */}
        <div className="text-[#11a95e] font-bold bg-[#eaf6f0] px-3 py-1 rounded-[4px] text-[13px] tracking-wide border border-[#11a95e]/10">
          {displayPrice(service.price)}
        </div>
      </div>

      {/* ЗАГОЛОВОК С ПРАВИЛЬНОЙ ССЫЛКОЙ */}
      <Link href={`/service/${service.id}`}>
        <h2 className="text-[18px] font-extrabold text-[#11a95e] group-hover:underline cursor-pointer pr-36 mb-2 line-clamp-1">
          {service.title}
        </h2>
      </Link>

      <div className="text-[13px] text-gray-600 mb-4 pr-10 leading-relaxed line-clamp-2">
        {service.description}
        <Link href={`/service/${service.id}`} className="text-[#11a95e] cursor-pointer hover:underline ml-1 font-medium">
          {translate('show_all')}
        </Link>
      </div>

      {/* ИНФО О ПРОДАВЦЕ */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-[90px] h-[90px] rounded-[6px] bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-3xl shadow-inner">
          {service.image_url ? (
             <img src={service.image_url} className="w-full h-full object-cover" alt="" />
          ) : service.seller_avatar ? (
             <img src={service.seller_avatar} className="w-full h-full object-cover" alt="" /> 
          ) : (
             (service.seller_name ? service.seller_name.charAt(0).toUpperCase() : 'U')
          )}
        </div>
        <div className="text-[13px] text-gray-800 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-500">⭐ {service.rating ?? '5.0'}</span>
            <span className="text-gray-300">|</span>
            <span>
              {translate('buyer')}:{' '}
              <Link 
                href={`/user/${service.seller_email}`}
                className="cursor-pointer font-bold hover:text-[#11a95e] hover:underline transition-colors"
              >
                {service.seller_name || 'UNIT_USER'}
              </Link>
            </span>
            <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-extrabold border border-blue-100">PRO</span>
          </div>
          <div>{translate('projects_on_exchange')}: <span className="font-medium">{service.seller_projects ?? 0}</span></div>
          <div className="flex items-center gap-1">
            {translate('hired_on')}: <span className="font-medium text-[#11a95e]">{service.seller_hired ?? 100}%</span>
            <span className="w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 flex items-center justify-center text-[9px] cursor-help bg-gray-50">?</span>
          </div>
        </div>
      </div>

      {/* КНОПКИ */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100 gap-3">
        <div className="text-[12.5px] text-gray-500 font-medium w-full sm:w-auto flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {translate('rest_time')} • {translate('reviews_count')}: <span className="font-bold text-gray-700">{service.reviews_count ?? 0}</span>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
           {isAdmin && (
             <button onClick={() => deleteService(service.id)} className="border border-red-500 text-red-500 px-4 py-[8px] rounded-[6px] hover:bg-red-50 transition-colors text-[13px] font-medium">
               {translate('delete')}
             </button>
           )}
           <Link 
             href={`/service/${service.id}`}
             className="px-5 py-[8px] rounded-[6px] font-medium text-[13px] text-[#11a95e] border border-[#11a95e] hover:bg-[#f0fdf4] transition-colors hidden sm:block"
           >
             {translate('review_btn')}
           </Link>
           <button onClick={() => handleOrder(service.id, service.title)} className="w-full sm:w-auto px-6 py-[8px] rounded-[6px] font-bold text-[13px] text-white bg-[#11a95e] hover:bg-[#0e9552] transition-colors shadow-sm shadow-[#11a95e]/30">
            {translate('order')}
          </button>
        </div>
      </div>
    </div>
  );
}