"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';

export default function TopSpecialistsBanner() {
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTopSellers();
  }, []);

  const fetchTopSellers = async () => {
    // Тянем данные из созданного нами View в Supabase
    const { data, error } = await supabase.from('top_specialists').select('*');
    
    if (error) {
      console.error('Ошибка загрузки топов:', error.message);
    } else if (data) {
      setTopSellers(data);
    }
    setLoading(false);
  };

  const navigateToProfile = (sellerId: string) => {
    router.push(`/user/${sellerId}`); // Ведем на страницу профиля
  };

  if (loading) return null; // Или можно показать скелетон-загрузку
  if (topSellers.length === 0) return null; // Если топов нет, баннер не показываем

  return (
    <div className="bg-gradient-to-r from-[#111] via-[#222] to-[#111] rounded-3xl p-8 mb-10 shadow-xl border border-gray-800 relative overflow-hidden group">
      
      {/* Декоративный фон */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[12px] font-black text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                UNIT Hall of Fame
            </span>
          </div>
          <h2 className="text-[28px] md:text-[32px] font-black text-white leading-tight tracking-tighter mb-1.5">Лучшие специалисты месяца</h2>
          <p className="text-[14px] text-gray-400 font-medium max-w-lg mb-6">Проверенные профессионалы с самым высоким рейтингом и безупречной репутацией.</p>
        </div>
      </div>

      {/* КАРТОЧКИ ТОПОВ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-4 relative z-10">
        {topSellers.map((seller, index) => (
          <div 
            key={seller.id} 
            onClick={() => navigateToProfile(seller.id)}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-white/10 hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/20 transition-all duration-300"
          >
            
            {/* АВАТАР И РЕЙТИНГ */}
            <div className="relative shrink-0">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt={seller.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-orange-400" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-xl font-black text-gray-400 uppercase border-2 border-gray-600">
                    {seller.full_name?.[0]}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-orange-400 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                    ★ {(seller.rating || 5.0).toFixed(1)}
                </div>
            </div>
            
            {/* ИНФО */}
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-black text-white truncate mb-0.5">{seller.full_name || 'Специалист'}</p>
              <p className="text-[12px] text-gray-400 truncate mb-2">{seller.specialization || 'Разработчик'}</p>
              
              <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase font-black tracking-widest border-t border-white/5 pt-2">
                <span>Заказов:</span>
                <span className="text-white">{seller.completed_orders || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}