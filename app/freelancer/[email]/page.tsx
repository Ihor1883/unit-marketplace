"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// ИСПРАВЛЕННЫЙ ПУТЬ К БАЗЕ ДАННЫХ:
import { supabase } from '../../supabase'; 

export default function FreelancerProfile() {
  const params = useParams();
  const router = useRouter();
  const decodedEmail = decodeURIComponent(params.email as string);

  const [services, setServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 5.0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFreelancerData() {
      // 1. Ищем все услуги данного фрилансера
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('seller_email', decodedEmail)
        .order('created_at', { ascending: false });

      if (servicesData) {
        setServices(servicesData);
        
        // Считаем общую статистику по всем услугам
        const totalRev = servicesData.reduce((acc, s) => acc + (s.reviews_count || 0), 0);
        
        let calculatedRating = 5.0;
        if (totalRev > 0) {
          // Взвешенный средний рейтинг
          const sumRatings = servicesData.reduce((acc, s) => acc + ((s.rating_avg || 5) * (s.reviews_count || 0)), 0);
          calculatedRating = sumRatings / totalRev;
        }

        setStats({
          totalReviews: totalRev,
          avgRating: Number(calculatedRating.toFixed(1))
        });
      }

      // 2. Ищем данные профиля (Bio, навыки, общий рейтинг)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', decodedEmail)
        .single();
        
      if (profileData) {
        setProfile(profileData);
      } else if (servicesData && servicesData.length > 0 && servicesData[0].user_id) {
        // Fallback: ищем по user_id из первой услуги, если поиск по email не сработал
        const { data: profById } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', servicesData[0].user_id)
          .single();
        if (profById) setProfile(profById);
      }

      setLoading(false);
    }

    fetchFreelancerData();
  }, [decodedEmail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-gray-200 border-t-[#11a95e] rounded-full animate-spin"></span>
          <span className="font-bold text-[#11a95e] animate-pulse">Загрузка профиля...</span>
        </div>
      </div>
    );
  }

  // Определяем рейтинг для отображения (приоритет у профиля, затем расчетный)
  const displayRating = profile?.rating ? profile.rating.toFixed(1) : stats.avgRating.toFixed(1);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#333] pb-16">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1000px] mx-auto px-4 h-[64px] flex items-center justify-between">
          <div className="text-[24px] font-black tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => router.push('/')}>
            <span>UNIT<span className="text-[#11a95e]">.</span></span> 
          </div>
          <button onClick={() => window.close()} className="text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors">
            Закрыть вкладку ✕
          </button>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 py-8">
        
        {/* КАРТОЧКА ПРОФИЛЯ С РЕЙТИНГОМ */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#11a95e] rounded-full mix-blend-multiply filter blur-3xl opacity-5 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
            {/* Аватар */}
            <div className="w-[100px] h-[100px] shrink-0 rounded-[28px] bg-gradient-to-br from-[#11a95e] to-emerald-400 flex items-center justify-center text-4xl text-white font-black shadow-lg shadow-emerald-500/30">
              {decodedEmail.charAt(0).toUpperCase()}
            </div>
            
            {/* Информация */}
            <div className="flex-1 w-full">
              <h1 className="text-[28px] font-black text-[#111] mb-1">{decodedEmail.split('@')[0]}</h1>
              <p className="text-gray-500 font-medium text-[14px] mb-4">{decodedEmail}</p>
              
              {/* Статистика (Бейджи) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-5">
                <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg border border-orange-100 shadow-sm">
                  <span className="text-[14px]">⭐</span>
                  <span className="font-black text-[14px]">{displayRating}</span>
                  <span className="text-[11px] font-semibold opacity-70 ml-1">({stats.totalReviews} отзывов)</span>
                </div>
                <div className="flex items-center gap-2 bg-[#11a95e]/10 text-[#11a95e] px-3 py-1.5 rounded-lg border border-[#11a95e]/20 shadow-sm">
                  <span className="font-black text-[14px]">{services.length}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wide">Услуг в каталоге</span>
                </div>
              </div>

              {/* Bio & О себе */}
              {profile?.bio ? (
                <p className="text-[14px] text-gray-600 leading-relaxed mb-5 max-w-3xl">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-[13px] text-gray-400 italic mb-5">
                  Пользователь пока не добавил описание о себе.
                </p>
              )}

              {/* Навыки */}
              {profile?.skills && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 border-t border-gray-100 pt-5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mr-2">Навыки:</span>
                  {profile.skills.split(',').map((skill: string, idx: number) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-full">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* УСЛУГИ ФРИЛАНСЕРА */}
        <h2 className="text-[18px] font-black text-[#111] mb-5 uppercase tracking-wide flex items-center gap-3">
          Портфолио и Услуги
          <span className="bg-gray-200 text-gray-600 text-[12px] px-2 py-0.5 rounded-full">{services.length}</span>
        </h2>
        
        {services.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="text-gray-400 font-medium text-[14px]">У этого пользователя пока нет опубликованных услуг.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {services.map(s => (
              <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => {}}>
                <div className="w-full aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden mb-4 relative border border-gray-100">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl group-hover:scale-110 transition-transform duration-500">📸</div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-black text-gray-600 uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border border-white/50">
                    {s.category}
                  </div>
                </div>
                
                <h3 className="font-bold text-[14px] text-[#111] mb-2 line-clamp-2 leading-snug h-10 group-hover:text-[#11a95e] transition-colors">{s.title}</h3>
                
                <div className="flex items-center justify-between mt-auto border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1 text-[12px] font-bold text-gray-400">
                    <span className="text-orange-400 text-[14px]">★</span>
                    <span className={s.rating_avg ? 'text-gray-700' : ''}>{s.rating_avg ? Number(s.rating_avg).toFixed(1) : 'Новая'}</span>
                  </div>
                  <div className="font-black text-orange-500 text-[15px]">{s.price} PLN</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}