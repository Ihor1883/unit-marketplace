"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [pass, setPass] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (pass === 'ТВОЙ_ПАРОЛЬ') {
      document.cookie = "admin_token=SUPER_SECRET_KEY_123; path=/; max-age=86400"; // Живет 24 часа
      router.push('/admin');
    } else {
      alert('Неверный пароль!');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <input type="password" onChange={(e) => setPass(e.target.value)} className="border p-2" />
      <button onClick={handleLogin} className="bg-black text-white p-2">Войти</button>
    </div>
  );
}