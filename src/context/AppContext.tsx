import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Account, Language, Theme, Page, Toast, ConfirmOptions } from '../types';
import { storage } from '../services/storage';
import { createGitHubAPI, type GitHubAPI } from '../services/github';
import { getTranslation } from '../translations';

interface AppContextValue {
  accounts: Account[];
  activeAccount: Account | null;
  api: GitHubAPI | null;
  language: Language;
  theme: Theme;
  currentPage: Page;
  toasts: Toast[];
  confirmOptions: ConfirmOptions | null;
  confirmResolve: ((confirmed: boolean, typedValue?: string) => void) | null;

  setAccounts: (accounts: Account[]) => void;
  setActiveAccount: (account: Account | null) => void;
  addAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  navigate: (page: Page) => void;
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
  confirm: (options: ConfirmOptions) => Promise<{ confirmed: boolean; typedValue?: string }>;
  t: (key: string, vars?: Record<string, string>) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccountsState] = useState<Account[]>(() => storage.getAccounts());
  const [activeAccount, setActiveAccountState] = useState<Account | null>(
    () => storage.getActiveAccount(),
  );
  const [language, setLanguageState] = useState<Language>(() => storage.getLanguage());
  const [theme, setThemeState] = useState<Theme>(() => storage.getTheme());
  const [currentPage, setCurrentPage] = useState<Page>({ name: 'dashboard' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [confirmResolve, setConfirmResolve] = useState<
    ((confirmed: boolean, typedValue?: string) => void) | null
  >(null);

  const api = activeAccount ? createGitHubAPI(activeAccount.token) : null;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const setAccounts = useCallback((accs: Account[]) => {
    setAccountsState(accs);
    storage.saveAccounts(accs);
  }, []);

  const setActiveAccount = useCallback((account: Account | null) => {
    setActiveAccountState(account);
    storage.setActiveAccountId(account?.id ?? null);
  }, []);

  const addAccount = useCallback((account: Account) => {
    const updated = storage.addAccount(account);
    setAccountsState(updated);
    setActiveAccount(account);
  }, [setActiveAccount]);

  const removeAccount = useCallback((id: string) => {
    const updated = storage.removeAccount(id);
    setAccountsState(updated);
    const newActive = storage.getActiveAccount();
    setActiveAccountState(newActive);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    storage.setLanguage(lang);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    storage.setTheme(t);
  }, []);

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const showToast = useCallback((type: Toast['type'], message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, message, duration };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<{ confirmed: boolean; typedValue?: string }> => {
      return new Promise((resolve) => {
        setConfirmOptions(options);
        setConfirmResolve(
          () => (confirmed: boolean, typedValue?: string) => {
            setConfirmOptions(null);
            setConfirmResolve(null);
            resolve({ confirmed, typedValue });
          },
        );
      });
    },
    [],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => getTranslation(language, key, vars),
    [language],
  );

  return (
    <AppContext.Provider
      value={{
        accounts,
        activeAccount,
        api,
        language,
        theme,
        currentPage,
        toasts,
        confirmOptions,
        confirmResolve,
        setAccounts,
        setActiveAccount,
        addAccount,
        removeAccount,
        setLanguage,
        setTheme,
        navigate,
        showToast,
        confirm,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
