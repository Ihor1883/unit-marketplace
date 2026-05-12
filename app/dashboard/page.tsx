"use client";

import React, { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
import Chat from '../components/Chat'; // Убедись, что путь к файлу Chat правильный

export default function AdminDashboard() {
  const router = useRouter();

  // Состояния для платежной системы
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);

  // Состояния для данных (статистика, заказы, услуги)
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // СОСТОЯНИЕ ДЛЯ ОТКРЫТОГО ЧАТА (Аккордеон)
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  // --- ИНИЦИАЛИЗАЦИЯ ---
  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'payment_enabled').single();
      if (data && isMounted) setPaymentEnabled(data.value === 'true');
    };

    const fetchData = async () => {
      setLoadingData(true);
      const [ordersRes, servicesRes] = await Promise.all([
        supabase.from('orders').select('*, services(title, seller_email)').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('created_at', { ascending: false })
      ]);

      if (isMounted) {
        if (ordersRes.data) setAllOrders(ordersRes.data);
        if (servicesRes.data) setAllServices(servicesRes.data);
        setLoadingData(false);
      }
    };

    fetchSettings();
    fetchData();

    return () => { isMounted = false; };
  }, []);

  // --- ЛОГИКА АДМИНА ---

  // 1. Включение/Выключение платежей
  const togglePayment = async () => {
    setLoadingToggle(true);
    const newValue = !paymentEnabled;
    const { error } = await supabase.from('settings').upsert({ key: 'payment_enabled', value: String(newValue) });
    if (!error) setPaymentEnabled(newValue);
    else alert("Ошибка при сохранении: " + error.message);
    setLoadingToggle(false);
  };

  // 2. Смена статуса заказа
  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setAllOrders(allOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } else {
      alert("Ошибка обновления статуса: " + error.message);
    }
  };

  // 3. Удаление услуги
  const deleteServiceAdmin = async (id: string) => {
    if (!confirm("Вы уверены, что хотите безвозвратно удалить эту услугу?")) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) {
      setAllServices(allServices.filter(s => s.id !== id));
      alert("Услуга удалена!");
    } else {
      alert("Ошибка удаления: " + error.message);
    }
  };

  // 4. Включение/Выключение ТОП-статуса
  const toggleTopStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('services').update({ is_top: newStatus }).eq('id', id);
    
    if (!error) {
      setAllServices(allServices.map(s => s.id === id ? { ...s, is_top: newStatus } : s));
    } else {
      alert("Ошибка обновления ТОП статуса: " + error.message);
    }
  };

  // Стили для бейджей статусов
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'New': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Process': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Done': 
      case 'Completed': return 'bg-[#11a95e] text-white border border-[#0f9653]'; 
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  // Функция для переключения чата
  const toggleChat = (orderId: string) => {
    if (openChatId === orderId) {
      setOpenChatId(null); // Если кликнули по открытому - закрываем
    } else {
      setOpenChatId(orderId); // Открываем новый
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333]">
      
      {/* HEADER АДМИНКИ */}
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-[1240px] mx-auto px-6 h-[70px] flex items-center justify-between">
          <div className="text-[24px] font-black tracking-tighter flex items-center gap-2">
            UNIT<span className="text-[#11a95e]">.</span> <span className="text-[12px] font-bold tracking-widest text-gray-400 uppercase border-l border-gray-700 pl-3 ml-1 mt-1">Admin Panel</span>
          </div>
          <button onClick={() => router.push('/')} className="text-[13px] font-bold text-gray-300 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-[6px]">
            Вернуться на сайт
          </button>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-6 py-8">
        
        {/* БЛОК АКТИВАЦИИ ПЛАТЕЖЕЙ */}
        <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#222] mb-1">Прием платежей (Stripe)</h2>
            <p className="text-[13px] text-gray-500">
              {paymentEnabled 
                ? "Платежная система включена. Пользователи должны оплатить заказ картой перед его созданием." 
                : "Тестовый режим. Пользователи создают заказы бесплатно и без привязки карты."}
            </p>
          </div>
          <button onClick={togglePayment} disabled={loadingToggle} className={`shrink-0 px-6 py-3 rounded-[8px] font-bold text-[13px] transition-all shadow-sm ${paymentEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-[#11a95e] text-white hover:bg-[#0e9552] shadow-md shadow-[#11a95e]/20'} disabled:opacity-50`}>
            {loadingToggle ? "ОБРАБОТКА..." : (paymentEnabled ? "ВЫКЛЮЧИТЬ ОПЛАТУ" : "АКТИВИРОВАТЬ ОПЛАТУ")}
          </button>
        </div>

        {/* СТАТИСТИКА */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Всего услуг</p>
              <h3 className="text-[32px] font-black text-[#222] leading-none">{loadingData ? '...' : allServices.length}</h3>
            </div>
            <div className="text-[40px] opacity-20">📁</div>
          </div>
          <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Всего заказов</p>
              <h3 className="text-[32px] font-black text-[#11a95e] leading-none">{loadingData ? '...' : allOrders.length}</h3>
            </div>
            <div className="text-[40px] opacity-20">🛒</div>
          </div>
        </div>

        {/* ТАБЛИЦА ЗАКАЗОВ */}
        <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-extrabold text-[16px] text-[#222]">Управление заказами</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6">ID / Дата</th>
                  <th className="p-4">Услуга / Продавец</th>
                  <th className="p-4">Покупатель</th>
                  <th className="p-4 text-center">Статус</th>
                  <th className="p-4 pr-6 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px]">
                {loadingData ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Загрузка данных...</td></tr>
                ) : allOrders.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Заказов пока нет</td></tr>
                ) : (
                  allOrders.map(order => (
                    <Fragment key={order.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-mono text-[11px] text-gray-400 mb-1">{order.id.split('-')[0]}</div>
                          <div className="text-gray-500">{new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#222]">{order.services?.title || <span className="text-red-400">Удалена</span>}</div>
                          <div className="text-[11px] text-gray-400">{order.services?.seller_email || '-'}</div>
                        </td>
                        <td className="p-4 text-gray-600">{order.client_email}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-extrabold uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end items-center gap-3">
                            {/* КНОПКА ЧАТА */}
                            <button 
                              onClick={() => toggleChat(order.id)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-bold rounded-[6px] px-3 py-1.5 transition-colors flex items-center gap-1"
                            >
                              Чат {openChatId === order.id ? '▲' : '▼'}
                            </button>

                            {/* ВЫБОР СТАТУСА */}
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="bg-white border border-gray-300 text-gray-700 text-[12px] font-bold rounded-[6px] px-2 py-1.5 outline-none focus:border-[#11a95e] w-[100px]"
                            >
                              <option value="New">New</option>
                              <option value="Process">Process</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                      
                      {/* ВЫПАДАЮЩИЙ БЛОК ЧАТА (АККОРДЕОН) */}
                      {openChatId === order.id && (
                        <tr>
                          <td colSpan={5} className="p-0 border-b border-gray-200 bg-gray-50/80">
                            <div className="p-6">
                              <div className="bg-white border border-gray-200 rounded-[12px] overflow-hidden shadow-sm">
                                {/* Вызываем твой компонент чата */}
                                <Chat orderId={order.id} userEmail="Admin" lang="RU" />
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

        {/* ТАБЛИЦА УСЛУГ (С КНОПКОЙ "В ТОП") */}
        <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-extrabold text-[16px] text-[#222]">Управление визитками (ТОП и Удаление)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6">Фото</th>
                  <th className="p-4">Название</th>
                  <th className="p-4">Продавец</th>
                  <th className="p-4">Цена</th>
                  <th className="p-4 pr-6 text-right">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px]">
                {loadingData ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Загрузка данных...</td></tr>
                ) : allServices.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Услуг пока нет</td></tr>
                ) : (
                  allServices.map(service => (
                    <tr key={service.id} className={`hover:bg-gray-50/50 transition-colors ${service.is_top ? 'bg-yellow-50/30' : ''}`}>
                      <td className="p-4 pl-6">
                        {service.image_url ? (
                          <img src={service.image_url} alt="Cover" className="w-12 h-12 object-cover rounded-[6px] border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-[6px] border border-gray-200 flex items-center justify-center text-[10px] text-gray-400">Нет фото</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#222] max-w-[200px] truncate">{service.title}</div>
                        {service.is_top && <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest bg-yellow-100 px-1.5 py-0.5 rounded">ТОП</span>}
                      </td>
                      <td className="p-4 text-gray-600">{service.seller_email}</td>
                      <td className="p-4 font-black text-[#11a95e]">{service.price}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => toggleTopStatus(service.id, service.is_top)}
                            className={`px-3 py-1.5 rounded-[6px] text-[12px] font-bold transition-colors border ${
                              service.is_top 
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' 
                                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {service.is_top ? '⭐ Снять ТОП' : '🚀 В ТОП'}
                          </button>
                          
                          <button 
                            onClick={() => deleteServiceAdmin(service.id)}
                            className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-[6px] text-[12px] font-bold transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}