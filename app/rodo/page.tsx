"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RodoPage() {
  const [lang, setLang] = useState('RU');

  // Мини-словарь
  const t: Record<string, any> = {
    RU: { title: "Политика конфиденциальности (RODO)", back: "На главную", text: "Здесь будет информация об обработке персональных данных..." },
    EN: { title: "Privacy Policy (GDPR)", back: "Back to home", text: "Information about personal data processing will be here..." },
    PL: { title: "Polityka prywatności (RODO)", back: "Na główną", text: "Informacje o przetwarzaniu danych osobowych będą tutaj..." },
    DE: { title: "Datenschutzerklärung (DSGVO)", back: "Zur Startseite", text: "Informationen zur Verarbeitung personenbezogener Daten..." },
    ES: { title: "Política de privacidad (RGPD)", back: "Al inicio", text: "La información sobre el procesamiento de datos personales estará aquí..." },
    IT: { title: "Informativa sulla privacy (GDPR)", back: "Alla Home", text: "Le informazioni sul trattamento dei dati personali saranno qui..." },
    FR: { title: "Politique de confidentialité (RGPD)", back: "Accueil", text: "Les informations sur le traitement des données personnelles seront ici..." }
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
            {/* СЮДА В БУДУЩЕМ ВСТАВИШЬ НАСТОЯЩИЙ ТЕКСТ ПОЛИТИКИ RODO */}
            <p>{translate('text')}</p>
            <p>Ваши данные надежно защищены в соответствии с европейским регламентом GDPR/RODO.</p>
          </div>
        </div>
      </main>
    </div>
  );
}