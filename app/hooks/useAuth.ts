import { useState, useEffect } from 'react';
import { supabase } from '../supabase'; // проверьте путь до вашего файла

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    // Подписываемся на изменения (вход/выход)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null);
    });

    return () => { 
      isMounted = false; 
      subscription?.unsubscribe(); 
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, authLoading, logout };
};