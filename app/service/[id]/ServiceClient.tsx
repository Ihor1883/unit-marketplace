"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase'; 
import { useParams, useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import toast from 'react-hot-toast';

export default function ServiceClient() {
  const params = useParams();
  const router = useRouter(); 
  
  const [user, setUser] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null); // НОВЫЙ СТЕЙТ ДЛЯ ПРОФИЛЯ ПРОДАВЦА
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);

  // Настройки локализации
  const [lang, setLang] = useState('RU');
  const [currency, setCurrency] = useState('PLN');

  // Состояния для формы нового отзыва
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- СЛОВАРЬ (ПОЛНЫЙ) ---
  const t: Record<string, any> = {
    RU: {
      loading_service: "Загрузка услуги...", service_not_found: "Услуга не найдена :(", back_to_main: "Вернуться на главную", back_to_list: "Вернуться к списку", category_label: "Рубрика", about_service: "Об услуге", customer_reviews: "Отзывы покупателей", rate_seller: "Оцените работу продавца:", review_placeholder: "Расскажите, как прошло сотрудничество...", submitting: "Отправка...", publish_review: "Опубликовать отзыв", login_to_review: "Войдите в аккаунт, чтобы оставить отзыв об этой услуге.", no_reviews_yet: "Пока нет ни одного отзыва. Станьте первым!", quality_guarantee: "Гарантия качества", direct_communication: "Связь напрямую с исполнителем", post_support: "Поддержка после сдачи", order_for: "Заказать за", order_now: "Заказать сейчас", safe_deal: "Безопасная сделка", reviews_count_text: "отзывов", created_services: "Создано услуг", successfully_delivered: "Успешно сдано", alert_login_review: "Пожалуйста, войдите в аккаунт на главной странице, чтобы оставить отзыв.", alert_empty_review: "Пожалуйста, напишите текст отзыва.", alert_review_success: "Отзыв успешно опубликован!", alert_review_error: "Ошибка при отправке: ", alert_login_order: "Для заказа войдите в аккаунт на главной странице!", order_success: "Заказ успешно оформлен! Вы можете отслеживать его в 'Мои заказы'.",
      cat_design: "Дизайн", cat_dev: "Разработка и IT", cat_text: "Тексты и переводы", cat_seo: "SEO и трафик", cat_social: "Соцсети и маркетинг", cat_audio: "Аудио, видео, съемка", cat_bus: "Бизнес и жизнь", delivery_time: "Срок: 1-3 дня", seller: "Продавец",
      languages_spoken: "Языки общения" // ПЕРЕВОД ДЛЯ БЛОКА ЯЗЫКОВ
    },
    EN: {
      loading_service: "Loading service...", service_not_found: "Service not found :(", back_to_main: "Back to home", back_to_list: "Back to list", category_label: "Category", about_service: "About the service", customer_reviews: "Customer reviews", rate_seller: "Rate the seller:", review_placeholder: "Tell us how the cooperation went...", submitting: "Submitting...", publish_review: "Publish review", login_to_review: "Log in to leave a review for this service.", no_reviews_yet: "No reviews yet. Be the first!", quality_guarantee: "Quality guarantee", direct_communication: "Direct communication with the seller", post_support: "Post-delivery support", order_for: "Order for", order_now: "Order now", safe_deal: "Safe deal", reviews_count_text: "reviews", created_services: "Services created", successfully_delivered: "Success rate", alert_login_review: "Please log in on the main page to leave a review.", alert_empty_review: "Please write a review text.", alert_review_success: "Review published successfully!", alert_review_error: "Error submitting: ", alert_login_order: "Log in on the main page to order!", order_success: "Order placed successfully! Track it in 'My Orders'.",
      cat_design: "Design", cat_dev: "Development & IT", cat_text: "Texts & Translation", cat_seo: "SEO & Traffic", cat_social: "Social Media", cat_audio: "Audio & Video", cat_bus: "Business & Life", delivery_time: "Time: 1-3 days", seller: "Seller",
      languages_spoken: "Languages"
    },
    PL: {
      loading_service: "Ładowanie usługi...", service_not_found: "Nie znaleziono usługi :(", back_to_main: "Strona główna", back_to_list: "Wróć do listy", category_label: "Kategoria", about_service: "O usłudze", customer_reviews: "Opinie", rate_seller: "Oceń sprzedawcę:", review_placeholder: "Powiedz, jak przebiegła współpraca...", submitting: "Wysyłanie...", publish_review: "Opublikuj opinię", login_to_review: "Zaloguj się, aby zostawić opinię.", no_reviews_yet: "Brak opinii. Bądź pierwszy!", quality_guarantee: "Gwarancja jakości", direct_communication: "Bezpośredni kontakt", post_support: "Wsparcie po dostawie", order_for: "Zamów za", order_now: "Zamów teraz", safe_deal: "Bezpieczna transakcja", reviews_count_text: "opinii", created_services: "Utworzone usługi", successfully_delivered: "Sukces", alert_login_review: "Zaloguj się, aby dodać opinię.", alert_empty_review: "Proszę napisać tekst opinii.", alert_review_success: "Opinia pomyślnie opublikowana!", alert_review_error: "Błąd wysyłania: ", alert_login_order: "Zaloguj się, aby zamówić!", order_success: "Zamówienie złożone pomyślnie! Śledź je w swoim profilu.",
      cat_design: "Design", cat_dev: "Programowanie i IT", cat_text: "Teksty i Tłumaczenia", cat_seo: "SEO i Ruch", cat_social: "Media", cat_audio: "Audio i Wideo", cat_bus: "Biznes", delivery_time: "Czas: 1-3 dni", seller: "Sprzedawca",
      languages_spoken: "Języki komunikacji"
    }
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  const categories = [
    { id: 'DESIGN', titleKey: 'cat_design' },
    { id: 'DEV', titleKey: 'cat_dev' },
    { id: 'TEXT', titleKey: 'cat_text' },
    { id: 'SEO', titleKey: 'cat_seo' },
    { id: 'SOCIAL', titleKey: 'cat_social' },
    { id: 'AUDIO', titleKey: 'cat_audio' },
    { id: 'BUSINESS', titleKey: 'cat_bus' }
  ];

  const getSellerLevel = (count: number) => {
    if (count >= 50) return { icon: '💎', text: 'Платина', style: 'bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-800 border-indigo-200 shadow-sm' };
    if (count >= 20) return { icon: '🥇', text: 'Золото', style: 'bg-gradient-to-r from-yellow-100 to-amber-200 text-amber-800 border-amber-300 shadow-sm' };
    if (count >= 5) return  { icon: '🥈', text: 'Серебро', style: 'bg-gradient-to-r from-slate-100 to-gray-200 text-gray-800 border-gray-300 shadow-sm' };
    return { icon: '🌱', text: 'Новичок', style: 'bg-gray-50 text-gray-600 border-gray-200' };
  };

  useEffect(() => {
    let isMounted = true; 
    const initLanguage = async () => {
      const savedLang = localStorage.getItem('unit_lang') || 'RU';
      if (isMounted) setLang(savedLang);
      const savedCurrency = localStorage.getItem('unit_currency') || 'PLN';
      if (isMounted) setCurrency(savedCurrency);
    };
    initLanguage();

    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) setUser(session?.user || null);
        if (!params.id) return;

        const { data: srvData } = await supabase.from('services').select('*').eq('id', params.id).maybeSingle(); 
        if (isMounted && srvData) {
          setService(srvData);

          // ПОДТЯГИВАЕМ ПРОФИЛЬ ПРОДАВЦА ДЛЯ ПОЛУЧЕНИЯ ЯЗЫКОВ
          if (srvData.user_id) {
            const { data: profData } = await supabase.from('profiles').select('*').eq('id', srvData.user_id).maybeSingle();
            if (isMounted && profData) setSellerProfile(profData);
          }

          const { data: revData } = await supabase.from('reviews').select('*').eq('service_id', params.id).order('created_at', { ascending: false });
          if (isMounted && revData) setReviews(revData);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [params.id]);

  const displayPrice = (price: number) => {
    if (currency === 'USD') return `${(price * 0.25).toFixed(0)} $`;
    if (currency === 'EUR') return `${(price * 0.23).toFixed(0)} €`;
    return `${price} PLN`; 
  };

  const submitReview = async () => {
    if (!user) return toast.error(translate('alert_login_review')); 
    if (!newComment.trim()) return toast.error(translate('alert_empty_review')); 
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.from('reviews').insert([{
        service_id: service.id,
        client_email: user.email,
        rating: newRating,
        comment: newComment
      }]).select();

      if (data) {
        const updatedReviews = [data[0], ...reviews];
        setReviews(updatedReviews);
        setNewComment('');
        const avg = (updatedReviews.reduce((s, r) => s + r.rating, 0) / updatedReviews.length).toFixed(1);
        await supabase.from('services').update({ rating_avg: avg, reviews_count: updatedReviews.length }).eq('id', service.id);
        setService({ ...service, rating_avg: avg, reviews_count: updatedReviews.length });
        toast.success(translate('alert_review_success')); 
      } else if (error) {
        toast.error(translate('alert_review_error') + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      toast.error(translate('alert_login_order')); 
      return router.push('/');
    }
    setIsOrdering(true);
    const { error } = await supabase.from('orders').insert([{ service_id: service.id, client_email: user.email, status: 'New' }]);
    setIsOrdering(false);
    
    if (!error) {
      toast.success(translate('order_success')); 
      router.push('/profile');
    } else {
      toast.error("Error: " + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-bold text-[#11a95e] animate-pulse text-base bg-[#F8F9FA]">
      {translate('loading_service')}
    </div>
  );
  
  if (!service) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
      <h1 className="text-xl font-black text-[#111]">{translate('service_not_found')}</h1>
      <Link href="/" className="px-6 py-2.5 bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white rounded-xl font-bold shadow-md">
        {translate('back_to_main')}
      </Link>
    </div>
  );

  const sellerLevel = getSellerLevel(service.reviews_count || 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#333] pb-12" suppressHydrationWarning>
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1080px] mx-auto px-4 h-[64px] flex items-center justify-between">
          <Link href="/" className="text-[24px] font-black tracking-tighter cursor-pointer flex items-center gap-1">
            UNIT<span className="text-[#11a95e]">.</span>
          </Link>
          <button onClick={() => router.push('/')} className="text-[13px] font-bold text-gray-400 hover:text-orange-500 transition-colors">
             ← {translate('back_to_list')}
          </button>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 py-6">
        
        {/* ХЛЕБНЫЕ КРОШКИ */}
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-orange-500 transition-colors">Marketplace</Link>
          <span className="text-gray-300">/</span>
          <span className="text-[#11a95e]">{translate(categories.find(c => c.id === service.category)?.titleKey || service.category)}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* ЛЕВАЯ ЧАСТЬ (Основной контент) */}
          <div className="flex-1 w-full space-y-6">
            
            {/* ОБЛОЖКА */}
            <div className="w-full h-[240px] sm:h-[340px] bg-gray-100 rounded-2xl overflow-hidden shadow-sm relative border border-gray-100 group">
              {service.image_url ? (
                <img src={service.image_url} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl bg-gradient-to-br from-gray-50 to-gray-200">📸</div>
              )}
            </div>

            {/* ЗАГОЛОВОК И ОПИСАНИЕ */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <h1 className="text-[24px] sm:text-[28px] font-black text-[#111] mb-5 leading-tight tracking-tight">
                {service.title}
              </h1>

              <h2 className="text-[16px] font-black text-[#111] mb-3">{translate('about_service')}</h2>
              <div className="text-gray-600 text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                {service.description}
              </div>
            </div>

            {/* ОТЗЫВЫ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="text-[18px] font-black text-[#111] mb-4 flex items-center gap-2">
                 {translate('customer_reviews')} 
                 <span className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-[12px]">{reviews.length}</span>
               </h3>

               {user ? (
                 <div className="bg-gray-50/50 rounded-xl p-4 mb-6 border border-gray-100">
                    <p className="font-bold text-[12px] mb-2 text-gray-700">{translate('rate_seller')}</p>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setNewRating(star)} className={`text-2xl transition-transform hover:scale-110 ${star <= newRating ? 'text-orange-400' : 'text-gray-300'}`}>★</button>
                      ))}
                    </div>
                    <textarea 
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/5 mb-3 resize-none transition-all shadow-sm"
                      rows={3}
                      placeholder={translate('review_placeholder')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                      onClick={submitReview} 
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-sm disabled:bg-gray-300"
                    >
                      {isSubmitting ? translate('submitting') : translate('publish_review')}
                    </button>
                 </div>
               ) : (
                 <div className="bg-orange-50/40 border border-orange-100 rounded-xl p-4 mb-6 text-center">
                    <p className="text-orange-600 font-medium text-[13px] mb-2">{translate('login_to_review')}</p>
                    <button onClick={() => router.push('/')} className="px-4 py-1.5 bg-white border border-orange-200 text-orange-600 font-bold rounded-lg text-[12px] hover:bg-orange-50 transition-colors">Войти</button>
                 </div>
               )}

               <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                       <p className="text-[13px] text-gray-400 font-medium">{translate('no_reviews_yet')}</p>
                    </div>
                  ) : (
                    reviews.map(r => (
                      <div key={r.id} className="flex gap-3 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-[#11a95e] to-emerald-400 text-white rounded-full flex items-center justify-center text-[14px] font-black">
                          {r.client_email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-1 gap-2">
                             <span className="text-[13px] font-black text-[#111] truncate">{r.client_email.split('@')[0]}</span>
                             <span className="text-orange-400 text-[12px] tracking-wider shrink-0">
                               {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                             </span>
                           </div>
                           <p className="text-[13px] text-gray-600 leading-normal font-medium">{r.comment}</p>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ (Sidebar) */}
          <aside className="w-full lg:w-[320px] shrink-0 space-y-5 lg:sticky lg:top-[84px] relative z-20">
            
            {/* БЛОК ЦЕНЫ И ЗАКАЗА */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg shadow-gray-200/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[#11a95e] to-emerald-400"></div>
              
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{translate('order_for')}</div>
              <div className="text-[32px] font-black text-orange-500 leading-none tracking-tight mb-5">
                {displayPrice(service.price)}
              </div>
              
              <div className="space-y-3 mb-6 text-[12px] font-medium text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#11a95e] flex items-center justify-center font-bold text-[10px] shrink-0">✓</div>
                  <span>{translate('quality_guarantee')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#11a95e] flex items-center justify-center font-bold text-[10px] shrink-0">✓</div>
                  <span>{translate('direct_communication')}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#11a95e] flex items-center justify-center font-bold text-[10px] shrink-0">✓</div>
                  <span>{translate('post_support')}</span>
                </div>
              </div>

              <button 
                onClick={handleOrder} 
                disabled={isOrdering || (user && user.email === service.seller_email)}
                className="w-full bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white py-3.5 rounded-xl font-black text-[14px] uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 disabled:bg-gray-300 disabled:shadow-none cursor-pointer"
              >
                {isOrdering ? "..." : user?.email === service.seller_email ? "Это ваша услуга" : translate('order_now')}
              </button>
              
              <div className="mt-4 text-center text-[11px] text-gray-400 font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider">
                 <svg className="w-3.5 h-3.5 text-[#11a95e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                 {translate('safe_deal')}
              </div>
            </div>

            {/* БЛОК ПРОДАВЦА */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/10 shrink-0 overflow-hidden">
                   {service.seller_avatar ? (
                     <img src={service.seller_avatar} className="w-full h-full object-cover" alt="" />
                   ) : (
                     service.seller_name ? service.seller_name.charAt(0).toUpperCase() : service.seller_email.charAt(0).toUpperCase()
                   )}
                 </div>
                 <div className="flex-1 overflow-hidden">
                   <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{translate('seller')}</div>
                   <div className="font-black text-[15px] text-[#111] truncate">
                     {service.seller_name || service.seller_email.split('@')[0]}
                   </div>
                   <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${sellerLevel.style}`}>
                     {sellerLevel.icon} {sellerLevel.text}
                   </span>
                 </div>
               </div>

               <div className="text-[12px] text-orange-400 font-bold mb-4 flex items-center gap-1.5 bg-orange-50/40 p-2.5 rounded-lg border border-orange-100/50">
                 <span>★</span>
                 <span className="text-[#111] text-[13px]">{service.rating_avg || '5.0'}</span> 
                 <span className="text-gray-300 font-normal">|</span> 
                 <span className="text-gray-500 font-medium">{service.reviews_count || 0} {translate('reviews_count_text')}</span>
               </div>

               {/* === НОВЫЙ КРАСИВЫЙ БЛОК ВЫВОДА ЯЗЫКОВ ПРОДАВЦА === */}
               {sellerProfile?.spoken_languages && sellerProfile.spoken_languages.length > 0 && (
                 <div className="mb-4 border-t border-gray-50 pt-4 w-full">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                     <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                     </svg>
                     {translate('languages_spoken')}
                   </p>
                   <div className="space-y-1.5">
                     {sellerProfile.spoken_languages.map((lang: any) => (
                       <div key={lang.code} className="flex items-center justify-between text-[13px] bg-gray-50/60 px-3 py-1.5 rounded-xl border border-gray-100 text-[12px]">
                         <span className="font-black text-gray-700 tracking-wide uppercase">{lang.code}</span>
                         <div className="flex gap-0.5">
                           {[1, 2, 3, 4, 5].map(star => (
                             <span 
                               key={star} 
                               className={`text-base leading-none ${star <= lang.level ? 'text-orange-400' : 'text-gray-200'}`}
                             >
                               ★
                             </span>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               {/* === КОНЕЦ БЛОКА ЯЗЫКОВ === */}

               <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-4">
                  <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
                    <div className="font-black text-[15px] text-[#111]">{service.seller_projects || 0}</div>
                    <div className="text-[9px] text-gray-400 uppercase font-bold mt-0.5 leading-tight">{translate('created_services')}</div>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-center border border-emerald-100">
                    <div className="font-black text-[15px] text-[#11a95e]">{service.seller_hired || 100}%</div>
                    <div className="text-[9px] text-[#11a95e]/70 uppercase font-bold mt-0.5 leading-tight">{translate('successfully_delivered')}</div>
                  </div>
               </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}