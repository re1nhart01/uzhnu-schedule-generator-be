import en from "@/locales/en/translation.json"
import uk from "@/locales/uk/translation.json"

export const defaultNS = 'translation';

export const resources = {
  en: {
    translation: en,
  },
  uk: {
    translation: uk,
  },
} as const;

export const fallbackLng = 'en';
export const languages = ['en', 'uk'];
