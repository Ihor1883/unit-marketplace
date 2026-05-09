import type { Metadata } from 'next';
import './globals.css'; 

// --- НАСТРОЙКА OPEN GRAPH И SEO ---
export const metadata: Metadata = {
  title: 'UNIT Marketplace — Цифровые Услуги',
  description: 'Найдите идеального специалиста. Тысячи фрилансеров готовы выполнить вашу задачу прямо сейчас.',
  
  // Стандарт Open Graph (Telegram, WhatsApp, Facebook, LinkedIn)
  openGraph: {
    title: 'UNIT Marketplace — Цифровые Услуги',
    description: 'Надежная биржа цифровых услуг. Быстрый заказ, безопасная оплата и чат с фрилансерами.',
    url: 'https://unit-marketplace.vercel.app', 
    siteName: 'UNIT',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=1200&auto=format&fit=crop', // Временная красивая заглушка
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
    images: ['https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=1200&auto=format&fit=crop'], 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="bg-[#F3F4F6] text-[#333] antialiased">
        {children}
      </body>
    </html>
  );
}