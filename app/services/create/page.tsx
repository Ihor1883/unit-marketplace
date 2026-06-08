"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
import Link from 'next/link';

export default function CreateServicePage() {
  const router = useRouter();
  
  // Данные пользователя
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Поля формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('DESIGN');
  const [imageUrl, setImageUrl] = useState('');

  // Локализация (берем из памяти, чтобы соответствовать выбранному стилю сайта)
  const [lang, setLang] = useState('RU');
  const [currency, setCurrency] = useState('PLN');

  const t: Record<string, any> = {
    RU: { title: "Создание новой услуги", sub: "Заполните данные, чтобы карточка появилась на маркетплейсе", f_title: "Название услуги", ph_title: "Например: Профессиональный дизайн логотипа", f_cat: "Категория", f_price: "Стоимость", f_desc: "Описание услуги", ph_desc: "Подробно расскажите, что входит в стоимость, какие этапы работы и что получит клиент...", f_img: "Ссылка на обложку (URL)", ph_img: "https://images.unsplash.com/...", preview: "Предпросмотр карточки", btn_create: "Опубликовать услугу", alert_auth: "Пожалуйста, войдите в аккаунт, чтобы добавлять услуги", alert_success: "Услуга успешно добавлена!", cat_design: "Дизайн", cat_dev: "Разработка и IT", cat_text: "Тексты и переводы", cat_seo: "SEO и трафик", cat_social: "Соцсети и маркетинг", cat_audio: "Аудио, видео, съемка", cat_bus: "Бизнес и жизнь", back: "Назад в профиль" },
    EN: { title: "Create New Service", sub: "Fill in the details to publish your service on the marketplace", f_title: "Service Title", ph_title: "e.g., Professional Logo Design", f_cat: "Category", f_price: "Price", f_desc: "Description", ph_desc: "Describe what is included in the price, your workflow, and what the client gets...", f_img: "Cover Image URL", ph_img: "https://images.unsplash.com/...", preview: "Live Card Preview", btn_create: "Publish Service", alert_auth: "Please log in to add services", alert_success: "Service published successfully!", cat_design: "Design", cat_dev: "Development & IT", cat_text: "Texts & Translation", cat_seo: "SEO & Traffic", cat_social: "Social Media", cat_audio: "Audio & Video", cat_bus: "Business & Life", back: "Back to Profile" }
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  const categories = [
    { id: 'DESIGN', name: translate('cat_design') },
    { id: 'DEV', name: translate('cat_dev') },
    { id: 'TEXT', name: translate('cat_text') },
    { id: 'SEO', name: translate('cat_seo') },
    { id: 'SOCIAL', name: translate('cat_social') },
    { id: 'AUDIO', name: translate('cat_audio') },
    { id: 'BUSINESS', name: translate('cat_bus') },
  ];

  useEffect(() => {
    setLang(localStorage.getItem('unit_lang') || 'RU');
    setCurrency(localStorage.getItem('unit_currency') || 'PLN');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        alert(translate('alert_auth'));
        router.push('/');
      }
      setLoadingUser(false);
    });
  }, []);

  const displayPrice = (val: string) => {
    const num = Number(val) || 0;
    if (currency === 'USD') return `${(num * 0.25).toFixed(0)} $`;
    if (currency === 'EUR') return `${(num * 0.23).toFixed(0)} €`;
    return `${num} PLN`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price) return;

    setIsSubmitting(true);

    const { error } = await supabase.from('services').insert([
      {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category: category,
        image_url: imageUrl.trim() || null,
        seller_email: user.email,
        seller_name: user.email.split('@')[0],
        rating_avg: '5.0',
        reviews_count: 0
      }
    ]);

    setIsSubmitting(false);

    if (!error) {
      alert(translate('alert_success'));
      router.push('/profile');
    } else {
      alert("Ошибка: " + error.message);
    }
  };

  if (loadingUser) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-[#11a95e] animate-pulse bg-[#F8F9FA]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#333] pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="text-[28px] font-black tracking-tighter">
            UNIT<span className="text-[#11a95e]">.</span>
          </Link>
          <button onClick={() => router.push('/profile')} className="text-[14px] font-bold text-gray-400 hover:text-orange-500 transition-colors">
            ← {translate('back')}
          </button>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] sm:text-[34px] font-black text-[#111] tracking-tight mb-2">{translate('title')}</h1>
          <p className="text-gray-500 text-[15px] font-medium">{translate('sub')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* ФОРМА СОЗДАНИЯ (ЛЕВАЯ ЧАСТЬ) */}
          <form onSubmit={handleSubmit} className="flex-1 w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            
            {/* НАЗВАНИЕ */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-black uppercase tracking-wider text-gray-400">{translate('f_title')}</label>
              <input 
                type="text" 
                required
                maxLength={80}
                placeholder={translate('ph_title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-[15px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* КАТЕГОРИЯ */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-black uppercase tracking-wider text-gray-400">{translate('f_cat')}</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-[15px] font-bold outline-none focus:border-orange-400 focus:bg-white transition-all cursor-pointer shadow-inner"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* ЦЕНА */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-black uppercase tracking-wider text-gray-400">{translate('f_price')} (PLN)</label>
                <input 
                  type="number" 
                  required
                  min={1}
                  placeholder="150"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-[15px] font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* ССЫЛКА НА ИЗОБРАЖЕНИЕ */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-black uppercase tracking-wider text-gray-400">{translate('f_img')}</label>
              <input 
                type="url" 
                placeholder={translate('ph_img')}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-[15px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* ОПИСАНИЕ */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-black uppercase tracking-wider text-gray-400">{translate('f_desc')}</label>
              <textarea 
                required
                rows={6}
                placeholder={translate('ph_desc')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-[15px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white transition-all resize-none shadow-inner"
              />
            </div>

            {/* КНОПКА ОТПРАВКИ */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white py-4 rounded-xl font-black text-[15px] uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
            >
              {isSubmitting ? "..." : translate('btn_create')}
            </button>

          </form>

          {/* LIVE ПРЕВЬЮ (ПРАВАЯ ЧАСТЬ) */}
          <aside className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-[100px]">
            <div className="text-[13px] font-black uppercase tracking-wider text-gray-400 mb-4 px-2">{translate('preview')}</div>
            
            {/* Настоящее превью в дизайне ServiceCard */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md overflow-hidden pointer-events-none flex flex-col">
              <div className="w-full aspect-[4/3] bg-gray-50 relative overflow-hidden border-b border-gray-50">
                {imageUrl.trim() ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📷</div>
                )}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md">
                  ТОП
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2 text-[12px] font-medium text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-[9px]">
                      {(user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-600">{user?.email?.split('@')[0] || 'seller'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-400 font-bold">
                    <span>★</span> <span className="text-gray-700">5.0</span> <span className="text-gray-300 font-normal">(0)</span>
                  </div>
                </div>
                <h3 className="font-black text-[#111] text-[15px] leading-snug line-clamp-2 h-11">
                  {title.trim() || translate('ph_title')}
                </h3>
                <div className="mt-5 border-t border-gray-50 pt-4 flex items-center justify-between">
                  <div className="text-[14px] font-black text-orange-500 leading-none">
                    {displayPrice(price)}
                  </div>
                  <div className="bg-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl">
                    Заказать
                  </div>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}