import React, { useState } from 'react';
import { supabase } from '../../supabase'; // проверяем путь к supabase

interface AuthModalProps {
  onClose: () => void;
  translate: (key: string) => string;
}

export default function AuthModal({ onClose, translate }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async () => {
    setIsSubmitting(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else onClose();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else { 
        alert("Success! Now login."); 
        setIsLogin(true); 
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-[22px] text-[#111]">
            {isLogin ? translate('login') : translate('register')}
          </h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-orange-500 leading-none transition-colors">×</button>
        </div>
        <div className="space-y-4 mb-6">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[44px] border border-gray-300 rounded-xl px-4 text-[14px] outline-none focus:border-[#11a95e]" />
          <input type="password" placeholder={translate('pass_q')} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-[44px] border border-gray-300 rounded-xl px-4 text-[14px] outline-none focus:border-[#11a95e]" />
        </div>
        <button onClick={handleAuth} disabled={isSubmitting} className="w-full h-[44px] bg-gradient-to-r from-[#11a95e] to-emerald-500 hover:from-[#0e9552] hover:to-[#11a95e] text-white rounded-xl font-bold text-[14px] transition-all shadow-md shadow-emerald-500/20 disabled:bg-gray-400">
          {isSubmitting ? "..." : (isLogin ? translate('login') : translate('register'))}
        </button>
        <div className="mt-4 text-center text-[13px] text-gray-500">
          {isLogin ? translate('no_acc') : translate('has_acc')}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#11a95e] font-bold hover:underline">
            {isLogin ? translate('register') : translate('login')}
          </button>
        </div>
      </div>
    </div>
  );
}