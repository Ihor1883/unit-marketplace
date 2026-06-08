"use client"; // Компоненты ошибок обязательно должны быть клиентскими

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Выводим ошибку в консоль для разработчиков
    console.error("Критическая ошибка на сайте:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 max-w-md w-full relative overflow-hidden">
        
        {/* Декоративные свечения */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#11a95e] rounded-full mix-blend-multiply filter blur-3xl opacity-15 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-[60px] leading-none mb-5">🛠️</div>
          <h1 className="text-[22px] font-black text-[#111] mb-2 tracking-tight">
            Технические неполадки
          </h1>
          <p className="text-[14px] text-gray-500 mb-8 font-medium leading-relaxed">
            Прямо сейчас мы обновляем сайт или чиним непредвиденную ошибку. Пожалуйста, подождите немного — скоро всё заработает!
          </p>
          
          {/* Кнопка "Попробовать снова" */}
          <button
            onClick={() => reset()} // Пытается перезагрузить упавший компонент
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-black py-3.5 rounded-xl text-[13px] uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  );
}