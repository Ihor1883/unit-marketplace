"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import Chat from '../components/Chat';

export default function ProfilePage() {
  const router = useRouter();
  
  // Состояния пользователя и загрузки
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'settings'>('services');
  
  // Состояния для услуг и заказов
  const [myServices, setMyServices] = useState<any[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null);

  // Состояния для ПРОФИЛЯ (Новое)
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [contacts, setContacts] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Настройки локализации
  const [lang, setLang] = useState('RU');
  const [currency, setCurrency] = useState('PLN');

  // Modal State (Добавление/редактирование услуг)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ 
    title: '', price: 0, description: '', category: 'DESIGN', image_url: '' 
  });
  
  // Состояния для загрузки файла
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- СЛОВАРЬ (7 ЯЗЫКОВ) ---
  const t: Record<string, any> = {
    RU: {
      auth_req: "Пожалуйста, войдите в аккаунт на главной странице.", loading: "Загрузка профиля...", cabinet: "/ Кабинет продавца", to_main: "На главную", services_count: "Услуг:", orders_process: "Заказов в работе:", orders_done: "Завершено:", add_service: "+ Добавить услугу", tab_services: "Мои услуги", tab_orders: "Входящие заказы", tab_settings: "Настройки профиля", no_services: "У вас пока нет активных услуг.", create_first: "Создать первую услугу", edit: "Изменить", delete: "Удалить", delete_confirm: "Удалить услугу навсегда?", no_orders: "Пока нет входящих заказов.", th_service: "Услуга / Дата", th_client: "Заказчик", th_price: "Цена", th_status: "Статус", th_action: "Действие", service_deleted: "Услуга удалена", btn_to_work: "В работу", btn_deliver: "Сдать заказ", btn_completed: "Завершено", modal_edit: "Редактировать услугу", modal_new: "Новая услуга", label_title: "Название услуги *", ph_title: "Сделаю крутой дизайн логотипа...", label_cat: "Рубрика *", label_price: "Цена *", ph_price: "500", label_desc: "Описание *", ph_desc: "Подробно опишите, что входит в вашу услугу...", label_url: "Обложка (URL картинки)", ph_url: "https://example.com/image.jpg", or: "— или —", label_upload: "Загрузить фото с устройства", file_selected: "✓ Выбран файл:", click_to_upload: "📁 Нажмите, чтобы выбрать файл", saving: "Сохранение...", save_changes: "Сохранить изменения", publish: "Опубликовать услугу", fill_required: "Заполните все обязательные поля!", save_error: "Ошибка при сохранении: ", cat_design: "Дизайн", cat_dev: "Разработка и IT", cat_text: "Тексты и переводы", cat_seo: "SEO и трафик", cat_social: "Соцсети и маркетинг", cat_audio: "Аудио, видео, съемка", cat_bus: "Бизнес и жизнь", btn_chat: "Чат", label_name: "Имя / Никнейм", label_bio: "О себе", label_contacts: "Контакты (Telegram / WhatsApp)", save_profile: "Сохранить профиль", profile_saved: "Ваш профиль успешно обновлен!"
    },
    EN: {
      auth_req: "Please log in on the main page.", loading: "Loading profile...", cabinet: "/ Seller Dashboard", to_main: "To Home", services_count: "Services:", orders_process: "Orders in process:", orders_done: "Completed:", add_service: "+ Add Service", tab_services: "My Services", tab_orders: "Incoming Orders", tab_settings: "Profile Settings", no_services: "You have no active services yet.", create_first: "Create first service", edit: "Edit", delete: "Delete", delete_confirm: "Delete this service permanently?", no_orders: "No incoming orders yet.", th_service: "Service / Date", th_client: "Client", th_price: "Price", th_status: "Status", th_action: "Action", service_deleted: "Service deleted", btn_to_work: "Start work", btn_deliver: "Deliver order", btn_completed: "Completed", modal_edit: "Edit Service", modal_new: "New Service", label_title: "Service Title *", ph_title: "I will design an awesome logo...", label_cat: "Category *", label_price: "Price *", ph_price: "500", label_desc: "Description *", ph_desc: "Describe in detail what is included...", label_url: "Cover (Image URL)", ph_url: "https://example.com/image.jpg", or: "— or —", label_upload: "Upload photo from device", file_selected: "✓ File selected:", click_to_upload: "📁 Click to select a file", saving: "Saving...", save_changes: "Save changes", publish: "Publish service", fill_required: "Fill in all required fields!", save_error: "Error saving: ", cat_design: "Design", cat_dev: "Development & IT", cat_text: "Texts & Translation", cat_seo: "SEO & Traffic", cat_social: "Social Media", cat_audio: "Audio & Video", cat_bus: "Business & Life", btn_chat: "Chat", label_name: "Name / Nickname", label_bio: "About me", label_contacts: "Contacts (Telegram / WhatsApp)", save_profile: "Save Profile", profile_saved: "Profile successfully updated!"
    },
    PL: {
      auth_req: "Proszę zalogować się na stronie głównej.", loading: "Ładowanie profilu...", cabinet: "/ Panel Sprzedawcy", to_main: "Na główną", services_count: "Usługi:", orders_process: "W realizacji:", orders_done: "Zakończone:", add_service: "+ Dodaj Usługę", tab_services: "Moje Usługi", tab_orders: "Otrzymane Zamówienia", tab_settings: "Ustawienia profilu", no_services: "Nie masz jeszcze aktywnych usług.", create_first: "Utwórz pierwszą usługę", edit: "Edytuj", delete: "Usuń", delete_confirm: "Trwale usunąć tę usługę?", no_orders: "Brak otrzymanych zamówień.", th_service: "Usługa / Data", th_client: "Klient", th_price: "Cena", th_status: "Status", th_action: "Akcja", service_deleted: "Usługa usunięta", btn_to_work: "Do realizacji", btn_deliver: "Dostarcz", btn_completed: "Zakończono", modal_edit: "Edytuj Usługę", modal_new: "Nowa Usługa", label_title: "Tytuł usługi *", ph_title: "Zaprojektuję świetne logo...", label_cat: "Kategoria *", label_price: "Cena *", ph_price: "500", label_desc: "Opis *", ph_desc: "Opisz szczegółowo, co zawiera usługa...", label_url: "Okładka (URL obrazka)", ph_url: "https://example.com/image.jpg", or: "— lub —", label_upload: "Prześlij zdjęcie z urządzenia", file_selected: "✓ Wybrano plik:", click_to_upload: "📁 Kliknij, aby wybrać plik", saving: "Zapisywanie...", save_changes: "Zapisz zmiany", publish: "Opublikuj usługę", fill_required: "Wypełnij wszystkie wymagane pola!", save_error: "Błąd podczas zapisywania: ", cat_design: "Design", cat_dev: "Programowanie i IT", cat_text: "Teksty i Tłumaczenia", cat_seo: "SEO i Ruch", cat_social: "Media Społecznościowe", cat_audio: "Audio i Wideo", cat_bus: "Biznes i Życie", btn_chat: "Czat", label_name: "Imię / Nick", label_bio: "O mnie", label_contacts: "Kontakty", save_profile: "Zapisz profil", profile_saved: "Profil pomyślnie zaktualizowany!"
    },
    DE: {
      auth_req: "Bitte loggen Sie sich ein.", loading: "Laden...", cabinet: "/ Dashboard", to_main: "Zur Startseite", services_count: "Dienste:", orders_process: "In Arbeit:", orders_done: "Abgeschlossen:", add_service: "+ Dienst hinzufügen", tab_services: "Meine Dienste", tab_orders: "Bestellungen", tab_settings: "Einstellungen", no_services: "Keine aktiven Dienste.", create_first: "Dienst erstellen", edit: "Bearbeiten", delete: "Löschen", delete_confirm: "Löschen?", no_orders: "Keine Bestellungen.", th_service: "Dienst", th_client: "Kunde", th_price: "Preis", th_status: "Status", th_action: "Aktion", btn_to_work: "In Arbeit", btn_deliver: "Liefern", btn_completed: "Fertig", modal_edit: "Bearbeiten", modal_new: "Neuer Dienst", label_title: "Titel *", ph_title: "Logo-Design...", label_cat: "Kategorie *", label_price: "Preis *", ph_price: "500", label_desc: "Beschreibung *", ph_desc: "Details...", label_url: "Cover (URL)", ph_url: "https://...", or: "— oder —", label_upload: "Foto hochladen", file_selected: "✓ Ausgewählt:", click_to_upload: "📁 Klicken", saving: "Speichern...", save_changes: "Speichern", publish: "Veröffentlichen", fill_required: "Pflichtfelder ausfüllen!", save_error: "Fehler: ", cat_design: "Design", cat_dev: "IT", cat_text: "Texte", cat_seo: "SEO", cat_social: "Social Media", cat_audio: "Audio/Video", cat_bus: "Business", btn_chat: "Chat", label_name: "Name", label_bio: "Über mich", label_contacts: "Kontakte", save_profile: "Profil speichern", profile_saved: "Profil aktualisiert!"
    },
    ES: {
      auth_req: "Inicie sesión.", loading: "Cargando...", cabinet: "/ Panel", to_main: "Inicio", services_count: "Servicios:", orders_process: "En proceso:", orders_done: "Completado:", add_service: "+ Agregar servicio", tab_services: "Mis servicios", tab_orders: "Pedidos", tab_settings: "Ajustes", no_services: "Sin servicios.", create_first: "Crear", edit: "Editar", delete: "Eliminar", delete_confirm: "¿Eliminar?", no_orders: "Sin pedidos.", th_service: "Servicio", th_client: "Cliente", th_price: "Precio", th_status: "Estado", th_action: "Acción", btn_to_work: "Trabajar", btn_deliver: "Entregar", btn_completed: "Terminado", modal_edit: "Editar", modal_new: "Nuevo servicio", label_title: "Título *", ph_title: "Logo...", label_cat: "Categoría *", label_price: "Precio *", ph_price: "500", label_desc: "Descripción *", ph_desc: "Detalles...", label_url: "Imagen (URL)", ph_url: "https://...", or: "— o —", label_upload: "Subir foto", file_selected: "✓ Archivo:", click_to_upload: "📁 Clic para subir", saving: "Guardando...", save_changes: "Guardar", publish: "Publicar", fill_required: "¡Campos obligatorios!", save_error: "Error: ", cat_design: "Diseño", cat_dev: "TI", cat_text: "Textos", cat_seo: "SEO", cat_social: "Redes", cat_audio: "Audio/Video", cat_bus: "Negocios", btn_chat: "Chat", label_name: "Nombre", label_bio: "Sobre mí", label_contacts: "Contactos", save_profile: "Guardar perfil", profile_saved: "¡Perfil actualizado!"
    },
    IT: {
      auth_req: "Accedi.", loading: "Caricamento...", cabinet: "/ Dashboard", to_main: "Home", services_count: "Servizi:", orders_process: "In corso:", orders_done: "Completato:", add_service: "+ Aggiungi", tab_services: "I miei servizi", tab_orders: "Ordini", tab_settings: "Impostazioni", no_services: "Nessun servizio.", create_first: "Crea", edit: "Modifica", delete: "Elimina", delete_confirm: "Eliminare?", no_orders: "Nessun ordine.", th_service: "Servizio", th_client: "Cliente", th_price: "Prezzo", th_status: "Stato", th_action: "Azione", btn_to_work: "Lavorare", btn_deliver: "Consegna", btn_completed: "Finito", modal_edit: "Modifica", modal_new: "Nuovo servizio", label_title: "Titolo *", ph_title: "Logo...", label_cat: "Categoria *", label_price: "Prezzo *", ph_price: "500", label_desc: "Descrizione *", ph_desc: "Dettagli...", label_url: "Immagine (URL)", ph_url: "https://...", or: "— o —", label_upload: "Carica foto", file_selected: "✓ File:", click_to_upload: "📁 Clicca per caricare", saving: "Salvataggio...", save_changes: "Salva", publish: "Pubblica", fill_required: "Campi obbligatori!", save_error: "Errore: ", cat_design: "Design", cat_dev: "IT", cat_text: "Testi", cat_seo: "SEO", cat_social: "Social", cat_audio: "Audio/Video", cat_bus: "Affari", btn_chat: "Chat", label_name: "Nome", label_bio: "Su di me", label_contacts: "Contatti", save_profile: "Salva profilo", profile_saved: "Profilo aggiornato!"
    },
    FR: {
      auth_req: "Connectez-vous.", loading: "Chargement...", cabinet: "/ Tableau de bord", to_main: "Accueil", services_count: "Services:", orders_process: "En cours:", orders_done: "Terminé:", add_service: "+ Ajouter", tab_services: "Mes services", tab_orders: "Commandes", tab_settings: "Paramètres", no_services: "Aucun service.", create_first: "Créer", edit: "Modifier", delete: "Supprimer", delete_confirm: "Supprimer?", no_orders: "Aucune commande.", th_service: "Service", th_client: "Client", th_price: "Prix", th_status: "Statut", th_action: "Action", btn_to_work: "Travailler", btn_deliver: "Livrer", btn_completed: "Terminé", modal_edit: "Modifier", modal_new: "Nouveau service", label_title: "Titre *", ph_title: "Logo...", label_cat: "Catégorie *", label_price: "Prix *", ph_price: "500", label_desc: "Description *", ph_desc: "Détails...", label_url: "Image (URL)", ph_url: "https://...", or: "— ou —", label_upload: "Télécharger", file_selected: "✓ Fichier:", click_to_upload: "📁 Cliquez pour télécharger", saving: "Enregistrement...", save_changes: "Enregistrer", publish: "Publier", fill_required: "Champs requis !", save_error: "Erreur : ", cat_design: "Design", cat_dev: "IT", cat_text: "Textes", cat_seo: "SEO", cat_social: "Social", cat_audio: "Audio/Vidéo", cat_bus: "Affaires", btn_chat: "Chat", label_name: "Nom", label_bio: "À propos de moi", label_contacts: "Contacts", save_profile: "Enregistrer le profil", profile_saved: "Profil mis à jour !"
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

  // Инициализация настроек
  useEffect(() => {
    let isMounted = true; 
    const initSettings = async () => {
      const savedLang = localStorage.getItem('unit_lang');
      if (savedLang && isMounted) setLang(savedLang);
      const savedCurrency = localStorage.getItem('unit_currency');
      if (savedCurrency && isMounted) setCurrency(savedCurrency);
    };
    initSettings();
    return () => { isMounted = false; };
  }, []);

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !session.user.email) {
        alert(translate('auth_req'));
        router.push('/');
        return;
      }
      setUser(session.user);
      fetchDashboardData(session.user); 
    }
    checkAuth();
  }, [router, lang]);

  const displayPrice = (price: number) => {
    if (currency === 'USD') return `${(price * 0.25).toFixed(0)} $`;
    if (currency === 'EUR') return `${(price * 0.23).toFixed(0)} €`;
    return `${price} PLN`; 
  };

  // Получение данных пользователя, услуг и заказов
  const fetchDashboardData = async (currentUser: any) => {
    setLoading(true);
    
    // 1. Подтягиваем профиль пользователя
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setContacts(profile.contacts || '');
    }

    // 2. Подтягиваем услуги
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('seller_email', currentUser.email)
      .order('created_at', { ascending: false });
      
    if (servicesData) {
      setMyServices(servicesData);
      
      // 3. Подтягиваем заказы
      if (servicesData.length > 0) {
        const serviceIds = servicesData.map(s => s.id);
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, services(title, price)')
          .in('service_id', serviceIds)
          .order('created_at', { ascending: false });
        if (ordersData) setIncomingOrders(ordersData);
      }
    }
    setLoading(false);
  };

  // --- ЛОГИКА ПРОФИЛЯ ---
  const saveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      bio: bio,
      contacts: contacts,
      updated_at: new Date()
    });

    if (error) {
      alert(translate('save_error') + error.message);
    } else {
      alert(translate('profile_saved'));
    }
    setSavingProfile(false);
  };

  // --- ЛОГИКА УСЛУГ ---
  const uploadImage = async (file: File) => {
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('services').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('services').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveService = async () => {
    if (!editForm.title || !editForm.price || !editForm.description) {
      alert(translate('fill_required'));
      return;
    }
    setIsUploading(true);
    try {
      let finalImageUrl = editForm.image_url;
      if (selectedFile) finalImageUrl = await uploadImage(selectedFile);
      const serviceData = {
        ...editForm,
        image_url: finalImageUrl,
        seller_email: user.email,
        seller_name: fullName || user.email.split('@')[0], // Используем имя профиля, если есть
        user_id: user.id // Привязка к конкретному пользователю
      };
      if (editingId) {
        await supabase.from('services').update(serviceData).eq('id', editingId);
        setMyServices(myServices.map(s => s.id === editingId ? { ...s, ...serviceData } : s));
      } else {
        const { data } = await supabase.from('services').insert([serviceData]).select();
        if (data) setMyServices([data[0], ...myServices]);
      }
      setShowModal(false);
      setSelectedFile(null);
    } catch (err: any) {
      alert(translate('save_error') + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm(translate('delete_confirm'))) return;
    await supabase.from('services').delete().eq('id', id);
    setMyServices(myServices.filter(s => s.id !== id));
  };

  const openNewServiceModal = () => {
    setEditingId(null);
    setEditForm({ title: '', price: 0, description: '', category: 'DESIGN', image_url: '' });
    setSelectedFile(null); 
    setShowModal(true);
  };

  const openEditModal = (service: any) => {
    setEditingId(service.id);
    setEditForm({ ...service });
    setSelectedFile(null); 
    setShowModal(true);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    setIncomingOrders(incomingOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'New': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Process': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Done': return 'bg-[#11a95e] text-white border border-[#0f9653]';
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">{translate('loading')}</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-4 h-[70px] flex items-center justify-between">
          <div className="text-[32px] font-black tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
            UNIT<span className="text-[#11a95e]">.</span> <span className="text-[14px] text-gray-400 hidden sm:inline-block">{translate('cabinet')}</span>
          </div>
          <button onClick={() => router.push('/')} className="text-[14px] font-bold text-gray-500 flex items-center gap-2">
            {translate('to_main')}
          </button>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-4 py-8">
        {/* PROFILE CARD */}
        <div className="bg-white rounded-[12px] p-6 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
           <div className="w-[100px] h-[100px] shrink-0 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-4xl text-[#11a95e] font-black shadow-inner">
             {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
           </div>
           <div className="flex-1 text-center md:text-left">
             <h1 className="text-[24px] font-extrabold">{fullName || user?.email?.split('@')[0]}</h1>
             <p className="text-gray-500 mb-4">{user?.email}</p>
             <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 text-[13px]">
                <div className="bg-gray-50 px-4 py-2 rounded-[8px] border border-gray-100">{translate('services_count')} <b>{myServices.length}</b></div>
                <div className="bg-gray-50 px-4 py-2 rounded-[8px] border border-gray-100">{translate('orders_process')} <b className="text-blue-600">{incomingOrders.filter(o => o.status === 'Process').length}</b></div>
                <div className="bg-gray-50 px-4 py-2 rounded-[8px] border border-gray-100">{translate('orders_done')} <b className="text-[#11a95e]">{incomingOrders.filter(o => o.status === 'Done').length}</b></div>
             </div>
           </div>
           <button onClick={openNewServiceModal} className="bg-[#11a95e] text-white px-6 py-3 rounded-[8px] font-bold shadow-md hover:bg-[#0e9552] transition-colors shrink-0">
             {translate('add_service')}
           </button>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
          <button onClick={() => setActiveTab('services')} className={`px-5 sm:px-6 py-3 font-bold whitespace-nowrap ${activeTab === 'services' ? 'border-b-2 border-[#11a95e] text-[#11a95e]' : 'text-gray-500 hover:text-gray-700'}`}>{translate('tab_services')}</button>
          <button onClick={() => setActiveTab('orders')} className={`px-5 sm:px-6 py-3 font-bold whitespace-nowrap ${activeTab === 'orders' ? 'border-b-2 border-[#11a95e] text-[#11a95e]' : 'text-gray-500 hover:text-gray-700'}`}>{translate('tab_orders')}</button>
          <button onClick={() => setActiveTab('settings')} className={`px-5 sm:px-6 py-3 font-bold whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-[#11a95e] text-[#11a95e]' : 'text-gray-500 hover:text-gray-700'}`}>{translate('tab_settings')}</button>
        </div>

        {/* Вкладка: НАСТРОЙКИ ПРОФИЛЯ */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-[12px] p-6 sm:p-8 shadow-sm border border-gray-100 max-w-3xl">
            <h2 className="text-[20px] font-extrabold mb-6 text-[#222] border-b border-gray-100 pb-4">{translate('tab_settings')}</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('label_name')}</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 text-[14px] focus:border-[#11a95e] focus:bg-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('label_contacts')}</label>
                  <input 
                    type="text" 
                    value={contacts}
                    onChange={(e) => setContacts(e.target.value)}
                    placeholder="@username / +..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 text-[14px] focus:border-[#11a95e] focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('label_bio')}</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 text-[14px] focus:border-[#11a95e] focus:bg-white outline-none transition-all h-[120px] resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="bg-[#11a95e] hover:bg-[#0e9552] text-white px-8 py-3.5 rounded-[10px] font-bold text-[14px] transition-all shadow-md shadow-emerald-200 disabled:bg-gray-300"
                >
                  {savingProfile ? translate('saving') : translate('save_profile')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Вкладка: МОИ УСЛУГИ */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myServices.length === 0 ? (
              <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-[12px] border border-dashed">
                {translate('no_services')}
              </div>
            ) : myServices.map(s => (
              <div key={s.id} className="bg-white rounded-[12px] p-5 shadow-sm border border-gray-100 flex flex-col hover:border-[#11a95e]/50 transition-colors">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{translate(categories.find(c => c.id === s.category)?.titleKey || s.category)}</div>
                {s.image_url && <img src={s.image_url} className="w-full h-36 object-cover rounded-[8px] mb-4" />}
                <h3 className="font-bold text-[15px] mb-2 h-11 line-clamp-2 leading-tight">{s.title}</h3>
                <div className="font-black text-[#11a95e] mb-5 text-[16px]">{displayPrice(s.price)}</div>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => openEditModal(s)} className="flex-1 py-2.5 bg-gray-50 border border-gray-200 rounded-[8px] font-bold text-[13px] hover:bg-gray-100">{translate('edit')}</button>
                  <button onClick={() => deleteService(s.id)} className="px-4 py-2.5 bg-red-50 text-red-500 rounded-[8px] font-bold text-[13px] hover:bg-red-100">{translate('delete')}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Вкладка: ЗАКАЗЫ */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-[12px] shadow-sm overflow-hidden border border-gray-100">
            {incomingOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium">
                {translate('no_orders')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="p-4">{translate('th_service')}</th>
                      <th className="p-4">{translate('th_status')}</th>
                      <th className="p-4 text-right">{translate('th_action')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px]">
                    {incomingOrders.map(o => (
                      <React.Fragment key={o.id}>
                        <tr className="border-b border-gray-50">
                          <td className="p-4">
                            <div className="font-bold text-[#222] mb-1">{o.services?.title}</div>
                            <div className="text-[12px] text-gray-400">{o.client_email}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wider ${getStatusStyle(o.status)}`}>{o.status}</span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button 
                              onClick={() => setOpenChatOrderId(openChatOrderId === o.id ? null : o.id)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-[6px] font-bold text-[12px] hover:bg-gray-200 transition-colors"
                            >
                              {translate('btn_chat')} {openChatOrderId === o.id ? '▲' : '▼'}
                            </button>
                            {o.status === 'New' && <button onClick={() => updateOrderStatus(o.id, 'Process')} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-[6px] font-bold text-[12px] hover:bg-blue-200 transition-colors">{translate('btn_to_work')}</button>}
                            {o.status === 'Process' && <button onClick={() => updateOrderStatus(o.id, 'Done')} className="px-3 py-1.5 bg-[#11a95e] hover:bg-[#0e9552] text-white rounded-[6px] font-bold text-[12px] transition-colors">{translate('btn_deliver')}</button>}
                          </td>
                        </tr>
                        {openChatOrderId === o.id && (
                          <tr>
                            <td colSpan={3} className="p-4 bg-gray-50 border-b border-gray-200">
                              <Chat orderId={o.id} userEmail={user.email} lang={lang} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ УСЛУГИ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[12px] p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-3xl text-gray-300 hover:text-red-500 transition-colors">×</button>
            <h2 className="text-[22px] font-extrabold mb-6 text-[#222]">{editingId ? translate('modal_edit') : translate('modal_new')}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{translate('label_title')}</label>
                <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-[8px] outline-none focus:border-[#11a95e] focus:bg-white transition-colors" placeholder={translate('ph_title')} value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{translate('label_cat')}</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-[8px] outline-none focus:border-[#11a95e] focus:bg-white transition-colors" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{translate(c.titleKey)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{translate('label_price')}</label>
                  <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-[8px] outline-none focus:border-[#11a95e] focus:bg-white transition-colors" type="number" placeholder={translate('ph_price')} value={editForm.price} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{translate('label_desc')}</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-[8px] h-32 outline-none resize-none focus:border-[#11a95e] focus:bg-white transition-colors" placeholder={translate('ph_desc')} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{translate('label_url')}</label>
                <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-[8px] outline-none focus:border-[#11a95e] focus:bg-white transition-colors" placeholder={translate('ph_url')} value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
              </div>
              
              <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 rounded-[12px] p-6 text-center group hover:border-[#11a95e]/50 hover:bg-emerald-50/30 transition-colors">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                <div className="text-[13px] text-gray-500 font-medium">
                  {selectedFile ? (
                    <span className="text-[#11a95e] font-bold">{translate('file_selected')} {selectedFile.name}</span>
                  ) : (
                    translate('click_to_upload')
                  )}
                </div>
              </div>
            </div>
            <button onClick={saveService} disabled={isUploading} className="w-full bg-[#11a95e] hover:bg-[#0e9552] text-white py-4 rounded-[10px] font-bold mt-8 shadow-md shadow-[#11a95e]/30 transition-all disabled:bg-gray-400">
              {isUploading ? translate('saving') : (editingId ? translate('save_changes') : translate('publish'))}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}