"use client";

import { useMarketplaceFilters } from './hooks/useMarketplaceFilters';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; 

// === СУПАБАЗА И КОМПОНЕНТЫ ===
import { supabase } from './supabase';
import ServiceCard from './components/ServiceCard';

// === ХУКИ ===
import { useAuth } from './hooks/useAuth';
import { useMarketplaceData } from './hooks/useMarketplaceData';
import { useSupabaseRealtime } from './hooks/useSupabaseRealtime';

// === КОНСТАНТЫ ===
import { TICKER_ITEMS, t, categories } from './lib/constants';

// === МОДАЛКИ ===
import AuthModal from './components/modals/AuthModal';
import TrackerModal from './components/modals/TrackerModal';
import ReviewModal from './components/modals/ReviewModal';
import ApplyModal from './components/modals/ApplyModal';
import MyTasksModal from './components/modals/MyTasksModal';
import CreateTaskModal from './components/modals/CreateTaskModal';

export default function HomePage() {
  const router = useRouter(); 

  // === 1. МАГИЯ ХУКОВ ===
  const { user, logout } = useAuth();
  const { services, tasks, ads, loading, setServices } = useMarketplaceData();
  const { onlineUsers, toast, setToast } = useSupabaseRealtime(user);

  // === 2. ЛОКАЛЬНЫЕ СТЕЙТЫ UI ===
  const [currency, setCurrency] = useState('PLN'); 
  const [lang, setLang] = useState('EN'); 
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewModeType, setViewModeType] = useState<'services' | 'tasks'>('services'); 
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');

  // Стейт авторизации
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Стейты поиска и фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetRanges, setBudgetRanges] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  // Модалки
  const [showTracker, setShowTracker] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState<{orderId: string, serviceId: string} | null>(null);
  const [ratingQuality, setRatingQuality] = useState(5);
  const [ratingPunctuality, setRatingPunctuality] = useState(5);
  const [ratingPrice, setRatingPrice] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showMyTasksModal, setShowMyTasksModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [applyModal, setApplyModal] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // === НОВЫЕ СТЕЙТЫ: УВЕДОМЛЕНИЯ И ПРОФИЛЬ ===
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Прочие стейты
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hiddenServices, setHiddenServices] = useState<string[]>([]);
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isBudgetOpen, setIsBudgetOpen] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Стейты тикера
  const tickerRef = useRef<HTMLDivElement>(null);
  const [isDraggingTicker, setIsDraggingTicker] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [isHoveredTicker, setIsHoveredTicker] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;
  const currentTickerItems = TICKER_ITEMS[lang] || TICKER_ITEMS['EN'];

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('unit_lang', newLang);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('unit_currency', newCurrency);
  };

