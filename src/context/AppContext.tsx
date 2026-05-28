import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import type { Language, TranslationKey } from '../utils/translations';

interface AppContextType {
  language: Language;
  theme: 'dark' | 'light';
  toggleLanguage: () => void;
  toggleTheme: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('memento_lang');
    return (saved === 'en' || saved === 'th') ? saved : 'en';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('memento_theme_v2');
      if (saved !== 'dark' && saved !== 'light') {
        localStorage.setItem('memento_theme_v2', 'light');
        return 'light';
      }
      return saved;
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    localStorage.setItem('memento_lang', language);
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('memento_theme_v2', theme);
    } catch (e) {
      console.warn(e);
    }
  }, [theme]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'th' : 'en');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations['en'];
    let text: string = (dict as any)[key] || (translations['en'] as any)[key] || String(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return text;
  };

  return (
    <AppContext.Provider value={{ language, theme, toggleLanguage, toggleTheme, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useTranslation must be used within an AppContextProvider');
  }
  return { t: context.t, language: context.language, toggleLanguage: context.toggleLanguage };
};

export const useTheme = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useTheme must be used within an AppContextProvider');
  }
  return { theme: context.theme, toggleTheme: context.toggleTheme };
};
