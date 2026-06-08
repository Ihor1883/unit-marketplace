'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon, BriefcaseIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function HeroBanner() {
  const [searchQuery, setSearchQuery] = useState('');

  const popularTags = ['Next.js', 'Дизайн UI/UX', 'Копирайтинг', 'Supabase', 'Python'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Логика поиска по базе данных Supabase или редирект на страницу каталога
    console.log('Поиск:', searchQuery);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#11a95e]/10 via-emerald-50/40 to-blue-50/30 p-1 dark:from-[#11a95e]/5 dark:via-zinc-900 dark:to-zinc-900/50">
      
      {/* Декоративные светящиеся сферы на фоне для усиления эффекта Glassmorphism */}
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#11a95e]/20 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
      
      {/* Основной стеклянный баннер */}
      <div className="relative w-full rounded-[22px] border border-white/30 bg-white/60 p-6 backdrop-blur-xl transition-all duration-300 md:p-12 dark:border-zinc-800/50 dark:bg-zinc-900/60">
        
        <div className="mx-auto max-w-4xl text-center">
          {/* Приветственный бейдж */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#11a95e]/10 px-4 py-1.5 text-xs font-medium text-[#11a95e] backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <span className="h-2 w-2 rounded-full bg-[#11a95e] animate-pulse" />
            UNIT Marketplace — Будущее фриланса уже здесь
          </span>

          {/* Главный заголовок */}
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl dark:text-white">
            Найдите идеального исполнителя для{' '}
            <span className="relative inline-block text-[#11a95e]">
              любых задач
              <span className="absolute bottom-1 left-0 h-2 w-full bg-[#11a95e]/10 rounded-full -z-10" />
            </span>
          </h1>

          <p className="mt-4 text-base text-zinc-600 sm:text-lg dark:text-zinc-400 max-w-2xl mx-auto">
            Сотни проверенных специалистов в категориях разработки, дизайна и маркетинга. Безопасная сделка и прозрачные условия.
          </p>

          {/* Форма поиска (Воздушная стеклянная панель) */}
          <form 
            onSubmit={handleSearch}
            className="mt-10 flex w-full flex-col gap-2 rounded-2xl border border-white/40 bg-white/70 p-2 shadow-sm backdrop-blur-md transition-all duration-300 focus-within:border-[#11a95e]/50 focus-within:shadow-md sm:flex-row sm:items-center dark:border-zinc-700/40 dark:bg-zinc-800/80"
          >
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Какую услугу или исполнителя вы ищете?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-transparent py-3 pl-12 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 rounded-xl bg-[#11a95e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#0f9653] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
            >
              Найти
              <MagnifyingGlassIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            </button>
          </form>

          {/* Популярные теги */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">Популярно:</span>
            {popularTags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className="rounded-full border border-zinc-200/60 bg-white/40 px-3 py-1 transition-all duration-300 hover:border-[#11a95e]/30 hover:bg-[#11a95e]/10 hover:text-[#11a95e] hover:-translate-y-0.5 dark:border-zinc-700/60 dark:bg-zinc-800/40"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Сетка мини-статистики (Воздушные карточки) */}
          <div className="mt-12 grid grid-cols-1 gap-4 border-t border-zinc-200/50 pt-8 sm:grid-cols-3 dark:border-zinc-800/60">
            
            <div className="group flex items-center justify-center gap-3 rounded-2xl p-3 transition-all duration-300 hover:bg-white/40 dark:hover:bg-zinc-800/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#11a95e]/10 text-[#11a95e] transition-transform duration-300 group-hover:scale-110">
                <UserGroupIcon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-zinc-900 dark:text-white">12,400+</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Активных фрилансеров</div>
              </div>
            </div>

            <div className="group flex items-center justify-center gap-3 rounded-2xl p-3 transition-all duration-300 hover:bg-white/40 dark:hover:bg-zinc-800/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#11a95e]/10 text-[#11a95e] transition-transform duration-300 group-hover:scale-110">
                <BriefcaseIcon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-zinc-900 dark:text-white">3,850+</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Открытых проектов</div>
              </div>
            </div>

            <div className="group flex items-center justify-center gap-3 rounded-2xl p-3 transition-all duration-300 hover:bg-white/40 dark:hover:bg-zinc-800/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#11a95e]/10 text-[#11a95e] transition-transform duration-300 group-hover:scale-110">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-zinc-900 dark:text-white">99.4%</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Успешных сделок</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}