// Инициализация локальных настроек и языка по IP-адресу
  useEffect(() => {
    let isMounted = true;

    const initSettings = async () => {
      // Валюта (оставляем без изменений)
      const savedCurrency = localStorage.getItem('unit_currency');
      if (savedCurrency && isMounted) setCurrency(savedCurrency);

      // 1. Если пользователь уже заходил и менял язык — берем его выбор
      const savedLang = localStorage.getItem('unit_lang');
      if (savedLang) {
        if (isMounted) setLang(savedLang);
        return; 
      }

      // 2. Если зашел впервые — определяем страну по IP
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const country = data.country_code; // Получаем код страны (PL, DE, RU и т.д.)

        let autoLang = 'EN'; // Язык по умолчанию

        // Сопоставляем страны с языками вашего маркетплейса
        if (['RU', 'BY', 'KZ', 'UA'].includes(country)) autoLang = 'RU';
        else if (country === 'PL') autoLang = 'PL';
        else if (['DE', 'AT', 'CH'].includes(country)) autoLang = 'DE';
        else if (['ES', 'AR', 'MX'].includes(country)) autoLang = 'ES';
        else if (country === 'IT') autoLang = 'IT';
        else if (['FR', 'BE'].includes(country)) autoLang = 'FR';

        if (isMounted) {
          setLang(autoLang);
          localStorage.setItem('unit_lang', autoLang);
        }
      } catch (error) {
        // 3. Резервный вариант, если сервис IP заблокирован — берем язык браузера
        const browserLang = navigator.language.substring(0, 2).toUpperCase();
        const supportedLangs = ['RU', 'EN', 'PL', 'DE', 'ES', 'IT', 'FR'];
        const fallbackLang = supportedLangs.includes(browserLang) ? browserLang : 'EN';
        
        if (isMounted) {
          setLang(fallbackLang);
          localStorage.setItem('unit_lang', fallbackLang);
        }
      }
    };

    initSettings();
    return () => { isMounted = false; };
  }, []);

  // Синхронизация скрытых услуг
  useEffect(() => {
    if (loading) return; 

    const savedHidden = localStorage.getItem('unit_hidden_services');
    if (savedHidden) {
      try {
        const parsed = JSON.parse(savedHidden);
        const validHidden = parsed.filter((id: string) => services.some(s => s.id === id));
        setHiddenServices(validHidden);
        if (validHidden.length !== parsed.length) {
          localStorage.setItem('unit_hidden_services', JSON.stringify(validHidden));
        }
      } catch (e) {
        setHiddenServices([]);
        localStorage.removeItem('unit_hidden_services');
      }
    }
  }, [services, loading]);

  // === ЭФФЕКТ ДЛЯ УВЕДОМЛЕНИЙ (FETCH & REALTIME) ===
  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;

    // 1. Загружаем старые уведомления
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (data && isMounted) setNotifications(data);
    };
    fetchNotifications();

    // 2. Подписываемся на новые уведомления в реальном времени
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_email=eq.${user.email}` },
        (payload) => {
          if (isMounted) {
            setNotifications(prev => [payload.new, ...prev]);
            // Показываем Toast сбоку
            setToast({ title: payload.new.title, message: payload.new.message });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user, setToast]);

  // === ПРОВЕРКА НА БАН ПОЛЬЗОВАТЕЛЯ (РЕАЛЬНОЕ ВРЕМЯ) ===
  useEffect(() => {
    let isMounted = true;
    
    const checkBanStatus = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', user.id)
        .single();

      if (data?.is_banned && isMounted) {
        alert(translate('account_banned') || 'Ваш аккаунт заблокирован за нарушение правил платформы.');
        await logout(); // Мгновенно выкидываем из аккаунта
        router.refresh();
      }
    };

    checkBanStatus();

    // Подписка на изменения профиля в реальном времени
    const banChannel = supabase
      .channel('public:profiles_ban')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` },
        (payload) => {
          if (payload.new.is_banned && isMounted) {
            alert('Ваш аккаунт был только что заблокирован администратором.');
            logout();
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(banChannel);
    };
  }, [user, logout, router]);

  // Закрытие дропдаунов при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Слайдер рекламы
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  // Анимация тикера
  useEffect(() => {
    let animationFrameId: number;
    const el = tickerRef.current;
    const scrollStep = () => {
      if (el && !isHoveredTicker && !isDraggingTicker) {
        el.scrollLeft += 1.0; 
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0; 
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };
    animationFrameId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHoveredTicker, isDraggingTicker]);

  // Загрузка избранного
  useEffect(() => {
    let isMounted = true;
    if (user) {
      supabase.from('favorites').select('service_id').eq('user_email', user.email)
        .then(({ data }) => {
          if (isMounted && data) setFavorites(data.map(f => f.service_id));
        });
    } else {
      if (isMounted) { setFavorites([]); setShowFavoritesOnly(false); }
    }
    return () => { isMounted = false; };
  }, [user]);

  // === ОБНОВЛЕННЫЕ ФУНКЦИИ ===

  const handleLogout = async () => {
    await logout();
    setShowTracker(false);
    setNotifications([]);
    setIsProfileOpen(false);
    router.refresh(); 
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_email', user.email);
  };

  const handleAdminLogin = () => {
    const pass = prompt("Password:");
    if (pass === "123") router.push('/dashboard'); 
    else alert("Invalid password");
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
      case 'Done': 
      case 'Completed': return 'bg-[#11a95e] text-white border border-[#0f9653]'; 
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
    const { error } = await supabase.from('orders').insert([{ service_id, client_email: user.email, status: 'New' }]);

    if (!error) {
      alert(translate('msg'));
      
      // Отправляем уведомление ПРОДАВЦУ (Исполнителю)
      const currentService = services.find(s => s.id === service_id);
      if (currentService && currentService.seller_email && currentService.seller_email !== user.email) {
         await supabase.from('notifications').insert([{
            user_email: currentService.seller_email,
            title: '🎉 Новый заказ!',
            message: `Пользователь ${user.email} заказал у вас услугу: "${service_title}". Проверьте личный кабинет.`,
            type: 'order'
         }]);
      }

      try {
        const message = `🚀 НОВЫЙ ЗАКАЗ!\n\n📦 Услуга: ${service_title}\n📧 Клиент: ${user.email}\n💰 Сумма: ${displayPrice(currentService?.price || 0)}`;
        await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: message }) });
      } catch (apiError) {}
    } else { alert("Ошибка: " + error.message); }
  };

  const handleApplyToTask = async () => {
    if (!user) { alert(translate('auth_req')); setShowAuthModal(true); return; }
    if (!applyMessage.trim()) return alert("Напишите сообщение!");
    
    const { error } = await supabase.from('task_responses').insert([{
      task_id: applyModal,
      freelancer_email: user.email,
      message: applyMessage
    }]);

    if (error) alert("Ошибка: " + error.message);
    else {
      alert(translate('review_success') || "Успешно отправлено!");
      
      // Отправляем уведомление ПОКУПАТЕЛЮ (Заказчику задания)
      const currentTask = tasks.find(t => t.id === applyModal);

      if (currentTask && currentTask.client_email && currentTask.client_email !== user.email) {
         await supabase.from('notifications').insert([{
            user_email: currentTask.client_email,
            title: '📩 Новый отклик на задание!',
            message: `Исполнитель ${user.email} оставил отклик на ваше задание: "${currentTask.title}". Проверьте личный кабинет.`,
            type: 'task'
         }]);
      }

      setApplyModal(null);
      setApplyMessage('');
    }
  };

  const handleToggleFavorite = async (serviceId: string) => {
    if (!user) { alert(translate('auth_req')); setShowAuthModal(true); return; }
    const isFav = favorites.includes(serviceId);
    if (isFav) {
      setFavorites(favorites.filter(id => id !== serviceId));
      await supabase.from('favorites').delete().eq('user_email', user.email).eq('service_id', serviceId);
    } else {
      setFavorites([...favorites, serviceId]);
      await supabase.from('favorites').insert([{ user_email: user.email, service_id: serviceId }]);
    }
  };

  const toggleHideService = (serviceId: string) => {
    let updated: string[];
    if (hiddenServices.includes(serviceId)) {
      updated = hiddenServices.filter(id => id !== serviceId);
    } else {
      updated = [...hiddenServices, serviceId];
    }
    setHiddenServices(updated);
    localStorage.setItem('unit_hidden_services', JSON.stringify(updated));
    
    if (showHiddenOnly && updated.length === 0) setShowHiddenOnly(false);
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    setIsSubmittingReview(true);
    
    const avgOrderRating = Math.round((ratingQuality + ratingPunctuality + ratingPrice) / 3);

    await supabase.from('orders').update({ 
      rating: avgOrderRating,
      rating_quality: ratingQuality,
      rating_punctuality: ratingPunctuality,
      rating_price: ratingPrice,
      review_text: reviewText 
    }).eq('id', reviewModal.orderId);

    const { data: allReviews } = await supabase.from('orders')
      .select('rating, rating_quality, rating_punctuality, rating_price')
      .eq('service_id', reviewModal.serviceId)
      .not('rating', 'is', null);
    
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      
      await supabase.from('services').update({ 
        rating_avg: avg.toFixed(2), 
        reviews_count: allReviews.length 
      }).eq('id', reviewModal.serviceId);

      setServices(services.map(s => s.id === reviewModal.serviceId ? { ...s, rating_avg: avg.toFixed(2), reviews_count: allReviews.length } : s));

      const service = services.find(s => s.id === reviewModal.serviceId);
      if (service && service.user_id) {
        const avgQ = allReviews.reduce((acc, curr) => acc + (curr.rating_quality || 5), 0) / allReviews.length;
        const avgP = allReviews.reduce((acc, curr) => acc + (curr.rating_punctuality || 5), 0) / allReviews.length;
        const avgPr = allReviews.reduce((acc, curr) => acc + (curr.rating_price || 5), 0) / allReviews.length;

        await supabase.from('profiles').update({
          rating_quality: avgQ.toFixed(2),
          rating_punctuality: avgP.toFixed(2),
          rating_price: avgPr.toFixed(2)
        }).eq('id', service.user_id);
      }
    }

    setUserOrders(userOrders.map(o => o.id === reviewModal.orderId ? { ...o, rating: avgOrderRating } : o));
    alert(translate('review_success'));
    setReviewModal(null);
    setRatingQuality(5); setRatingPunctuality(5); setRatingPrice(5);
    setReviewText('');
    setIsSubmittingReview(false);
  };

  const toggleBudgetRange = (rangeId: string) => {
    if (budgetRanges.includes(rangeId)) setBudgetRanges(budgetRanges.filter(id => id !== rangeId));
    else setBudgetRanges([...budgetRanges, rangeId]);
  };

  // === ОПТИМИЗИРОВАННАЯ ФИЛЬТРАЦИЯ И СОРТИРОВКА ===
  const sortedServices = useMemo(() => {
    const filtered = services.filter(s => {
      if (showHiddenOnly ? !hiddenServices.includes(s.id) : hiddenServices.includes(s.id)) return false;
      if (showFavoritesOnly && !favorites.includes(s.id)) return false;
      if (activeCategory !== 'ALL' && s.category !== activeCategory) return false;
      
      if (searchQuery) {
        const queryWords = searchQuery.toLowerCase().split(' ').filter(w => w.trim() !== '');
        const catKey = categories.find(c => c.id === s.category)?.titleKey || s.category;
        const combinedText = `${s.title || ''} ${s.description || ''} ${translate(catKey)}`.toLowerCase();
        if (!queryWords.every(word => combinedText.includes(word))) return false;
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

    return [...filtered].sort((a, b) => {
      if (a.is_top && !b.is_top) return -1;
      if (!a.is_top && b.is_top) return 1;
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'rating': return (Number(b.rating_avg) || 0) - (Number(a.rating_avg) || 0);
        case 'newest':
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
      }
    });
  }, [services, searchQuery, activeCategory, sortBy, favorites, showFavoritesOnly, hiddenServices, showHiddenOnly, budgetRanges, budgetMin, budgetMax, lang]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (activeCategory !== 'ALL' && t.category !== activeCategory) return false;
      if (searchQuery) {
        const queryWords = searchQuery.toLowerCase().split(' ').filter(w => w.trim() !== '');
        const catKey = categories.find(c => c.id === t.category)?.titleKey || t.category;
        const combinedText = `${t.title || ''} ${t.description || ''} ${translate(catKey)}`.toLowerCase();
        if (!queryWords.every(word => combinedText.includes(word))) return false;
      }
      if (budgetMin !== '' && t.budget < Number(budgetMin)) return false;
      if (budgetMax !== '' && t.budget > Number(budgetMax)) return false;
      return true;
    });
  }, [tasks, searchQuery, activeCategory, budgetRanges, budgetMin, budgetMax, lang]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#222] flex flex-col" suppressHydrationWarning>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-3 sm:gap-4">
          <Link href="/" className="text-[22px] sm:text-[28px] font-black tracking-tight cursor-pointer shrink-0">
            UNIT<span className="text-[#11a95e]">.</span>
          </Link>

          <div className="flex-1 max-w-[800px] flex h-[40px] sm:h-[44px] border border-gray-300 rounded-full hover:border-gray-400 focus-within:border-[#11a95e] focus-within:ring-2 focus-within:ring-[#11a95e]/10 bg-white relative overflow-hidden transition-all shadow-sm hover:shadow-md">
            <input 
              type="text" 
              placeholder={translate('search')} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-5 sm:pl-6 pr-3 text-[13px] sm:text-[14px] outline-none rounded-l-full bg-transparent" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-[44px] sm:right-[54px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 px-2 text-lg transition-colors">×</button>
            )}
            <button className="bg-gradient-to-r from-[#11a95e] to-emerald-400 hover:from-[#0e9552] hover:to-[#11a95e] w-[40px] sm:w-[54px] flex items-center justify-center shrink-0 transition-all">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-5 text-[14px] font-medium shrink-0">
            <div className="flex items-center gap-4 border-r border-gray-200 pr-5">
              <div className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 focus-within:text-orange-500 transition-colors">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <select value={lang} onChange={(e) => handleLangChange(e.target.value)} className="text-[13px] font-bold outline-none cursor-pointer bg-transparent text-[#222]">
                  <option value="RU">RU</option><option value="EN">EN</option><option value="PL">PL</option><option value="DE">DE</option><option value="ES">ES</option><option value="IT">IT</option><option value="FR">FR</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 focus-within:text-orange-500 transition-colors">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <select value={currency} onChange={(e) => handleCurrencyChange(e.target.value)} className="text-[13px] font-bold outline-none cursor-pointer bg-transparent text-[#222]">
                  <option value="PLN">PLN</option><option value="USD">USD</option><option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-5">
                {/* КОЛОКОЛЬЧИК УВЕДОМЛЕНИЙ */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                    className="relative p-2 text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                  </button>

                  {/* ВЫПАДАЮЩЕЕ МЕНЮ УВЕДОМЛЕНИЙ */}
                  {isNotificationsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 fade-in">
                      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-black text-[15px] text-[#111]">{translate('notifications') || 'Уведомления'}</h3>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllAsRead} className="text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors">
                            {translate('mark_all_read') || 'Прочитать все'}
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-[380px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 text-[13px] font-medium">{translate('no_new_notifications') || 'Нет новых уведомлений'}</div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.is_read ? 'bg-orange-50/30' : ''}`}
                              onClick={() => handleMarkAsRead(notif.id)}
                            >
                              <div className="shrink-0 mt-1">
                                {!notif.is_read ? (
                                  <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`text-[13px] mb-0.5 ${!notif.is_read ? 'font-black text-[#111]' : 'font-bold text-gray-600'}`}>{notif.title}</h4>
                                <p className="text-[12px] text-gray-500 leading-snug">{notif.message}</p>
                                <span className="text-[10px] font-medium text-gray-400 mt-2 block">
                                  {new Date(notif.created_at).toLocaleDateString()} в {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* НОВОЕ ВЫПАДАЮЩЕЕ МЕНЮ ПРОФИЛЯ ИЗ СКРИНШОТА */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                    className="w-10 h-10 rounded-full bg-[#11a95e] text-white flex items-center justify-center font-bold shadow-sm hover:shadow-md transition-all focus:outline-none text-[15px]"
                  >
                    {user.email?.[0].toUpperCase() || 'U'}
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 fade-in">
                      <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{translate('logged_in_as') || 'Вы вошли как'}</p>
                        <p className="text-[13px] font-black text-[#111] truncate">{user.email}</p>
                      </div>
                      
                      <div className="p-2 flex flex-col gap-0.5">
                        <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="px-3 py-2.5 text-[14px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors text-left flex items-center gap-3">
                          <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {translate('profile') || 'Кабинет'}
                        </Link>
                        <button onClick={() => { handleOpenTracker(); setIsProfileOpen(false); }} className="px-3 py-2.5 text-[14px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors text-left flex items-center gap-3">
                          <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          {translate('track_orders') || 'Мои Заказы'}
                        </button>
                        <button onClick={() => { setShowMyTasksModal(true); setIsProfileOpen(false); }} className="px-3 py-2.5 text-[14px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors text-left flex items-center gap-3">
                          <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                          {translate('my_tasks') || 'Мои задания'}
                        </button>
                        <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
                        <button onClick={() => { handleAdminLogin(); setIsProfileOpen(false); }} className="px-3 py-2.5 text-[13px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors text-left flex items-center gap-3">
                          <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {translate('admin') || 'Админ-панель'}
                        </button>
                      </div>
                      
                      <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                        <button onClick={handleLogout} className="w-full px-3 py-2.5 text-[14px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left flex items-center gap-3">
                          <svg className="w-[18px] h-[18px] text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          {translate('logout') || 'Выйти'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth" className="text-[#11a95e] hover:text-emerald-400 transition-colors font-bold">{translate('login')}</Link>
                <button onClick={handleAdminLogin} className="px-5 py-2 rounded-full bg-[#222] hover:bg-[#111] transition-colors text-white text-[11px] font-bold shadow-sm hover:shadow-md">
                  {translate('admin')}
                </button>
              </div>
            )}
          </div>

          <button 
            className="lg:hidden p-1.5 text-gray-600 hover:text-[#11a95e] transition-colors shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        
       {/* ГЛАВНАЯ ПАНЕЛЬ С КНОПКАМИ И ИКОНКАМИ СОЦСЕТЕЙ */}
        <div className="relative bg-gradient-to-r from-[#11a95e]/10 via-orange-50/40 to-orange-500/20 rounded-2xl p-4 md:px-6 md:py-5 mb-4 border border-orange-100/70 overflow-hidden shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="absolute -top-16 -right-12 w-56 h-56 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 pointer-events-none animate-pulse"></div>
          <div className="absolute -top-4 right-24 w-48 h-48 bg-[#11a95e] rounded-full mix-blend-multiply filter blur-3xl opacity-15 pointer-events-none"></div>
          
          {/* ЛЕВАЯ ЧАСТЬ: Заголовок и Переключатель */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <h1 className="text-[20px] md:text-[24px] font-black text-[#111] tracking-tight leading-tight">
              {translate('title')}
            </h1>

            {/* ПЕРЕКЛЮЧАТЕЛЬ: УСЛУГИ ИЛИ ЗАДАНИЯ */}
            <div className="flex gap-1.5 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm w-fit">
              <button 
                onClick={() => setViewModeType('services')} 
                className={`px-4 py-2 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all ${
                  viewModeType === 'services' 
                    ? 'bg-white text-[#11a95e] shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"/></svg>
                {translate('services')}
              </button>
              <button 
                onClick={() => setViewModeType('tasks')} 
                className={`px-4 py-2 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all ${
                  viewModeType === 'tasks' 
                    ? 'bg-white text-[#11a95e] shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                {translate('tasks')}
              </button>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: Кнопки и Соцсети */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
            
            {/* КНОПКА СОЗДАТЬ ЗАДАНИЕ */}
            {viewModeType === 'tasks' && user && (
              <button 
                onClick={() => setShowCreateTaskModal(true)}
                className="text-[10px] text-white font-bold uppercase tracking-widest flex items-center gap-1.5 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 px-4 py-2 rounded-full shadow-sm transition-all w-fit cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                {translate('create_task') || 'Создать задание'}
              </button>
            )}

            {/* Иконки соцсетей */}
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200/60 shadow-sm">
              <a href="https://t.me/your_telegram_channel" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange-500 hover:scale-110 transition-all" title="Telegram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75l-2.22-1.47c-.98-.65-1.57-1.34-1.57-2.33 0-.17.03-.32.06-.48.07-.36.43-1.08 1.59-2.25.66-.65 1.22-1.22 1.48-1.52.06-.06.13-.17.13-.3 0-.17-.13-.26-.26-.26-.06 0-1.04.68-2.58 1.76-.24.17-.46.26-.7.26-.26 0-.63-.12-.87-.21-.37-.14-.66-.21-.64-.44.01-.16.23-.33.6-.48 2.39-1.05 4.09-1.8 5.1-2.25 2.45-1.09 2.96-1.27 3.3-1.27.07 0 .23.01.33.09.09.07.12.18.14.28.01.12.01.25.01.38z"/></svg>
              </a>
              <a href="https://instagram.com/your_instagram" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange-500 hover:scale-110 transition-all" title="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.206.055 2.065.253 2.793.535.758.293 1.304.66 1.87 1.225.565.565.932 1.112 1.225 1.87.282.728.48 1.587.535 2.793.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.206-.253 2.065-.535 2.793-.293.758-.66 1.304-1.225 1.87-.565.565-1.112.932-1.87 1.225-.728.282-1.587.48-2.793.535-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.206-.055-2.065-.253-2.793-.535-.758-.293-1.304-.66-1.87-1.225-.565-.565-1.112-1.225-1.87-1.225-.728.282-1.587.48-2.793.535C8.416 2.175 8.796 2.163 12 2.163zm0 2.163c-3.13 0-3.504.012-4.746.068-1.144.053-1.765.238-2.18.403-.548.212-.938.467-1.348.877-.41.41-.665.8-.877 1.348-.165.415-.35 1.036-.403 2.18C4.012 8.496 4 8.87 4 12s.012 3.504.068 4.746c.053 1.144.238 1.765.403 2.18.212.548.467.938.877 1.348.41.41.8.665 1.348.877.415.165 1.036.35 2.18.403C8.496 19.988 8.87 20 12 20s3.504-.012 4.746-.068c1.144-.053 1.765-.238 2.18-.403.548-.212.938-.467 1.348-.877.41-.41.665-.8.877-1.348.165-.415.35-1.036.403-2.18C15.504 4.175 15.13 4.163 12 4.163z"/></svg>
              </a>
              <a href="https://tiktok.com/@your_tiktok" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange-500 hover:scale-110 transition-all" title="TikTok">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.77 0 2.89 2.89 0 0 1 2.5-2.87V9.3a6.34 6.34 0 0 0-6.33 6.34 6.34 6.34 0 0 0 6.33 6.34 6.34 6.34 0 0 0 6.34-6.34V8.34a8.19 8.19 0 0 0 5.48 2.06v-3.71z"/></svg>
              </a>
            </div>

            {/* КНОПКА ПОМОЩИ (ВЫЗЫВАЕТ AI-ЧАТ) */}
            <button 
              onClick={() => window.dispatchEvent(new Event('open-ai-chat'))} 
              className="text-[10px] text-gray-600 hover:text-orange-500 font-bold uppercase tracking-widest flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur-md px-4 py-2 rounded-full border border-gray-200/60 shadow-sm transition-all w-fit cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {translate('help_btn')}
            </button>
          </div>
        </div>

        {/* СКОЛЬЗЯЩАЯ СТРОКА */}
        <div className="w-full bg-white border border-gray-200 rounded-[16px] mb-8 overflow-hidden shadow-sm relative group cursor-grab active:cursor-grabbing select-none">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none rounded-l-[16px]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none rounded-r-[16px]"></div>
          
          <div 
            ref={tickerRef}
            className="flex overflow-x-auto hide-scrollbar w-full relative"
            onMouseDown={(e) => {
              if (e.button !== 0) return; 
              setIsDraggingTicker(true);
              setDragDistance(0);
              setDragStart(e.pageX - e.currentTarget.offsetLeft);
              setScrollStart(e.currentTarget.scrollLeft);
            }}
            onMouseMove={(e) => {
              if (!isDraggingTicker) return;
              e.preventDefault();
              const x = e.pageX - e.currentTarget.offsetLeft;
              const walk = (x - dragStart) * 1.5;
              let targetScroll = scrollStart - walk;

              if (targetScroll <= 0) {
                targetScroll += e.currentTarget.scrollWidth / 2;
                setDragStart(x);
                setScrollStart(targetScroll);
              }
              else if (targetScroll >= e.currentTarget.scrollWidth / 2) {
                targetScroll -= e.currentTarget.scrollWidth / 2;
                setDragStart(x);
                setScrollStart(targetScroll);
              }

              e.currentTarget.scrollLeft = targetScroll;
              setDragDistance(Math.abs(walk));
            }}
            onMouseUp={() => setIsDraggingTicker(false)}
            onMouseLeave={() => { setIsDraggingTicker(false); setIsHoveredTicker(false); }}
            onMouseEnter={() => setIsHoveredTicker(true)}
          >
            <div className="flex py-3 text-[#11a95e] font-bold text-[13px] uppercase tracking-widest whitespace-nowrap w-max">
              {[...currentTickerItems, ...currentTickerItems, ...currentTickerItems, ...currentTickerItems].map((item, i) => (
                <span 
                  key={i} 
                  onClick={() => {
                    if (dragDistance < 5) {
                      setSearchQuery(item);     
                      setActiveCategory('ALL'); 
                    }
                  }}
                  className="mx-6 flex items-center gap-6 cursor-pointer hover:text-orange-500 transition-colors"
                >
                  <span>{item}</span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* СЕТКА И БОКОВАЯ ПАНЕЛЬ */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <aside className="w-full md:w-[260px] shrink-0 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-[96px]">
            <div className="mb-8">
              <h3 className="font-bold text-[16px] mb-4 text-[#111] border-b border-gray-100 pb-2 flex items-center gap-2">
                {translate('rub_cat')}
              </h3>
              <ul className="space-y-1.5 text-[14px] text-gray-600 font-medium">
                <li 
                  onClick={() => {
                    setActiveCategory('ALL');
                    setIsCategoriesOpen(!isCategoriesOpen);
                  }}
                  className={`flex justify-between items-center cursor-pointer px-3 py-2.5 rounded-xl transition-all ${activeCategory === 'ALL' ? 'bg-[#11a95e] text-white font-bold shadow-sm' : 'hover:bg-orange-50 hover:text-orange-600'}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={activeCategory === 'ALL' ? "text-white" : "text-gray-400"}>
                      {categories[0].icon}
                    </span>
                    {translate('cat_all')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${activeCategory === 'ALL' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                      {viewModeType === 'services' ? services.length : tasks.length}
                    </span>
                    <span className={`text-[10px] opacity-70 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </li>

                {isCategoriesOpen && (
                  <div className="space-y-1.5 animate-in fade-in duration-200 pt-1.5">
                    {categories.slice(1).map(cat => (
                      <li 
                        key={cat.id} 
                        onClick={() => setActiveCategory(cat.id)} 
                        className={`flex justify-between items-center cursor-pointer px-3 py-2.5 rounded-xl transition-all ${activeCategory === cat.id ? 'bg-[#11a95e] text-white font-bold shadow-sm' : 'hover:bg-orange-50 hover:text-orange-600'}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={activeCategory === cat.id ? "text-white" : "text-gray-400"}>{cat.icon}</span> 
                          {translate(cat.titleKey)}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${activeCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                          {viewModeType === 'services' ? services.filter(s => s.category === cat.id).length : tasks.filter(t => t.category === cat.id).length}
                        </span>
                      </li>
                    ))}
                  </div>
                )}
              </ul>
            </div>

            <div className="mb-6">
              <h3 
                onClick={() => setIsBudgetOpen(!isBudgetOpen)}
                className="font-bold text-[16px] mb-4 text-[#111] border-b border-gray-100 pb-2 flex items-center justify-between gap-2 cursor-pointer select-none hover:text-[#11a95e] transition-colors group"
              >
                {translate('rub_bud')}
                <span className={`text-[12px] text-gray-400 group-hover:text-[#11a95e] transition-transform duration-200 ${isBudgetOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </h3>
              
              {isBudgetOpen && (
                <div className="animate-in fade-in duration-200">
                  <div className="space-y-3 text-[13px] text-gray-600 mb-5 font-medium">
                    {['r1', 'r2', 'r3', 'r4', 'r5'].map((r, i) => {
                      const labels = ["До 1 000", "1 000 - 3 000", "3 000 - 10 000", "10 000 - 30 000", "От 30 000"];
                      return (
                        <label key={r} className="flex items-center gap-3 cursor-pointer group hover:text-orange-500 transition-colors">
                          <input type="checkbox" checked={budgetRanges.includes(r)} onChange={() => toggleBudgetRange(r)} className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 transition-colors" /> 
                          {labels[i]} {currency}
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder={translate('from') || 'От'} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="w-full h-[38px] border border-gray-300 rounded-lg px-3 text-[13px] outline-none focus:border-orange-500 transition-colors" />
                    <input type="number" placeholder={translate('to') || 'До'} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="w-full h-[38px] border border-gray-300 rounded-lg px-3 text-[13px] outline-none focus:border-orange-500 transition-colors" />
                  </div>
                </div>
              )}
            </div>

            {user && (
              <div className="pt-6 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group hover:text-orange-500 transition-colors">
                  <input type="checkbox" checked={showFavoritesOnly} onChange={() => setShowFavoritesOnly(!showFavoritesOnly)} className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                  <span className="text-[14px] font-bold text-[#111] group-hover:text-orange-500 flex items-center gap-2 transition-colors">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    {translate('fav_only')}
                  </span>
                </label>
              </div>
            )}

            {/* БЛОК С РЕКЛАМОЙ (СО СЛАЙДЕРОМ) */}
            <div className="mt-8 relative w-full h-[280px] rounded-2xl overflow-hidden group flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg border border-slate-700/50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-orange-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute top-10 right-10 w-20 h-20 bg-[#11a95e] rounded-full mix-blend-overlay filter blur-2xl opacity-20"></div>

              {ads.length > 0 ? (
                <>
                  <img 
                    key={ads[currentAdIndex].id} 
                    src={ads[currentAdIndex].image_url} 
                    alt="Advertisement" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-opacity duration-700" 
                  />
                  
                  {ads[currentAdIndex].link && (
                    <a href={ads[currentAdIndex].link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20 cursor-pointer"></a>
                  )}

                  {ads.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-30 pointer-events-none">
                      {ads.map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentAdIndex ? 'bg-white scale-125' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span className="relative z-10 text-white/40 font-black text-[15px] uppercase tracking-[0.25em] text-center px-6 leading-relaxed select-none group-hover:text-white/60 transition-colors duration-500">
                  {translate('ad_placeholder')}
                </span>
              )}
            </div>

          </aside>

          {/* КОНТЕНТНАЯ ЧАСТЬ */}
          <div className="flex-1 w-full flex flex-col content-start">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gray-200 rounded-2xl p-3 md:pl-5 mb-5 shadow-sm gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-gray-400 font-medium hidden sm:block">
                  {translate('hero_desc')}
                </span>
                <span className="text-[14px] font-bold text-[#111]">
                  {translate('found') || 'Найдено:'} <span className="text-orange-500">{viewModeType === 'services' ? sortedServices.length : filteredTasks.length}</span>
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-gray-100 pt-3 md:border-0 md:pt-0 mt-1 md:mt-0">
                {hiddenServices.length > 0 && viewModeType === 'services' && (
                  <button 
                    onClick={() => setShowHiddenOnly(!showHiddenOnly)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${showHiddenOnly ? 'bg-gray-800 text-white border-gray-800 shadow-md' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'}`}
                  >
                    {showHiddenOnly ? translate('back_to_all') : `${translate('show_hidden')} (${hiddenServices.length})`}
                  </button>
                )}

                {viewModeType === 'services' && (
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-gray-50 text-[13px] font-bold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 outline-none hover:border-orange-400 focus:border-orange-400 focus:text-orange-600 cursor-pointer transition-colors"
                  >
                    <option value="newest">{translate('sort_new')}</option>
                    <option value="price_asc">{translate('sort_cheap')}</option>
                    <option value="price_desc">{translate('sort_exp')}</option>
                    <option value="rating">{translate('sort_top')}</option>
                  </select>
                )}

                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 hidden sm:flex">
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-[#11a95e] shadow-sm' : 'text-gray-400 hover:text-orange-500'}`}
                    title={translate('view_grid') || "Плиткой"}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/></svg>
                  </button>
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-[#11a95e] shadow-sm' : 'text-gray-400 hover:text-orange-500'}`}
                    title={translate('view_list') || "Списком"}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <section className={`w-full ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch' : 'flex flex-col gap-4'}`}>
              {loading ? (
                <div className="col-span-full py-20 text-center animate-pulse text-gray-400 font-medium text-lg">{translate('loading') || 'Загрузка...'}</div>
              ) : viewModeType === 'services' ? (
                /* РЕНДЕР КАТАЛОГА УСЛУГ ИЗ SUPABASE */
                sortedServices.length === 0 ? (
                  <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
                   <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                   <p className="text-gray-500 font-medium text-[15px]">
                     {searchQuery ? `${translate('no_orders')} по запросу "${searchQuery}"` : translate('no_orders')}
                   </p>
                   {searchQuery && (
                     <button onClick={() => setSearchQuery('')} className="mt-4 text-[#11a95e] font-bold underline hover:text-[#0e9552]">
                       {translate('show_all')}
                     </button>
                   )}
                  </div>
                ) : (
                  sortedServices.map((s) => (
                    <div key={s.id} className="relative group/hide flex flex-col">
                      <ServiceCard 
                        service={s} 
                        isAdmin={false}
                        displayPrice={displayPrice} 
                        translate={translate} 
                        handleOrder={() => handleOrder(s.id, s.title)} 
                        deleteService={() => {}}
                        isFavorite={favorites.includes(s.id)}
                        toggleFavorite={() => handleToggleFavorite(s.id)}
                        isTop={s.is_top}
                        viewMode={viewMode}
                        isOnline={onlineUsers.includes(s.user_id || s.sellerProfile?.id)}
                      />
                      
                      <div className="absolute inset-0 z-10 pointer-events-none flex items-start justify-center pt-[70px] opacity-0 group-hover/hide:opacity-100 transition-opacity">
                         <button 
                           onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHideService(s.id); }}
                           className="pointer-events-auto bg-white/95 text-gray-700 hover:text-red-500 font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 backdrop-blur-sm transition-all hover:scale-105"
                         >
                           {showHiddenOnly ? (
                             <>
                               <svg className="w-4 h-4 text-[#11a95e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                               {translate('unhide_btn')}
                             </>
                           ) : (
                             <>
                               <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                               {translate('hide_btn')}
                             </>
                           )}
                         </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                /* РЕНДЕР БИРЖИ ЗАДАНИЙ ИЗ SUPABASE */
                filteredTasks.length === 0 ? (
                  <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
                   <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                   <p className="text-gray-500 font-medium text-[15px]">
                     {searchQuery ? `Нет заданий по запросу "${searchQuery}"` : (translate('no_active_tasks') || "Нет активных заданий в этой категории")}
                   </p>
                   {searchQuery && (
                     <button onClick={() => setSearchQuery('')} className="mt-4 text-[#11a95e] font-bold underline hover:text-[#0e9552]">
                       {translate('reset_search') || 'Сбросить поиск'}
                     </button>
                   )}
                  </div>
                ) : (
                  filteredTasks.map(t => (
                    <div key={t.id} className={`bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow ${viewMode === 'grid' ? 'flex flex-col h-full' : 'flex flex-col md:flex-row justify-between items-start md:items-center gap-4'}`}>
                      
                      {viewMode === 'grid' ? (
                        /* ПЛИТКА (GRID) ДЛЯ ЗАДАНИЙ */
                        <>
                          <div className="flex-1 flex flex-col min-w-0">
                            <h3 className="font-black text-[16px] text-[#111] mb-2 line-clamp-2">{t.title}</h3>
                            <p className="text-[13px] text-gray-500 mb-4 line-clamp-3 flex-1">{t.description}</p>
                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                              <span className="bg-gray-100 px-2.5 py-1.5 rounded-lg truncate max-w-[140px] text-gray-500" title={t.client_email}>{t.client_email}</span>
                              <span className="bg-orange-50 text-orange-600 px-2.5 py-1.5 rounded-lg">{translate(categories.find(c => c.id === t.category)?.titleKey || t.category)}</span>
                            </div>
                          </div>
                          <div className="mt-auto border-t border-gray-100 pt-4 flex flex-col gap-3">
                            <div className="font-black text-[18px] text-orange-500">{displayPrice(t.budget)}</div>
                            <button 
                              onClick={() => setApplyModal(t.id)}
                              className="w-full bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-wider hover:scale-[1.02] transition-transform shadow-sm"
                            >
                              {translate('btn_apply')}
                            </button>
                          </div>
                        </>
                      ) : (
                        /* СПИСОК (LIST) ДЛЯ ЗАДАНИЙ */
                        <>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-[16px] text-[#111] mb-1 truncate">{t.title}</h3>
                            <p className="text-[13px] text-gray-500 mb-3 line-clamp-2 max-w-3xl">{t.description}</p>
                            <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
                              <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md">{t.client_email}</span>
                              <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md">{translate(categories.find(c => c.id === t.category)?.titleKey || t.category)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 gap-2 w-full md:w-auto border-t md:border-0 border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0">
                            <div className="font-black text-[18px] text-orange-500">{displayPrice(t.budget)}</div>
                            <button 
                              onClick={() => setApplyModal(t.id)}
                              className="w-full md:w-auto bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-wider hover:scale-105 transition-transform shadow-sm"
                            >
                              {translate('btn_apply')}
                            </button>
                          </div>
                        </>
                      )}

                    </div>
                  ))
                )
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-gray-500 font-medium">
          <div>&copy; {new Date().getFullYear()} UNIT. {translate('footer_rights')}</div>
          <div className="flex gap-6">
            <Link href="/regulations" className="hover:text-orange-500 transition-colors underline decoration-gray-300 underline-offset-4">
              {translate('regulations')}
            </Link>
            <Link href="/rodo" className="hover:text-orange-500 transition-colors underline decoration-gray-300 underline-offset-4">
              {translate('rodo')}
            </Link>
          </div>
        </div>
      </footer>

      {/* МОБИЛЬНОЕ МЕНЮ (DRAWER) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[2000] bg-gray-900/60 backdrop-blur-sm flex justify-end lg:hidden">
          <div className="w-[280px] h-full bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[20px] font-black tracking-tight">{translate('menu') || 'Меню'}</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-3xl leading-none text-gray-400 hover:text-orange-500 transition-colors">×</button>
            </div>
            
            <div className="flex flex-col gap-6 font-bold text-[15px] text-[#222]">
              <div className="flex flex-col gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[13px] uppercase tracking-widest">{translate('language') || 'Язык'}</span>
                  <select value={lang} onChange={(e) => handleLangChange(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none">
                    <option value="RU">RU</option><option value="EN">EN</option><option value="PL">PL</option><option value="DE">DE</option><option value="ES">ES</option><option value="IT">IT</option><option value="FR">FR</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[13px] uppercase tracking-widest">{translate('currency') || 'Валюта'}</span>
                  <select value={currency} onChange={(e) => handleCurrencyChange(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none">
                    <option value="PLN">PLN</option><option value="USD">USD</option><option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              
              <button onClick={() => { handleOpenTracker(); setIsMobileMenuOpen(false); }} className="text-left hover:text-orange-500 transition-colors">
                {translate('track_orders')}
              </button>

              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-[#11a95e] hover:text-emerald-400 transition-colors">
                    {translate('profile')}
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left text-gray-400 hover:text-red-500 transition-colors">
                    {translate('logout')}
                  </button>
                </>
              ) : (
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="text-left text-[#11a95e] hover:text-emerald-400 transition-colors block">
                  {translate('login')}
                </Link>
              )}
              
              <button onClick={() => { handleAdminLogin(); setIsMobileMenuOpen(false); }} className="text-left text-gray-400 mt-auto pt-6 border-t border-gray-100 hover:text-[#111] transition-colors">
                {translate('admin')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* АУТЕНТИФИКАЦИЯ */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} translate={translate} />
      )}

      {/* МОНИТОРИНГ ЗАКАЗОВ */}
      <TrackerModal 
        isOpen={showTracker}
        onClose={() => setShowTracker(false)}
        userOrders={userOrders}
        userEmail={user?.email || ''} 
        trackingLoading={trackingLoading}
        translate={translate}
        getStatusStyle={getStatusStyle}
        onRate={(orderId, serviceId) => {
          setReviewModal({ orderId, serviceId });
          setShowTracker(false);
        }}
      />

      {/* ОСТАВИТЬ ОТЗЫВ (РАСШИРЕННЫЙ) */}
      <ReviewModal 
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        translate={translate}
        ratingQuality={ratingQuality} setRatingQuality={setRatingQuality}
        ratingPunctuality={ratingPunctuality} setRatingPunctuality={setRatingPunctuality}
        ratingPrice={ratingPrice} setRatingPrice={setRatingPrice}
        reviewText={reviewText} setReviewText={setReviewText}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
      />

      {/* МОДАЛКА: ОТКЛИКНУТЬСЯ НА ЗАДАНИЕ */}
      <ApplyModal 
        isOpen={!!applyModal}
        onClose={() => setApplyModal(null)}
        message={applyMessage}
        setMessage={setApplyMessage}
        onSubmit={handleApplyToTask}
        translate={translate}  
      />

      {/* ОКНО УПРАВЛЕНИЯ ЗАДАНИЯМИ */}
      <MyTasksModal 
        isOpen={showMyTasksModal}
        onClose={() => setShowMyTasksModal(false)}
        userEmail={user?.email || ''}
      />

      {/* КНОПКА ВЫЗОВА ОКНА СОЗДАНИЯ ЗАДАНИЯ */}
      <CreateTaskModal 
        isOpen={showCreateTaskModal} 
        onClose={() => setShowCreateTaskModal(false)} 
        userEmail={user?.email || ''} 
        categories={categories} 
      />

      {/* ВСПЛЫВАЮЩЕЕ УВЕДОМЛЕНИЕ (TOAST) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[1000] bg-white border-l-4 border-[#11a95e] shadow-2xl rounded-r-2xl p-4 w-[320px] md:w-[380px] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <button onClick={() => setToast(null)} className="absolute top-2 right-3 text-xl text-gray-400 hover:text-gray-600 transition-colors">×</button>
          <h4 className="font-black text-[15px] text-[#111] mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#11a95e] animate-pulse shadow-[0_0_8px_rgba(17,169,94,0.6)]"></span>
            {toast.title}
          </h4>
          <p className="text-[13px] text-gray-500 font-medium leading-snug pr-4">
            {toast.message}
          </p>
        </div>
      )}

    </div>
  );
}