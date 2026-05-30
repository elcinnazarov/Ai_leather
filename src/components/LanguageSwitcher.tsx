import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

type SupportedLanguage = 'az' | 'en';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // i18n-dən aktiv dili alırıq. 'en-US' kimi gələ bilər, ona görə ilk 2 hərfi götürürük
  const currentLanguage = (i18n.language || 'en').substring(0, 2) as SupportedLanguage;

  // Kənara vuranda menunun bağlanması üçün
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'az', label: 'AZ' }
  ];

  const changeLanguage = (code: SupportedLanguage) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative z-[100] flex items-center pr-2 md:pr-4" ref={menuRef}>
      {/* İkon və Seçilmiş Dil */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 font-sans text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-black hover:opacity-60 transition-opacity"
      >
        <span>{currentLanguage}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-500", isOpen && "rotate-180")} />
      </button>

      {/* Açılan Menyu (Dropdown) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-20 bg-white/95 backdrop-blur-md shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 flex flex-col items-center"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                className={cn(
                  "w-full px-4 py-2.5 text-[10px] md:text-xs font-sans font-black uppercase tracking-[0.2em] transition-all duration-300",
                  currentLanguage === l.code 
                    ? "text-black bg-gray-50" 
                    : "text-gray-400 hover:text-black hover:bg-gray-50"
                )}
              >
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
