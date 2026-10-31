import type { Account, Language, Theme } from '../types';

const KEYS = {
  ACCOUNTS: 'gh_accounts',
  ACTIVE_ACCOUNT_ID: 'gh_active_account',
  LANGUAGE: 'gh_language',
  THEME: 'gh_theme',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage might be full
  }
}

export const storage = {
  getAccounts(): Account[] {
    return read<Account[]>(KEYS.ACCOUNTS, []);
  },

  saveAccounts(accounts: Account[]): void {
    write(KEYS.ACCOUNTS, accounts);
  },

  addAccount(account: Account): Account[] {
    const accounts = storage.getAccounts().filter((a) => a.id !== account.id);
    const updated = [...accounts, account];
    storage.saveAccounts(updated);
    return updated;
  },

  removeAccount(id: string): Account[] {
    const updated = storage.getAccounts().filter((a) => a.id !== id);
    storage.saveAccounts(updated);
    if (storage.getActiveAccountId() === id) {
      const next = updated[0];
      storage.setActiveAccountId(next?.id ?? null);
    }
    return updated;
  },

  getActiveAccountId(): string | null {
    return read<string | null>(KEYS.ACTIVE_ACCOUNT_ID, null);
  },

  setActiveAccountId(id: string | null): void {
    write(KEYS.ACTIVE_ACCOUNT_ID, id);
  },

  getActiveAccount(): Account | null {
    const id = storage.getActiveAccountId();
    if (!id) return null;
    return storage.getAccounts().find((a) => a.id === id) ?? null;
  },

  getLanguage(): Language {
    const lang = read<string>(KEYS.LANGUAGE, '');
    if (lang === 'fr' || lang === 'en') return lang;
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('fr') ? 'fr' : 'en';
  },

  setLanguage(lang: Language): void {
    write(KEYS.LANGUAGE, lang);
  },

  getTheme(): Theme {
    const theme = read<string>(KEYS.THEME, '');
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
  },

  setTheme(theme: Theme): void {
    write(KEYS.THEME, theme);
  },

  clearAll(): void {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
