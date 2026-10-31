import fr from './fr';
import en from './en';
import type { Language } from '../types';

export const translations = { fr, en };

export type TranslationKey = string;

export function getTranslation(lang: Language, key: string, vars?: Record<string, string>): string {
  const parts = key.split('.');
  let value: unknown = translations[lang];

  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[part];
    } else {
      value = undefined;
      break;
    }
  }

  if (typeof value !== 'string') {
    const fallback = translations['en'];
    let fallbackValue: unknown = fallback;
    for (const part of parts) {
      if (fallbackValue && typeof fallbackValue === 'object') {
        fallbackValue = (fallbackValue as Record<string, unknown>)[part];
      } else {
        fallbackValue = undefined;
        break;
      }
    }
    if (typeof fallbackValue === 'string') {
      value = fallbackValue;
    } else {
      return key;
    }
  }

  let result = value as string;

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }

  return result;
}
