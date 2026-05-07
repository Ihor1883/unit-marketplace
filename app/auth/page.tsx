"use client";
import { useState, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LogIn, Mail, Lock, Loader2, ChevronLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  'https://bvkynrssmjwvflqefhcn.supabase.co', 
  'sb_publishable_tqAPmwHev9W5Z4rIbqtouA_oaCXi2KR'
);

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      alert(isSignUp ? "Проверьте почту для подтверждения!" : "Вы вошли!");
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-black transition">
          <ChevronLeft size={14} /> На главную
        </Link>

        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-black">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <LogIn size={30} />
            </div>
          </div>

          <h1 className="text-3xl font-[1000] text-center uppercase tracking-tighter mb-2">
            {isSignUp ? 'Создать аккаунт' : 'С возвращением'}
          </h1>
          <p className="text-center text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-10">
            GlobalTask Marketplace
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="email" 
                placeholder="EMAIL" 
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-5 font-bold outline-none focus:border-blue-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="password" 
                placeholder="PASSWORD" 
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-5 font-bold outline-none focus:border-blue-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
            </button>
          </form>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition"
          >
            {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
          </button>
        </div>
        
        <div className="mt-10 flex justify-center items-center gap-2 text-gray-400">
          <Sparkles size={16} />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Secure Auth by Supabase</span>
        </div>
      </div>
    </div>
  );
}