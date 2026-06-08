import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const useMarketplaceData = () => {
  const [services, setServices] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, profilesRes, adsRes, tasksRes] = await Promise.all([
          supabase.from('services').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('ads').select('*'),
          supabase.from('tasks').select('*').eq('status', 'open').order('created_at', { ascending: false })
        ]);

        if (isMounted) {
          if (servicesRes.data) {
            // Обогащаем услуги профилями продавцов
            const enriched = servicesRes.data.map(s => {
              const prof = profilesRes.data?.find(p => p.id === s.user_id || p.email === s.seller_email);
              return { ...s, sellerProfile: prof || null };
            });
            setServices(enriched);
          }
          if (adsRes.data) setAds(adsRes.data);
          if (tasksRes.data) setTasks(tasksRes.data);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, []);

  return { services, tasks, ads, loading, setServices, setTasks };
};