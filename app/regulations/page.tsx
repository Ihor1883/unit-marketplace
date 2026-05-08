"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RegulationsPage() {
  const [lang, setLang] = useState('RU');

  useEffect(() => {
    const savedLang = localStorage.getItem('unit_lang');
    if (savedLang) setLang(savedLang);
  }, []);

  const t: Record<string, any> = {
    RU: { 
      title: "Регламент маркетплейса UNIT", back: "На главную", last_updated: "Последнее обновление: Май 2026",
      sections: [
        { title: "1. Общие положения", body: "Платформа UNIT является онлайн-маркетплейсом, предоставляющим пользователям возможность публиковать, продавать и покупать цифровые услуги. Платформа выступает исключительно в роли информационного посредника." },
        { title: "2. Регистрация и аккаунт", body: "Пользователь обязуется предоставлять достоверную информацию при регистрации. Пользователь несет полную ответственность за сохранность своих учетных данных и все действия, совершенные под его аккаунтом." },
        { title: "3. Заказы и оплата", body: "Цены на услуги устанавливаются продавцами самостоятельно. Сделки заключаются напрямую между покупателем и продавцом. Платформа оставляет за собой право взимать комиссию за использование сервиса." },
        { title: "4. Права и обязанности", body: "Пользователям запрещается публиковать незаконный контент, нарушать авторские права третьих лиц и использовать платформу для мошеннических действий. Администрация имеет право блокировать нарушителей." },
        { title: "5. Разрешение споров", body: "Все разногласия между покупателем и продавцом должны решаться путем переговоров через внутренний чат платформы. Платформа не несет юридической ответственности за качество выполненных фрилансерами работ." }
      ]
    },
    EN: { 
      title: "UNIT Terms of Service", back: "Back to home", last_updated: "Last updated: May 2026",
      sections: [
        { title: "1. General Provisions", body: "The UNIT platform is an online marketplace that allows users to publish, sell, and buy digital services. The platform acts solely as an informational intermediary." },
        { title: "2. Registration and Account", body: "The user agrees to provide accurate information during registration. The user is fully responsible for the security of their credentials and all activities under their account." },
        { title: "3. Orders and Payments", body: "Prices for services are set by the sellers. Transactions are made directly between the buyer and the seller. The platform reserves the right to charge a fee for using the service." },
        { title: "4. Rights and Obligations", body: "Users are strictly prohibited from publishing illegal content, violating third-party copyrights, or using the platform for fraudulent activities. Administration may suspend violators." },
        { title: "5. Dispute Resolution", body: "All disputes between the buyer and seller should be resolved through negotiations via the internal chat. The platform bears no legal responsibility for the quality of work performed." }
      ]
    },
    PL: { 
      title: "Regulamin serwisu UNIT", back: "Na główną", last_updated: "Ostatnia aktualizacja: Maj 2026",
      sections: [
        { title: "1. Postanowienia ogólne", body: "Platforma UNIT to internetowy rynek (marketplace), który umożliwia użytkownikom publikowanie, sprzedaż i zakup usług cyfrowych. Platforma działa wyłącznie jako pośrednik informacyjny." },
        { title: "2. Rejestracja i konto", body: "Użytkownik zobowiązuje się do podania prawdziwych informacji podczas rejestracji oraz ponosi pełną odpowiedzialność za bezpieczeństwo swoich danych logowania." },
        { title: "3. Zamówienia i płatności", body: "Ceny usług ustalają sami sprzedawcy. Transakcje zawierane są bezpośrednio między kupującym a sprzedającym. Platforma zastrzega sobie prawo do pobierania prowizji." },
        { title: "4. Prawa i obowiązki", body: "Zabrania się publikowania nielegalnych treści, naruszania praw autorskich oraz oszustw. Administracja ma prawo zablokować konto użytkownika naruszającego zasady." },
        { title: "5. Rozwiązywanie sporów", body: "Wszelkie spory między użytkownikami powinny być rozwiązywane w drodze negocjacji przez wewnętrzny czat. Platforma nie ponosi odpowiedzialności prawnej za jakość wykonanych usług." }
      ]
    },
    DE: { 
      title: "Nutzungsbedingungen UNIT", back: "Zur Startseite", last_updated: "Letztes Update: Mai 2026",
      sections: [
        { title: "1. Allgemeine Bestimmungen", body: "Die UNIT-Plattform ist ein Online-Marktplatz für digitale Dienste. Die Plattform agiert ausschließlich als Informationsvermittler." },
        { title: "2. Registrierung und Konto", body: "Der Nutzer verpflichtet sich, bei der Registrierung genaue Angaben zu machen und ist für die Sicherheit seiner Zugangsdaten verantwortlich." },
        { title: "3. Bestellungen und Zahlungen", body: "Preise werden von den Verkäufern festgelegt. Transaktionen finden direkt zwischen Käufer und Verkäufer statt." },
        { title: "4. Rechte und Pflichten", body: "Nutzern ist es untersagt, illegale Inhalte zu veröffentlichen oder Urheberrechte zu verletzen. Zuwiderhandlungen führen zur Sperrung." },
        { title: "5. Streitbeilegung", body: "Alle Streitigkeiten sollten über den internen Chat gelöst werden. Die Plattform übernimmt keine rechtliche Verantwortung für die Arbeitsqualität." }
      ]
    },
    ES: { 
      title: "Términos de servicio UNIT", back: "Al inicio", last_updated: "Última actualización: Mayo 2026",
      sections: [
        { title: "1. Disposiciones Generales", body: "La plataforma UNIT es un mercado en línea para servicios digitales. Actúa únicamente como intermediario informativo." },
        { title: "2. Registro y Cuenta", body: "El usuario se compromete a proporcionar información precisa y es responsable de la seguridad de sus credenciales." },
        { title: "3. Pedidos y Pagos", body: "Los precios son fijados por los vendedores. Las transacciones se realizan directamente entre comprador y vendedor." },
        { title: "4. Derechos y Obligaciones", body: "Está prohibido publicar contenido ilegal o violar derechos de autor. La administración puede suspender a los infractores." },
        { title: "5. Resolución de Disputas", body: "Las disputas deben resolverse mediante el chat interno. La plataforma no se responsabiliza por la calidad del trabajo." }
      ]
    },
    IT: { 
      title: "Termini di servizio UNIT", back: "Alla Home", last_updated: "Ultimo aggiornamento: Maggio 2026",
      sections: [
        { title: "1. Disposizioni Generali", body: "La piattaforma UNIT è un marketplace online per servizi digitali e funge solo da intermediario informativo." },
        { title: "2. Registrazione e Account", body: "L'utente si impegna a fornire informazioni accurate ed è responsabile della sicurezza delle proprie credenziali." },
        { title: "3. Ordini e Pagamenti", body: "I prezzi sono stabiliti dai venditori. Le transazioni avvengono direttamente tra acquirente e venditore." },
        { title: "4. Diritti e Obblighi", body: "È vietato pubblicare contenuti illegali o violare i diritti d'autore. L'amministrazione può bloccare i trasgressori." },
        { title: "5. Risoluzione delle Controversie", body: "Le controversie devono essere risolte tramite la chat interna. La piattaforma non è responsabile della qualità del lavoro." }
      ]
    },
    FR: { 
      title: "Conditions d'utilisation UNIT", back: "Accueil", last_updated: "Dernière mise à jour : Mai 2026",
      sections: [
        { title: "1. Dispositions Générales", body: "La plateforme UNIT est un marché en ligne pour les services numériques. Elle agit uniquement comme intermédiaire." },
        { title: "2. Inscription et Compte", body: "L'utilisateur s'engage à fournir des informations exactes et est responsable de la sécurité de ses identifiants." },
        { title: "3. Commandes et Paiements", body: "Les prix sont fixés par les vendeurs. Les transactions se font directement entre acheteur et vendeur." },
        { title: "4. Droits et Obligations", body: "Il est interdit de publier du contenu illégal ou de violer les droits d'auteur. L'administration peut suspendre les contrevenants." },
        { title: "5. Résolution des Litiges", body: "Les litiges doivent être résolus via le chat interne. La plateforme n'est pas responsable de la qualité du travail." }
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