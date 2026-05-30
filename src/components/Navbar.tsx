import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore'; // 🛠️ DÜZƏLİŞ: Doğru fayl importu
import { User, LogOut, ShoppingBag, Globe } from 'lucide-react'; 

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  // 🛠️ DÜZƏLİŞ: Alias istifadə edərək 'language'-i 'lang' kimi qəbul edirik
  const { language: lang, setLanguage: setLang } = useLanguageStore(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  // --- DİL LÜĞƏTİ ---
  const t = {
    az: {
      catalog: "Kataloq",
      leathers: "Dərilər",
      aiDesign: "AI Dizayn",
      welcome: "Xoş gəldin",
      signIn: "Daxil Ol",
      adminPanel: "Admin Panel"
    },
    en: {
      catalog: "Catalog",
      leathers: "Leathers",
      aiDesign: "AI Design",
      welcome: "Welcome",
      signIn: "Sign In",
      adminPanel: "Admin Panel"
    }
  }[lang as 'az' | 'en']; // 🛠️ DÜZƏLİŞ: TypeScript zəmanəti

  return (
    <nav className="w-full bg-[#FAF9F6] border-b border-gray-200 px-8 py-4 flex justify-between items-center z-50 relative">
      {/* SOL TƏRƏF: Loqo və Açıq Linklər */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-serif font-bold tracking-widest uppercase">
          E1000_ATELIER
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-sans uppercase tracking-widest text-gray-600">
          <Link to="/products" className="hover:text-black transition-colors">{t.catalog}</Link>
          <Link to="/materials" className="hover:text-black transition-colors">{t.leathers}</Link>
          <Link to="/ai-design" className="hover:text-black text-[#3525cd] transition-colors">{t.aiDesign}</Link>
        </div>
      </div>

      {/* SAĞ TƏRƏF: Dil, Səbət və İstifadəçi Paneli */}
      <div className="flex items-center gap-6">
        
        {/* DİL SEÇİMİ BLOKU */}
        <div className="flex items-center gap-2 border-r border-gray-300 pr-6">
          <Globe className="w-4 h-4 text-gray-500" />
          <button 
            onClick={() => setLang('az')} 
            className={`text-xs font-bold tracking-widest transition-colors ${lang === 'az' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
          >
            AZ
          </button>
          <span className="text-gray-300">/</span>
          <button 
            onClick={() => setLang('en')} 
            className={`text-xs font-bold tracking-widest transition-colors ${lang === 'en' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
          >
            EN
          </button>
        </div>

        <Link to="/cart" className="relative group">
          <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors" />
        </Link>

        {isAuthenticated ? (
          /* Daxil olmuş istifadəçi */
          <div className="flex items-center gap-4 border-l border-gray-300 pl-6">
            <span className="text-sm font-sans font-medium text-gray-800 hidden md:block">
              {t.welcome}, {user?.name}
            </span>
            <Link to="/profile" className="text-gray-500 hover:text-black transition-colors">
              <User className="w-5 h-5" />
            </Link>
            
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-[10px] md:text-xs font-bold bg-black text-white px-3 py-1.5 uppercase tracking-widest hover:bg-gray-800 transition-colors">
                {t.adminPanel}
              </Link>
            )}

            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors ml-2">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Daxil OLMAYAN istifadəçi */
          <div className="border-l border-gray-300 pl-6">
            <Link 
              to="/auth" 
              className="bg-[#111] text-white px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-sm"
            >
              {t.signIn}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}