"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function AdminModeration() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    setLoading(true);
    // Получаем нерассмотренные нарушения
    const { data } = await supabase
      .from('violations')
      .select('*')
      .eq('is_reviewed', false)
      .order('created_at', { ascending: false });
      
    if (data) setViolations(data);
    setLoading(false);
  };

  const handleBanUser = async (userEmail: string, violationId: string) => {
    if (!confirm(`Точно заблокировать ${userEmail}? Пользователь не сможет пользоваться чатом и заказами.`)) return;
    
    // Блокируем в профилях
    await supabase.from('profiles').update({ is_banned: true }).eq('email', userEmail);
    // Отмечаем нарушение как рассмотренное
    await supabase.from('violations').update({ is_reviewed: true }).eq('id', violationId);
    
    setViolations(violations.filter(v => v.id !== violationId));
    alert("Аккаунт заблокирован.");
  };

  const handleDismiss = async (violationId: string) => {
    // Прощаем пользователя, убираем из списка
    await supabase.from('violations').update({ is_reviewed: true }).eq('id', violationId);
    setViolations(violations.filter(v => v.id !== violationId));
  };

  if (loading) return <div>Загрузка панели модерации...</div>;
  if (violations.length === 0) return <div className="p-6 bg-green-50 text-green-700 rounded-xl font-bold">🎉 Нарушений не найдено. В чатах чисто!</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
      <h2 className="text-xl font-black text-red-600 mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        Панель модерации (Нарушители)
      </h2>
      
      <div className="space-y-4">
        {violations.map((v) => (
          <div key={v.id} className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="text-[12px] font-black text-red-500 uppercase tracking-widest mb-1">{v.reason}</div>
              <div className="font-bold text-[#111] mb-1">{v.user_email}</div>
              <div className="text-[14px] text-gray-700 italic bg-white p-2 rounded border border-red-100">
                "{v.message}"
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => handleDismiss(v.id)}
                className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-[12px] font-bold hover:bg-gray-50 transition-colors"
              >
                Простить
              </button>
              <button 
                onClick={() => handleBanUser(v.user_email, v.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-[12px] font-bold hover:bg-red-700 transition-colors shadow-sm shadow-red-500/30"
              >
                Заблокировать аккаунт
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}