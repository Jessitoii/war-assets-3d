import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en.json';
import tr from './tr.json';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

// Detect system language
const systemLanguage = Localization.getLocales()[0].languageCode;
const defaultLang = systemLanguage === 'tr' ? 'tr' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
