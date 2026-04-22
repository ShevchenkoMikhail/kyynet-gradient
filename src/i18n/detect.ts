export type AppLang = 'ru' | 'en'

const LANG_STORAGE_KEY = 'kyynet-gradient:lang'

export function detectLang(): AppLang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (saved === 'ru' || saved === 'en') return saved
  } catch {
    // localStorage unavailable
  }
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language || 'en'
    if (nav.toLowerCase().startsWith('ru')) return 'ru'
  }
  return 'en'
}

export function storeLang(lang: AppLang): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // ignore
  }
}
