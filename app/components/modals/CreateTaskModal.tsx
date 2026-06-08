"use client";

import { useState } from 'react';
import { supabase } from '../../supabase';

// Описываем типы пропсов
interface Category {
  id: string;
  titleKey: string;
  icon?: any;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  categories: Category[];
}

export default function CreateTaskModal({ isOpen, onClose, userEmail, categories }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  // Берем первую категорию по умолчанию (пропуская 'ALL')
  const [category, setCategory] = useState(categories.find(c => c.id !== 'ALL')?.id || 'OTHER'); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !budget) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    setIsSubmitting(true);

    // Отправляем данные в таблицу tasks
    const { error } = await supabase.from('tasks').insert([
      {
        title,
        description,
        budget: Number(budget),
        category,
        client_email: userEmail,
        status: 'Open'
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      alert("Ошибка при создании задания: " + error.message);
    } else {
      alert("Задание успешно создано!");
      setTitle('');
      setDescription('');
      setBudget('');
      onClose();
      // Перезагружаем страницу, чтобы подтянуть новые задания из базы
      window.location.reload(); 
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="font-black text-[20px] text-[#111]">Создать новое задание</h2>
          <button onClick={onClose} className="text-3xl leading-none text-gray-400 hover:text-orange-500 transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Название задания</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Например: Сделать дизайн логотипа"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#11a95e] focus:bg-white transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Подробное описание</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Опишите, что именно нужно сделать, требования и пожелания..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#11a95e] focus:bg-white transition-all min-h-[120px] resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Бюджет</label>
              <input 
                type="number" 
                value={budget} 
                onChange={(e) => setBudget(e.target.value)} 
                placeholder="Сумма"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#11a95e] focus:bg-white transition-all"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Категория</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#11a95e] focus:bg-white transition-all cursor-pointer font-bold text-gray-700"
              >
                {categories.filter(c => c.id !== 'ALL').map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-[13px] text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white px-8 py-3 rounded-xl font-bold text-[13px] transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
            >
              {isSubmitting ? 'Создание...' : 'Опубликовать'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}