import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import { ru } from './locales/ru'
import { en } from './locales/en'
import { detectLang, storeLang, type AppLang } from './detect'
import type { DictKey } from './locales/keys'

void i18n.use(initReactI18next).init({
  lng: detectLang(),
  fallbackLng: 'en',
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
})

export type { DictKey, AppLang }

export function useT() {
  const { t, i18n: inst } = useTranslation()
  return {
    t: (key: DictKey, vars?: Record<string, string | number>) =>
      t(key, vars as Record<string, unknown>) as string,
    lang: inst.language as AppLang,
    setLang: (lang: AppLang) => {
      storeLang(lang)
      void inst.changeLanguage(lang)
    },
  }
}

export { i18n }
