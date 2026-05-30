import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import azTranslation from './locales/az.json';

const resources = {
  en: { translation: enTranslation },
  az: { translation: azTranslation }
};

i18n
  // i18next-browser-languagedetector vasitəsilə browser-in və ya localStorage-da olan dili tapır
  .use(LanguageDetector)
  // react-i18next ilə inteqrasiya edir
  .use(initReactI18next)
  .init({
    resources,
    // Default dil İngilis dili (en) olur
    fallbackLng: 'en',
    
    // Default olaraq en olsun, əgər localStorage-da başqa dil yoxdursa
    lng: localStorage.getItem('i18nextLng') || 'en',
    
    interpolation: {
      escapeValue: false // React xss hücumlarından avtomatik qoruyur deyə false edirik
    }
  });

export default i18n;
