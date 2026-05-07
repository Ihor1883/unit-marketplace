"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RegulationsPage() {
  const [lang, setLang] = useState('RU');

  // Мини-словарь для юридических страниц
  const t: Record<string, any> = {
    RU: { title: "Регламент маркетплейса", back: "На главную", text: "Здесь будет текст правил использования вашего сервиса..." },
    EN: { title: "Terms of Service", back: "Back to home", text: "Terms of service text will be here..." },
    PL: { title: "Regulamin serwisu", back: "Na główną", text: "Tekst regulaminu będzie tutaj..." },
    DE: { title: "Nutzungsbedingungen", back: "Zur Startseite", text: "Der Text der Nutzungsbedingungen wird hier stehen..." },
    ES: { title: "Términos de servicio", back: "Al inicio", text: "El texto de los términos de servicio estará aquí..." },
    IT: { title: "Termini di servizio", back: "Alla Home", text: "Il testo dei termini di servizio sarà qui..." },
    FR: { title: "Conditions d'utilisation", back: "Accueil", text: "Le texte des conditions d'utilisation sera ici..." }
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  useEffect(() => {
    const savedLang = localStorage.getItem('unit_lang');
    if (savedLang) setLang(savedLang);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333] pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-4 h-[70px] flex items-center justify-between">
          <Link href="/" className="text-[32px] font-black tracking-tighter">
            UNIT<span className="text-[#11a95e]">.</span>
          </Link>
          <Link href="/" className="text-[14px] font-bold text-gray-500 hover:text-[#11a95e] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {translate('back')}
          </Link>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 py-12">
        <div className="bg-white rounded-[12px] p-8 shadow-sm border border-gray-200">
          <h1 className="text-3xl font-black mb-8 text-[#222]">{translate('title')}</h1>
          <div className="text-gray-600 leading-relaxed space-y-4">
            {/* СЮДА В БУДУЩЕМ ВСТАВИШЬ НАСТОЯЩИЙ ТЕКСТ РЕГЛАМЕНТА */}
            <p>{translate('text')}</p>
            <p>1. Общие положения...</p>
            <p>2. Права и обязанности сторон...</p>
          </div>
        </div>
      </main>
    </div>
  );
}