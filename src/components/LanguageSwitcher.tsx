import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bs' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
      title={t('common.language')}
      aria-label={t('common.language')}
    >
      <Globe size={18} />
      <span className="font-medium text-sm">
        {i18n.language === 'en' ? t('common.bosnian') : t('common.english')}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
