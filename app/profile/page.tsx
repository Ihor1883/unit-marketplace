"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Chat from '../components/Chat'; // ИМПОРТ КОМПОНЕНТА ЧАТА

const supabase = createClient(
  'https://bvkynrssmjwvflqefhcn.supabase.co', 
  'sb_publishable_tqAPmwHev9W5Z4rIbqtouA_oaCXi2KR'
);

export default function ProfilePage() {
  const router = useRouter();
  
  // States
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('services');
  
  const [myServices, setMyServices] = useState<any[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
  
  // СОСТОЯНИЕ ДЛЯ ОТКРЫТОГО ЧАТА
  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null);

  // Настройки локализации
  const [lang, setLang] = useState('RU');
  const [currency, setCurrency] = useState('PLN');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ 
    title: '', price: 0, description: '', category: 'DESIGN', image_url: '' 
  });
  
  // Состояния для загрузки файла
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- СЛОВАРЬ (Добавлен перевод для кнопки чата) ---
  const t: Record<string, any> = {
    RU: {
      auth_req: "Пожалуйста, войдите в аккаунт на главной странице.", loading: "Загрузка профиля...", cabinet: "/ Кабинет продавца", to_main: "На главную", services_count: "Услуг:", orders_process: "Заказов в работе:", orders_done: "Завершено:", add_service: "+ Добавить услугу", tab_services: "Мои услуги", tab_orders: "Входящие заказы", no_services: "У вас пока нет активных услуг.", create_first: "Создать первую услугу", edit: "Изменить", delete: "Удалить", delete_confirm: "Удалить услугу навсегда?", no_orders: "Пока нет входящих заказов.", th_service: "Услуга / Дата", th_client: "Заказчик", th_price: "Цена", th_status: "Статус", th_action: "Действие", service_deleted: "Услуга удалена", btn_to_work: "В работу", btn_deliver: "Сдать заказ", btn_completed: "Завершено", modal_edit: "Редактировать услугу", modal_new: "Новая услуга", label_title: "Название услуги *", ph_title: "Сделаю крутой дизайн логотипа...", label_cat: "Рубрика *", label_price: "Цена *", ph_price: "500", label_desc: "Описание *", ph_desc: "Подробно опишите, что входит в вашу услугу...", label_url: "Обложка (URL картинки)", ph_url: "https://example.com/image.jpg", or: "— или —", label_upload: "Загрузить фото с устройства", file_selected: "✓ Выбран файл:", click_to_upload: "📁 Нажмите, чтобы выбрать файл", saving: "Сохранение и загрузка файла...", save_changes: "Сохранить изменения", publish: "Опубликовать услугу", fill_required: "Заполните все обязательные поля!", save_error: "Ошибка при сохранении: ", cat_design: "Дизайн", cat_dev: "Разработка и IT", cat_text: "Тексты и переводы", cat_seo: "SEO и трафик", cat_social: "Соцсети и маркетинг", cat_audio: "Аудио, видео, съемка", cat_bus: "Бизнес и жизнь",
      btn_chat: "Чат"
    },
    EN: {
      auth_req: "Please log in on the main page.", loading: "Loading profile...", cabinet: "/ Seller Dashboard", to_main: "To Home", services_count: "Services:", orders_process: "Orders in process:", orders_done: "Completed:", add_service: "+ Add Service", tab_services: "My Services", tab_orders: "Incoming Orders", no_services: "You have no active services yet.", create_first: "Create first service", edit: "Edit", delete: "Delete", delete_confirm: "Delete this service permanently?", no_orders: "No incoming orders yet.", th_service: "Service / Date", th_client: "Client", th_price: "Price", th_status: "Status", th_action: "Action", service_deleted: "Service deleted", btn_to_work: "Start work", btn_deliver: "Deliver order", btn_completed: "Completed", modal_edit: "Edit Service", modal_new: "New Service", label_title: "Service Title *", ph_title: "I will design an awesome logo...", label_cat: "Category *", label_price: "Price *", ph_price: "500", label_desc: "Description *", ph_desc: "Describe in detail what is included...", label_url: "Cover (Image URL)", ph_url: "https://example.com/image.jpg", or: "— or —", label_upload: "Upload photo from device", file_selected: "✓ File selected:", click_to_upload: "📁 Click to select a file", saving: "Saving and uploading file...", save_changes: "Save changes", publish: "Publish service", fill_required: "Fill in all required fields!", save_error: "Error saving: ", cat_design: "Design", cat_dev: "Development & IT", cat_text: "Texts & Translation", cat_seo: "SEO & Traffic", cat_social: "Social Media", cat_audio: "Audio & Video", cat_bus: "Business & Life",
      btn_chat: "Chat"
    },
    PL: {
      auth_req: "Proszę zalogować się na stronie głównej.", loading: "Ładowanie profilu...", cabinet: "/ Panel Sprzedawcy", to_main: "Na główną", services_count: "Usługi:", orders_process: "W realizacji:", orders_done: "Zakończone:", add_service: "+ Dodaj Usługę", tab_services: "Moje Usługi", tab_orders: "Otrzymane Zamówienia", no_services: "Nie masz jeszcze aktywnych usług.", create_first: "Utwórz pierwszą usługę", edit: "Edytuj", delete: "Usuń", delete_confirm: "Trwale usunąć tę usługę?", no_orders: "Brak otrzymanych zamówień.", th_service: "Usługa / Data", th_client: "Klient", th_price: "Cena", th_status: "Status", th_action: "Akcja", service_deleted: "Usługa usunięta", btn_to_work: "Do realizacji", btn_deliver: "Dostarcz", btn_completed: "Zakończono", modal_edit: "Edytuj Usługę", modal_new: "Nowa Usługa", label_title: "Tytuł usługi *", ph_title: "Zaprojektuję świetne logo...", label_cat: "Kategoria *", label_price: "Cena *", ph_price: "500", label_desc: "Opis *", ph_desc: "Opisz szczegółowo, co zawiera usługa...", label_url: "Okładka (URL obrazka)", ph_url: "https://example.com/image.jpg", or: "— lub —", label_upload: "Prześlij zdjęcie z urządzenia", file_selected: "✓ Wybrano plik:", click_to_upload: "📁 Kliknij, aby wybrać plik", saving: "Zapisywanie i przesyłanie pliku...", save_changes: "Zapisz zmiany", publish: "Opublikuj usługę", fill_required: "Wypełnij wszystkie wymagane pola!", save_error: "Błąd podczas zapisywania: ", cat_design: "Design", cat_dev: "Programowanie i IT", cat_text: "Teksty i Tłumaczenia", cat_seo: "SEO i Ruch", cat_social: "Media Społecznościowe", cat_audio: "Audio i Wideo", cat_bus: "Biznes i Życie",
      btn_chat: "Czat"
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

  useEffect(() => {
    let isMounted = true; 
    const initLanguage = async () => {
      const savedLang = localStorage.getItem('unit_lang');
      if (savedLang && isMounted) setLang(savedLang);
    };
    initLanguage();
    const savedCurrency = localStorage.getItem('unit_currency');
    if (savedCurrency && isMounted) setCurrency(savedCurrency);
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !session.user.email) {
        alert(translate('auth_req'));
        router.push('/');
        return;
      }
      setUser(session.user);
      fetchDashboardData(session.user.email); 
    }
    checkAuth();
  }, [router, lang]);

  const displayPrice = (price: number) => {
    if (currency === 'USD') return `${(price * 0.25).toFixed(0)} $`;
    if (currency === 'EUR') return `${(price * 0.23).toFixed(0)} €`;
    return `${price} PLN`; 
  };

  const fetchDashboardData = async (userEmail: string) => {
    setLoading(true);
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('seller_email', userEmail)
      .order('created_at', { ascending: false });
      
    if (servicesData) {
      setMyServices(servicesData);
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
        seller_name: user.email.split('@')[0]
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
           <div className="w-[100px] h-[100px] rounded-full bg-emerald-50 flex items-center justify-center text-4xl text-emerald-300 font-bold">
             {user?.email?.charAt(0).toUpperCase()}
           </div>
           <div className="flex-1 text-center md:text-left">
             <h1 className="text-[24px] font-extrabold">{user?.email?.split('@')[0]}</h1>
             <p className="text-gray-500 mb-4">{user?.email}</p>
             <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[13px]">
                <div className="bg-gray-50 px-4 py-2 rounded-[8px]">{translate('services_count')} <b>{myServices.length}</b></div>
                <div className="bg-gray-50 px-4 py-2 rounded-[8px]">{translate('orders_process')} <b className="text-blue-600">{incomingOrders.filter(o => o.status === 'Process').length}</b></div>
                <div className="bg-gray-50 px-4 py-2 rounded-[8px]">{translate('orders_done')} <b className="text-[#11a95e]">{incomingOrders.filter(o => o.status === 'Done').length}</b></div>
             </div>
           </div>
           <button onClick={openNewServiceModal} className="bg-[#11a95e] text-white px-6 py-3 rounded-[8px] font-bold shadow-md shadow-[#11a95e]/30">
             {translate('add_service')}
           </button>
        </div>

        <div className="flex border-b border-gray-200 mb-8">
          <button onClick={() => setActiveTab('services')} className={`px-6 py-3 font-bold ${activeTab === 'services' ? 'border-b-2 border-[#11a95e] text-[#11a95e]' : 'text-gray-500'}`}>{translate('tab_services')}</button>
          <button onClick={() => setActiveTab('orders')} className={`px-6 py-3 font-bold ${activeTab === 'orders' ? 'border-b-2 border-[#11a95e] text-[#11a95e]' : 'text-gray-500'}`}>{translate('tab_orders')}</button>
        </div>

        {activeTab === 'services' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myServices.map(s => (
              <div key={s.id} className="bg-white rounded-[12px] p-5 shadow-sm border flex flex-col">
                <div className="text-[10px] font-bold text-gray-400 uppercase">{translate(categories.find(c => c.id === s.category)?.titleKey || s.category)}</div>
                {s.image_url && <img src={s.image_url} className="w-full h-32 object-cover rounded my-3" />}
                <h3 className="font-bold mb-2 h-12 line-clamp-2">{s.title}</h3>
                <div className="font-black text-[#11a95e] mb-4">{displayPrice(s.price)}</div>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => openEditModal(s)} className="flex-1 py-2 bg-gray-100 rounded font-bold text-[13px]">{translate('edit')}</button>
                  <button onClick={() => deleteService(s.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded font-bold text-[13px]">{translate('delete')}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[12px] shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[12px] font-bold text-gray-500 uppercase">
                  <th className="p-4">{translate('th_service')}</th>
                  <th className="p-4">{translate('th_status')}</th>
                  <th className="p-4 text-right">{translate('th_action')}</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {incomingOrders.map(o => (
                  <React.Fragment key={o.id}>
                    <tr className="border-t">
                      <td className="p-4">
                        <div className="font-bold">{o.services?.title}</div>
                        <div className="text-[12px] text-gray-400">{o.client_email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${getStatusStyle(o.status)}`}>{o.status}</span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {/* КНОПКА ЧАТА */}
                        <button 
                          onClick={() => setOpenChatOrderId(openChatOrderId === o.id ? null : o.id)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded font-bold text-[12px]"
                        >
                          {translate('btn_chat')} {openChatOrderId === o.id ? '▲' : '▼'}
                        </button>
                        {o.status === 'New' && <button onClick={() => updateOrderStatus(o.id, 'Process')} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded font-bold text-[12px]">{translate('btn_to_work')}</button>}
                        {o.status === 'Process' && <button onClick={() => updateOrderStatus(o.id, 'Done')} className="px-3 py-1.5 bg-[#11a95e] text-white rounded font-bold text-[12px]">{translate('btn_deliver')}</button>}
                      </td>
                    </tr>
                    {/* ОКНО ЧАТА ПОД ЗАКАЗОМ */}
                    {openChatOrderId === o.id && (
                      <tr>
                        <td colSpan={3} className="p-4 bg-gray-50">
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
      </main>

      {/* MODAL (Оставлен без изменений для краткости) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[12px] p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-2xl text-gray-400">×</button>
            <h2 className="text-[20px] font-extrabold mb-6">{editingId ? translate('modal_edit') : translate('modal_new')}</h2>
            <div className="space-y-4">
              <input className="w-full border p-3 rounded" placeholder={translate('ph_title')} value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full border p-3 rounded" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.id}>{translate(c.titleKey)}</option>)}
                </select>
                <input className="w-full border p-3 rounded" type="number" placeholder={translate('ph_price')} value={editForm.price} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} />
              </div>
              <textarea className="w-full border p-3 rounded h-32" placeholder={translate('ph_desc')} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              <input className="w-full border p-3 rounded" placeholder={translate('ph_url')} value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
              <div className="border-2 border-dashed p-4 text-center cursor-pointer relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                <span className="text-[13px] text-gray-500">{selectedFile ? selectedFile.name : translate('click_to_upload')}</span>
              </div>
            </div>
            <button onClick={saveService} disabled={isUploading} className="w-full bg-[#11a95e] text-white py-4 rounded font-bold mt-8">
              {isUploading ? translate('saving') : (editingId ? translate('save_changes') : translate('publish'))}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ДОБАВЛЯЕМ ИМПОРТ REACT В НАЧАЛО ДЛЯ React.Fragment
import React from 'react';