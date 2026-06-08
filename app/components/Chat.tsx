"use client";

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { checkMessage, censorText } from '../utils/moderation'; 

interface ChatProps {
  orderId: string;
  userEmail: string;
  lang: string;
  status?: string; // Добавили статус заказа
}

export default function Chat({ orderId, userEmail, lang, status }: ChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t: Record<string, any> = {
    RU: { 
      placeholder: "Напишите сообщение...", send: "ОТПРАВИТЬ", loading: "Загрузка сообщений...", no_messages: "История сообщений пуста. Начните диалог!",
      safety_alert: "Осторожно, мошенники!", safety_text: "Мы не проводим платежи внутри сайта. Не переходите по фишинговым ссылкам и не переводите 100% предоплату.", safety_link: "Правила безопасности →"
    },
    EN: { 
      placeholder: "Type a message...", send: "SEND", loading: "Loading messages...", no_messages: "No messages yet. Start the conversation!",
      safety_alert: "Beware of scammers!", safety_text: "We do not process payments on the site. Do not click on phishing links or send 100% upfront payments.", safety_link: "Safety rules →"
    },
    PL: { 
      placeholder: "Napisz wiadomość...", send: "WYŚLIJ", loading: "Ładowanie...", no_messages: "Brak wiadomości. Rozpocznij rozmowę!",
      safety_alert: "Uwaga na oszustów!", safety_text: "Nie przetwarzamy płatności na stronie. Nie klikaj w podejrzane linki i nie wysyłaj 100% zaliczki.", safety_link: "Zasady bezpieczeństwa →"
    },
    DE: {
      placeholder: "Nachricht eingeben...", send: "SENDEN", loading: "Laden...", no_messages: "Noch keine Nachrichten. Beginnen Sie das Gespräch!",
      safety_alert: "Achtung Betrüger!", safety_text: "Wir wickeln keine Zahlungen über die Seite ab. Klicken Sie nicht auf Phishing-Links und zahlen Sie nicht 100% im Voraus.", safety_link: "Sicherheitsregeln →"
    },
    ES: {
      placeholder: "Escribe un mensaje...", send: "ENVIAR", loading: "Cargando...", no_messages: "Aún no hay mensajes. ¡Inicia la conversación!",
      safety_alert: "¡Cuidado con las estafas!", safety_text: "No procesamos pagos en el sitio. No hagas clic en enlaces sospechosos ni envíes pagos por adelantado del 100%.", safety_link: "Reglas de seguridad →"
    },
    IT: {
      placeholder: "Scrivi un messaggio...", send: "INVIA", loading: "Caricamento...", no_messages: "Nessun messaggio. Inizia la conversazione!",
      safety_alert: "Attenzione alle truffe!", safety_text: "Non gestiamo pagamenti sul sito. Non cliccare su link di phishing e non inviare pagamenti anticipati del 100%.", safety_link: "Regole di sicurezza →"
    },
    FR: {
      placeholder: "Écrivez un message...", send: "ENVOYER", loading: "Chargement...", no_messages: "Aucun message. Commencez la conversation !",
      safety_alert: "Attention aux arnaques !", safety_text: "Nous ne traitons pas les paiements sur le site. Ne cliquez pas sur des liens suspects et n'envoyez pas 100% d'acompte.", safety_link: "Règles de sécurité →"
    }
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });

        if (!error && data && isMounted) {
          setMessages(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`order_chat_${orderId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` },
        (payload) => {
          if (isMounted) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const originalText = newMessage.trim();

    try {
      // 1. ПРОВЕРКА НА БАН
      const { data: profile } = await supabase.from('profiles').select('is_banned').eq('email', userEmail).single();
      if (profile?.is_banned) {
        alert("Ваш аккаунт заблокирован за нарушение правил. Отправка сообщений недоступна.");
        setIsSending(false);
        return;
      }

      // 2. ФИЛЬТРАЦИЯ ТЕКСТА
      const moderation = checkMessage(originalText);
      const textToSend = moderation.isClean ? originalText : censorText(originalText);

      // 3. ОТПРАВКА ЖАЛОБЫ АДМИНУ (если текст грязный)
      if (!moderation.isClean) {
        await supabase.from('violations').insert([{
          user_email: userEmail,
          message: originalText,
          reason: moderation.reason
        }]);
      }

      setNewMessage('');

      // 4. ОТПРАВКА СООБЩЕНИЯ В БАЗУ
      const { error } = await supabase
        .from('messages')
        .insert([{ order_id: orderId, sender_email: userEmail, text: textToSend }]);

      if (error) {
        console.error(error.message);
        setNewMessage(originalText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const isOrderCompleted = status === 'Completed';

  return (
    <div className="flex flex-col h-[450px] bg-white rounded-2xl overflow-hidden border border-gray-100">
      
      {/* === ПРЕДУПРЕЖДАЮЩИЙ БАННЕР О БЕЗОПАСНОСТИ === */}
      <div className="bg-orange-50 border-b border-orange-100 p-3 sm:p-4 shrink-0 flex items-start gap-3">
        <div className="text-[16px] md:text-[20px] mt-0.5 animate-bounce">⚠️</div>
        <div>
          <p className="text-[11px] sm:text-[12px] text-orange-800 font-medium leading-relaxed">
            <span className="font-black">{translate('safety_alert')}</span> {translate('safety_text')}
            <a href="/safety" target="_blank" className="font-bold text-orange-600 hover:text-orange-700 underline ml-1 transition-colors">
              {translate('safety_link')}
            </a>
          </p>
        </div>
      </div>

      {/* КОРПУС СООБЩЕНИЙ */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8F9FA] min-h-0 select-text">
        {loading ? (
          <div className="h-full flex items-center justify-center text-[13px] text-gray-400 font-medium animate-pulse">
            {translate('loading')}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-6">
            <p className="text-[13px] text-gray-400 font-medium italic max-w-xs">{translate('no_messages')}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_email?.toLowerCase() === userEmail?.toLowerCase();
            return (
              <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                
                {/* ИМЯ СВЕРХУ ОБЛАЧКА */}
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1.5">
                  {msg.sender_email?.split('@')[0]}
                </span>
                
                {/* ОВАЛЬНОЕ ОБЛАЧКО С ХВОСТИКОМ */}
                <div className={`px-5 py-3 text-[14px] font-medium shadow-sm break-words relative transition-all ${
                  isMe 
                    ? 'bg-gradient-to-br from-[#11a95e] to-emerald-500 text-white rounded-[22px] rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-[22px] rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  
                  {/* ВРЕМЯ ВНУТРИ ОБЛАЧКА */}
                  <span className={`block text-[9px] font-bold text-right mt-1.5 -mb-0.5 ${
                    isMe ? 'text-emerald-100' : 'text-gray-400'
                  }`}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ФОРМА ОТПРАВКИ ИЛИ ПЛАШКА "ЗАВЕРШЕНО" */}
      {isOrderCompleted ? (
        <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex flex-col items-center justify-center text-center">
          <span className="text-[13px] font-black text-[#11a95e] uppercase tracking-wider mb-1">✓ Заказ завершен</span>
          <span className="text-[12px] text-emerald-700 font-medium">Чат доступен только для чтения</span>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={translate('placeholder')}
            disabled={loading || isSending}
            className="flex-1 h-[44px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-[14px] font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 focus:bg-white transition-all"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || isSending || loading}
            className="h-[44px] bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-600 font-black text-[12px] uppercase tracking-wider px-6 rounded-xl transition-all disabled:opacity-40 shrink-0 [&:not(:disabled)]:bg-gradient-to-r [&:not(:disabled)]:from-orange-400 [&:not(:disabled)]:to-orange-500 [&:not(:disabled)]:text-white [&:not(:disabled)]:shadow-md [&:not(:disabled)]:shadow-orange-500/10"
          >
            {isSending ? "..." : translate('send')}
          </button>
        </form>
      )}

    </div>
  );
}