"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Данные для управления
  const [services, setServices] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [defaultLang, setDefaultLang] = useState('RU');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/'); // Если не вошел — на главную
      return;
    }
    // В будущем тут можно добавить проверку на email администратора
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Загружаем настройки языка
    const { data: langData } = await supabase.from('settings').select('value').eq('key', 'default_lang').single();
    if (langData) setDefaultLang(langData.value);

    // Загружаем всё остальное
    const { data: srv } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    const { data: prof } = await supabase.from('profiles').select('*');
    const { data: ord } = await supabase.from('orders').select('*, services(title)');

    if (srv) setServices(srv);
    if (prof) setProfiles(prof);
    if (ord) setOrders(ord);
    
    setLoading(false);
  };

  // Смена языка по умолчанию
  const updateDefaultLang = async (val: string) => {
    const { error } = await supabase.from('settings').upsert({ key: 'default_lang', value: val });
    if (!error) {
      setDefaultLang(val);
      toast.success(`Язык по умолчанию изменен на ${val}`);
    }
  };

  // Удаление услуги (модерация)
  const deleteService = async (id: string) => {
    if (!confirm("Удалить эту услугу как модератор?")) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) {
      setServices(services.filter(s => s.id !== id));
      toast.success("Услуга удалена");
    }
  };

  if (loading) return <div className="p-10 text-center font-black text-[#11a95e] animate-pulse">UNIT ADMIN ACCESS...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333] pb-20">
      <header className="bg-[#222] text-white py-4 shadow-xl">
        <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center">
          <div className="text-xl font-black tracking-tighter">UNIT<span className="text-[#11a95e]">.</span> ADMIN</div>
          <Link href="/" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all">На сайт</Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-8 space-y-8">
        
        {/* ГЛОБАЛЬНЫЕ НАСТРОЙКИ */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2">
            ⚙️ Глобальные настройки
          </h2>
          <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-xl">
            <div>
              <p className="text-xs font-black text-emerald-700 uppercase mb-1">Язык сайта по умолчанию</p>
              <p className="text-[11px] text-emerald-600 mb-2">Этот язык увидят новые пользователи</p>
            </div>
            <select 
              value={defaultLang} 
              onChange={(e) => updateDefaultLang(e.target.value)}
              className="bg-white border border-emerald-200 rounded-lg px-4 py-2 font-bold outline-none focus:ring-2 ring-emerald-500"
            >
              <option value="RU">Русский (RU)</option>
              <option value="EN">English (EN)</option>
              <option value="PL">Polski (PL)</option>
              <option value="DE">Deutsch (DE)</option>
            </select>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* СПИСОК ПОЛЬЗОВАТЕЛЕЙ */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-black mb-4">👥 Пользователи ({profiles.length})</h2>
            <div className="space-y-3">
              {profiles.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                    {p.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">{p.full_name || 'Аноним'}</p>
                    <p className="text-[10px] text-gray-400">{p.contacts || 'Нет контактов'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* УПРАВЛЕНИЕ УСЛУГАМИ */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-black mb-4">🛠 Все услуги ({services.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 font-black text-[10px] uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-3">Название</th>
                    <th className="pb-3">Продавец</th>
                    <th className="pb-3">Цена</th>
                    <th className="pb-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0 group">
                      <td className="py-3 font-bold text-gray-700 truncate max-w-[200px]">{s.title}</td>
                      <td className="py-3 text-gray-500">{s.seller_name}</td>
                      <td className="py-3 font-black text-[#11a95e]">{s.price} PLN</td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => deleteService(s.id)}
                          className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-bold text-[11px] hover:bg-red-500 hover:text-white transition-all"
                        >
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

        {/* ЗАКАЗЫ */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black mb-4">📦 История заказов ({orders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {orders.map(o => (
              <div key={o.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Заказ #{o.id.slice(0,5)}</p>
                <p className="text-sm font-bold line-clamp-1 mb-2">{o.services?.title}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${o.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {o.status}
                  </span>
                  <p className="text-[10px] text-gray-400">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
} 