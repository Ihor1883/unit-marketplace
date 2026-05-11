"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabase'; 
import { useParams, useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import toast from 'react-hot-toast';

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

  // --- СЛОВАРЬ (ПОЛНЫЙ, НА ВСЕ 7 ЯЗЫКОВ) ---
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
      toast.error(translate('alert_login_review')); 
      return;
    }
    if (!newComment.trim()) {
      toast.error(translate('alert_empty_review')); 
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
        toast.success(translate('alert_review_success')); 
      }
    } catch (error: any) {
      toast.error(translate('alert_review_error') + error.message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // Логика оформления заказа
  const handleOrder = async () => {
    if (!user) {
      toast.error(translate('alert_login_order')); 
      router.push('/');
      return;
    }

    const { error } = await supabase.from('orders').insert([
      { service_id: service.id, client_email: user.email, status: 'New' }
    ]);

    if (!error) {
      toast.success(translate('order_success'), { duration: 4000 }); 
      
      // Отправляем уведомление в Telegram (если настроено)
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
      toast.error("Ошибка оформления заказа: " + error.message); 
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center font-bold text-gray-400">{translate('loading_service')}</div>;
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-[#222] mb-4">{translate('service_not_found')}</h1>
        <button onClick={() => router.push('/')} className="text-[#11a95e] hover:underline font-medium">{translate('back_to_main')}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#333] pb-10" suppressHydrationWarning>
      
      {/* МИНИ-ШАПКА */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-[60px] flex items-center justify-between">
          <Link href="/" className="text-[24px] font-black tracking-tighter text-[#222]">
            UNIT<span className="text-[#11a95e]">.</span>
          </Link>
          <Link href="/" className="text-[13px] font-bold text-gray-400 hover:text-[#11a95e] flex items-center gap-2 transition-colors">
            ← {translate('back_to_list')}
          </Link>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* ЛЕВАЯ КОЛОНКА: Детали услуги */}
          <div className="flex-1 w-full space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                 <span className="bg-emerald-50 text-[#11a95e] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  {translate(categories.find(c => c.id === service.category)?.titleKey || service.category)}
                </span>
              </div>

              <h1 className="text-[24px] sm:text-[28px] font-black text-[#222] mb-5 leading-tight">
                {service.title}
              </h1>
              
              {/* Адаптивный контейнер картинки */}
              <div className="w-full relative rounded-xl overflow-hidden mb-6 bg-gray-50 border border-gray-50 aspect-video lg:max-h-[400px]">
                {service.image_url ? (
                  <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📸</div>
                )}
              </div>

              <h3 className="text-[18px] font-bold text-[#222] mb-3">{translate('about_service')}</h3>
              <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                {service.description}
              </div>
            </div>

            {/* БЛОК ОТЗЫВОВ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-7 shadow-sm">
               <h3 className="text-[18px] font-bold text-[#222] mb-5">
                 {translate('customer_reviews')} ({reviews.length})
               </h3>

               {/* Форма для добавления отзыва */}
               {user && (
                 <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                    <p className="font-bold text-[13px] mb-2 text-gray-700">{translate('rate_seller')}</p>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star} 
                          onClick={() => setNewRating(star)}
                          className={`text-xl transition-all hover:scale-110 ${star <= newRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea 
                      className="w-full border border-gray-200 rounded-lg p-3 text-[13px] outline-none focus:border-[#11a95e] mb-3 resize-none bg-white"
                      rows={2}
                      placeholder={translate('review_placeholder')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                      onClick={submitReview} 
                      disabled={isSubmitting}
                      className="bg-[#11a95e] hover:bg-[#0e9552] text-white px-5 py-2 rounded-lg font-bold text-[12px] transition-colors disabled:bg-gray-400"
                    >
                      {isSubmitting ? translate('submitting') : translate('publish_review')}
                    </button>
                 </div>
               )}

               {/* Список отзывов */}
               <div className="space-y-5">
                  {reviews.length === 0 ? (
                    <p className="text-[13px] text-gray-500 italic">{translate('no_reviews_yet')}</p>
                  ) : (
                    reviews.map(r => (
                      <div key={r.id} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-emerald-50 text-[#11a95e] border border-emerald-100 rounded-full flex items-center justify-center text-[12px] font-bold">
                            {r.client_email[0].toUpperCase()}
                          </div>
                          <span className="text-[13px] font-bold text-gray-800">{r.client_email.split('@')[0]}</span>
                          <span className="text-yellow-400 text-[12px] tracking-widest">
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-600 pl-11">{r.comment}</p>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: Sidebar (Sticky) */}
          <aside className="w-full lg:w-[350px] shrink-0 space-y-5 lg:sticky lg:top-[80px]">
            
            {/* Блок цены */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md border-t-4 border-t-[#11a95e]">
              <div className="flex justify-between items-end mb-5">
                  <div className="text-[26px] font-black text-[#222]">{displayPrice(service.price)}</div>
                  <div className="text-[12px] text-gray-400 line-through mb-1">{displayPrice(Math.round(service.price * 1.3))}</div>
              </div>
              
              <div className="space-y-3 mb-6 text-[13px] text-gray-500 font-medium">
                <div className="flex items-center gap-2">✅ <span className="flex-1">{translate('quality_guarantee')}</span></div>
                <div className="flex items-center gap-2">✅ <span className="flex-1">{translate('direct_communication')}</span></div>
                <div className="flex items-center gap-2">✅ <span className="flex-1">{translate('post_support')}</span></div>
              </div>

              <button 
                onClick={handleOrder} 
                className="w-full bg-[#11a95e] hover:bg-[#0e9552] text-white py-4 rounded-xl font-black text-[14px] transition-all shadow-lg shadow-emerald-100"
              >
                {translate('order_for')} {displayPrice(service.price)}
              </button>
              <div className="mt-3 text-center text-[11px] text-gray-400">{translate('safe_deal')}</div>
            </div>

            {/* Карточка продавца */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                   {service.seller_avatar ? (
                     <img src={service.seller_avatar} className="w-full h-full object-cover" alt="" />
                   ) : (
                     service.seller_name ? service.seller_name.charAt(0).toUpperCase() : 'U'
                   )}
                 </div>
                 <div>
                   <div className="font-bold text-[15px] flex items-center gap-1.5">
                     {service.seller_name || 'UNIT Seller'}
                     <span className="bg-blue-50 text-blue-600 text-[9px] px-1.5 py-0.5 rounded font-black border border-blue-100 uppercase">PRO</span>
                   </div>
                   <div className="text-[12px] text-yellow-500 font-medium mt-0.5">
                     ★ {service.rating || '5.0'} <span className="text-gray-400 ml-1">({service.reviews_count || 0} {translate('reviews_count_text')})</span>
                   </div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-4">
                  <div className="text-center">
                    <div className="font-bold text-[15px] text-[#222]">{service.seller_projects || 0}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold mt-0.5">{translate('created_services')}</div>
                  </div>
                  <div className="text-center border-l border-gray-50">
                    <div className="font-bold text-[15px] text-[#11a95e]">{service.seller_hired || 100}%</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold mt-0.5">{translate('successfully_delivered')}</div>
                  </div>
               </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}