"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

const LanguageContext = createContext({
  lang: 'EN',
  setLang: (l: string) => {}
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState('EN');
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);