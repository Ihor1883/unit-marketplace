import { Metadata } from 'next';
import { supabase } from '../../supabase';
import ServiceClient from './ServiceClient';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: service } = await supabase
    .from('services')
    .select('title, description, image_url')
    .eq('id', params.id)
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