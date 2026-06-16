"use client";

import React, { useState, useRef, useEffect } from 'react';

// --- СЛОВАРЬ ИНТЕРФЕЙСА ПОМОЩНИКА (Вынесен наружу для оптимизации) ---
const t: Record<string, any> = {
  RU: {
    title: "Помощник UNIT",
    greeting: "Привет! Я виртуальный помощник UNIT. 🚀 Помогу найти специалиста, создать задание или разобраться в функциях. Какой у вас вопрос?",
    placeholder: "Ваш вопрос...",
    send: "Отправить",
    thinking: "UNIT думает",
    error: "Извините, сейчас я на техническом перерыве. Пожалуйста, повторите вопрос чуть позже."
  },
  EN: {
    title: "UNIT Assistant",
    greeting: "Hello! I am the UNIT virtual assistant. 🚀 I can help you find a specialist, create a task, or figure out the features. What is your question?",
    placeholder: "Your question...",
    send: "Send",
    thinking: "UNIT is thinking",
    error: "Sorry, I'm currently on a technical break. Please try again a bit later."
  },
  PL: {
    title: "Asystent UNIT",
    greeting: "Cześć! Jestem wirtualnym asystentem UNIT. 🚀 Pomogę Ci znaleźć specjalistę, utworzyć zadanie lub zrozumieć funkcje. Jakie masz pytanie?",
    placeholder: "Twoje pytanie...",
    send: "Wyślij",
    thinking: "UNIT myśli",
    error: "Przepraszam, mam obecnie przerwę techniczną. Spróbuj ponownie później."
  },
  DE: {
    title: "UNIT Assistent",
    greeting: "Hallo! Ich bin der virtuelle UNIT-Assistent. 🚀 Ich helfe bei der Suche nach Spezialisten oder beim Erstellen von Aufgaben. Was ist Ihre Frage?",
    placeholder: "Ihre Frage...",
    send: "Senden",
    thinking: "UNIT denkt nach",
    error: "Entschuldigung, ich bin gerade in einer technischen Pause. Bitte versuchen Sie es später noch einmal."
  },
  ES: {
    title: "Asistente UNIT",
    greeting: "¡Hola! Soy el asistente virtual de UNIT. 🚀 Puedo ayudarte a encontrar un especialista, crear una tarea o entender las funciones. ¿Cuál es tu pregunta?",
    placeholder: "Tu pregunta...",
    send: "Enviar",
    thinking: "UNIT está pensando",
    error: "Lo siento, estoy en una pausa técnica. Por favor, inténtalo de nuevo más tarde."
  },
  IT: {
    title: "Assistente UNIT",
    greeting: "Ciao! Sono l'assistente virtuale di UNIT. 🚀 Posso aiutarti a trovare uno specialista, creare un'attività o capire le funzioni. Qual è la tua domanda?",
    placeholder: "La tua domanda...",
    send: "Invia",
    thinking: "UNIT sta pensando",
    error: "Scusa, sono in pausa tecnica. Riprova più tardi."
  },
  FR: {
    title: "Assistant UNIT",
    greeting: "Bonjour ! Je suis l'assistant virtuel d'UNIT. 🚀 Je peux vous aider à trouver un spécialiste, créer une tâche ou comprendre les fonctionnalités. Quelle est votre question ?",
    placeholder: "Votre question...",
    send: "Envoyer",
    thinking: "UNIT réfléchit",
    error: "Désolé, je suis en pause technique. Veuillez réessayer plus tard."
  }
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('RU');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  // Отслеживаем изменение языка в реальном времени
  useEffect(() => {
    const checkLang = () => {
      const savedLang = localStorage.getItem('unit_lang') || 'RU';
      
      setLang(prevLang => {
        if (prevLang !== savedLang) {
          // Если язык сменился, переводим самое первое приветственное сообщение
          setMessages(prev => {
            if (prev.length <= 1) { // Меняем только если юзер еще не начал диалог
              return [{ role: 'ai', text: t[savedLang]?.greeting || t['EN'].greeting }];
            }
            return prev;
          });
          return savedLang;
        }
        return prevLang;
      });
    };

    checkLang(); // Запуск при загрузке
    const interval = setInterval(checkLang, 500); // Проверка каждые полсекунды
    
    return () => clearInterval(interval);
  }, []);

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

    const langNames: Record<string, string> = { 
      RU: "Russian", EN: "English", PL: "Polish", DE: "German", 
      ES: "Spanish", IT: "Italian", FR: "French" 
    };
    const targetLangName = langNames[lang] || "English";
    
    const apiPrompt = `[System instruction: You are a helpful assistant for the UNIT Marketplace. Reply strictly in ${targetLangName} language]. User asks: ${userMsg}`;

    try {
      const response = await fetch('https://cqqygtqtdztcwcdwvifr.supabase.co/functions/v1/clever-processor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_T3mXpJUgZmPr7cwJcLPohA_0JsjIrAO',
          'Authorization': 'Bearer sb_publishable_T3mXpJUgZmPr7cwJcLPohA_0JsjIrAO'
        },
        body: JSON.stringify({ message: apiPrompt, language: lang }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      
    } catch (e: any) {
      console.error("Ошибка AI помощника:", e);
      setMessages(prev => [...prev, { role: 'ai', text: translate('error') }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      <div className="bg-white w-[340px] h-[480px] rounded-[24px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-200">
        <div className="bg-gradient-to-r from-[#11a95e] to-emerald-500 p-4 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse"></div>
            <span className="font-black tracking-tight text-[15px]">{translate('title')}</span>
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
              <span>{translate('thinking')}</span>
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
            placeholder={translate('placeholder')}
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="h-[40px] bg-gradient-to-r from-orange-400 to-orange-500 text-white font-black text-[11px] uppercase tracking-wider px-4 rounded-xl transition-all shadow-md shadow-orange-500/10 disabled:opacity-40 shrink-0 cursor-pointer"
          >
            {translate('send')}
          </button>
        </div>
      </div>
    </div>
  );
}