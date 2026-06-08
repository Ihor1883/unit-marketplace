import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const useSupabaseRealtime = (user: any) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [toast, setToast] = useState<{ title: string, message: string } | null>(null);

  // Логика присутствия (Онлайн статус)
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase.channel('global-presence');
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = Object.values(state).flatMap((users: any) => users.map((u: any) => u.user_id));
        setOnlineUsers([...new Set(onlineIds)]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
           const { data } = await supabase.from('profiles').select('show_online').eq('id', user.id).single();
           if (data?.show_online !== false) {
              await channel.track({ user_id: user.id }); 
           }
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Логика уведомлений (Тоасты)
  useEffect(() => {
    if (!user) return;

    const checkTaskAndNotify = async (newResponse: any) => {
      const { data: task } = await supabase
        .from('tasks').select('client_email, title').eq('id', newResponse.task_id).single();
        
      if (task && task.client_email === user.email) {
        setToast({
          title: 'Новый отклик на задание!',
          message: `Пользователь ${newResponse.freelancer_email} откликнулся на "${task.title}"`
        });
        setTimeout(() => setToast(null), 6000);
      }
    };

    const channel = supabase.channel('realtime-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_responses' }, (payload) => {
        checkTaskAndNotify(payload.new);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new.freelancer_email === user.email) {
          setToast({
            title: 'Вас выбрали исполнителем! 🎉',
            message: 'Заказчик подтвердил вашу кандидатуру. Новый заказ добавлен в Кабинет.'
          });
          setTimeout(() => setToast(null), 8000);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { onlineUsers, toast, setToast };
};