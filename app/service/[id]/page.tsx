import { Metadata } from 'next';
import { supabase } from '../../supabase';
import ServiceClient from './ServiceClient';

// 1. ЗАПРЕЩАЕМ КЭШИРОВАНИЕ: Заставляем Vercel всегда запрашивать свежие данные
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  // 2. РАСПАКОВКА ПАРАМЕТРОВ (Фикс для новых версий Next.js)
  const resolvedParams = await params;
  const serviceId = resolvedParams.id;

  const { data: service } = await supabase
    .from('services')
    .select('title, description, image_url')
    .eq('id', serviceId)
    .single();

  if (!service) {
    return { title: 'Услуга не найдена | UNIT' };
  }

  const shortDescription = service.description 
    ? service.description.substring(0, 150) + '...' 
    : 'Смотрите подробности на сайте';

  return {
    title: `${service.title} | UNIT`,
    description: shortDescription,
    openGraph: {
      title: service.title,
      description: shortDescription,
      images: [
        service.image_url || 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=1200&auto=format&fit=crop'
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: service.title,
      description: shortDescription,
      images: [service.image_url || 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=1200&auto=format&fit=crop'],
    }
  };
}

export default function Page() {
  return <ServiceClient />;
}