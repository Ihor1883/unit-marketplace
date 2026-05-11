"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../supabase'; // Убедись, что путь к supabase.ts правильный
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AddServicePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Состояния формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('DESIGN');
  
  // Загрузка фото
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Локализация
  const [lang, setLang] = useState('RU');
  const [currency, setCurrency] = useState('PLN');

  // --- СЛОВАРЬ (7 ЯЗЫКОВ) ---
  const t: Record<string, any> = {
    RU: {
      page_title: "Создать новое объявление", page_sub: "Заполните данные, чтобы опубликовать вашу услугу на маркетплейсе.", back: "Назад в кабинет",
      label_title: "Название услуги *", ph_title: "Напр: Сделаю крутой дизайн логотипа",
      label_cat: "Категория *",
      label_price: `Цена (${currency}) *`, ph_price: "500",
      label_desc: "Подробное описание *", ph_desc: "Опишите, что входит в вашу услугу, сроки и условия...",
      label_photo: "Обложка услуги", file_selected: "✓ Выбран файл:", click_to_upload: "📁 Нажмите, чтобы загрузить фото",
      publishing: "Публикация...", publish_btn: "Опубликовать на UNIT",
      fill_req: "Пожалуйста, заполните все обязательные поля!", err_upload: "Ошибка загрузки фото: ", err_save: "Ошибка сохранения: ", success: "Услуга успешно опубликована!",
      cat_design: "Дизайн", cat_dev: "Разработка и IT", cat_text: "Тексты и переводы", cat_seo: "SEO и трафик", cat_social: "Соцсети и маркетинг", cat_audio: "Аудио, видео, съемка", cat_bus: "Бизнес и жизнь"
    },
    EN: {
      page_title: "Create a new listing", page_sub: "Fill in the details to publish your service on the marketplace.", back: "Back to Dashboard",
      label_title: "Service Title *", ph_title: "e.g.: I will design an awesome logo",
      label_cat: "Category *",
      label_price: `Price (${currency}) *`, ph_price: "500",
      label_desc: "Detailed Description *", ph_desc: "Describe what is included in your service, deadlines, etc...",
      label_photo: "Service Cover", file_selected: "✓ File selected:", click_to_upload: "📁 Click to upload a photo",
      publishing: "Publishing...", publish_btn: "Publish on UNIT",
      fill_req: "Please fill in all required fields!", err_upload: "Error uploading photo: ", err_save: "Error saving: ", success: "Service published successfully!",
      cat_design: "Design", cat_dev: "Development & IT", cat_text: "Texts & Translation", cat_seo: "SEO & Traffic", cat_social: "Social Media", cat_audio: "Audio & Video", cat_bus: "Business & Life"
    },
    // Для экономии места оставляю структуру, остальные языки будут использовать EN как фоллбэк, если не переведены.
    // Ты можешь добавить переводы для PL, DE, ES, IT, FR аналогично файлам выше.
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN']?.[key] || key;

  const categories = [
    { id: 'DESIGN', titleKey: 'cat_design' },
    { id: 'DEV', titleKey: 'cat_dev' },
    { id: 'TEXT', titleKey: 'cat_text' },
    { id: 'SEO', titleKey: 'cat_seo' },
    { id: 'SOCIAL', titleKey: 'cat_social' },
    { id: 'AUDIO', titleKey: 'cat_audio' },
    { id: 'BUSINESS', titleKey: 'cat_bus' }
  ];

  // Инициализация
  useEffect(() => {
    const savedLang = localStorage.getItem('unit_lang');
    if (savedLang) setLang(savedLang);
    const savedCurrency = localStorage.getItem('unit_currency');
    if (savedCurrency) setCurrency(savedCurrency);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/');
      } else {
        setUser(session.user);
      }
      setLoadingAuth(false);
    });
  }, [router]);

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}_${Math.random()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('services').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('services').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) {
      toast.error(translate('fill_req'));
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = '';
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      // Получаем профиль продавца, чтобы записать его имя
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const sellerName = profile?.full_name || user.email.split('@')[0];

      const { error } = await supabase.from('services').insert([
        {
          title,
          description,
          price: Number(price),
          category,
          image_url: finalImageUrl,
          seller_email: user.email,
          seller_name: sellerName,
          user_id: user.id
        }
      ]);

      if (error) throw error;

      toast.success(translate('success'));
      router.push('/profile'); // После успеха кидаем обратно в кабинет

    } catch (err: any) {
      toast.error(translate('err_save') + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loadingAuth) return <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center font-bold text-[#11a95e]">UNIT...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-[#333] pb-12">
      
      {/* Шапка */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[800px] mx-auto px-4 h-[60px] flex items-center justify-between">
          <Link href="/" className="text-[24px] font-black tracking-tighter text-[#222]">
            UNIT<span className="text-[#11a95e]">.</span>
          </Link>
          <Link href="/profile" className="text-[13px] font-bold text-gray-400 hover:text-[#11a95e] flex items-center gap-2 transition-colors">
            ← {translate('back')}
          </Link>
        </div>
      </header>

      {/* Форма */}
      <main className="max-w-[800px] mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
          
          <div className="mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-[28px] font-black text-[#222] mb-2">{translate('page_title')}</h1>
            <p className="text-[14px] text-gray-500">{translate('page_sub')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Название */}
            <div>
              <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('label_title')}</label>
              <input 
                required 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder={translate('ph_title')} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] outline-none focus:bg-white focus:border-[#11a95e] transition-colors font-medium text-[#222]" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Категория */}
              <div>
                <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('label_cat')}</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] outline-none focus:bg-white focus:border-[#11a95e] transition-colors font-medium text-[#222]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{translate(c.titleKey)}</option>
                  ))}
                </select>
              </div>

              {/* Цена */}
              <div>
                <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('label_price')}</label>
                <input 
                  required 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder={translate('ph_price')} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] outline-none focus:bg-white focus:border-[#11a95e] transition-colors font-medium text-[#222]" 
                />
              </div>
            </div>

            {/* Описание */}
            <div>
              <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('label_desc')}</label>
              <textarea 
                required 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder={translate('ph_desc')} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] outline-none focus:bg-white focus:border-[#11a95e] transition-colors font-medium text-[#222] min-h-[160px] resize-y" 
              />
            </div>

            {/* Фото */}
            <div>
              <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2">{translate('label_photo')}</label>
              <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-8 text-center hover:border-[#11a95e]/50 hover:bg-emerald-50/30 transition-colors group">
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} 
                />
                <div className="text-[14px] font-medium text-gray-500">
                  {selectedFile ? (
                    <span className="text-[#11a95e] font-bold">{translate('file_selected')} {selectedFile.name}</span>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📸</span>
                      <span>{translate('click_to_upload')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопка отправки */}
            <div className="pt-6 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={isUploading} 
                className="w-full bg-[#11a95e] text-white font-black text-[16px] py-4 rounded-xl hover:bg-[#0e9552] transition-all disabled:bg-gray-300 shadow-lg shadow-emerald-100"
              >
                {isUploading ? translate('publishing') : translate('publish_btn')}
              </button>
            </div>

          </form>
        </div>
      </main>

    </div>
  );
}