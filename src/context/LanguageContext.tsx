import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '@/lib/translations';
import type { Language } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations.en, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved === 'en' || saved === 'es') ? saved : 'es'; // Default to Spanish as requested by user context implies Spanish usage
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const setLanguage = (lang: Language) => setLanguageState(lang);

    const t = (key: keyof typeof translations.en, params?: Record<string, string>) => {
        let text = translations[language][key] || key;
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                text = text.replace(`{${key}}`, value);
            });
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
