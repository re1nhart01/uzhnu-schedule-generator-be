import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, fallbackLng } from './i18n';

export async function initI18nServer(lang: string) {
  const instance = i18n.createInstance();
  await instance
    .use(initReactI18next)
    .init({
      lng: lang,
      fallbackLng,
      resources,
      interpolation: { escapeValue: false },
    });

  return instance;
}
