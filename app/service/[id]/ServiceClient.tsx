"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase'; 
import { useParams, useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import toast from 'react-hot-toast'; // <-- ДОБАВЛЕН ИМПОРТ TOAST

export default function ServicePage() {
  const params = useParams();
  const router = useRouter(); 
  
  const [user, setUser] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Настройки локализации
  const [lang, setLang] = useState('RU');
  const [currency, setCurrency] = useState('PLN');

  // Состояния для формы нового отзыва
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- СЛОВАРЬ ---
  const t: Record<string, any> = {
    RU: {
      loading_service: "Загрузка услуги...", service_not_found: "Услуга не найдена :(", back_to_main: "Вернуться на главную", back_to_list: "Вернуться к списку", category_label: "Рубрика", about_service: "Об услуге", customer_reviews: "Отзывы покупателей", rate_seller: "Оцените работу продавца:", review_placeholder: "Расскажите, как прошло сотрудничество...", submitting: "Отправка...", publish_review: "Опубликовать отзыв", login_to_review: "Войдите в аккаунт, чтобы оставить отзыв об этой услуге.", no_reviews_yet: "Пока нет ни одного отзыва. Станьте первым!", quality_guarantee: "Гарантия качества", direct_communication: "Связь напрямую с исполнителем", post_support: "Поддержка после сдачи", order_for: "Заказать за", safe_deal: "Безопасная сделка P2P", reviews_count_text: "отзывов", created_services: "Создано услуг", successfully_delivered: "Успешно сдано", alert_login_review: "Пожалуйста, войдите в аккаунт на главной странице, чтобы оставить отзыв.", alert_empty_review: "Пожалуйста, напишите текст отзыва.", alert_review_success: "Отзыв успешно опубликован!", alert_review_error: "Ошибка при отправке: ", alert_login_order: "Для заказа войдите в аккаунт на главной странице!", order_success: "Заказ успешно оформлен! Вы можете отслеживать его в 'Мои заказы'.",
      cat_design: "Дизайн", cat_dev: "Разработка и IT", cat_text: "Тексты и переводы", cat_seo: "SEO и трафик", cat_social: "Соцсети и маркетинг", cat_audio: "Аудио, видео, съемка", cat_bus: "Бизнес и жизнь"
    },
    EN: {
      loading_service: "Loading service...", service_not_found: "Service not found :(", back_to_main: "Back to home", back_to_list: "Back to list", category_label: "Category", about_service: "About the service", customer_reviews: "Customer reviews", rate_seller: "Rate the seller:", review_placeholder: "Tell us how the cooperation went...", submitting: "Submitting...", publish_review: "Publish review", login_to_review: "Log in to leave a review for this service.", no_reviews_yet: "No reviews yet. Be the first!", quality_guarantee: "Quality guarantee", direct_communication: "Direct communication with the seller", post_support: "Post-delivery support", order_for: "Order for", safe_deal: "Safe P2P deal", reviews_count_text: "reviews", created_services: "Services created", successfully_delivered: "Success rate", alert_login_review: "Please log in on the main page to leave a review.", alert_empty_review: "Please write a review text.", alert_review_success: "Review published successfully!", alert_review_error: "Error submitting: ", alert_login_order: "Log in on the main page to order!", order_success: "Order placed successfully! Track it in 'My Orders'.",
      cat_design: "Design", cat_dev: "Development & IT", cat_text: "Texts & Translation", cat_seo: "SEO & Traffic", cat_social: "Social Media", cat_audio: "Audio & Video", cat_bus: "Business & Life"
    },
    PL: {
      loading_service: "Ładowanie usługi...", service_not_found: "Nie znaleziono usługi :(", back_to_main: "Wróć do strony głównej", back_to_list: "Wróć do listy", category_label: "Kategoria", about_service: "O usłudze", customer_reviews: "Opinie klientów", rate_seller: "Oceń sprzedawcę:", review_placeholder: "Opowiedz, jak przebiegała współpraca...", submitting: "Wysyłanie...", publish_review: "Opublikuj opinię", login_to_review: "Zaloguj się, aby zostawić opinię o tej usłudze.", no_reviews_yet: "Brak opinii. Bądź pierwszy!", quality_guarantee: "Gwarancja jakości", direct_communication: "Bezpośredni kontakt z wykonawcą", post_support: "Wsparcie po dostarczeniu", order_for: "Zamów za", safe_deal: "Bezpieczna transakcja P2P", reviews_count_text: "opinii", created_services: "Utworzono usług", successfully_delivered: "Sukces", alert_login_review: "Zaloguj się na stronie głównej, aby zostawić opinię.", alert_empty_review: "Proszę wpisać tekst opinii.", alert_review_success: "Opinia została pomyślnie opublikowana!", alert_review_error: "Błąd podczas wysyłania: ", alert_login_order: "Aby złożyć zamówienie, zaloguj się na stronie głównej!", order_success: "Zamówienie złożone pomyślnie! Śledź je w 'Moje zamówienia'.",
      cat_design: "Design", cat_dev: "Programowanie i IT", cat_text: "Teksty i Tłumaczenia", cat_seo: "SEO i Ruch", cat_social: "Media Społecznościowe", cat_audio: "Audio i Wideo", cat_bus: "Biznes i Życie"
    },
    DE: {
      loading_service: "Dienst wird geladen...", service_not_found: "Dienst nicht gefunden :(", back_to_main: "Zurück zur Startseite", back_to_list: "Zurück zur Liste", category_label: "Kategorie", about_service: "Über den Dienst", customer_reviews: "Kundenbewertungen", rate_seller: "Verkäufer bewerten:", review_placeholder: "Erzählen Sie uns, wie die Zusammenarbeit verlief...", submitting: "Wird gesendet...", publish_review: "Bewertung veröffentlichen", login_to_review: "Melden Sie sich an, um eine Bewertung zu hinterlassen.", no_reviews_yet: "Noch keine Bewertungen. Seien Sie der Erste!", quality_guarantee: "Qualitätsgarantie", direct_communication: "Direkte Kommunikation mit dem Verkäufer", post_support: "Post-Delivery-Support", order_for: "Bestellen für", safe_deal: "Sicherer P2P-Deal", reviews_count_text: "Bewertungen", created_services: "Erstellte Dienste", successfully_delivered: "Erfolgsquote", alert_login_review: "Bitte melden Sie sich auf der Hauptseite an, um eine Bewertung abzugeben.", alert_empty_review: "Bitte schreiben Sie einen Bewertungstext.", alert_review_success: "Bewertung erfolgreich veröffentlicht!", alert_review_error: "Fehler beim Senden: ", alert_login_order: "Melden Sie sich auf der Hauptseite an, um zu bestellen!", order_success: "Bestellung erfolgreich aufgegeben! Verfolgen Sie sie unter 'Meine Bestellungen'.",
      cat_design: "Design", cat_dev: "Entwicklung & IT", cat_text: "Texte & Übersetzungen", cat_seo: "SEO & Traffic", cat_social: "Soziale Medien", cat_audio: "Audio & Video", cat_bus: "Business & Leben"
    },
    ES: {
      loading_service: "Cargando servicio...", service_not_found: "Servicio no encontrado :(", back_to_main: "Volver a la página principal", back_to_list: "Volver a la lista", category_label: "Categoría", about_service: "Sobre el servicio", customer_reviews: "Opiniones de clientes", rate_seller: "Califica al vendedor:", review_placeholder: "Cuéntanos cómo fue la cooperación...", submitting: "Enviando...", publish_review: "Publicar reseña", login_to_review: "Inicie sesión para dejar una reseña.", no_reviews_yet: "Aún no hay reseñas. ¡Sé el primero!", quality_guarantee: "Garantía de calidad", direct_communication: "Comunicación directa con el vendedor", post_support: "Soporte post-entrega", order_for: "Pedir por", safe_deal: "Trato P2P seguro", reviews_count_text: "reseñas", created_services: "Servicios creados", successfully_delivered: "Tasa de éxito", alert_login_review: "Inicie sesión en la página principal para dejar una reseña.", alert_empty_review: "Escriba el texto de la reseña.", alert_review_success: "¡Reseña publicada con éxito!", alert_review_error: "Error al enviar: ", alert_login_order: "¡Inicie sesión en la página principal para pedir!", order_success: "¡Pedido realizado con éxito! Rastréalo en 'Mis pedidos'.",
      cat_design: "Diseño", cat_dev: "Desarrollo y TI", cat_text: "Textos y Traducción", cat_seo: "SEO y Tráfico", cat_social: "Redes Sociales", cat_audio: "Audio y Video", cat_bus: "Negocios y Vida"
    },
    IT: {
      loading_service: "Caricamento servizio...", service_not_found: "Servizio non trovato :(", back_to_main: "Torna alla home", back_to_list: "Torna alla lista", category_label: "Categoria", about_service: "Informazioni sul servizio", customer_reviews: "Recensioni dei clienti", rate_seller: "Valuta il venditore:", review_placeholder: "Raccontaci come è andata la collaborazione...", submitting: "Invio...", publish_review: "Pubblica recensione", login_to_review: "Accedi per lasciare una recensione.", no_reviews_yet: "Ancora nessuna recensione. Sii il primo!", quality_guarantee: "Garanzia di qualità", direct_communication: "Comunicazione diretta con il venditore", post_support: "Supporto post-consegna", order_for: "Ordina per", safe_deal: "Affare P2P sicuro", reviews_count_text: "recensioni", created_services: "Servizi creati", successfully_delivered: "Tasso di successo", alert_login_review: "Accedi alla pagina principale per lasciare una recensione.", alert_empty_review: "Scrivi un testo per la recensione.", alert_review_success: "Recensione pubblicata con successo!", alert_review_error: "Errore durante l'invio: ", alert_login_order: "Accedi alla pagina principale per ordinare!", order_success: "Ordine effettuato con successo! Seguilo in 'I miei ordini'.",
      cat_design: "Design", cat_dev: "Sviluppo e IT", cat_text: "Testi e Traduzioni", cat_seo: "SEO e Traffico", cat_social: "Social Media", cat_audio: "Audio e Video", cat_bus: "Affari e Vita"
    },
    FR: {
      loading_service: "Chargement du service...", service_not_found: "Service introuvable :(", back_to_main: "Retour à l'accueil", back_to_list: "Retour à la liste", category_label: "Catégorie", about_service: "À propos du service", customer_reviews: "Avis des clients", rate_seller: "Évaluez le vendeur :", review_placeholder: "Racontez-nous comment s'est passée la coopération...", submitting: "Envoi en cours...", publish_review: "Publier l'avis", login_to_review: "Connectez-vous pour laisser un avis.", no_reviews_yet: "Aucun avis pour le moment. Soyez le premier !", quality_guarantee: "Garantie de qualité", direct_communication: "Communication directe avec le vendeur", post_support: "Support après livraison", order_for: "Commander pour", safe_deal: "Transaction P2P sécurisée", reviews_count_text: "avis", created_services: "Services créés", successfully_delivered: "Taux de réussite", alert_login_review: "Veuillez vous connecter sur la page principale pour laisser un avis.", alert_empty_review: "Veuillez écrire un texte d'avis.", alert_review_success: "Avis publié avec succès !", alert_review_error: "Erreur lors de l'envoi : ", alert_login_order: "Connectez-vous sur la page principale pour commander !", order_success: "Commande passée avec succès ! Suivez-la dans 'Mes commandes'.",
      cat_design: "Design", cat_dev: "Développement et informatique", cat_text: "Textes et traduction", cat_seo: "SEO et trafic", cat_social: "Réseaux sociaux", cat_audio: "Audio et vidéo", cat_bus: "Affaires et vie"
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

  // ИНИЦИАЛИЗАЦИЯ И ЗАГРУЗКА
  useEffect(() => {
    let isMounted = true; 

    const initLanguage = async () => {
      const savedLang = localStorage.getItem('unit_lang');
      if (savedLang && isMounted) setLang(savedLang);
      else {
        try {
          const { data } = await supabase.from('settings').select('value').eq('key', 'default_lang').single();
          if (data && data.value && isMounted) setLang(data.value);
        } catch (e) {}
      }
    };

    initLanguage();

    const savedCurrency = localStorage.getItem('unit_currency');
    if (savedCurrency && isMounted) setCurrency(savedCurrency);

    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) setUser(session?.user || null);

        if (!params.id) return;

        const { data: srvData, error: srvErr } = await supabase
          .from('services')
          .select('*')
          .eq('id', params.id)
          .maybeSingle(); 
          
        if (srvErr) {
          console.log("Supabase не нашел услугу:", srvErr.message || srvErr);
        } else if (isMounted && srvData) {
          setService(srvData);
          
          const { data: revData, error: revErr } = await supabase
            .from('reviews')
            .select('*')
            .eq('service_id', params.id)
            .order('created_at', { ascending: false });
            
          if (!revErr && isMounted && revData) {
            setReviews(revData);
          }
        }
      } catch (error) {
        console.error("Критический сбой сети:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchData();

    return () => { isMounted = false; };
  }, [params.id]);

  // КОНВЕРТАЦИЯ ВАЛЮТ
  const displayPrice = (price: number) => {
    if (currency === 'USD') return `${(price * 0.25).toFixed(0)} $`;
    if (currency === 'EUR') return `${(price * 0.23).toFixed(0)} €`;
    return `${price} PLN`; 
  };

  // Логика отправки нового отзыва
  const submitReview = async () => {
    if (!user) {
      toast.error(translate('alert_login_review')); // <-- TOAST ВМЕСТО ALERT
      return;
    }
    if (!newComment.trim()) {
      toast.error(translate('alert_empty_review')); // <-- TOAST ВМЕСТО ALERT
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      service_id: service.id,
      client_email: user.email,
      rating: newRating,
      comment: newComment
    };

    try {
      const { data, error } = await supabase.from('reviews').insert([reviewData]).select();

      if (error) {
        throw error;
      } else if (data) {
        const updatedReviews = [data[0], ...reviews];
        setReviews(updatedReviews);
        setNewComment('');
        setNewRating(5);

        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = (totalRating / updatedReviews.length).toFixed(1);

        await supabase.from('services').update({
          rating: avgRating,
          reviews_count: updatedReviews.length
        }).eq('id', service.id);

        setService({ ...service, rating: avgRating, reviews_count: updatedReviews.length });
        toast.success(translate('alert_review_success')); // <-- TOAST ВМЕСТО ALERT
      }
    } catch (error: any) {
      toast.error(translate('alert_review_error') + error.message); // <-- TOAST ВМЕСТО ALERT
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ИСПРАВЛЕНА ЛОГИКА ЗАКАЗА: Создаем заказ прямо здесь ---
  const handleOrder = async () => {
    if (!user) {
      toast.error(translate('alert_login_order')); // <-- TOAST ВМЕСТО ALERT
      router.push('/');
      return;
    }

    const { error } = await supabase.from('orders').insert([
      { service_id: service.id, client_email: user.email, status: 'New' }
    ]);

    if (!error) {
      toast.success(translate('order_success'), { duration: 4000 }); // <-- TOAST ВМЕСТО ALERT
      
      // Отправляем уведомление в Telegram
      try {
        const message = `🚀 НОВЫЙ ЗАКАЗ!\n\n📦 Услуга: ${service.title}\n📧 Клиент: ${user.email}\n💰 Сумма: ${displayPrice(service.price)}`;
        await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        });
      } catch (apiError) {
        console.error("Ошибка отправки:", apiError);
      }
    } else {
      toast.error("Ошибка оформления заказа: " + error.message); // <-- TOAST ВМЕСТО ALERT
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center font-bold text-gray-400">{translate('loading_service')}</div>;
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-[#222] mb-4">{translate('service_not_found')}</h1>
        <button onClick={() => router.push('/')} className="text-[#11a95e] hover:underline font-medium">{translate('back_to_main')}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333] pb-20" suppressHydrationWarning>
      
      {/* МИНИ-ШАПКА */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-4 h-[70px] flex items-center justify-between">
          <Link href="/" className="text-[32px] font-black tracking-tighter cursor-pointer flex-shrink-0">
            UNIT<span className="text-[#11a95e]">.</span>
          </Link>
          
          <Link href="/" className="text-[14px] font-bold text-gray-500 hover:text-[#11a95e] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {translate('back_to_list')}
          </Link>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="max-w-[1240px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ЛЕВАЯ КОЛОНКА (Инфо об услуге) */}
          <div className="flex-1 w-full space-y-6">
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 sm:p-8 shadow-sm">
              <span className="inline-block bg-gray-100 text-gray-600 text-[12px] font-bold px-3 py-1 rounded-[4px] uppercase tracking-wider mb-4">
                {translate('category_label')}: {translate(categories.find(c => c.id === service.category)?.titleKey || service.category)}
              </span>
              <h1 className="text-[26px] sm:text-[32px] font-extrabold text-[#222] mb-6 leading-tight">
                {service.title}
              </h1>
              
              {service.image_url ? (
                <div className="w-full h-[300px] sm:h-[450px] rounded-[8px] overflow-hidden mb-8 border border-gray-100">
                  <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-[200px] bg-emerald-50 rounded-[8px] flex items-center justify-center mb-8 border border-emerald-100">
                  <span className="text-emerald-200 text-6xl">📸</span>
                </div>
              )}

              <h3 className="text-[20px] font-extrabold text-[#222] mb-4 border-b border-gray-100 pb-2">{translate('about_service')}</h3>
              <div className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {service.description}
              </div>
            </div>

            {/* БЛОК ОТЗЫВОВ */}
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 sm:p-8 shadow-sm">
               <h3 className="text-[20px] font-extrabold text-[#222] mb-6 flex items-center gap-2">
                 {translate('customer_reviews')} <span className="text-gray-400 font-medium text-[15px]">({reviews.length})</span>
               </h3>

               {/* Форма для добавления отзыва */}
               {user ? (
                 <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-5 mb-8">
                   <p className="font-bold text-[14px] mb-3 text-gray-700">{translate('rate_seller')}</p>
                   <div className="flex gap-1 mb-4">
                     {[1, 2, 3, 4, 5].map(star => (
                       <button 
                         key={star} 
                         onClick={() => setNewRating(star)}
                         className={`text-2xl transition-all hover:scale-110 ${star <= newRating ? 'text-yellow-400' : 'text-gray-300'}`}
                       >
                         ★
                       </button>
                     ))}
                   </div>
                   <textarea 
                     className="w-full border border-gray-300 rounded-[6px] p-3 text-[14px] outline-none focus:border-[#11a95e] resize-none mb-3"
                     rows={3}
                     placeholder={translate('review_placeholder')}
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                   />
                   <button 
                     onClick={submitReview} 
                     disabled={isSubmitting}
                     className="bg-[#11a95e] hover:bg-[#0e9552] text-white px-6 py-2.5 rounded-[6px] font-bold text-[13px] transition-colors disabled:bg-gray-400"
                   >
                     {isSubmitting ? translate('submitting') : translate('publish_review')}
                   </button>
                 </div>
               ) : (
                 <div className="bg-blue-50 border border-blue-100 rounded-[8px] p-4 mb-8 text-[13px] text-blue-700 font-medium flex items-center gap-2">
                   <span>ℹ️</span> {translate('login_to_review')}
                 </div>
               )}

               {/* Список отзывов */}
               <div className="space-y-6">
                 {reviews.length === 0 ? (
                   <p className="text-[14px] text-gray-500 italic">{translate('no_reviews_yet')}</p>
                 ) : (
                   reviews.map(review => (
                     <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600 border border-emerald-200">
                             {review.client_email.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <p className="font-bold text-[14px] text-gray-800">{review.client_email.split('@')[0]}</p>
                             <div className="flex items-center gap-2">
                               <p className="text-[12px] text-yellow-500 tracking-widest">
                                 {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                               </p>
                               <span className="text-[11px] text-gray-400">
                                 {new Date(review.created_at).toLocaleDateString('ru-RU')}
                               </span>
                             </div>
                           </div>
                        </div>
                        <p className="text-[14px] text-gray-700 leading-relaxed pl-13">{review.comment}</p>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА (Сайдбар с ценой и профилем) */}
          <aside className="w-full lg:w-[380px] shrink-0 space-y-6 lg:sticky lg:top-[100px]">
            
            {/* Блок цены */}
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-lg border-t-4 border-t-[#11a95e]">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-[28px] font-black text-[#11a95e]">{displayPrice(service.price)}</h2>
                 <span className="text-[13px] text-gray-500 font-medium line-through">
                   {displayPrice(Math.round(service.price * 1.2))}
                 </span>
              </div>
              
              <ul className="space-y-3 mb-8 text-[14px] text-gray-600">
                <li className="flex items-center gap-3"><span className="text-[#11a95e]">✔</span> {translate('quality_guarantee')}</li>
                <li className="flex items-center gap-3"><span className="text-[#11a95e]">✔</span> {translate('direct_communication')}</li>
                <li className="flex items-center gap-3"><span className="text-[#11a95e]">✔</span> {translate('post_support')}</li>
              </ul>

              <button onClick={handleOrder} className="w-full bg-[#11a95e] hover:bg-[#0e9552] text-white py-4 rounded-[8px] font-extrabold text-[15px] transition-all shadow-md shadow-[#11a95e]/30 flex items-center justify-center gap-2">
                {translate('order_for')} {displayPrice(service.price)}
              </button>
              <p className="text-center text-[12px] text-gray-400 mt-4">{translate('safe_deal')}</p>
            </div>

            {/* Карточка продавца */}
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center">
               <div className="w-[100px] h-[100px] rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md mb-4 flex items-center justify-center text-gray-400 font-bold text-4xl">
                  {service.seller_avatar ? <img src={service.seller_avatar} className="w-full h-full object-cover" alt="" /> : (service.seller_name ? service.seller_name.charAt(0).toUpperCase() : 'U')}
               </div>
               
               <h4 className="font-extrabold text-[18px] text-[#222] flex items-center gap-2 justify-center">
                 {service.seller_name || 'UNIT_USER'} 
                 <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-black border border-blue-100 uppercase">PRO</span>
               </h4>
               
               <p className="text-[13px] text-gray-500 mt-1 mb-6 flex items-center gap-1 justify-center">
                 <span className="text-yellow-400 text-[16px]">★</span> 
                 <strong className="text-gray-800">{service.rating ?? '5.0'}</strong> 
                 ({service.reviews_count ?? 0} {translate('reviews_count_text')})
               </p>

               <div className="grid grid-cols-2 gap-4 w-full border-t border-gray-100 pt-6">
                 <div>
                    <p className="text-[20px] font-black text-[#222]">{service.seller_projects ?? 0}</p>
                    <p className="text-[12px] text-gray-500 font-medium">{translate('created_services')}</p>
                 </div>
                 <div>
                    <p className="text-[20px] font-black text-[#11a95e]">{service.seller_hired ?? 100}%</p>
                    <p className="text-[12px] text-gray-500 font-medium">{translate('successfully_delivered')}</p>
                 </div>
               </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}