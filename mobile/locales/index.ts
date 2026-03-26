import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { loadLanguageFile, languageLoaders } from '../utils/languageLoader';
import { LanguageCode } from '../store/slices/appSlice';

const supportedLocales = Object.keys(languageLoaders) as LanguageCode[];

/**
 * Strategy:
 * 1. Initial i18n setup with empty resources.
 * 2. Asynchronously load initial language bundle.
 * 3. Use addResourceBundle to populate i18next on the fly.
 */

// Detect system language
const getSystemLanguage = (): LanguageCode => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const code = locales[0].languageCode as LanguageCode;
    if (code && supportedLocales.includes(code)) return code;
  }
  return 'en';
};

const defaultLang = getSystemLanguage();

// Basic init (will be empty until addResourceBundle is called)
i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

/**
 * Loads a resource bundle into i18next instance dynamically.
 * Should be called before changing language.
 */
export const ensureLanguageLoaded = async (lang: LanguageCode) => {
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    const translation = await loadLanguageFile(lang);
    if (translation) {
      i18n.addResourceBundle(lang, 'translation', translation, true, true);
    }
  }
};

// Immediately load the default language to avoid UI showing keys
ensureLanguageLoaded(defaultLang).catch(err => {
  console.warn('Initial language load failed, falling back to English.', err);
  ensureLanguageLoaded('en');
});

export default i18n;
