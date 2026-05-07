import type { Metadata } from 'next';
import './globals.css'; // Проверь, чтобы путь к стилям совпадал с твоим

// --- НАСТРОЙКА OPEN GRAPH И SEO ---
export const metadata: Metadata = {
  title: 'UNIT Marketplace — Цифровые Услуги',
  description: 'Найдите идеального специалиста. Тысячи фрилансеров готовы выполнить вашу задачу прямо сейчас.',
  
  // Стандарт Open Graph (Telegram, WhatsApp, Facebook, LinkedIn)
  openGraph: {
    title: 'UNIT Marketplace — Цифровые Услуги',
    description: 'Надежная биржа цифровых услуг. Быстрый заказ, безопасная оплата и чат с фрилансерами.',
    url: 'https://unit-marketplace.vercel.app', // Позже заменишь на свой реальный домен
    siteName: 'UNIT',
    images: [
      {
        url: '/og-image.jpg', // Ссылка на картинку превью
        width: 1200,
        height: 630,
        alt: 'UNIT Marketplace Cover',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  
  // Настройки для Twitter (X)
  twitter: {
    card: 'summary_large_image',
    title: 'UNIT Marketplace',
    description: 'Найдите идеального специалиста. Тысячи фрилансеров онлайн.',
    images: ['/og-image.jpg'], 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-[#F3F4F6] text-[#333] antialiased">
        {children}
      </body>
    </html>
  );
}