import { useState, useEffect } from 'react';
import translations from '../translations/translations.json';

export const useTranslation = (currentLanguage) => {
  const [translation, setTranslation] = useState(translations.English); // Default to English

  useEffect(() => {
    setTranslation(translations[currentLanguage] || translations.English);
  }, [currentLanguage]);

  return translation;
};
