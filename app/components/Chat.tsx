"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';

export default function Chat({ orderId, userEmail, lang }: { orderId: string, userEmail: string, lang: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const t: any = {
    RU: { placeholder: "Напишите сообщение...", send: "Отправить" },
    EN: { placeholder: "Type a message...", send: "Send" },
    PL: { placeholder: "Napisz wiadomość...", send: "Wyślij" },
    DE: { placeholder: "Schreiben...", send: "Senden" },
    ES: { placeholder: "Escribir...", send: "Enviar" },
    IT: { placeholder: "Scrivere...", send: "Invia" },
    FR: { placeholder: "Écrire...", send: "Envoyer" }
  };
  const translate = (key: string) => t[lang]?.[key] || t['EN'][key];

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${orderId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `order_id=eq.${orderId}` 
      }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const msg = newMessage;
    setNewMessage('');
    
    const { error } = await supabase.from('messages').insert([
      { order_id: orderId, sender_email: userEmail, text: msg }
    ]);
    
    if (error) return;

    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CHAT_MESSAGE',
          orderId: orderId,
          sender: userEmail,
          text: msg
        })
      });
    } catch (e) {}
  };

  return (
    // ИСПРАВЛЕНО: rounded-[16px] вместо огромного круга
    <div className="flex flex-col h-[380px] bg-white border border-gray-200 rounded-[16px] overflow-hidden mt-4 shadow-md animate-in fade-in duration-300">
      
      {/* Шапка чата */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Live Chat</span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender_email === userEmail ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-[14px] text-[14px] shadow-sm ${
              m.sender_email === userEmail 
                ? 'bg-[#11a95e] text-white rounded-br-none' 
                : 'bg-gray-100 text-[#333] rounded-bl-none'
            }`}>
              <p className="font-bold text-[10px] opacity-70 mb-1">{m.sender_email.split('@')[0]}</p>
              <p className="leading-snug">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Поле ввода - добавили больше отступов */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
        <input 
          className="flex-1 bg-white border border-gray-200 rounded-[10px] px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#11a95e]/20 focus:border-[#11a95e] transition-all"
          placeholder={translate('placeholder')}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage} 
          className="bg-[#11a95e] text-white px-5 py-2 rounded-[10px] font-bold text-[13px] hover:bg-[#0e9552] transition-all active:scale-95 shadow-sm"
        >
          {translate('send')}
        </button>
      </div>
    </div>
  );
}