"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import { supabase } from './supabase'; 
import ServiceCard from './components/ServiceCard';

export default function HomePage() {
  const router = useRouter(); 

  // --- СОСТОЯНИЯ ---
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  
  // ВАЛЮТА И ЯЗЫК
  const [currency, setCurrency] = useState('PLN'); 
  const [lang, setLang] = useState('RU'); 
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  // Авторизация
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authIsLogin, setAuthIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetRanges, setBudgetRanges] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  // Трекер заказов
  const [showTracker, setShowTracker] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Отзывы
  const [reviewModal, setReviewModal] = useState<{orderId: string, serviceId: string} | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // --- ДОБАВЛЕНО: ЗАКЛАДКИ ---
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // --- СЛОВАРЬ (7 ЯЗЫКОВ) ---
  const t: Record<string, any> = {
    RU: { fav_only: "Мои закладки", payment_notice: "Тестовый режим (Оплата отключена)", buy_now: "Оплатить", title: "UNIT Marketplace — Цифровые Услуги", sub: "ОБЪЯВЛЕНИЯ", search: "Найти услуги", track_orders: "Мои Заказы", admin: "АДМИН", login: "Войти", logout: "Выйти", register: "Регистрация", pass_q: "Пароль", auth_req: "Войдите в аккаунт, чтобы продолжить", no_acc: "Нет аккаунта?", has_acc: "Уже есть аккаунт?", msg: "Заказ принят!", rub_cat: "Рубрики", rub_bud: "Бюджет", cat_all: "Все", cat_design: "Дизайн", cat_dev: "Разработка и IT", cat_text: "Тексты и переводы", cat_seo: "SEO и трафик", cat_social: "Соцсети и маркетинг", cat_audio: "Аудио, видео, съемка", cat_bus: "Бизнес и жизнь", regulations: "Регламент", rodo: "Политика конфиденциальности (RODO)", footer_rights: "Все права защищены.", no_orders: "Ничего не найдено", profile: "Кабинет", show_all: "Показать всё", buyer: "Продавец", projects_on_exchange: "Проектов на бирже", hired_on: "Успешно сдано", rest_time: "Срок: 1-3 дня", review_btn: "Смотреть", order: "Заказать", reviews_count: "Отзывов", delete: "Удалить", btn_rate: "⭐ Оценить", modal_review_title: "Оставьте отзыв", ph_review: "Напишите пару слов о работе...", btn_send_review: "Отправить отзыв", review_success: "Спасибо за ваш отзыв!" },
    EN: { fav_only: "My Favorites", payment_notice: "Test Mode (Payments Disabled)", buy_now: "Pay Now", title: "UNIT Marketplace — Digital Services", sub: "LISTINGS", search: "Find services", track_orders: "My Orders", admin: "ADMIN", login: "Login", logout: "Logout", register: "Sign Up", pass_q: "Password", auth_req: "Please login to continue", no_acc: "No account?", has_acc: "Already have an account?", msg: "Order accepted!", rub_cat: "Categories", rub_bud: "Budget", cat_all: "All", cat_design: "Design", cat_dev: "Development & IT", cat_text: "Texts & Translation", cat_seo: "SEO & Traffic", cat_social: "Social Media", cat_audio: "Audio & Video", cat_bus: "Business & Life", regulations: "Terms of Service", rodo: "Privacy Policy (GDPR)", footer_rights: "All rights reserved.", no_orders: "Nothing found", profile: "Profile", show_all: "Show all", buyer: "Seller", projects_on_exchange: "Projects", hired_on: "Success rate", rest_time: "Time: 1-3 days", review_btn: "View", order: "Order", reviews_count: "Reviews", delete: "Delete", btn_rate: "⭐ Rate", modal_review_title: "Leave a review", ph_review: "Write a few words about the work...", btn_send_review: "Send review", review_success: "Thank you for your review!" },
    PL: { fav_only: "Moje ulubione", payment_notice: "Tryb testowy (Płatności wyłączone)", buy_now: "Zapłać", title: "UNIT Marketplace — Usługi Cyfrowe", sub: "OGŁOSZENIA", search: "Znajdź usługi", track_orders: "Moje Zamówienia", admin: "ADMIN", login: "Zaloguj się", logout: "Wyloguj", register: "Rejestracja", pass_q: "Hasło", auth_req: "Zaloguj się, aby kontynuować", no_acc: "Brak konta?", has_acc: "Masz już konto?", msg: "Zamówienie przyjęte!", rub_cat: "Kategorie", rub_bud: "Budżet", cat_all: "Wszystko", cat_design: "Design", cat_dev: "Programowanie i IT", cat_text: "Teksty i Tłumaczenia", cat_seo: "SEO i Ruch", cat_social: "Media Społecznościowe", cat_audio: "Audio i Wideo", cat_bus: "Biznes i Życie", regulations: "Regulamin", rodo: "Polityka prywatności (RODO)", footer_rights: "Wszelkie prawa zastrzeżone.", no_orders: "Nic nie znaleziono", profile: "Profil", show_all: "Pokaż wszystko", buyer: "Sprzedawca", projects_on_exchange: "Projekty", hired_on: "Sukces", rest_time: "Czas: 1-3 dni", review_btn: "Zobacz", order: "Zamów", reviews_count: "Opinie", delete: "Usuń", btn_rate: "⭐ Oceń", modal_review_title: "Zostaw opinię", ph_review: "Napisz kilka słów o pracy...", btn_send_review: "Wyślij opinię", review_success: "Dziękujemy za Twoją opinię!" },
    DE: { fav_only: "Meine Favoriten", payment_notice: "Testmodus (Zahlungen deaktiviert)", buy_now: "Bezahlen", title: "UNIT Marketplace — Digitale Dienste", sub: "ANZEIGEN", search: "Dienste finden", track_orders: "Meine Bestellungen", admin: "ADMIN", login: "Anmelden", logout: "Abmelden", register: "Registrieren", pass_q: "Passwort", auth_req: "Bitte einloggen, um fortzufahren", no_acc: "Kein Konto?", has_acc: "Bereits ein Konto?", msg: "Bestellung angenommen!", rub_cat: "Kategorien", rub_bud: "Budget", cat_all: "Alle", cat_design: "Design", cat_dev: "Entwicklung & IT", cat_text: "Texte & Übersetzungen", cat_seo: "SEO & Traffic", cat_social: "Soziale Medien", cat_audio: "Audio & Video", cat_bus: "Business & Leben", regulations: "Nutzungsbedingungen", rodo: "Datenschutzerklärung (DSGVO)", footer_rights: "Alle Rechte vorbehalten.", no_orders: "Nichts gefunden", profile: "Kabinett", show_all: "Alles anzeigen", buyer: "Verkäufer", projects_on_exchange: "Projekte", hired_on: "Erfolgsquote", rest_time: "Zeit: 1-3 Tage", review_btn: "Ansehen", order: "Bestellen", reviews_count: "Bewertungen", delete: "Löschen", btn_rate: "⭐ Bewerten", modal_review_title: "Bewertung hinterlassen", ph_review: "Schreibe ein paar Worte über die Arbeit...", btn_send_review: "Bewertung senden", review_success: "Danke für deine Bewertung!" },
    ES: { fav_only: "Mis favoritos", payment_notice: "Modo de prueba (Pagos desactivados)", buy_now: "Pagar", title: "UNIT Marketplace — Servicios Digitales", sub: "ANUNCIOS", search: "Buscar servicios", track_orders: "Mis Pedidos", admin: "ADMIN", login: "Iniciar sesión", logout: "Cerrar sesión", register: "Regístrate", pass_q: "Contraseña", auth_req: "Inicie sesión para continuar", no_acc: "¿No tienes cuenta?", has_acc: "¿Ya tienes cuenta?", msg: "¡Pedido aceptado!", rub_cat: "Categorías", rub_bud: "Presupuesto", cat_all: "Todo", cat_design: "Diseño", cat_dev: "Desarrollo y TI", cat_text: "Textos y Traducción", cat_seo: "SEO y Tráfico", cat_social: "Redes Sociales", cat_audio: "Audio y Video", cat_bus: "Negocios y Vida", regulations: "Términos de servicio", rodo: "Política de privacidad (RGPD)", footer_rights: "Todos los derechos reservados.", no_orders: "Nada encontrado", profile: "Perfil", show_all: "Mostrar todo", buyer: "Vendedor", projects_on_exchange: "Proyectos", hired_on: "Éxito", rest_time: "Tiempo: 1-3 días", review_btn: "Ver", order: "Pedir", reviews_count: "Reseñas", delete: "Eliminar", btn_rate: "⭐ Calificar", modal_review_title: "Deja una reseña", ph_review: "Escribe algunas palabras sobre el trabajo...", btn_send_review: "Enviar reseña", review_success: "¡Gracias por tu reseña!" },
    IT: { fav_only: "I miei preferiti", payment_notice: "Modalità test (Pagamenti disabilitati)", buy_now: "Paga", title: "UNIT Marketplace — Servizi Digitali", sub: "ANNUNCI", search: "Trova servizi", track_orders: "I miei ordini", admin: "ADMIN", login: "Accedi", logout: "Esci", register: "Iscriviti", pass_q: "Password", auth_req: "Accedi per continuare", no_acc: "Nessun account?", has_acc: "Hai già un account?", msg: "Ordine accettato!", rub_cat: "Categorie", rub_bud: "Budget", cat_all: "Tutto", cat_design: "Design", cat_dev: "Sviluppo e IT", cat_text: "Testi e Traduzioni", cat_seo: "SEO e Traffico", cat_social: "Social Media", cat_audio: "Audio e Video", cat_bus: "Affari e Vita", regulations: "Termini di servizio", rodo: "Informativa sulla privacy (GDPR)", footer_rights: "Tutti i diritti riservati.", no_orders: "Nessun risultato", profile: "Profilo", show_all: "Mostra tutto", buyer: "Venditore", projects_on_exchange: "Progetti", hired_on: "Successo", rest_time: "Tempo: 1-3 giorni", review_btn: "Visualizza", order: "Ordina", reviews_count: "Recensioni", delete: "Elimina", btn_rate: "⭐ Valuta", modal_review_title: "Lascia una recensione", ph_review: "Scrivi qualche parola sul lavoro...", btn_send_review: "Invia recensione", review_success: "Grazie per la tua recensione!" },
    FR: { fav_only: "Mes favoris", payment_notice: "Mode test (Paiements désactivés)", buy_now: "Payer", title: "UNIT Marketplace — Services Numériques", sub: "ANNONCES", search: "Trouver des services", track_orders: "Mes commandes", admin: "ADMIN", login: "Se connecter", logout: "Se déconnecter", register: "S'inscrire", pass_q: "Mot de passe", auth_req: "Veuillez vous connecter", no_acc: "Pas de compte?", has_acc: "Déjà un compte?", msg: "Commande acceptée!", rub_cat: "Catégories", rub_bud: "Budget", cat_all: "Tout", cat_design: "Design", cat_dev: "Développement et informatique", cat_text: "Textes et traduction", cat_seo: "SEO et trafic", cat_social: "Réseaux sociaux", cat_audio: "Audio et vidéo", cat_bus: "Affaires et vie", regulations: "Conditions d'utilisation", rodo: "Politique de confidentialité (RGPD)", footer_rights: "Tous droits réservés.", no_orders: "Rien n'a été trouvé", profile: "Profil", show_all: "Tout afficher", buyer: "Vendeur", projects_on_exchange: "Projets", hired_on: "Succès", rest_time: "Temps: 1-3 jours", review_btn: "Voir", order: "Commander", reviews_count: "Avis", delete: "Supprimer", btn_rate: "⭐ Évaluer", modal_review_title: "Laisser un avis", ph_review: "Écrivez quelques mots sur le travail...", btn_send_review: "Envoyer l'avis", review_success: "Merci pour votre avis !" }
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  const categories = [
    { id: 'ALL', icon: '📁', titleKey: 'cat_all' },
    { id: 'DESIGN', icon: '🎨', titleKey: 'cat_design' },
    { id: 'DEV', icon: '💻', titleKey: 'cat_dev' },
    { id: 'TEXT', icon: '✍️', titleKey: 'cat_text' },
    { id: 'SEO', icon: '📈', titleKey: 'cat_seo' },
    { id: 'SOCIAL', icon: '📱', titleKey: 'cat_social' },
    { id: 'AUDIO', icon: '🎵', titleKey: 'cat_audio' },
    { id: 'BUSINESS', icon: '💼', titleKey: 'cat_bus' }
  ];

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('unit_lang', newLang);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('unit_currency', newCurrency);
  };

  // --- ИНИЦИАЛИЗАЦИЯ ---
  useEffect(() => {
    let isMounted = true;

    const initSettings = async () => {
      const savedLang = localStorage.getItem('unit_lang');
      if (savedLang && isMounted) setLang(savedLang);
      
      const savedCurrency = localStorage.getItem('unit_currency');
      if (savedCurrency && isMounted) setCurrency(savedCurrency);

      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'payment_enabled').single();
        if (data && isMounted) setPaymentEnabled(data.value === 'true');
      } catch (e) {}
    };

    initSettings();

    const fetchServices = async () => {
      try {
        const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
        if (isMounted && data) setServices(data);
        setLoading(false);
      } catch (err) { if (isMounted) setLoading(false); }
    };
    fetchServices();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null);
    });

    return () => { isMounted = false; subscription?.unsubscribe(); };
  }, []);

  // --- ДОБАВЛЕНО: ЗАГРУЗКА ЗАКЛАДОК ---
  useEffect(() => {
    let isMounted = true;
    if (user) {
      supabase.from('favorites').select('service_id').eq('user_email', user.email)
        .then(({ data }) => {
          if (isMounted && data) setFavorites(data.map(f => f.service_id));
        });
    } else {
      if (isMounted) {
        setFavorites([]);
        setShowFavoritesOnly(false);
      }
    }
    return () => { isMounted = false; };
  }, [user]);

  // --- ЛОГИКА ---
  const handleAdminLogin = () => {
    const pass = prompt("Password:");
    if (pass === "123") router.push('/dashboard'); 
    else alert("Invalid password");
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    if (authIsLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) alert(error.message);
      else setShowAuthModal(false);
    } else {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) alert(error.message);
      else { alert("Success! Now login."); setAuthIsLogin(true); }
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); 
    setShowTracker(false);
    router.refresh(); 
  };

  const displayPrice = (price: number) => {
    if (currency === 'USD') return `${(price * 0.25).toFixed(0)} $`;
    if (currency === 'EUR') return `${(price * 0.23).toFixed(0)} €`;
    return `${price} PLN`; 
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'New': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Process': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Completed': 
      case 'Done': return 'bg-[#11a95e] text-white border border-[#0f9653]'; 
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  const handleOpenTracker = async () => {
    if (!user) { setShowAuthModal(true); return; }
    setShowTracker(true);
    setTrackingLoading(true);
    const { data } = await supabase.from('orders').select('*, services(title)').eq('client_email', user.email).order('created_at', { ascending: false });
    setUserOrders(data || []);
    setTrackingLoading(false);
  };

  const handleOrder = async (service_id: string, service_title: string) => {
    if (!user) { alert(translate('auth_req')); setShowAuthModal(true); return; }

    if (paymentEnabled) {
      alert(translate('buy_now') + ": " + service_title + " (Redirecting to Stripe...)");
      return; 
    }

    const { error } = await supabase.from('orders').insert([{ service_id, client_email: user.email, status: 'New' }]);

    if (!error) {
      alert(translate('msg'));
      try {
        const currentService = services.find(s => s.id === service_id);
        const message = `🚀 НОВЫЙ ЗАКАЗ!\n\n📦 Услуга: ${service_title}\n📧 Клиент: ${user.email}\n💰 Сумма: ${displayPrice(currentService?.price || 0)}`;
        await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: message }) });
      } catch (apiError) {}
    } else { alert("Ошибка: " + error.message); }
  };

  // --- ДОБАВЛЕНО: ТОГГЛ ЗАКЛАДКИ ---
  const handleToggleFavorite = async (serviceId: string) => {
    if (!user) {
      alert(translate('auth_req'));
      setShowAuthModal(true);
      return;
    }
    const isFav = favorites.includes(serviceId);
    if (isFav) {
      setFavorites(favorites.filter(id => id !== serviceId));
      await supabase.from('favorites').delete().eq('user_email', user.email).eq('service_id', serviceId);
    } else {
      setFavorites([...favorites, serviceId]);
      await supabase.from('favorites').insert([{ user_email: user.email, service_id: serviceId }]);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    setIsSubmittingReview(true);
    await supabase.from('orders').update({ rating, review_text: reviewText }).eq('id', reviewModal.orderId);
    const { data: allReviews } = await supabase.from('orders').select('rating').eq('service_id', reviewModal.serviceId).not('rating', 'is', null);
    
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      await supabase.from('services').update({ rating_avg: avg.toFixed(2), reviews_count: allReviews.length }).eq('id', reviewModal.serviceId);
      setServices(services.map(s => s.id === reviewModal.serviceId ? { ...s, rating_avg: avg.toFixed(2), reviews_count: allReviews.length } : s));
    }

    setUserOrders(userOrders.map(o => o.id === reviewModal.orderId ? { ...o, rating } : o));
    alert(translate('review_success'));
    setReviewModal(null);
    setRating(5);
    setReviewText('');
    setIsSubmittingReview(false);
  };

  const toggleBudgetRange = (rangeId: string) => {
    if (budgetRanges.includes(rangeId)) setBudgetRanges(budgetRanges.filter(id => id !== rangeId));
    else setBudgetRanges([...budgetRanges, rangeId]);
  };

  const filteredServices = services.filter(s => {
    // --- ДОБАВЛЕНО: ФИЛЬТР ЗАКЛАДОК ---
    if (showFavoritesOnly && !favorites.includes(s.id)) return false;

    if (activeCategory !== 'ALL' && s.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
    }
    if (budgetRanges.length > 0) {
      const matchesRange = budgetRanges.some(range => {
        if (range === 'r1') return s.price < 1000;
        if (range === 'r2') return s.price >= 1000 && s.price <= 3000;
        if (range === 'r3') return s.price > 3000 && s.price <= 10000;
        if (range === 'r4') return s.price > 10000 && s.price <= 30000;
        if (range === 'r5') return s.price > 30000;
        return false;
      });
      if (!matchesRange) return false;
    }
    if (budgetMin !== '' && s.price < Number(budgetMin)) return false;
    if (budgetMax !== '' && s.price > Number(budgetMax)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333] flex flex-col" suppressHydrationWarning>
      
      {!paymentEnabled && (
        <div className="bg-amber-500 text-white text-[10px] py-1 text-center font-bold uppercase tracking-widest">
          {translate('payment_notice')}
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-3 sm:px-4 h-[70px] flex items-center justify-between gap-2 sm:gap-6">
          <Link href="/" className="text-[26px] sm:text-[32px] font-black tracking-tighter cursor-pointer flex-shrink-0">
            UNIT<span className="text-[#11a95e]">.</span>
          </Link>

          <div className="flex-1 max-w-[700px] hidden md:flex h-[42px] border border-[#d9d9d9] rounded hover:border-[#b0b0b0] focus-within:border-[#11a95e] shadow-inner">
            <input type="text" placeholder={translate('search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 text-[14px] outline-none" />
            <button className="bg-[#11a95e] hover:bg-[#0e9552] w-[54px] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-[12px] sm:text-[14px] font-medium ml-auto whitespace-nowrap">
            <div className="flex items-center gap-1.5 sm:gap-3 border-r border-gray-200 pr-3 sm:pr-4">
              <select value={lang} onChange={(e) => handleLangChange(e.target.value)} className="text-[12px] sm:text-[13px] font-bold outline-none cursor-pointer bg-transparent">
                <option value="RU">RU</option><option value="EN">EN</option><option value="PL">PL</option>
              </select>
              <select value={currency} onChange={(e) => handleCurrencyChange(e.target.value)} className="text-[12px] sm:text-[13px] font-bold outline-none cursor-pointer bg-transparent">
                <option value="PLN">PLN</option><option value="USD">USD</option><option value="EUR">EUR</option>
              </select>
            </div>

            <button onClick={handleOpenTracker} className="hover:text-[#11a95e] flex items-center gap-1.5 shrink-0">
              {translate('track_orders')}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <Link href="/profile" className="text-[#11a95e] font-bold">{translate('profile')}</Link>
                <button onClick={handleLogout} className="text-gray-500 font-bold hidden sm:block">{translate('logout')}</button>
              </div>
            ) : (
              <button onClick={() => { setAuthIsLogin(true); setShowAuthModal(true); }} className="text-[#11a95e] font-bold shrink-0">{translate('login')}</button>
            )}

            <button onClick={handleAdminLogin} className="hidden sm:block px-3 py-[6px] rounded bg-[#222] text-white text-[11px] font-bold shrink-0 ml-1">
              {translate('admin')}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[30px] font-extrabold text-[#222] mb-1 tracking-tight">{translate('title')}</h1>
          <p className="text-[12px] text-gray-500 uppercase tracking-widest font-semibold">{translate('sub')}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <aside className="w-full md:w-[260px] shrink-0 bg-white rounded-[8px] border border-gray-200 p-5 shadow-sm">
            <div className="mb-6">
              <h3 className="font-extrabold text-[15px] mb-3 text-[#222] border-b border-gray-100 pb-2">{translate('rub_cat')}</h3>
              <ul className="space-y-[8px] text-[13.5px] text-gray-700">
                {categories.map(cat => (
                  <li key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex justify-between items-center cursor-pointer hover:text-[#11a95e] transition-colors ${activeCategory === cat.id ? 'font-bold text-[#11a95e] bg-emerald-50 -mx-2 px-2 py-1 rounded' : 'py-1'}`}>
                    <span className="flex items-center gap-2">
                      <span className="text-lg opacity-80">{cat.icon}</span> 
                      {translate(cat.titleKey)}
                    </span>
                    <span className="text-gray-400 text-xs bg-gray-50 px-1.5 py-0.5 rounded">
                      {services.filter(s => cat.id === 'ALL' || s.category === cat.id).length}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-extrabold text-[15px] mb-3 text-[#222] border-b border-gray-100 pb-2">{translate('rub_bud')}</h3>
              <div className="space-y-[10px] text-[13px] text-gray-700 mb-4">
                {['r1', 'r2', 'r3', 'r4', 'r5'].map((r, i) => {
                  const labels = ["До 1 000", "1 000 - 3 000", "3 000 - 10 000", "10 000 - 30 000", "От 30 000"];
                  return (
                    <label key={r} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={budgetRanges.includes(r)} onChange={() => toggleBudgetRange(r)} className="w-[16px] h-[16px] rounded-[4px] border-gray-300 text-[#11a95e] focus:ring-[#11a95e]" /> 
                      {labels[i]} {currency}
                    </label>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input type="number" placeholder={`От ${currency}`} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="w-full h-[36px] border border-gray-300 rounded-[4px] px-3 text-[13px] outline-none focus:border-[#11a95e] transition-colors" />
                <input type="number" placeholder={`До ${currency}`} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="w-full h-[36px] border border-gray-300 rounded-[4px] px-3 text-[13px] outline-none focus:border-[#11a95e] transition-colors" />
              </div>
            </div>

            {/* --- ДОБАВЛЕНО: КНОПКА ФИЛЬТРА ЗАКЛАДОК В МЕНЮ --- */}
            {user && (
              <div className="pt-6 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={showFavoritesOnly} onChange={() => setShowFavoritesOnly(!showFavoritesOnly)} className="w-[16px] h-[16px] rounded-[4px] border-gray-300 text-red-500 focus:ring-red-500" />
                  <span className="text-[13.5px] font-bold text-[#222]">❤️ {translate('fav_only')}</span>
                </label>
              </div>
            )}
          </aside>

          <section className="flex-1 space-y-4 w-full overflow-hidden">
            {loading ? (
              <div className="p-10 text-center animate-pulse text-gray-400 font-medium">Loading...</div>
            ) : filteredServices.length === 0 ? (
               <div className="bg-white p-12 rounded-[8px] border border-dashed border-gray-300 text-center text-gray-500 font-medium">
                {translate('no_orders')}
              </div>
            ) : (
              filteredServices.map((s) => (
                <ServiceCard 
                  key={s.id} 
                  service={s} 
                  isAdmin={false}
                  displayPrice={displayPrice} 
                  translate={translate} 
                  handleOrder={() => handleOrder(s.id, s.title)} 
                  deleteService={() => {}}
                  // Передаем пропсы в карточку
                  isFavorite={favorites.includes(s.id)}
                  toggleFavorite={() => handleToggleFavorite(s.id)}
                />
              ))
            )}
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-[1240px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-gray-500 font-medium">
          <div>&copy; {new Date().getFullYear()} UNIT. {translate('footer_rights')}</div>
          <div className="flex gap-6">
            <Link href="/regulations" className="hover:text-[#11a95e] transition-colors underline decoration-gray-300 underline-offset-4">
              {translate('regulations')}
            </Link>
            <Link href="/rodo" className="hover:text-[#11a95e] transition-colors underline decoration-gray-300 underline-offset-4">
              {translate('rodo')}
            </Link>
          </div>
        </div>
      </footer>

      {/* МОДАЛКИ (Без изменений) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[300] bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[12px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-extrabold text-[22px] text-[#222]">{authIsLogin ? translate('login') : translate('register')}</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-2xl text-gray-400 hover:text-red-500 leading-none transition-colors">×</button>
            </div>
            <div className="space-y-4 mb-6">
              <input type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full h-[44px] border border-gray-300 rounded-[6px] px-4 text-[14px] outline-none focus:border-[#11a95e]" />
              <input type="password" placeholder={translate('pass_q')} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full h-[44px] border border-gray-300 rounded-[6px] px-4 text-[14px] outline-none focus:border-[#11a95e]" />
            </div>
            <button onClick={handleAuth} disabled={authLoading} className="w-full h-[44px] bg-[#11a95e] hover:bg-[#0e9552] text-white rounded-[6px] font-bold text-[14px] transition-colors disabled:bg-gray-400">
              {authLoading ? "..." : (authIsLogin ? translate('login') : translate('register'))}
            </button>
            <div className="mt-4 text-center text-[13px] text-gray-500">
              {authIsLogin ? translate('no_acc') : translate('has_acc')}{' '}
              <button onClick={() => setAuthIsLogin(!authIsLogin)} className="text-[#11a95e] font-bold hover:underline">
                {authIsLogin ? translate('register') : translate('login')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTracker && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[12px] p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
              <h2 className="font-extrabold text-[20px] text-[#222]">{translate('track_orders')}</h2>
              <button onClick={() => setShowTracker(false)} className="text-2xl text-gray-400 hover:text-red-500 leading-none transition-colors">×</button>
            </div>
             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {trackingLoading ? (
                  <div className="text-center py-4 text-[13px] text-gray-500">Loading...</div>
                ) : userOrders.length > 0 ? (
                  userOrders.map(o => (
                    <div key={o.id} className="p-4 bg-gray-50 border border-gray-200 rounded-[8px] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <span className="font-bold text-[13px] text-[#333] w-full sm:w-48 truncate">{o.services?.title}</span>
                      <div className="flex items-center gap-3">
                         <span className={`px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(o.status)}`}>{o.status}</span>
                         
                         {(o.status === 'Done' || o.status === 'Completed') && !o.rating && (
                            <button 
                              onClick={() => { setReviewModal({orderId: o.id, serviceId: o.service_id}); setShowTracker(false); }}
                              className="text-[11px] font-bold text-[#11a95e] bg-emerald-50 px-2 py-1.5 rounded-[4px] border border-emerald-100 hover:bg-[#11a95e] hover:text-white transition-colors shadow-sm"
                            >
                              {translate('btn_rate')}
                            </button>
                         )}

                         {o.rating && <span className="text-[12px] text-yellow-500 font-bold tracking-widest">{'⭐'.repeat(o.rating)}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-[13px] text-gray-400 font-medium">{translate('no_orders')}</div>
                )}
             </div>
          </div>
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 z-[400] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[16px] p-8 shadow-2xl relative text-center">
             <button onClick={() => setReviewModal(null)} className="absolute top-4 right-4 text-gray-400 text-xl hover:text-red-500">×</button>
             <h2 className="font-black text-[22px] mb-2">{translate('modal_review_title')}</h2>
             <p className="text-[13px] text-gray-500 mb-6">Как вы оцениваете работу фрилансера?</p>
             
             <div className="flex justify-center gap-2 mb-6">
               {[1, 2, 3, 4, 5].map(star => (
                 <button 
                   key={star} 
                   onClick={() => setRating(star)} 
                   className={`text-4xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200'}`}
                 >
                   ★
                 </button>
               ))}
             </div>

             <textarea 
               className="w-full border border-gray-200 bg-gray-50 rounded-[10px] p-4 text-[13px] outline-none focus:border-[#11a95e] focus:bg-white transition-all resize-none h-24 mb-6"
               placeholder={translate('ph_review')}
               value={reviewText}
               onChange={(e) => setReviewText(e.target.value)}
             />

             <button 
               onClick={handleSubmitReview} 
               disabled={isSubmittingReview}
               className="w-full bg-[#11a95e] hover:bg-[#0e9552] text-white py-3.5 rounded-[10px] font-bold text-[14px] transition-all shadow-md shadow-[#11a95e]/30 disabled:bg-gray-400"
             >
               {isSubmittingReview ? "..." : translate('btn_send_review')}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}