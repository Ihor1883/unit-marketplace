import { useMemo } from 'react';
import { categories } from '../lib/constants';

export const useMarketplaceFilters = (
  services: any[],
  tasks: any[],
  filters: any, // Сюда мы передадим объект со всеми стейтами фильтров
  translate: (key: string) => string
) => {
  const { searchQuery, activeCategory, sortBy, favorites, showFavoritesOnly, hiddenServices, showHiddenOnly, budgetRanges, budgetMin, budgetMax, lang } = filters;

  const sortedServices = useMemo(() => {
    const filtered = services.filter(s => {
      if (showHiddenOnly ? !hiddenServices.includes(s.id) : hiddenServices.includes(s.id)) return false;
      if (showFavoritesOnly && !favorites.includes(s.id)) return false;
      if (activeCategory !== 'ALL' && s.category !== activeCategory) return false;
      
      if (searchQuery) {
        const queryWords = searchQuery.toLowerCase().split(' ').filter((w: string) => w.trim() !== '');
        const catKey = categories.find((c: any) => c.id === s.category)?.titleKey || s.category;
        const combinedText = `${s.title || ''} ${s.description || ''} ${translate(catKey)}`.toLowerCase();
        if (!queryWords.every((word: string) => combinedText.includes(word))) return false;
      }
      
      if (budgetRanges.length > 0) {
        const matchesRange = budgetRanges.some((range: string) => {
          if (range === 'r1') return s.price < 1000;
          if (range === 'r2') return s.price >= 1000 && s.price <= 3000;
          if (range === 'r3') return s.price > 3000 && s.price <= 10000;
          if (range === 'r4') return s.price > 10000 && s.price <= 30000;
          if (range === 'r5') return s.price > 30000;
          return false;
        });
        if (!matchesRange) return false;
      }
      if (budgetMin !== '' && s.price < Number(budgetMin)) return false;
      if (budgetMax !== '' && s.price > Number(budgetMax)) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (a.is_top && !b.is_top) return -1;
      if (!a.is_top && b.is_top) return 1;
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'rating': return (Number(b.rating_avg) || 0) - (Number(a.rating_avg) || 0);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
      }
    });
  }, [services, searchQuery, activeCategory, sortBy, favorites, showFavoritesOnly, hiddenServices, showHiddenOnly, budgetRanges, budgetMin, budgetMax, lang]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (activeCategory !== 'ALL' && t.category !== activeCategory) return false;
      if (searchQuery) {
         // Аналогичная логика для задач...
         return true;
      }
      return true;
    });
  }, [tasks, searchQuery, activeCategory, budgetRanges, budgetMin, budgetMax, lang]);

  return { sortedServices, filteredTasks };
};