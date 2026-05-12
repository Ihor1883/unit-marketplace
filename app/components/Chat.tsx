"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';

export default function Chat({ orderId, userEmail, lang }: { orderId: string, userEmail: string, lang: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t: any = {
    RU: { placeholder: "Напишите сообщение...", send: "Отправить", live: "ЧАТ ПО ЗАКАЗУ" },
    EN: { placeholder: "Type a message...", send: "Send", live: "LIVE CHAT" },
    PL: { placeholder: "Napisz wiadomość...", send: "Wyślij", live: "CZAT NA ŻYWO" },
    DE: { placeholder: "Schreiben...", send: "Senden", live: "LIVE-CHAT" },
    ES: { placeholder: "Escribir...", send: "Enviar", live: "CHAT EN VIVO" },
    IT: { placeholder: "Scrivere...", send: "Invia", live: "CHAT DAL VIVO" },
    FR: { placeholder: "Écrire...", send: "Envoyer", live: "CHAT EN DIRECT" }
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
      setLoading(false);
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
    
    if (error) {
        setNewMessage(msg); // Возвращаем текст в поле при ошибке
        return;
    }

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
    <div className="flex flex-col h-[420px] bg-white border border-gray-200 rounded-[16px] overflow-hidden mt-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Шапка чата */}
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">{translate('live')}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">#{orderId.slice(0, 8)}</span>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAFA]">
        {loading ? (
            <div className="h-full flex items-center justify-center text-gray-300 text-sm italic"> UNIT CHAT... </div>
        ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                <span className="text-3xl">💬</span>
                <p className="text-[12px] font-medium">Нет сообщений. Начните диалог!</p>
            </div>
        ) : (
            messages.map((m, i) => {
              const isMe = m.sender_email === userEmail;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-[18px] text-[14px] shadow-sm relative group ${
                    isMe 
                      ? 'bg-[#11a95e] text-white rounded-br-none' 
                      : 'bg-white border border-gray-100 text-[#333] rounded-bl-none'
                  }`}>
                    <div className="flex justify-between items-baseline gap-4 mb-0.5">
                        <p className={`font-black text-[9px] uppercase tracking-wider ${isMe ? 'text-white/70' : 'text-[#11a95e]'}`}>
                            {isMe ? 'Вы' : m.sender_email.split('@')[0]}
                        </p>
                        <span className={`text-[8px] opacity-50 ${isMe ? 'text-white' : 'text-gray-400'}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="leading-snug font-medium">{m.text}</p>
                  </div>
                </div>
              )
            })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Поле ввода */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 bg-gray-50 rounded-[12px] p-1.5 border border-gray-100 focus-within:border-[#11a95e] focus-within:ring-4 focus-within:ring-[#11a95e]/5 transition-all">
            <input 
              className="flex-1 bg-transparent px-3 py-2 text-[14px] outline-none placeholder:text-gray-400 font-medium"
              placeholder={translate('placeholder')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage} 
              className="bg-[#11a95e] text-white px-5 py-2 rounded-[10px] font-black text-[11px] uppercase tracking-wider hover:bg-[#0e9552] transition-all active:scale-95 shadow-md shadow-emerald-100 disabled:opacity-50"
              disabled={!newMessage.trim()}
            >
              {translate('send')}
            </button>
        </div>
      </div>
    </div>
  );
}