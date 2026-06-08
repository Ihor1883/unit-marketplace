"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { checkMessage, censorText } from '../utils/moderation'; // ПОДКЛЮЧАЕМ ФИЛЬТР

interface GlobalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  translate: (key: string) => string;
}

const CATEGORIES = [
  { id: 'ALL', titleKey: 'cat_all', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg> },
  { id: 'DESIGN', titleKey: 'cat_design', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
  { id: 'DEV', titleKey: 'cat_dev', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
  { id: 'TEXT', titleKey: 'cat_text', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
  { id: 'SEO', titleKey: 'cat_seo', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  { id: 'SOCIAL', titleKey: 'cat_social', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2v4l.586-.586z" /></svg> },
  { id: 'AUDIO', titleKey: 'cat_audio', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
  { id: 'PHOTO', titleKey: 'cat_photo', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { id: 'ANIMATION', titleKey: 'cat_anim', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14v4m0 0v10m0-14l-8 4m8 4l-8-4m0 0v10l8 4"/></svg> },
  { id: 'EDUCATION', titleKey: 'cat_edu', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg> },
  { id: 'BUSINESS', titleKey: 'cat_bus', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }
];

export default function GlobalChatModal({ isOpen, onClose, user, translate }: GlobalChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Загрузка сообщений и подписка
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchMessages = async () => {
      let query = supabase.from('global_chat').select('*').order('created_at', { ascending: true });
      if (activeCategory !== 'ALL') {
        query = query.eq('category', activeCategory);
      }
      const { data } = await query;
      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase.channel('global_chat_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'global_chat' }, payload => {
        if (payload.eventType === 'INSERT') {
           if (activeCategory === 'ALL' || payload.new.category === activeCategory) {
             setMessages(prev => {
               if (prev.some(m => m.id === payload.new.id)) return prev;
               return [...prev, payload.new];
             });
           }
        } else if (payload.eventType === 'UPDATE') {
           setMessages(prev => prev.map(msg => msg.id === payload.new.id ? payload.new : msg));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, activeCategory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. Отправка с мгновенным откликом UI + МОДЕРАЦИЯ
  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    const originalText = newMessage;
    const currentCategory = activeCategory;

    // 1. ПРОВЕРКА НА БАН
    const { data: profile } = await supabase.from('profiles').select('is_banned').eq('id', user.id).single();
    if (profile?.is_banned) {
      alert("Ваш аккаунт заблокирован за нарушение правил. Общение в чате недоступно.");
      return;
    }

    // 2. ФИЛЬТРАЦИЯ
    const moderation = checkMessage(originalText);
    const textToSend = moderation.isClean ? originalText : censorText(originalText);

    // 3. ОТПРАВКА ЖАЛОБЫ АДМИНУ
    if (!moderation.isClean) {
      await supabase.from('violations').insert([{
        user_email: user.email,
        user_id: user.id,
        message: originalText,
        reason: moderation.reason
      }]);
    }

    setNewMessage(''); 

    // Оптимистичное обновление (уже с отцензуренным текстом)
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      user_id: user.id,
      user_email: user.email,
      text: textToSend,
      category: currentCategory,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, tempMsg]);

 // Фоновый запрос
    const { data, error } = await supabase.from('global_chat').insert([{
      user_id: user.id,
      user_email: user.email,
      text: textToSend,
      category: currentCategory,
      is_deleted: false
    }]).select().single();

    if (error) {
      // ❗️ Теперь мы распечатаем ошибку полностью, даже если она "пустая"
      console.error("Детали ошибки Supabase:", JSON.stringify(error, null, 2));
      setMessages(prev => prev.filter(m => m.id !== tempId));
      
      const errMsg = error.message || error.details || error.hint || "Ошибка доступа RLS: Supabase блокирует запись.";
      alert("Ошибка при отправке: " + errMsg);
    } else if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }
  };

  // 3. Удаление
  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить сообщение?')) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_deleted: true, text: '' } : m));
      const { error } = await supabase.from('global_chat').update({ is_deleted: true, text: '' }).eq('id', id);
      if (error) console.error("Ошибка удаления:", error);
    }
  };

  const handleStartEdit = (id: string, text: string) => {
    setEditingMessageId(id);
    setEditMessageText(text);
  };

  // 4. Сохранение редактирования + МОДЕРАЦИЯ
  const handleSaveEdit = async () => {
    if (!editMessageText.trim() || !editingMessageId) return;
    
    const targetId = editingMessageId;
    const originalText = editMessageText;
    const updatedTime = new Date().toISOString();

    // Прогоняем через фильтр при редактировании
    const moderation = checkMessage(originalText);
    const textToSave = moderation.isClean ? originalText : censorText(originalText);

    if (!moderation.isClean) {
      await supabase.from('violations').insert([{
        user_email: user.email,
        user_id: user.id,
        message: originalText,
        reason: moderation.reason + ' (при ред.)'
      }]);
    }

    setMessages(prev => prev.map(m => m.id === targetId ? { ...m, text: textToSave, updated_at: updatedTime } : m));
    setEditingMessageId(null);
    setEditMessageText('');

    const { error } = await supabase.from('global_chat').update({ 
      text: textToSave, 
      updated_at: updatedTime 
    }).eq('id', targetId);

    if (error) console.error("Ошибка редактирования:", error);
  };

  const filteredMessages = messages.filter(m => 
    m.text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-[600] flex justify-end">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full md:w-[50vw] bg-[#F8F9FA] h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        
        <div className="bg-white px-6 py-4 border-b border-gray-200 shrink-0 relative z-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-black text-[20px] text-[#111] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#11a95e] animate-pulse"></span>
              {translate('global_chat')}
            </h2>
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-orange-500 transition-colors">×</button>
          </div>

          <div className="flex flex-col gap-3">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Поиск по сообщению или почте..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-[13px] outline-none focus:border-[#11a95e] transition-colors"
                />
             </div>
             
             <div className="relative">
                <div 
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex justify-between items-center cursor-pointer px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors select-none"
                >
                  <span className="font-bold text-[13px] text-[#111] flex items-center gap-2">
                    <span className="text-[#11a95e]">{currentCategory.icon}</span>
                    {translate(currentCategory.titleKey)}
                  </span>
                  <span className={`text-[10px] text-gray-500 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>

                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto animate-in fade-in duration-200">
                    {CATEGORIES.map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsCategoriesOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-[13px] transition-colors ${activeCategory === cat.id ? 'bg-[#11a95e]/10 text-[#11a95e] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span className={activeCategory === cat.id ? "text-[#11a95e]" : "text-gray-400"}>
                          {cat.icon}
                        </span>
                        {translate(cat.titleKey)}
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
           {filteredMessages.length === 0 ? (
             <div className="text-center text-gray-400 text-[13px] mt-10">В этой теме пока нет сообщений. Напишите первым!</div>
           ) : (
             filteredMessages.map(m => {
               const isMyMessage = m.user_id === user?.id;
               const categoryObj = CATEGORIES.find(c => c.id === m.category);
               
               return (
                 <div key={m.id} className={`flex flex-col max-w-[85%] group ${isMyMessage ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] text-gray-400 font-bold">{m.user_email?.split('@')[0]}</span>
                      {activeCategory === 'ALL' && m.category !== 'ALL' && categoryObj && (
                        <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                          {translate(categoryObj.titleKey)}
                        </span>
                      )}
                    </div>
                    
                    <div className={`relative px-4 py-2.5 rounded-2xl text-[13px] ${isMyMessage ? 'bg-gradient-to-br from-[#11a95e] to-emerald-500 text-white rounded-br-sm shadow-sm' : 'bg-white text-[#333] rounded-bl-sm border border-gray-200 shadow-sm'}`}>
                       {m.is_deleted ? (
                         <span className="italic opacity-60 text-[12px]">🚫 Сообщение удалено</span>
                       ) : editingMessageId === m.id ? (
                         <div className="flex gap-2 items-center">
                           <input 
                             type="text" 
                             value={editMessageText} 
                             onChange={e => setEditMessageText(e.target.value)} 
                             className="text-[#333] px-2 py-1 rounded text-[12px] outline-none border border-gray-300 w-full"
                             autoFocus
                           />
                           <button onClick={handleSaveEdit} className="text-white font-bold bg-black/20 px-2 py-1 rounded text-[10px] hover:bg-black/40">✓</button>
                           <button onClick={() => setEditingMessageId(null)} className="text-white font-bold bg-black/20 px-2 py-1 rounded text-[10px] hover:bg-black/40">✕</button>
                         </div>
                       ) : (
                         <>
                           {m.text}
                           {m.updated_at && <span className="text-[9px] opacity-50 ml-2 italic">(изменено)</span>}
                         </>
                       )}
                    </div>

                    {isMyMessage && !m.is_deleted && editingMessageId !== m.id && (
                      <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                        <button onClick={() => handleStartEdit(m.id, m.text)} className="text-[10px] text-blue-500 hover:underline">Изменить</button>
                        <button onClick={() => handleDelete(m.id)} className="text-[10px] text-red-500 hover:underline">Удалить</button>
                      </div>
                    )}
                 </div>
               );
             })
           )}
           <div ref={chatEndRef} />
        </div>

        <div className="bg-white p-4 border-t border-gray-200 shrink-0 z-10">
           <div className="flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={translate('chat_ph')}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#11a95e] transition-colors"
              />
              <button 
                onClick={handleSend}
                className="bg-[#11a95e] hover:bg-[#0e9552] text-white px-5 rounded-xl font-black text-[16px] transition-all shadow-md flex items-center justify-center"
              >
                →
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}