import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SupportedLanguage = 'az' | 'en';

interface LanguageState {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

// Zustand istifadə edərək seçilmiş dili həm State-də, həm də localStorage-da saxlayırıq.
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'az', // Default olaraq Azərbaycan dili
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage', // localStorage-da yaddaşda saxlanılacaq key adı
    }
  )
);
