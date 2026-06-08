"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Привет! Я виртуальный помощник UNIT. 🚀 Помогу найти специалиста, создать задание или разобраться в функциях. Какой у вас вопрос?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Слушаем команду на открытие чата из любой точки сайта
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpen);
    return () => window.removeEventListener('open-ai-chat', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('https://cqqygtqtdztcwcdwvifr.supabase.co/functions/v1/clever-processor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_T3mXpJUgZmPr7cwJcLPohA_0JsjIrAO',
          'Authorization': 'Bearer sb_publishable_T3mXpJUgZmPr7cwJcLPohA_0JsjIrAO'
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      
    } catch (e: any) {
      console.error("Ошибка AI помощника:", e);
      setMessages(prev => [...prev, { role: 'ai', text: 'Извините, сейчас я на техническом перерыве. Пожалуйста, повторите вопрос чуть позже.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Если чат закрыт, вообще ничего не рисуем на экране (круглой кнопки больше нет)
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      <div className="bg-white w-[340px] h-[480px] rounded-[24px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-200">
        <div className="bg-gradient-to-r from-[#11a95e] to-emerald-500 p-4 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse"></div>
            <span className="font-black tracking-tight text-[15px]">Помощник UNIT</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F9FA]">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div className={`px-4 py-2.5 text-[13px] font-medium leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                  m.role === 'user' 
                    ? 'bg-orange-500 text-white rounded-[18px] rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-[18px] rounded-tl-none'
                }`}>
                {m.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-[18px] rounded-tl-none text-[12px] text-gray-400 font-bold max-w-[80%] flex items-center gap-1 shadow-sm">
              <span>UNIT думает</span>
              <span className="animate-bounce delay-75">.</span>
              <span className="animate-bounce delay-150">.</span>
              <span className="animate-bounce delay-300">.</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="flex-1 h-[40px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-[13px] font-medium outline-none focus:border-orange-400 focus:bg-white transition-all"
            placeholder="Ваш вопрос..."
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="h-[40px] bg-gradient-to-r from-orange-400 to-orange-500 text-white font-black text-[11px] uppercase tracking-wider px-4 rounded-xl transition-all shadow-md shadow-orange-500/10 disabled:opacity-40 shrink-0 cursor-pointer"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}