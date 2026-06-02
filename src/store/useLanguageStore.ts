
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n'; // Sənin i18n konfiqurasiya faylının yolu

interface LanguageState {
  language: 'az' | 'en';
  setLanguage: (lang: 'az' | 'en') => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      // İlkin vəziyyət i18n-in cari dili olsun (və ya default az)
      language: (i18n.language as 'az' | 'en') || 'az',
      
      setLanguage: (lang) => {
        // 1. i18next kitabxanasında dili dəyiş (Bu, tərcümə xətalarını 100% bağlayır)
        i18n.changeLanguage(lang); 
        
        // 2. Zustand state-ni yenilə (Sənin UI komponentlərin bununla render olunur)
        set({ language: lang });
      },
    }),
    {
      name: 'language-storage', // Səhifə yenilənəndə dil yadda qalması üçün
    }
  )
);