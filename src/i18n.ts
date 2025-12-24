import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import bsTranslations from './locales/bs.json';

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    bs: { translation: bsTranslations }
  },
  lng: localStorage.getItem('language') || 'bs',
  fallbackLng: 'bs',
  interpolation: {
    escapeValue: false
  }
});

// Store language preference when changed
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
