"use client";

import React, { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import Chat from '../components/Chat';

export default function AdminDashboard() {
  const router = useRouter();

  const [loadingData, setLoadingData] = useState(true);
  const [loadingToggle, setLoadingToggle] = useState(false);

  // Настройки
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [defaultLang, setDefaultLang] = useState('RU');

  // Данные для таблиц
  const [profiles, setProfiles] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);

  // Состояние чата
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    
    // Загружаем настройки, профили, услуги и заказы
    const [settingsRes, profilesRes, servicesRes, ordersRes] = await Promise.all([
      supabase.from('settings').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('services').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, services(title, seller_email)').order('created_at', { ascending: false })
    ]);

    if (settingsRes.data) {
      const paymentSetting = settingsRes.data.find(s => s.key === 'payment_enabled');
      const langSetting = settingsRes.data.find(s => s.key === 'default_lang');
      if (paymentSetting) setPaymentEnabled(paymentSetting.value === 'true');
      if (langSetting) setDefaultLang(langSetting.value);
    }
    
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (servicesRes.data) setAllServices(servicesRes.data);
    if (ordersRes.data) setAllOrders(ordersRes.data);

    setLoadingData(false);
  };

  // 1. Смена языка по умолчанию (7 языков)
  const updateDefaultLang = async (val: string) => {
    const { error } = await supabase.from('settings').upsert({ key: 'default_lang', value: val });
    if (!error) {
      setDefaultLang(val);
      toast.success(`Язык изменен на ${val}`);
    } else {
      toast.error("Ошибка при сохранении языка");
    }
  };

  // 2. Включение/Выключение платежей
  const togglePayment = async () => {
    setLoadingToggle(true);
    const newValue = !paymentEnabled;
    const { error } = await supabase.from('settings').upsert({ key: 'payment_enabled', value: String(newValue) });
    if (!error) {
      setPaymentEnabled(newValue);
      toast.success(newValue ? "Оплата включена" : "Тестовый режим активен");
    }
    setLoadingToggle(false);
  };

  // 3. Смена статуса заказа
  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setAllOrders(allOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success("Статус обновлен");
    }
  };

  // 4. Удаление услуги
  const deleteServiceAdmin = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить услугу?")) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) {
      setAllServices(allServices.filter(s => s.id !== id));
      toast.success("Услуга удалена");
    }
  };

  // 5. Включение/Выключение ТОП-статуса
  const toggleTopStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('services').update({ is_top: newStatus }).eq('id', id);
    if (!error) {
      setAllServices(allServices.map(s => s.id === id ? { ...s, is_top: newStatus } : s));
      toast.success(newStatus ? "Добавлено в ТОП" : "Убрано из ТОП");
    }
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

  const toggleChat = (orderId: string) => {
    setOpenChatId(openChatId === orderId ? null : orderId);
  };

  if (loadingData) return <div className="min-h-screen flex items-center justify-center font-black text-[#11a95e] animate-pulse text-2xl">UNIT ADMIN ACCESS...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333] pb-20">
      
      {/* ШАПКА АДМИНКИ */}
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-[1240px] mx-auto px-6 h-[70px] flex items-center justify-between">
          <div className="text-[24px] font-black tracking-tighter flex items-center gap-2">
            UNIT<span className="text-[#11a95e]">.</span> 
            <span className="text-[12px] font-bold tracking-widest text-gray-400 uppercase border-l border-gray-700 pl-3 ml-1 mt-1">Admin Panel</span>
          </div>
          <Link href="/" className="text-[13px] font-bold text-gray-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg">
            На сайт
          </Link>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-6 py-8 space-y-8">
        
        {/* ГЛОБАЛЬНЫЕ НАСТРОЙКИ (7 языков и Stripe) */}
        <section className="bg-white rounded-[12px] shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-8 items-center">
          
          {/* СЛЕВА: ПЛАТЕЖИ */}
          <div className="flex-1 w-full">
            <h2 className="text-[18px] font-extrabold text-[#222] mb-1">Прием платежей (Stripe)</h2>
            <p className="text-[13px] text-gray-500 mb-4">
              {paymentEnabled ? "Оплата включена. Заказы создаются после оплаты." : "Тестовый режим. Заказы создаются бесплатно."}
            </p>
            <button onClick={togglePayment} disabled={loadingToggle} className={`px-6 py-2.5 rounded-lg font-bold text-[13px] transition-all shadow-sm ${paymentEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-[#11a95e] text-white hover:bg-[#0e9552] shadow-md shadow-[#11a95e]/20'} disabled:opacity-50`}>
              {loadingToggle ? "ОБРАБОТКА..." : (paymentEnabled ? "ВЫКЛЮЧИТЬ ОПЛАТУ" : "АКТИВИРОВАТЬ ОПЛАТУ")}
            </button>
          </div>

          <div className="w-px h-24 bg-gray-200 hidden md:block"></div>

          {/* СПРАВА: ЯЗЫК */}
          <div className="flex-1 w-full">
            <h2 className="text-[18px] font-extrabold text-[#222] mb-1">Язык по умолчанию</h2>
            <p className="text-[13px] text-gray-500 mb-4">Этот язык увидят новые пользователи при первом входе.</p>
            <select 
              value={defaultLang} 
              onChange={(e) => updateDefaultLang(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[14px] font-bold outline-none focus:border-[#11a95e] w-full max-w-[280px] shadow-sm cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="RU">Русский (RU)</option>
              <option value="EN">English (EN)</option>
              <option value="PL">Polski (PL)</option>
              <option value="DE">Deutsch (DE)</option>
              <option value="ES">Español (ES)</option>
              <option value="IT">Italiano (IT)</option>
              <option value="FR">Français (FR)</option>
            </select>
          </div>

        </section>

        {/* ПАНЕЛЬ УПРАВЛЕНИЯ ЮЗЕРАМИ И УСЛУГАМИ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* СПИСОК ПОЛЬЗОВАТЕЛЕЙ */}
          <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-black mb-4">👥 Юзеры ({profiles.length})</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {profiles.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 text-gray-500">
                    {p.full_name?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-tight truncate">{p.full_name || 'Аноним'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{p.contacts || 'Нет контактов'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ТАБЛИЦА ВСЕХ УСЛУГ */}
          <div className="md:col-span-2 bg-white rounded-[12px] shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-extrabold text-[16px] text-[#222]">Все услуги на витрине ({allServices.length})</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-4 pl-6">Название</th>
                    <th className="p-4">Продавец</th>
                    <th className="p-4">Цена</th>
                    <th className="p-4 pr-6 text-right">Управление</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[13px]">
                  {allServices.map(service => (
                    <tr key={service.id} className={`hover:bg-gray-50/50 transition-colors ${service.is_top ? 'bg-yellow-50/30' : ''}`}>
                      <td className="p-4 pl-6">
                        <div className="font-bold text-[#222] max-w-[200px] truncate">{service.title}</div>
                        {service.is_top && <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest bg-yellow-100 px-1.5 py-0.5 rounded mt-1 inline-block">ТОП УСЛУГА</span>}
                      </td>
                      <td className="p-4 text-gray-500 truncate max-w-[120px]">{service.seller_email}</td>
                      <td className="p-4 font-black text-[#11a95e] whitespace-nowrap">{service.price} PLN</td>
                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        <button onClick={() => toggleTopStatus(service.id, service.is_top)} className={`mr-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${service.is_top ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}>
                          {service.is_top ? '⭐ Снять' : '🚀 В ТОП'}
                        </button>
                        <button onClick={() => deleteServiceAdmin(service.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ТАБЛИЦА ЗАКАЗОВ (С ЧАТОМ) */}
        <section className="bg-white rounded-[12px] shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-extrabold text-[16px] text-[#222]">Управление заказами ({allOrders.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6">Дата</th>
                  <th className="p-4">Услуга / Продавец</th>
                  <th className="p-4">Покупатель</th>
                  <th className="p-4 text-center">Статус</th>
                  <th className="p-4 pr-6 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px]">
                {allOrders.map(order => (
                  <Fragment key={order.id}>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-6 text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#222] truncate max-w-[200px]">{order.services?.title || "Удаленная услуга"}</div>
                        <div className="text-[11px] text-gray-400">{order.services?.seller_email}</div>
                      </td>
                      <td className="p-4 text-gray-600 truncate max-w-[150px]">{order.client_email}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-extrabold uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <button onClick={() => toggleChat(order.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-lg px-3 py-1.5 transition-colors">
                            Чат {openChatId === order.id ? '▲' : '▼'}
                          </button>
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-[11px] font-bold rounded-lg px-2 py-1.5 outline-none focus:border-[#11a95e]"
                          >
                            <option value="New">New</option>
                            <option value="Process">Process</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                    
                    {/* РАСКРЫВАЮЩИЙСЯ ЧАТ */}
                    {openChatId === order.id && (
                      <tr>
                        <td colSpan={5} className="p-6 bg-gray-50/80 border-b border-gray-200">
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md max-w-[800px] mx-auto">
                            <Chat orderId={order.id} userEmail="Admin" lang="RU" />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}