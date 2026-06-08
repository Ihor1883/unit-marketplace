"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SafetyPage() {
  const router = useRouter();
  const [lang, setLang] = useState('EN');

  useEffect(() => {
    const savedLang = localStorage.getItem('unit_lang');
    if (savedLang) setLang(savedLang);
  }, []);

  const t: Record<string, any> = {
    RU: {
      badge: "Безопасность", back: "Вернуться на сайт →", important: "Важно",
      title: "Как не потерять деньги и защитить свой труд",
      desc: "Платформа работает в бесплатном режиме. Все финансовые операции проходят напрямую между заказчиком и исполнителем. Ознакомьтесь с правилами.",
      schema_title: "Рекомендуемая схема сделки",
      s1: "Чат внутри UNIT", s1_d: "Фиксируйте все ТЗ, сроки и стоимость только в нашем чате.",
      s2: "Разбивка платежа", s2_d: "Работайте по предоплате 30-50%. Не переводите 100% аванса.",
      s3: "Демонстрация", s3_d: "Исполнитель показывает результат (скриншоты, вотермарки).",
      s4: "Оплата и Исходники", s4_d: "Перевод остатка суммы и передача чистых файлов заказчику.",
      client_memo: "Памятка Заказчику",
      c1: "Избегайте 100% предоплаты", c1_d: "Оплачивайте всю сумму вперед только ТОП специалистам. С новичками договаривайтесь на 50/50.",
      c2: "Не переходите по ссылкам", c2_d: "UNIT не принимает платежи. Если вам кидают ссылку на «Безопасную сделку» — это мошенники.",
      c3: "Оценивайте адекватность цены", c3_d: "Если предлагают сложный сайт за копейки за один день — вас попытаются развести на аванс.",
      free_memo: "Памятка Фрилансеру",
      f1: "Защищайте свой труд", f1_d: "Не отправляйте готовые исходники до 100% оплаты. Используйте водяные знаки.",
      f2: "Осторожно с архивами", f2_d: "Не качайте .rar или .zip архивы от заказчиков. Внутри может быть вирус. Просите ТЗ текстом или PDF.",
      f3: "Берите минимальный аванс", f3_d: "Если работа занимает больше 2 дней, просите хотя бы 20% предоплаты.",
      gold_title: "Золотое правило платформы",
      gold_desc: "Вся переписка должна вестись ТОЛЬКО В ЧАТЕ UNIT. Если вы ушли в Telegram и вас обманули — мы не сможем помочь. При подозрениях нажимайте «Жалоба»."
    },
    EN: {
      badge: "Safety", back: "Back to site →", important: "Important",
      title: "How to avoid losing money and protect your work",
      desc: "The platform operates in free mode. All financial transactions are directly between the client and freelancer. Read the rules to stay safe.",
      schema_title: "Recommended Transaction Scheme",
      s1: "Chat inside UNIT", s1_d: "Discuss tasks, deadlines, and prices only in our chat.",
      s2: "Split the payment", s2_d: "Work with 30-50% upfront. Never pay 100% in advance.",
      s3: "Demonstration", s3_d: "Freelancer shows the result (screenshots, watermarks).",
      s4: "Final Payment & Files", s4_d: "Transfer the rest of the money and get the source files.",
      client_memo: "Client Guide",
      c1: "Avoid 100% upfront payment", c1_d: "Pay fully in advance only to TOP sellers. Otherwise, agree on 50/50.",
      c2: "Don't click external links", c2_d: "UNIT does not process payments. Links to 'Safe Deal' are phishing.",
      c3: "Assess price reality", c3_d: "If a complex project is offered for pennies in one day, it's likely a scam.",
      free_memo: "Freelancer Guide",
      f1: "Protect your work", f1_d: "Never send source files before 100% payment. Use watermarks.",
      f2: "Beware of archives", f2_d: "Don't download .rar or .zip files. They may contain viruses. Ask for text or PDF.",
      f3: "Take a small advance", f3_d: "If work takes >2 days, ask for at least a 20% upfront payment.",
      gold_title: "The Golden Rule",
      gold_desc: "All communication must stay IN THE UNIT CHAT. If you move to Telegram and get scammed, we cannot help."
    },
    PL: {
      badge: "Bezpieczeństwo", back: "Powrót do strony →", important: "Ważne",
      title: "Jak chronić swoje pieniądze i pracę",
      desc: "Platforma działa w trybie darmowym. Wszystkie transakcje finansowe odbywają się bezpośrednio. Przeczytaj zasady.",
      schema_title: "Zalecany schemat transakcji",
      s1: "Czat w UNIT", s1_d: "Ustalaj zadania, terminy i ceny tylko na naszym czacie.",
      s2: "Podział płatności", s2_d: "Pracuj na 30-50% zaliczki. Nigdy nie płać 100% z góry.",
      s3: "Demonstracja", s3_d: "Freelancer pokazuje wynik (zrzuty ekranu, znaki wodne).",
      s4: "Płatność i Pliki", s4_d: "Przelew reszty kwoty i przekazanie plików źródłowych.",
      client_memo: "Dla Klienta",
      c1: "Unikaj 100% zaliczki", c1_d: "Płać z góry tylko sprawdzonym ekspertom. Z nowymi ustal 50/50.",
      c2: "Nie klikaj w linki", c2_d: "UNIT nie przetwarza płatności. Linki do 'Bezpiecznej transakcji' to oszustwo.",
      c3: "Oceniaj cenę", c3_d: "Złożony projekt za grosze w jeden dzień to prawdopodobnie oszustwo.",
      free_memo: "Dla Freelancera",
      f1: "Chron swoją pracę", f1_d: "Nie wysyłaj plików źródłowych przed 100% płatnością. Używaj znaków wodnych.",
      f2: "Uważaj na archiwa", f2_d: "Nie pobieraj plików .rar ani .zip. Proś o tekst lub PDF.",
      f3: "Bierz małą zaliczkę", f3_d: "Jeśli praca trwa >2 dni, poproś o co najmniej 20% zaliczki.",
      gold_title: "Złota Zasada",
      gold_desc: "Cała komunikacja musi odbywać się NA CZACIE UNIT. Jeśli przejdziesz na Telegram i zostaniesz oszukany, nie będziemy w stanie pomóc."
    },
    DE: {
      badge: "Sicherheit", back: "Zurück zur Seite →", important: "Wichtig",
      title: "Wie Sie Geldverlust vermeiden und Ihre Arbeit schützen",
      desc: "Die Plattform arbeitet im kostenlosen Modus. Transaktionen erfolgen direkt. Lesen Sie die Regeln.",
      schema_title: "Empfohlenes Transaktionsschema",
      s1: "Chat in UNIT", s1_d: "Diskutieren Sie alles nur in unserem Chat.",
      s2: "Zahlung aufteilen", s2_d: "Arbeiten Sie mit 30-50% Vorschuss. Nie 100% im Voraus zahlen.",
      s3: "Demonstration", s3_d: "Freelancer zeigt das Ergebnis (Screenshots, Wasserzeichen).",
      s4: "Endzahlung & Dateien", s4_d: "Restbetrag überweisen und Quelldateien erhalten.",
      client_memo: "Für Kunden",
      c1: "Keine 100% Vorauszahlung", c1_d: "Zahlen Sie nur bei TOP-Verkäufern im Voraus.",
      c2: "Klicken Sie nicht auf Links", c2_d: "UNIT verarbeitet keine Zahlungen. Externe Zahlungslinks sind Phishing.",
      c3: "Preis bewerten", c3_d: "Ein komplexes Projekt für Pfennige an einem Tag ist wahrscheinlich Betrug.",
      free_memo: "Für Freelancer",
      f1: "Schützen Sie Ihre Arbeit", f1_d: "Quelldateien nie vor 100% Zahlung senden. Wasserzeichen verwenden.",
      f2: "Vorsicht vor Archiven", f2_d: "Laden Sie keine .rar- oder .zip-Dateien herunter.",
      f3: "Vorschuss nehmen", f3_d: "Wenn die Arbeit >2 Tage dauert, fragen Sie nach mind. 20% Vorschuss.",
      gold_title: "Die Goldene Regel",
      gold_desc: "Die gesamte Kommunikation muss IM UNIT-CHAT bleiben."
    },
    ES: {
      badge: "Seguridad", back: "Volver al sitio →", important: "Importante",
      title: "Cómo no perder dinero y proteger su trabajo",
      desc: "La plataforma funciona en modo gratuito. Las transacciones son directas. Lea las reglas.",
      schema_title: "Esquema de transacción recomendado",
      s1: "Chat en UNIT", s1_d: "Discuta todo solo en nuestro chat.",
      s2: "Dividir el pago", s2_d: "Trabaje con un adelanto del 30-50%.",
      s3: "Demostración", s3_d: "El freelancer muestra el resultado (marcas de agua).",
      s4: "Pago final y archivos", s4_d: "Transfiera el resto y obtenga los archivos.",
      client_memo: "Para el Cliente",
      c1: "Evite el pago 100% por adelantado", c1_d: "Pague solo a expertos comprobados.",
      c2: "No haga clic en enlaces", c2_d: "UNIT no procesa pagos. Los enlaces externos son phishing.",
      c3: "Evalúe el precio", c3_d: "Proyectos complejos por centavos suelen ser estafas.",
      free_memo: "Para el Freelancer",
      f1: "Proteja su trabajo", f1_d: "Nunca envíe archivos antes del pago total.",
      f2: "Cuidado con los archivos", f2_d: "No descargue .rar o .zip. Solicite PDF.",
      f3: "Tome un adelanto", f3_d: "Pida al menos un 20% de anticipo.",
      gold_title: "La Regla de Oro",
      gold_desc: "Toda la comunicación debe permanecer EN EL CHAT DE UNIT."
    },
    IT: {
      badge: "Sicurezza", back: "Torna al sito →", important: "Importante",
      title: "Come proteggere i tuoi soldi e il tuo lavoro",
      desc: "La piattaforma opera in modalità gratuita. Le transazioni sono dirette.",
      schema_title: "Schema di transazione",
      s1: "Chat in UNIT", s1_d: "Discuti tutto solo nella nostra chat.",
      s2: "Dividi il pagamento", s2_d: "Lavora con un anticipo del 30-50%.",
      s3: "Dimostrazione", s3_d: "Il freelancer mostra il risultato (filigrane).",
      s4: "Pagamento e File", s4_d: "Trasferisci il resto e ottieni i file.",
      client_memo: "Per il Cliente",
      c1: "Evita il 100% in anticipo", c1_d: "Paga solo esperti verificati.",
      c2: "Non cliccare sui link", c2_d: "UNIT non elabora pagamenti. I link esterni sono phishing.",
      c3: "Valuta il prezzo", c3_d: "Progetti complessi per pochi soldi sono truffe.",
      free_memo: "Per il Freelancer",
      f1: "Proteggi il tuo lavoro", f1_d: "Mai inviare file prima del pagamento completo.",
      f2: "Attenzione agli archivi", f2_d: "Non scaricare .rar o .zip.",
      f3: "Prendi un anticipo", f3_d: "Chiedi almeno il 20% di anticipo.",
      gold_title: "La Regola d'Oro",
      gold_desc: "Tutta la comunicazione deve rimanere NELLA CHAT DI UNIT."
    },
    FR: {
      badge: "Sécurité", back: "Retour au site →", important: "Important",
      title: "Comment protéger votre argent et votre travail",
      desc: "La plateforme fonctionne en mode gratuit. Les transactions sont directes.",
      schema_title: "Schéma de transaction",
      s1: "Chat dans UNIT", s1_d: "Discutez tout uniquement dans notre chat.",
      s2: "Divisez le paiement", s2_d: "Travaillez avec 30 à 50 % d'avance.",
      s3: "Démonstration", s3_d: "Le freelance montre le résultat (filigranes).",
      s4: "Paiement et Fichiers", s4_d: "Transférez le reste et obtenez les fichiers.",
      client_memo: "Pour le Client",
      c1: "Évitez 100% d'avance", c1_d: "Payez uniquement les experts vérifiés.",
      c2: "Ne cliquez pas sur les liens", c2_d: "UNIT ne traite pas les paiements.",
      c3: "Évaluez le prix", c3_d: "Les projets complexes pour des centimes sont des arnaques.",
      free_memo: "Pour le Freelance",
      f1: "Protégez votre travail", f1_d: "N'envoyez jamais de fichiers avant le paiement total.",
      f2: "Attention aux archives", f2_d: "Ne téléchargez pas de .rar ou .zip.",
      f3: "Prenez une avance", f3_d: "Demandez au moins 20% d'avance.",
      gold_title: "La Règle d'Or",
      gold_desc: "Toute la communication doit rester DANS LE CHAT UNIT."
    }
  };

  const translate = (key: string) => (t[lang] && t[lang][key]) ? t[lang][key] : t['EN'][key] || key;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#333] pb-20">
      
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1000px] mx-auto px-4 h-[64px] flex items-center justify-between">
          <div className="text-[24px] font-black tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => router.push('/')}>
            <span>UNIT<span className="text-[#11a95e]">.</span></span> 
            <span className="text-[10px] uppercase tracking-widest font-black text-white bg-red-500 px-2 py-0.5 rounded-md hidden sm:inline-block shadow-sm">
              {translate('badge')}
            </span>
          </div>
          <button onClick={() => router.push('/')} className="text-[13px] font-bold text-gray-400 hover:text-orange-500 transition-colors">
            {translate('back')}
          </button>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 py-8">
        
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm animate-pulse">
                {translate('important')}
              </span>
            </div>
            <h1 className="text-[28px] md:text-[36px] font-black text-white leading-tight mb-4 tracking-tight" dangerouslySetInnerHTML={{__html: translate('title')}}></h1>
            <p className="text-gray-400 text-[14px] md:text-[16px] max-w-2xl font-medium leading-relaxed">
              {translate('desc')}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-[20px] font-black text-[#111] mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#11a95e]/10 text-[#11a95e] flex items-center justify-center text-[16px]">🛡️</span>
            {translate('schema_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-black flex items-center justify-center mx-auto mb-3 text-[14px]">1</div>
              <h3 className="font-bold text-[13px] mb-1">{translate('s1')}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{translate('s1_d')}</p>
            </div>
            
            <div className="relative z-10 bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-black flex items-center justify-center mx-auto mb-3 text-[14px]">2</div>
              <h3 className="font-bold text-[13px] mb-1">{translate('s2')}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{translate('s2_d')}</p>
            </div>
            
            <div className="relative z-10 bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-black flex items-center justify-center mx-auto mb-3 text-[14px]">3</div>
              <h3 className="font-bold text-[13px] mb-1">{translate('s3')}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{translate('s3_d')}</p>
            </div>
            
            <div className="relative z-10 bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
              <div className="w-8 h-8 rounded-full bg-[#11a95e] text-white font-black flex items-center justify-center mx-auto mb-3 text-[14px]">4</div>
              <h3 className="font-bold text-[13px] mb-1">{translate('s4')}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{translate('s4_d')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          <div className="bg-orange-50/50 rounded-2xl p-6 md:p-8 border border-orange-100">
            <h2 className="text-[18px] font-black text-orange-600 mb-5 uppercase tracking-wide text-center">{translate('client_memo')}</h2>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <span className="text-orange-500 text-[18px] leading-none mt-0.5">✕</span>
                <div>
                  <h4 className="font-bold text-[14px] text-gray-900 mb-1">{translate('c1')}</h4>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{translate('c1_d')}</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-orange-500 text-[18px] leading-none mt-0.5">✕</span>
                <div>
                  <h4 className="font-bold text-[14px] text-gray-900 mb-1">{translate('c2')}</h4>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{translate('c2_d')}</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-orange-500 text-[18px] leading-none mt-0.5">✓</span>
                <div>
                  <h4 className="font-bold text-[14px] text-gray-900 mb-1">{translate('c3')}</h4>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{translate('c3_d')}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50/50 rounded-2xl p-6 md:p-8 border border-blue-100">
            <h2 className="text-[18px] font-black text-blue-600 mb-5 uppercase tracking-wide text-center">{translate('free_memo')}</h2>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <span className="text-blue-500 text-[18px] leading-none mt-0.5">🛡️</span>
                <div>
                  <h4 className="font-bold text-[14px] text-gray-900 mb-1">{translate('f1')}</h4>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{translate('f1_d')}</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-blue-500 text-[18px] leading-none mt-0.5">⚠️</span>
                <div>
                  <h4 className="font-bold text-[14px] text-gray-900 mb-1">{translate('f2')}</h4>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{translate('f2_d')}</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-blue-500 text-[18px] leading-none mt-0.5">💰</span>
                <div>
                  <h4 className="font-bold text-[14px] text-gray-900 mb-1">{translate('f3')}</h4>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{translate('f3_d')}</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="bg-white border-2 border-red-100 rounded-2xl p-6 text-center">
          <h3 className="text-[16px] font-black text-red-500 uppercase tracking-widest mb-2">{translate('gold_title')}</h3>
          <p className="text-[14px] text-gray-700 font-medium max-w-2xl mx-auto">
            {translate('gold_desc')}
          </p>
        </div>

      </main>
    </div>
  );
}