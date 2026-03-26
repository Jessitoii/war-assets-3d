import { LanguageCode } from '../store/slices/appSlice';

/**
 * Mapping of language codes to dynamic imports of their JSON locale files.
 * This ensures only the needed language is loaded into the bundle at any time.
 */
export const languageLoaders: Record<LanguageCode, () => Promise<any>> = {
    en: () => import('../locales/en.json'),
    ru: () => import('../locales/ru.json'),
    uk: () => import('../locales/uk.json'),
    he: () => import('../locales/he.json'),
    ar: () => import('../locales/ar.json'),
    fa: () => import('../locales/fa.json'),
    tr: () => import('../locales/tr.json'),
    fr: () => import('../locales/fr.json'),
    de: () => import('../locales/de.json'),
    pl: () => import('../locales/pl.json'),
    el: () => import('../locales/el.json'),
    zh: () => import('../locales/zh.json'),
    ja: () => import('../locales/ja.json'),
    ko: () => import('../locales/ko.json'),
    vi: () => import('../locales/vi.json'),
    hi: () => import('../locales/hi.json'),
    es: () => import('../locales/es.json'),
    pt: () => import('../locales/pt.json'),
    it: () => import('../locales/it.json'),
    nl: () => import('../locales/nl.json'),
    sv: () => import('../locales/sv.json'),
};

/**
 * Loads a language resource bundle dynamically.
 * @param lang The language code to load.
 * @returns The JSON object containing translations for that language.
 */
export const loadLanguageFile = async (lang: LanguageCode) => {
    const loader = languageLoaders[lang] || languageLoaders.en;
    try {
        const module = await loader();
        // Some bundlers/engines might wrap JSON in default property
        return module.default || module;
    } catch (error) {
        console.error(`Failed to dynamically load language: ${lang}`, error);
        // Fallback to English if loading fails
        const enModule = await languageLoaders.en();
        return enModule.default || enModule;
    }
};
