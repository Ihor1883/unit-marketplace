"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import Chat from '../components/Chat';

export default function ProfilePage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'settings'>('services');
  
  const [myServices, setMyServices] = useState<any[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<any[]>([]);
  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [contacts, setContacts] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // Новое: URL аватара
  const [savingProfile, setSavingProfile] = useState(false);

  const [lang, setLang] = useState('RU');
  const [currency, setCurrency] = useState('PLN');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ 
    title: '', price: 0, description: '', category: 'DESIGN', image_url: '' 
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null); // Новое: файл аватара
  const [isUploading, setIsUploading] = useState(false);

  const t: Record<string, any> = {
    RU: {
      auth_req: "Пожалуйста, войдите в аккаунт.", cabinet: "/ Кабинет продавца", to_main: "На главную", services_count: "Услуг:", orders_process: "В работе:", orders_done: "Завершено:", add_service: "+ Добавить услугу", tab_services: "Мои услуги", tab_orders: "Входящие заказы", tab_settings: "Настройки", no_services: "У вас пока нет услуг.", edit: "Изменить", delete: "Удалить", no_orders: "Нет заказов.", th_service: "Услуга / Дата", th_status: "Статус", th_action: "Действие", btn_to_work: "В работу", btn_deliver: "Сдать заказ", modal_edit: "Редактировать", modal_new: "Новая услуга", label_name: "Имя / Никнейм", label_bio: "О себе", label_contacts: "Контакты", save_profile: "Сохранить профиль", profile_saved: "Обновлено!", label_avatar: "Фото профиля", click_avatar: "Сменить фото", level_label: "Ваш уровень:"
    },
    EN: {
      auth_req: "Please log in.", cabinet: "/ Dashboard", to_main: "Home", services_count: "Services:", orders_process: "In process:", orders_done: "Done:", add_service: "+ Add Service", tab_services: "My Services", tab_orders: "Orders", tab_settings: "Settings", no_services: "No services yet.", edit: "Edit", delete: "Delete", no_orders: "No orders.", th_service: "Service", th_status: "Status", th_action: "Action", btn_to_work: "Start", btn_deliver: "Deliver", modal_edit: "Edit", modal_new: "New Service", label_name: "Full Name", label_bio: "Bio", label_contacts: "Contacts", save_profile: "Save Profile", profile_saved: "Updated!", label_avatar: "Profile Photo", click_avatar: "Change photo", level_label: "Your level:"
    }
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  // Логика уровней (такая же, как в ServiceCard)
  const getSellerLevel = (count: number) => {
    if (count >= 50) return { icon: '💎', text: 'Платина', style: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
    if (count >= 20) return { icon: '🥇', text: 'Золото', style: 'text-amber-700 bg-amber-50 border-amber-100' };
    if (count >= 5) return  { icon: '🥈', text: 'Серебро', style: 'text-gray-700 bg-gray-50 border-gray-200' };
    return { icon: '🌱', text: 'Новичок', style: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('unit_lang') || 'RU';
    setLang(savedLang);
    const savedCurrency = localStorage.getItem('unit_currency') || 'PLN';
    setCurrency(savedCurrency);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/');
        return;
      }
      setUser(session.user);
      fetchDashboardData(session.user); 
    }
    checkAuth();
  }, [router]);

  const fetchDashboardData = async (currentUser: any) => {
    setLoading(true);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setContacts(profile.contacts || '');
      setAvatarUrl(profile.avatar_url || '');
    }

    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('seller_email', currentUser.email)
      .order('created_at', { ascending: false });
      
    if (servicesData) {
      setMyServices(servicesData);
      const serviceIds = servicesData.map(s => s.id);
      if (serviceIds.length > 0) {
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

  // Загрузка файлов (и для услуг, и для аватара)
  const uploadToStorage = async (file: File, bucket: string) => {
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (selectedAvatar) {
        finalAvatarUrl = await uploadToStorage(selectedAvatar, 'avatars');
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        bio: bio,
        contacts: contacts,
        avatar_url: finalAvatarUrl,
        updated_at: new Date()
      });

      if (!error) {
        setAvatarUrl(finalAvatarUrl);
        setSelectedAvatar(null);
        alert(translate('profile_saved'));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const saveService = async () => {
    setIsUploading(true);
    try {
      let finalImageUrl = editForm.image_url;
      if (selectedFile) finalImageUrl = await uploadToStorage(selectedFile, 'services');
      
      const serviceData = {
        ...editForm,
        image_url: finalImageUrl,
        seller_email: user.email,
        seller_name: fullName || user.email.split('@')[0],
        seller_avatar: avatarUrl, // Передаем аватар в услугу для отображения на главной
        user_id: user.id
      };

      if (editingId) {
        await supabase.from('services').update(serviceData).eq('id', editingId);
      } else {
        await supabase.from('services').insert([serviceData]);
      }
      setShowModal(false);
      fetchDashboardData(user);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    setIncomingOrders(incomingOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const sellerLevel = getSellerLevel(incomingOrders.filter(o => o.status === 'Done').length);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-300 animate-pulse uppercase tracking-widest text-xs">UNIT. LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1240px] mx-auto px-4 h-[70px] flex items-center justify-between">
          <div className="text-[28px] font-black tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
            UNIT<span className="text-[#11a95e]">.</span> <span className="text-[12px] text-gray-400 ml-2 border-l pl-3 hidden sm:inline">{translate('cabinet')}</span>
          </div>
          <button onClick={() => router.push('/')} className="text-[13px] font-bold text-gray-500 hover:text-[#11a95e] transition-colors">{translate('to_main')} →</button>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-4 py-8">
        {/* ВЕРХНЯЯ КАРТОЧКА С УРОВНЕМ */}
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl font-black select-none pointer-events-none">DASHBOARD</div>
          
          <div className="relative group">
            <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[#11a95e]">{fullName.charAt(0) || user.email.charAt(0)}</div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
              <h1 className="text-[26px] font-black text-[#222]">{fullName || user?.email?.split('@')[0]}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${sellerLevel.style}`}>
                {sellerLevel.icon} {sellerLevel.text}
              </span>
            </div>
            <p className="text-[13px] text-gray-400 mb-4">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
               <div className="bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 text-[12px] font-bold">{translate('services_count')} {myServices.length}</div>
               <div className="bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 text-[12px] font-bold text-blue-600">{translate('orders_process')} {incomingOrders.filter(o => o.status === 'Process').length}</div>
               <div className="bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 text-[12px] font-bold text-[#11a95e]">{translate('orders_done')} {incomingOrders.filter(o => o.status === 'Done').length}</div>
            </div>
          </div>

          <button onClick={() => { setEditingId(null); setEditForm({title:'', price:0, description:'', category:'DESIGN', image_url:''}); setShowModal(true); }} className="bg-[#11a95e] hover:bg-[#0e9552] text-white px-8 py-4 rounded-[12px] font-black text-[14px] shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
            {translate('add_service')}
          </button>
        </div>

        {/* ТАБЫ */}
        <div className="flex gap-1 mb-8 bg-white p-1 rounded-xl w-fit border border-gray-100 shadow-sm">
          {['services', 'orders', 'settings'].map((tab: any) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-lg font-black text-[12px] uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[#11a95e] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              {translate(`tab_${tab}`)}
            </button>
          ))}
        </div>

        {/* НАСТРОЙКИ С ЗАГРУЗКОЙ АВАТАРА */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-[16px] p-8 shadow-sm border border-gray-100 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col items-center">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{translate('label_avatar')}</label>
                   <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setSelectedAvatar(e.target.files ? e.target.files[0] : null)} />
                      {selectedAvatar ? (
                        <div className="text-[10px] font-bold text-[#11a95e] text-center px-2 animate-pulse">✓ {selectedAvatar.name}</div>
                      ) : avatarUrl ? (
                        <img src={avatarUrl} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" alt="Preview" />
                      ) : (
                        <span className="text-gray-300 text-3xl">+</span>
                      )}
                      <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase">{translate('click_avatar')}</div>
                   </div>
                </div>
                <div className="md:col-span-2 space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{translate('label_name')}</label>
                         <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#11a95e] outline-none transition-all" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{translate('label_contacts')}</label>
                         <input type="text" value={contacts} onChange={e => setContacts(e.target.value)} placeholder="@telegram" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#11a95e] outline-none transition-all" />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{translate('label_bio')}</label>
                      <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm h-32 resize-none outline-none focus:border-[#11a95e] focus:bg-white transition-all" />
                   </div>
                   <button onClick={saveProfile} disabled={savingProfile} className="w-full sm:w-auto bg-[#11a95e] text-white px-10 py-4 rounded-xl font-black text-[13px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:bg-gray-300">
                      {savingProfile ? '...' : translate('save_profile')}
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* ЗАКАЗЫ С ЧАТОМ (ОБНОВЛЕННЫЙ ВИД) */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
            {incomingOrders.length === 0 ? (
               <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest text-[11px]">{translate('no_orders')}</div>
            ) : (
               <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="p-6">{translate('th_service')}</th>
                      <th className="p-6">{translate('th_status')}</th>
                      <th className="p-6 text-right">{translate('th_action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {incomingOrders.map(o => (
                       <React.Fragment key={o.id}>
                          <tr className={`transition-colors ${openChatOrderId === o.id ? 'bg-emerald-50/30' : 'hover:bg-gray-50/50'}`}>
                             <td className="p-6">
                                <div className="font-bold text-[#222] text-[15px] mb-1">{o.services?.title}</div>
                                <div className="text-[11px] text-gray-400 font-medium">КЛИЕНТ: {o.client_email}</div>
                             </td>
                             <td className="p-6">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                   o.status === 'New' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                   o.status === 'Process' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                   'bg-emerald-100 text-emerald-700 border-emerald-200'
                                }`}>{o.status}</span>
                             </td>
                             <td className="p-6 text-right">
                                <div className="flex justify-end items-center gap-2">
                                   <button onClick={() => setOpenChatOrderId(openChatOrderId === o.id ? null : o.id)} className={`px-4 py-2 rounded-lg font-black text-[11px] uppercase transition-all flex items-center gap-2 ${openChatOrderId === o.id ? 'bg-gray-800 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#11a95e]'}`}>
                                      💬 {translate('btn_chat')} {openChatOrderId === o.id ? '▲' : '▼'}
                                   </button>
                                   {o.status === 'New' && <button onClick={() => updateOrderStatus(o.id, 'Process')} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-black text-[11px] uppercase shadow-md shadow-blue-100 hover:bg-blue-700">{translate('btn_to_work')}</button>}
                                   {o.status === 'Process' && <button onClick={() => updateOrderStatus(o.id, 'Done')} className="px-4 py-2 bg-[#11a95e] text-white rounded-lg font-black text-[11px] uppercase shadow-md shadow-emerald-100 hover:bg-[#0e9552]">{translate('btn_deliver')}</button>}
                                </div>
                             </td>
                          </tr>
                          {openChatOrderId === o.id && (
                             <tr className="bg-white border-b border-gray-100">
                                <td colSpan={3} className="p-0 animate-in slide-in-from-top-2 duration-300">
                                   <div className="p-6 bg-gray-50/50">
                                      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                         <Chat orderId={o.id} userEmail={user.email} lang={lang} />
                                      </div>
                                   </div>
                                </td>
                             </tr>
                          )}
                       </React.Fragment>
                    ))}
                  </tbody>
               </table>
            )}
          </div>
        )}

        {/* УСЛУГИ (СЕТКА) */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {myServices.map(s => (
               <div key={s.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
                    {s.image_url ? (
                       <img src={s.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl">📁</div>
                    )}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded text-[9px] font-black uppercase text-gray-500 tracking-tighter">{s.category}</div>
                  </div>
                  <h3 className="font-black text-[16px] text-[#222] mb-1 line-clamp-2 leading-tight h-10">{s.title}</h3>
                  <div className="text-[18px] font-black text-[#11a95e] mb-6">{displayPrice(s.price)}</div>
                  <div className="mt-auto flex gap-2">
                     <button onClick={() => openEditModal(s)} className="flex-1 py-3 bg-gray-50 border border-gray-100 rounded-xl font-black text-[11px] uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:text-[#11a95e] transition-all">{translate('edit')}</button>
                     <button onClick={() => deleteService(s.id)} className="px-4 py-3 bg-red-50 text-red-500 rounded-xl font-black text-[11px] uppercase hover:bg-red-500 hover:text-white transition-all">🗑</button>
                  </div>
               </div>
            ))}
          </div>
        )}
      </main>

      {/* МОДАЛКА УСЛУГИ (АНИМИРОВАННАЯ) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[24px] p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
             <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 text-2xl transition-colors">×</button>
             <h2 className="text-[24px] font-black mb-8 text-[#222] tracking-tighter">{editingId ? translate('modal_edit') : translate('modal_new')}</h2>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{translate('label_title')}</label>
                  <input className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl outline-none focus:bg-white focus:border-[#11a95e] transition-all" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{translate('label_cat')}</label>
                    <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl outline-none focus:bg-white focus:border-[#11a95e]" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                      {['DESIGN','DEV','TEXT','SEO','SOCIAL','AUDIO','BUSINESS'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{translate('label_price')}</label>
                    <input className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl outline-none focus:bg-white focus:border-[#11a95e]" type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} />
                  </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">ОПИСАНИЕ</label>
                   <textarea className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl h-32 resize-none outline-none focus:bg-white focus:border-[#11a95e]" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                </div>
                <div className="border-2 border-dashed border-gray-100 bg-gray-50 rounded-2xl p-10 text-center relative hover:bg-emerald-50/50 hover:border-[#11a95e]/30 transition-all group">
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                   <div className="text-[12px] font-bold text-gray-400 group-hover:text-[#11a95e] transition-colors">
                      {selectedFile ? `✓ ${selectedFile.name}` : '+ ЗАГРУЗИТЬ ОБЛОЖКУ'}
                   </div>
                </div>
             </div>
             <button onClick={saveService} disabled={isUploading} className="w-full bg-[#11a95e] hover:bg-[#0e9552] text-white py-5 rounded-2xl font-black text-[14px] uppercase tracking-widest mt-8 shadow-xl shadow-emerald-100 transition-all hover:scale-[1.01] active:scale-100 disabled:bg-gray-300">
                {isUploading ? '...' : (editingId ? translate('save_changes') : translate('publish'))}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}