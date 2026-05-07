"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Убрали useRouter, он больше не нужен
import ServiceCard from '../../components/ServiceCard'; 
import { supabase } from '../../supabase'; // Единое подключение

export default function PublicProfilePage() {
  const params = useParams();
  
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerEmail, setSellerEmail] = useState('');

  // ВЕРНУЛИ СОСТОЯНИЯ ДЛЯ МУЛЬТИЯЗЫЧНОСТИ И ВАЛЮТ
  const [currency, setCurrency] = useState('PLN'); 
  const [lang, setLang] = useState('RU');

  // ВЕРНУЛИ ПОЛНОЦЕННУЮ ФУНКЦИЮ ВАЛЮТ
  const displayPrice = (price: number) => {
    if (currency === 'USD') return `${(price * 0.25).toFixed(0)} $`;
    if (currency === 'EUR') return `${(price * 0.23).toFixed(0)} €`;
    return `${price} PLN`; 
  };

  // ВЕРНУЛИ ПОЛНОЦЕННУЮ МУЛЬТИЯЗЫЧНОСТЬ
  const t: Record<string, any> = {
    RU: { 
      review_btn: "Посмотреть", order: "Оформить заказ", buyer: "Продавец", 
      hired_on: "Нанято", projects_on_exchange: "Проектов", rest_time: "Быстрая сдача", 
      show_all: "Читать далее", back_home: "На главную", send_msg: "Написать сообщение",
      services_title: "Услуги продавца", reviews_title: "Отзывы клиентов", 
      services_count: "Услуг", rating: "Рейтинг", deal: "Сделка:"
    },
    EN: {
      review_btn: "View", order: "Order", buyer: "Seller", 
      hired_on: "Hired", projects_on_exchange: "Projects", rest_time: "Fast delivery", 
      show_all: "Read more", back_home: "Home", send_msg: "Send message",
      services_title: "Seller services", reviews_title: "Customer reviews",
      services_count: "Services", rating: "Rating", deal: "Deal:"
    }
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['RU'][key] || key;
  
  // Жесткая ссылка для перехода на страницу услуги (сбрасывает кэш)
  const handleOrder = (id: string) => window.location.href = `/service/${id}`; 

  // ЗАЩИЩЕННАЯ ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
    let isMounted = true; // Защита от утечки памяти и вечной загрузки

    async function fetchSellerData() {
      if (!params.email) return;
      
      try {
        const decodedEmail = decodeURIComponent(params.email as string);
        if (isMounted) setSellerEmail(decodedEmail);

        // 1. Получаем все услуги продавца
        const { data: srvData, error: srvError } = await supabase
          .from('services')
          .select('*')
          .eq('seller_email', decodedEmail)
          .order('created_at', { ascending: false });
          
        if (srvError) {
           console.log("Ошибка загрузки услуг:", srvError.message);
        } else if (isMounted && srvData) {
          setServices(srvData);
          
          // 2. Если услуги есть, получаем отзывы к ним
          if (srvData.length > 0) {
            const serviceIds = srvData.map(s => s.id);
            const { data: revData } = await supabase
              .from('reviews')
              .select('*, services(title)')
              .in('service_id', serviceIds)
              .order('created_at', { ascending: false });
              
            if (isMounted && revData) setReviews(revData);
          }
        }
      } catch (err) {
        console.error("Критическая ошибка загрузки профиля:", err);
      } finally {
        // Гарантируем отключение лоадера
        if (isMounted) setLoading(false);
      }
    }
    fetchSellerData();

    return () => { isMounted = false; };
  }, [params.email]);

  // Высчитываем среднюю статистику продавца
  const avgRating = services.length > 0 
    ? (services.reduce((sum, s) => sum + Number(s.rating || 5), 0) / services.length).toFixed(1) 
    : '5.0';

  if (loading) {
    return <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center font-bold text-gray-400">Загрузка профиля...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333]">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-4 h-[70px] flex items-center justify-between">
          {/* ИСПРАВЛЕНИЕ: Жесткая ссылка вместо router.push сбрасывает кэш и убирает зацикливание */}
          <div className="text-[32px] font-black tracking-tighter cursor-pointer flex-shrink-0" onClick={() => window.location.href = '/'}>
            UNIT<span className="text-[#11a95e]">.</span>
          </div>
          <button onClick={() => window.location.href = '/'} className="text-[14px] font-bold text-gray-500 hover:text-[#11a95e] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {translate('back_home')}
          </button>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА: ИНФО О ПРОДАВЦЕ */}
        <aside className="w-full md:w-[320px] shrink-0 bg-white rounded-[12px] border border-gray-200 p-8 shadow-sm flex flex-col items-center text-center">
           <div className="w-[120px] h-[120px] rounded-full bg-emerald-50 overflow-hidden border-4 border-white shadow-md mb-4 flex items-center justify-center text-5xl text-emerald-300 font-bold">
              {services[0]?.seller_avatar ? (
                <img src={services[0].seller_avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                sellerEmail.charAt(0).toUpperCase()
              )}
           </div>
           
           <h1 className="font-extrabold text-[22px] text-[#222] mb-1">
             {services[0]?.seller_name || sellerEmail.split('@')[0]}
           </h1>
           <p className="text-[13px] text-gray-500 mb-6">{sellerEmail}</p>

           <div className="w-full border-t border-gray-100 pt-6 grid grid-cols-2 gap-4 mb-6">
             <div>
                <p className="text-[24px] font-black text-[#222]">{services.length}</p>
                <p className="text-[12px] text-gray-500 font-medium">{translate('services_count')}</p>
             </div>
             <div>
                <p className="text-[24px] font-black text-yellow-500 flex items-center justify-center gap-1">
                  <span className="text-[18px]">★</span> {avgRating}
                </p>
                <p className="text-[12px] text-gray-500 font-medium">{translate('rating')}</p>
             </div>
           </div>

           <button className="w-full border-2 border-[#11a95e] text-[#11a95e] hover:bg-[#11a95e] hover:text-white font-bold py-3 rounded-[8px] transition-colors">
             {translate('send_msg')}
           </button>
        </aside>

        {/* ПРАВАЯ КОЛОНКА: УСЛУГИ И ОТЗЫВЫ */}
        <div className="flex-1 w-full space-y-8">
          
          {/* СЕКЦИЯ: УСЛУГИ */}
          <section>
            <h2 className="text-[20px] font-extrabold text-[#222] mb-4 flex items-center gap-2">
              {translate('services_title')} <span className="bg-gray-200 text-gray-600 text-[12px] px-2 py-0.5 rounded-full">{services.length}</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {services.map(s => (
                <ServiceCard 
                  key={s.id} 
                  service={s} 
                  isAdmin={false} 
                  displayPrice={displayPrice} 
                  translate={translate} 
                  handleOrder={() => handleOrder(s.id)} 
                  deleteService={() => {}} 
                />
              ))}
              {services.length === 0 && <p className="text-gray-500 text-[14px]">{translate('no_services')}</p>}
            </div>
          </section>

          {/* СЕКЦИЯ: ОТЗЫВЫ */}
          <section className="bg-white rounded-[12px] border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-[20px] font-extrabold text-[#222] mb-6 flex items-center gap-2">
              {translate('reviews_title')} <span className="bg-gray-200 text-gray-600 text-[12px] px-2 py-0.5 rounded-full">{reviews.length}</span>
            </h2>
            
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-[14px] text-gray-500 italic">{translate('no_reviews')}</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600 text-[12px]">
                            {review.client_email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[13px] text-gray-800">{review.client_email.split('@')[0]}</p>
                            <p className="text-[11px] text-gray-400">{new Date(review.created_at).toLocaleDateString('ru-RU')}</p>
                          </div>
                       </div>
                       <div className="text-[12px] text-yellow-500 tracking-widest">
                         {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                       </div>
                     </div>
                     <p className="text-[13px] text-[#11a95e] font-medium mb-1 pl-11 flex items-center gap-1">
                       <span className="text-gray-400">{translate('deal')}</span> {review.services?.title}
                     </p>
                     <p className="text-[14px] text-gray-700 leading-relaxed pl-11">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}