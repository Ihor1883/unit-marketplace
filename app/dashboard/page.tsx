"use client";

import React, { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import Chat from '../components/Chat';

export default function AdminDashboard() {
  const router = useRouter();

  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);
  
  // Язык интерфейса самой админки (подхватывается из локальной памяти браузера)
  const [uiLang, setUiLang] = useState('EN'); 

  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [adImg, setAdImg] = useState('');
  const [adLink, setAdLink] = useState('');
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [currency, setCurrency] = useState('PLN');

  // Локальные переводы для админ-панели
  const t: Record<string, any> = {
    RU: {
      back: "Вернуться на сайт →", pay_title: "Прием платежей (Stripe)",
      pay_on: "Платежная система включена. Пользователи оплачивают заказ картой.",
      pay_off: "Тестовый режим. Пользователи создают заказы бесплатно.",
      btn_off: "ВЫКЛЮЧИТЬ ОПЛАТУ", btn_on: "АКТИВИРОВАТЬ ОПЛАТУ", processing: "ОБРАБОТКА...",
      ads_title: "Рекламные баннеры", ads_desc: "Управляйте рекламой на главной странице.",
      img_url: "URL картинки (https://...)", link_url: "Ссылка для перехода (https://...)",
      add: "Добавить", delete: "Удалить", no_ads: "Рекламных баннеров пока нет.",
      tot_serv: "Всего услуг", tot_ord: "Всего заказов", mod_req: "Требует модерации",
      forgive: "Простить", ban_acc: "Заблокировать аккаунт", ord_mgmt: "Управление заказами",
      th_id: "ID / Дата", th_serv: "Услуга / Продавец", th_buyer: "Покупатель", th_status: "Статус", th_act: "Действие",
      no_ord: "Заказов пока нет", chat: "Чат", card_mgmt: "Управление визитками",
      th_photo: "Фото", th_name: "Название", th_seller: "Продавец", th_manage: "Управление",
      top_add: "🚀 В ТОП", top_rem: "⭐ Снять", users: "Пользователи", blocked: "Заблокирован"
    },
    EN: {
      back: "Back to site →", pay_title: "Stripe Payments",
      pay_on: "Payments enabled. Users pay by card.",
      pay_off: "Test mode. Users create orders for free.",
      btn_off: "DISABLE PAYMENTS", btn_on: "ACTIVATE PAYMENTS", processing: "PROCESSING...",
      ads_title: "Ad Banners", ads_desc: "Manage ads on the main page.",
      img_url: "Image URL (https://...)", link_url: "Redirect Link (https://...)",
      add: "Add", delete: "Delete", no_ads: "No ad banners yet.",
      tot_serv: "Total Services", tot_ord: "Total Orders", mod_req: "Requires Moderation",
      forgive: "Forgive", ban_acc: "Ban Account", ord_mgmt: "Order Management",
      th_id: "ID / Date", th_serv: "Service / Seller", th_buyer: "Buyer", th_status: "Status", th_act: "Action",
      no_ord: "No orders yet", chat: "Chat", card_mgmt: "Service Management",
      th_photo: "Photo", th_name: "Title", th_seller: "Seller", th_manage: "Manage",
      top_add: "🚀 To TOP", top_rem: "⭐ Remove", users: "Users", blocked: "Banned"
    },
    PL: {
      back: "Powrót do strony →", pay_title: "Płatności Stripe",
      pay_on: "Płatności włączone. Użytkownicy płacą kartą.",
      pay_off: "Tryb testowy. Użytkownicy tworzą zamówienia za darmo.",
      btn_off: "WYŁĄCZ PŁATNOŚCI", btn_on: "AKTYWUJ PŁATNOŚCI", processing: "PRZETWARZANIE...",
      ads_title: "Banery reklamowe", ads_desc: "Zarządzaj reklamami na stronie głównej.",
      img_url: "URL obrazka (https://...)", link_url: "Link (https://...)",
      add: "Dodaj", delete: "Usuń", no_ads: "Brak banerów reklamowych.",
      tot_serv: "Wszystkie usługi", tot_ord: "Wszystkie zamówienia", mod_req: "Wymaga moderacji",
      forgive: "Wybacz", ban_acc: "Zablokuj konto", ord_mgmt: "Zarządzanie zamówieniami",
      th_id: "ID / Data", th_serv: "Usługa / Sprzedawca", th_buyer: "Kupujący", th_status: "Status", th_act: "Akcja",
      no_ord: "Brak zamówień", chat: "Czat", card_mgmt: "Zarządzanie wizytówkami",
      th_photo: "Zdjęcie", th_name: "Tytuł", th_seller: "Sprzedawca", th_manage: "Zarządzanie",
      top_add: "🚀 Do TOP", top_rem: "⭐ Usuń", users: "Użytkownicy", blocked: "Zablokowany"
    },
    DE: {
      back: "Zurück zur Seite →", pay_title: "Stripe-Zahlungen",
      pay_on: "Zahlungen aktiviert.", pay_off: "Testmodus. Kostenlos.",
      btn_off: "DEAKTIVIEREN", btn_on: "AKTIVIEREN", processing: "VERARBEITUNG...",
      ads_title: "Werbebanner", ads_desc: "Verwalten Sie Anzeigen.",
      img_url: "Bild-URL", link_url: "Weiterleitungslink",
      add: "Hinzufügen", delete: "Löschen", no_ads: "Noch keine Banner.",
      tot_serv: "Alle Dienste", tot_ord: "Alle Bestellungen", mod_req: "Erfordert Moderation",
      forgive: "Vergeben", ban_acc: "Konto sperren", ord_mgmt: "Bestellverwaltung",
      th_id: "ID / Datum", th_serv: "Dienst / Verkäufer", th_buyer: "Käufer", th_status: "Status", th_act: "Aktion",
      no_ord: "Keine Bestellungen", chat: "Chat", card_mgmt: "Dienstverwaltung",
      th_photo: "Foto", th_name: "Titel", th_seller: "Verkäufer", th_manage: "Verwalten",
      top_add: "🚀 Zu TOP", top_rem: "⭐ Entfernen", users: "Benutzer", blocked: "Gesperrt"
    },
    ES: {
      back: "Volver al sitio →", pay_title: "Pagos de Stripe",
      pay_on: "Pagos activados.", pay_off: "Modo de prueba. Gratis.",
      btn_off: "DESACTIVAR", btn_on: "ACTIVAR", processing: "PROCESANDO...",
      ads_title: "Banners de anuncios", ads_desc: "Administrar anuncios.",
      img_url: "URL de la imagen", link_url: "Enlace",
      add: "Agregar", delete: "Eliminar", no_ads: "Aún no hay anuncios.",
      tot_serv: "Servicios totales", tot_ord: "Pedidos totales", mod_req: "Requiere moderación",
      forgive: "Perdonar", ban_acc: "Prohibir cuenta", ord_mgmt: "Gestión de pedidos",
      th_id: "ID / Fecha", th_serv: "Servicio / Vendedor", th_buyer: "Comprador", th_status: "Estado", th_act: "Acción",
      no_ord: "Aún no hay pedidos", chat: "Chat", card_mgmt: "Gestión de servicios",
      th_photo: "Foto", th_name: "Título", th_seller: "Vendedor", th_manage: "Administrar",
      top_add: "🚀 A TOP", top_rem: "⭐ Quitar", users: "Usuarios", blocked: "Baneado"
    },
    IT: {
      back: "Torna al sito →", pay_title: "Pagamenti Stripe",
      pay_on: "Pagamenti attivati.", pay_off: "Modalità test. Gratis.",
      btn_off: "DISATTIVA", btn_on: "ATTIVA", processing: "ELABORAZIONE...",
      ads_title: "Banner pubblicitari", ads_desc: "Gestisci annunci.",
      img_url: "URL immagine", link_url: "Link",
      add: "Aggiungi", delete: "Elimina", no_ads: "Nessun annuncio ancora.",
      tot_serv: "Servizi totali", tot_ord: "Ordini totali", mod_req: "Richiede moderazione",
      forgive: "Perdona", ban_acc: "Banna account", ord_mgmt: "Gestione ordini",
      th_id: "ID / Data", th_serv: "Servizio / Venditore", th_buyer: "Acquirente", th_status: "Stato", th_act: "Azione",
      no_ord: "Nessun ordine", chat: "Chat", card_mgmt: "Gestione servizi",
      th_photo: "Foto", th_name: "Titolo", th_seller: "Venditore", th_manage: "Gestisci",
      top_add: "🚀 A TOP", top_rem: "⭐ Rimuovi", users: "Utenti", blocked: "Bannato"
    },
    FR: {
      back: "Retour au site →", pay_title: "Paiements Stripe",
      pay_on: "Paiements activés.", pay_off: "Mode test. Gratuit.",
      btn_off: "DÉSACTIVER", btn_on: "ACTIVER", processing: "TRAITEMENT...",
      ads_title: "Bannières publicitaires", ads_desc: "Gérer les annonces.",
      img_url: "URL de l'image", link_url: "Lien",
      add: "Ajouter", delete: "Supprimer", no_ads: "Pas encore d'annonces.",
      tot_serv: "Services totaux", tot_ord: "Commandes totales", mod_req: "Nécessite modération",
      forgive: "Pardonner", ban_acc: "Bannir le compte", ord_mgmt: "Gestion des commandes",
      th_id: "ID / Date", th_serv: "Service / Vendeur", th_buyer: "Acheteur", th_status: "Statut", th_act: "Action",
      no_ord: "Aucune commande", chat: "Chat", card_mgmt: "Gestion des services",
      th_photo: "Foto", th_name: "Titre", th_seller: "Vendeur", th_manage: "Gérer",
      top_add: "🚀 À TOP", top_rem: "⭐ Retirer", users: "Utilisateurs", blocked: "Banni"
    }
  };

  const translate = (key: string) => (t[uiLang] && t[uiLang][key]) ? t[uiLang][key] : t['EN'][key] || key;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoadingData(true);
      
      // Автоматическое применение языка админки из памяти
      const savedLang = localStorage.getItem('unit_lang') || 'EN';
      if (isMounted) setUiLang(savedLang);

      const savedCurrency = localStorage.getItem('unit_currency') || 'PLN';
      if (isMounted) setCurrency(savedCurrency);

      const [settingsRes, ordersRes, servicesRes, profilesRes, violationsRes, adsRes] = await Promise.all([
        supabase.from('settings').select('*'),
        supabase.from('orders').select('*, services(title, seller_email)').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('violations').select('*').eq('is_reviewed', false).order('created_at', { ascending: false }),
        supabase.from('ads').select('*')
      ]);

      if (isMounted) {
        if (settingsRes.data) {
          const paymentSetting = settingsRes.data.find(s => s.key === 'payment_enabled');
          if (paymentSetting) setPaymentEnabled(paymentSetting.value === 'true');
        }

        if (ordersRes.data) setAllOrders(ordersRes.data);
        if (servicesRes.data) setAllServices(servicesRes.data);
        if (profilesRes.data) setProfiles(profilesRes.data);
        if (violationsRes.data) setViolations(violationsRes.data);
        if (adsRes.data) setAds(adsRes.data);
        
        setLoadingData(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  const togglePayment = async () => {
    setLoadingToggle(true);
    const newValue = !paymentEnabled;
    const { error } = await supabase.from('settings').upsert({ key: 'payment_enabled', value: String(newValue) });
    if (!error) setPaymentEnabled(newValue);
    setLoadingToggle(false);
  };

  const handleAddAd = async () => {
    if (!adImg || !adLink) return;
    const { data, error } = await supabase.from('ads').insert([{ image_url: adImg, link: adLink }]).select();
    if (!error && data) {
      setAds([...ads, ...data]);
      setAdImg(''); setAdLink('');
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (!error) setAds(ads.filter(a => a.id !== id));
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) setAllOrders(allOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const deleteServiceAdmin = async (id: string) => {
    if (!confirm("Удалить услугу?")) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) {
      setAllServices(allServices.filter(s => s.id !== id));
      alert("Услуга удалена!");
    } else {
      alert("Ошибка удаления услуги: " + error.message);
    }
  };

  const toggleTopStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('services').update({ is_top: newStatus }).eq('id', id);
    if (!error) {
      setAllServices(allServices.map(s => s.id === id ? { ...s, is_top: newStatus } : s));
      alert(newStatus ? "Добавлено в ТОП!" : "Убрано из ТОПа!");
    } else {
      alert("Ошибка добавления в ТОП: " + error.message);
    }
  };

  const handleBanUser = async (userId: string, userEmail: string, violationId?: string) => {
    if (!confirm(`Заблокировать аккаунт ${userEmail}?`)) return;
    const { error } = await supabase.from('profiles').update({ is_banned: true }).eq('id', userId);
    if (!error) {
      if (violationId) {
        await supabase.from('violations').update({ is_reviewed: true }).eq('id', violationId);
        setViolations(violations.filter(v => v.id !== violationId));
      }
      setProfiles(profiles.map(p => p.id === userId ? { ...p, is_banned: true } : p));
      alert("Пользователь успешно заблокирован!");
    } else {
      alert("Ошибка при бане пользователя: " + error.message);
    }
  };

  const handleUnbanUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Разблокировать аккаунт ${userEmail}?`)) return;
    const { error } = await supabase.from('profiles').update({ is_banned: false }).eq('id', userId);
    if (!error) {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, is_banned: false } : p));
      alert("Пользователь разблокирован!");
    } else {
      alert("Ошибка при разблокировке: " + error.message);
    }
  };

  const handleDismissViolation = async (violationId: string) => {
    const { error } = await supabase.from('violations').update({ is_reviewed: true }).eq('id', violationId);
    if (!error) setViolations(violations.filter(v => v.id !== violationId));
  };

  const displayPrice = (price: number) => {
    if (currency === 'USD') return `${(price * 0.25).toFixed(0)} $`;
    if (currency === 'EUR') return `${(price * 0.23).toFixed(0)} €`;
    return `${price} PLN`; 
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'New': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Process': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Done': 
      case 'Completed': return 'bg-[#11a95e] text-white border border-[#0f9653] shadow-sm'; 
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#333] pb-20">
      
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-4 h-[64px] flex items-center justify-between">
          <div className="text-[24px] font-black tracking-tighter flex items-center gap-2">
            <span>UNIT<span className="text-[#11a95e]">.</span></span>
            <span className="text-[10px] uppercase tracking-widest font-black text-white bg-gray-800 px-2.5 py-0.5 rounded-md hidden sm:block shadow-sm">
              Admin Panel
            </span>
          </div>
          <button onClick={() => router.push('/')} className="text-[13px] font-bold text-gray-500 hover:text-orange-500 transition-colors flex items-center gap-2">
            {translate('back')}
          </button>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-4 py-6">
        
        {/* ПАНЕЛЬ УПРАВЛЕНИЯ ПЛАТЕЖАМИ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col relative z-10 w-full md:w-auto text-center md:text-left">
            <h2 className="text-[20px] font-black text-[#111] mb-1">{translate('pay_title')}</h2>
            <p className="text-[14px] text-gray-500 font-medium max-w-md">
              {paymentEnabled ? translate('pay_on') : translate('pay_off')}
            </p>
          </div>
          
          <button 
            onClick={togglePayment} 
            disabled={loadingToggle} 
            className={`relative z-10 w-full md:w-auto shrink-0 px-8 py-3.5 rounded-xl font-black text-[13px] tracking-wide uppercase transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer ${
              paymentEnabled 
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' 
                : 'bg-gradient-to-r from-[#11a95e] to-emerald-500 text-white'
            }`}
          >
            {loadingToggle ? translate('processing') : (paymentEnabled ? translate('btn_off') : translate('btn_on'))}
          </button>
        </div>

        {/* УПРАВЛЕНИЕ РЕКЛАМОЙ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-[18px] font-black text-[#111] mb-1">{translate('ads_title')}</h2>
          <p className="text-[13px] text-gray-400 font-medium mb-4">{translate('ads_desc')}</p>
          
          <div className="flex flex-col md:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <input 
              type="text" 
              placeholder={translate('img_url')}
              value={adImg}
              onChange={e => setAdImg(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-[13px] outline-none focus:border-[#11a95e]"
            />
            <input 
              type="text" 
              placeholder={translate('link_url')}
              value={adLink}
              onChange={e => setAdLink(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-[13px] outline-none focus:border-[#11a95e]"
            />
            <button 
              onClick={handleAddAd}
              className="bg-[#11a95e] text-white px-6 py-2 rounded-lg font-black text-[12px] uppercase tracking-wider shrink-0 cursor-pointer"
            >
              {translate('add')}
            </button>
          </div>

          {ads.length > 0 ? (
            <div className="space-y-3">
              {ads.map(ad => (
                <div key={ad.id} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={ad.image_url} alt="Banner" className="w-24 h-12 object-cover rounded-md bg-gray-100 shrink-0" />
                    <div className="truncate min-w-0">
                      <a href={ad.link} target="_blank" rel="noreferrer" className="text-[13px] text-blue-500 font-medium hover:underline truncate block">
                        {ad.link}
                      </a>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAd(ad.id)} className="ml-4 shrink-0 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer">
                    {translate('delete')}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-gray-400 italic">{translate('no_ads')}</p>
          )}
        </div>

        {/* СТАТИСТИКА */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl border border-orange-500/10 px-6 py-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-black text-orange-600/70 uppercase tracking-widest mb-1">{translate('tot_serv')}</p>
              <h3 className="text-[36px] font-black text-[#111] leading-none tracking-tight">{loadingData ? '...' : allServices.length}</h3>
            </div>
            <div className="text-[40px] opacity-20 filter grayscale transform hover:scale-110 transition-transform">📁</div>
          </div>
          <div className="bg-gradient-to-br from-[#11a95e]/5 to-transparent rounded-2xl border border-[#11a95e]/10 px-6 py-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-black text-[#11a95e]/70 uppercase tracking-widest mb-1">{translate('tot_ord')}</p>
              <h3 className="text-[36px] font-black text-[#111] leading-none tracking-tight">{loadingData ? '...' : allOrders.length}</h3>
            </div>
            <div className="text-[40px] opacity-20 filter grayscale transform hover:scale-110 transition-transform">🛒</div>
          </div>
        </div>

        {/* ЖАЛОБЫ И МОДЕРАЦИЯ */}
        {violations.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-white rounded-2xl shadow-sm border border-red-200 p-6 mb-6">
            <h2 className="text-[18px] font-black text-red-600 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              {translate('mod_req')} ({violations.length})
            </h2>
            <div className="space-y-3">
              {violations.map(v => (
                <div key={v.id} className="bg-white border border-red-100 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4 items-start md:items-center shadow-sm">
                  <div>
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 bg-red-100 w-fit px-2 py-0.5 rounded">{v.reason}</div>
                    <div className="font-bold text-[#111] mb-1.5">{v.user_email}</div>
                    <div className="text-[13px] text-gray-700 italic bg-gray-50 p-3 rounded-lg border border-gray-100">"{v.message}"</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleDismissViolation(v.id)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-[12px] font-bold cursor-pointer hover:bg-gray-200">
                      {translate('forgive')}
                    </button>
                    <button onClick={() => handleBanUser(v.user_id, v.user_email, v.id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-lg text-[12px] font-bold cursor-pointer">
                      {translate('ban_acc')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ТАБЛИЦА ЗАКАЗОВ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-[15px] text-[#111]">{translate('ord_mgmt')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                  <th className="p-4 pl-6">{translate('th_id')}</th>
                  <th className="p-4">{translate('th_serv')}</th>
                  <th className="p-4">{translate('th_buyer')}</th>
                  <th className="p-4 text-center">{translate('th_status')}</th>
                  <th className="p-4 pr-6 text-right">{translate('th_act')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[13px] font-medium">
                {allOrders.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-medium">{translate('no_ord')}</td></tr>
                ) : (
                  allOrders.map(order => (
                    <Fragment key={order.id}>
                      <tr className="hover:bg-gray-50/30 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-mono text-[11px] font-bold text-gray-400 mb-0.5">{order.id.split('-')[0]}</div>
                          <div className="text-gray-400 text-[12px] font-medium">{new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#111] mb-0.5">{order.services?.title}</div>
                          <div className="text-[11px] text-gray-400 font-medium">{order.services?.seller_email || '-'}</div>
                        </td>
                        <td className="p-4 text-gray-600 truncate max-w-[150px]">{order.client_email}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider inline-block ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button 
                              onClick={() => setOpenChatId(openChatId === order.id ? null : order.id)}
                              className={`text-[11px] font-bold rounded-xl px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer ${openChatId === order.id ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
                            >
                              {translate('chat')} {openChatId === order.id ? '▲' : '▼'}
                            </button>
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="bg-white border border-gray-200 text-gray-700 text-[12px] font-bold rounded-xl px-2.5 py-1.5 outline-none focus:border-orange-400 w-[100px] cursor-pointer shadow-sm"
                            >
                              <option value="New">New</option>
                              <option value="Process">Process</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      {openChatId === order.id && (
                        <tr>
                          <td colSpan={5} className="p-0 border-b border-gray-100 bg-gray-50/50">
                            <div className="p-4">
                              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-w-4xl mx-auto">
                                <Chat orderId={order.id} userEmail="Admin" lang={uiLang} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* УПРАВЛЕНИЕ КАРТОЧКАМИ И ПОЛЬЗОВАТЕЛЯМИ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          
          <div className="lg:col-span-2 xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="font-black text-[15px] text-[#111]">{translate('card_mgmt')}</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="p-4 pl-6">{translate('th_photo')}</th>
                    <th className="p-4">{translate('th_name')}</th>
                    <th className="p-4">{translate('th_seller')}</th>
                    <th className="p-4 pr-6 text-right">{translate('th_manage')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[13px] font-medium">
                  {allServices.map(service => (
                    <tr key={service.id} className={`hover:bg-gray-50/30 transition-colors ${service.is_top ? 'bg-orange-50/20' : ''}`}>
                      <td className="p-4 pl-6 w-16">
                        {service.image_url ? (
                          <img src={service.image_url} alt="Cover" className="w-10 h-10 object-cover rounded-xl shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-50 rounded-xl border flex items-center justify-center opacity-40">📸</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#111] max-w-[200px] truncate mb-1">{service.title}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-orange-500 text-[12px]">{displayPrice(service.price)}</span>
                          {service.is_top && <span className="text-[8px] font-black text-white uppercase bg-orange-400 px-1.5 py-0.5 rounded">ТОП</span>}
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 truncate max-w-[120px]">{service.seller_email}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => toggleTopStatus(service.id, service.is_top)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-50 cursor-pointer hover:bg-gray-100">
                            {service.is_top ? translate('top_rem') : translate('top_add')}
                          </button>
                          <button onClick={() => deleteServiceAdmin(service.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer hover:bg-red-100">
                            {translate('delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1 xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[600px]">
             <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <h3 className="font-black text-[15px] text-[#111]">{translate('users')}</h3>
                <span className="bg-white border text-gray-600 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">{profiles.length}</span>
             </div>
             <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {profiles.map(p => {
                  const displayName = p.full_name || p.email || 'Аноним';
                  return (
                    <div key={p.id} className={`flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-gray-50 ${p.is_banned ? 'bg-red-50/30' : ''}`}>
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[12px] font-black text-gray-600 shrink-0">
                        {displayName[0].toUpperCase()}
                      </div>
                      <div className="text-[12px] font-bold text-gray-700 flex-1 min-w-0">
                        <div className="truncate text-[#111]">{displayName}</div>
                        {p.is_banned ? (
                          <span className="text-red-500 text-[9px] uppercase font-black">{translate('blocked')}</span>
                        ) : (
                          <span className="text-gray-400 text-[10px] block truncate">{p.email}</span>
                        )}
                      </div>
                      <div className="shrink-0">
                        {p.is_banned ? (
                          <button onClick={() => handleUnbanUser(p.id, displayName)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-green-200 text-green-600 cursor-pointer shadow-sm hover:bg-green-50 transition-colors">✓</button>
                        ) : (
                          <button onClick={() => handleBanUser(p.id, displayName)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border text-gray-400 hover:text-red-500 cursor-pointer shadow-sm hover:bg-red-50 transition-colors">✕</button>
                        )}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}