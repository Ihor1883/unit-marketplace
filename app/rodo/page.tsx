"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RodoPage() {
  const [lang, setLang] = useState('RU');

  useEffect(() => {
    const savedLang = localStorage.getItem('unit_lang');
    if (savedLang) setLang(savedLang);
  }, []);

  const t: Record<string, any> = {
    RU: { 
      title: "Политика конфиденциальности (RODO)", back: "На главную", last_updated: "Последнее обновление: Май 2026",
      sections: [
        { title: "1. Администратор данных", body: "Администратором ваших персональных данных является платформа UNIT. Мы обрабатываем данные в строгом соответствии с Общим регламентом по защите данных (GDPR / RODO)." },
        { title: "2. Собираемые данные", body: "Мы собираем только ту информацию, которая необходима для работы сервиса: адрес электронной почты, историю заказов, отзывы и данные профиля (имя, аватар)." },
        { title: "3. Цели обработки", body: "Ваши данные используются исключительно для обеспечения функциональности маркетплейса: авторизации, связи между покупателем и продавцом, и уведомлений о статусе заказов." },
        { title: "4. Права пользователя", body: "В соответствии с RODO вы имеете право на доступ к своим данным, их исправление, а также право на полное удаление аккаунта и данных («право быть забытым»)." },
        { title: "5. Защита и файлы Cookie", body: "Мы используем современные методы шифрования для защиты вашей информации. Платформа использует файлы Cookie (например, localStorage) исключительно для сохранения настроек языка и авторизации." }
      ]
    },
    EN: { 
      title: "Privacy Policy (GDPR)", back: "Back to home", last_updated: "Last updated: May 2026",
      sections: [
        { title: "1. Data Controller", body: "The UNIT platform is the controller of your personal data. We process data in strict compliance with the General Data Protection Regulation (GDPR / RODO)." },
        { title: "2. Data Collected", body: "We collect only the information necessary for the service to function: email address, order history, reviews, and profile data (name, avatar)." },
        { title: "3. Purpose of Processing", body: "Your data is used solely to provide marketplace functionality: authorization, communication between buyer and seller, and order status notifications." },
        { title: "4. User Rights", body: "Under the GDPR, you have the right to access your data, correct it, and request complete deletion of your account and data (the 'right to be forgotten')." },
        { title: "5. Security and Cookies", body: "We use modern encryption to protect your information. The platform uses Cookies (e.g., localStorage) solely to save language settings and authorization." }
      ]
    },
    PL: { 
      title: "Polityka prywatności (RODO)", back: "Na główną", last_updated: "Ostatnia aktualizacja: Maj 2026",
      sections: [
        { title: "1. Administrator Danych", body: "Administratorem Twoich danych osobowych jest platforma UNIT. Przetwarzamy dane zgodnie z Ogólnym Rozporządzeniem o Ochronie Danych (RODO / GDPR)." },
        { title: "2. Gromadzone dane", body: "Zbieramy tylko informacje niezbędne do działania serwisu: adres e-mail, historię zamówień, opinie oraz dane profilowe (imię, avatar)." },
        { title: "3. Cel przetwarzania", body: "Twoje dane są wykorzystywane wyłącznie do obsługi marketplace'u: autoryzacji, komunikacji między kupującym a sprzedającym oraz powiadomień o zamówieniach." },
        { title: "4. Prawa użytkownika", body: "Zgodnie z RODO masz prawo dostępu do swoich danych, ich poprawiania, a także prawo do całkowitego usunięcia konta i danych («prawo do bycia zapomnianym»)." },
        { title: "5. Bezpieczeństwo i Pliki Cookie", body: "Stosujemy nowoczesne metody szyfrowania. Platforma używa plików cookie (np. localStorage) wyłącznie do zapisu ustawień językowych i autoryzacji." }
      ]
    },
    DE: { 
      title: "Datenschutzerklärung (DSGVO)", back: "Zur Startseite", last_updated: "Letztes Update: Mai 2026",
      sections: [
        { title: "1. Verantwortlicher", body: "Die UNIT-Plattform ist der Verantwortliche für Ihre Daten gemäß der DSGVO (GDPR)." },
        { title: "2. Erhobene Daten", body: "Wir erheben nur notwendige Daten: E-Mail-Adresse, Bestellverlauf, Bewertungen und Profildaten." },
        { title: "3. Zweck der Verarbeitung", body: "Ihre Daten werden nur zur Bereitstellung der Marktplatz-Funktionen verwendet." },
        { title: "4. Nutzerrechte", body: "Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten ('Recht auf Vergessenwerden')." },
        { title: "5. Sicherheit und Cookies", body: "Wir nutzen moderne Verschlüsselung. Cookies werden nur zur Speicherung von Spracheinstellungen verwendet." }
      ]
    },
    ES: { 
      title: "Política de privacidad (RGPD)", back: "Al inicio", last_updated: "Última actualización: Mayo 2026",
      sections: [
        { title: "1. Responsable de los datos", body: "La plataforma UNIT es el responsable de sus datos bajo el RGPD (GDPR)." },
        { title: "2. Datos Recopilados", body: "Solo recopilamos lo necesario: correo electrónico, historial de pedidos, reseñas y perfil." },
        { title: "3. Finalidad del Tratamiento", body: "Sus datos se utilizan únicamente para el funcionamiento del mercado." },
        { title: "4. Derechos del Usuario", body: "Tiene derecho a acceder, corregir y eliminar sus datos ('derecho al olvido')." },
        { title: "5. Seguridad y Cookies", body: "Usamos cifrado moderno. Las cookies solo se usan para guardar el idioma y la sesión." }
      ]
    },
    IT: { 
      title: "Informativa sulla privacy (GDPR)", back: "Alla Home", last_updated: "Ultimo aggiornamento: Maggio 2026",
      sections: [
        { title: "1. Titolare del trattamento", body: "La piattaforma UNIT è il titolare dei tuoi dati in conformità al GDPR." },
        { title: "2. Dati Raccolti", body: "Raccogliamo solo i dati necessari: email, cronologia ordini, recensioni e profilo." },
        { title: "3. Finalità del Trattamento", body: "I tuoi dati servono esclusivamente per le funzionalità del marketplace." },
        { title: "4. Diritti dell'Utente", body: "Hai il diritto di accedere, correggere e cancellare i tuoi dati ('diritto all'oblio')." },
        { title: "5. Sicurezza e Cookie", body: "Utilizziamo crittografia moderna. I cookie servono solo per la lingua e la sessione." }
      ]
    },
    FR: { 
      title: "Politique de confidentialité (RGPD)", back: "Accueil", last_updated: "Dernière mise à jour : Mai 2026",
      sections: [
        { title: "1. Responsable du traitement", body: "La plateforme UNIT est responsable de vos données selon le RGPD." },
        { title: "2. Données Collectées", body: "Nous ne collectons que l'essentiel : email, historique, avis et profil." },
        { title: "3. Finalité du Traitement", body: "Vos données sont utilisées uniquement pour le fonctionnement de la plateforme." },
        { title: "4. Droits de l'Utilisateur", body: "Vous avez le droit d'accéder, de modifier ou de supprimer vos données ('droit à l'oubli')." },
        { title: "5. Sécurité et Cookies", body: "Nous utilisons un chiffrement moderne. Les cookies servent uniquement pour la langue et la session." }
      ]
    }
  };

  const currentT = t[lang] || t['EN'];

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-[#333] pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-4 h-[70px] flex items-center justify-between">
          <Link href="/" className="text-[32px] font-black tracking-tighter">
            UNIT<span className="text-[#11a95e]">.</span>
          </Link>
          <Link href="/" className="text-[14px] font-bold text-gray-500 hover:text-[#11a95e] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {currentT.back}
          </Link>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 py-12">
        <div className="bg-white rounded-[12px] p-8 md:p-12 shadow-sm border border-gray-200">
          <h1 className="text-3xl md:text-4xl font-black mb-4 text-[#222]">{currentT.title}</h1>
          <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-10 pb-6 border-b border-gray-100">{currentT.last_updated}</p>
          
          <div className="text-gray-700 leading-relaxed space-y-8">
            {currentT.sections.map((sec: any, idx: number) => (
              <div key={idx}>
                <h3 className="text-[18px] font-extrabold text-[#222] mb-3">{sec.title}</h3>
                <p className="text-[15px]">{sec.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}