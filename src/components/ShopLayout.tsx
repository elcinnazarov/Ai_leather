import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  User, 
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import { useCartStore } from "../store/useCartStore";
import { useCurrencyStore } from "../store/useCurrencyStore";
import { useAuthStore } from "../store/useAuthStore";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ShopLayoutProps {
  children: React.ReactNode;
  cartCount?: number; 
}

export default function ShopLayout({ children, cartCount: propCartCount = 0 }: ShopLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // ✅ DÜZƏLİŞ: Yeni stateless cart strukturuna görə setIsOpen və getItemCount istifadə edirik
  const { setIsOpen, getItemCount } = useCartStore();
  const { currency, region, initializeGeoCurrency } = useCurrencyStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t } = useTranslation();

  // ✅ DÜZƏLİŞ: Səbət sayını yeni metodla alırıq
  const currentItemCount = getItemCount();
  const cartCount = currentItemCount > 0 ? currentItemCount : propCartCount;

  useEffect(() => {
    initializeGeoCurrency();
  }, [initializeGeoCurrency]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t("nav.collections", "PRODUCTS"), href: "/" },
    { label: t("nav.materials", "LEATHERS"), href: "/materials" },
    { label: t("nav.about", "ABOUT"), href: "/about" },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-secondary/20">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-6 flex items-center justify-between",
        isScrolled ? "glass shadow-[0_10px_30px_rgba(39,19,16,0.04)] py-4" : "bg-transparent"
      )}>
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-primary/5 rounded-full transition-colors md:hidden text-primary"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href}
                className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <h1 className="text-2xl font-serif font-bold tracking-tight text-black" style={{ fontFamily: "Noto Serif, serif" }}>
            E1000
          </h1>
          <span className="text-[7px] font-sans font-black uppercase tracking-[0.3em] text-gray-500 mt-1">
            BREND LEATHER HANDMADE
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          <div className="hidden lg:flex items-center gap-1 font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-gray-400 select-none">
            {region && currency && (
              <>
                <span>{region}</span>
                <span className="opacity-50">|</span>
                <span>{currency}</span>
              </>
            )}
          </div>

          <LanguageSwitcher />

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block text-black">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {isAuthenticated ? (
            <div className="relative group hidden md:block">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black flex items-center justify-center">
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col z-50 rounded-md overflow-hidden border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                   <p className="text-xs font-sans font-bold text-black">{user?.name || 'User'}</p>
                   <p className="text-[10px] font-sans text-gray-500 truncate">{user?.email}</p>
                </div>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="px-4 py-3 text-xs font-sans font-bold text-[#3525cd] hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100">
                    Admin Panel
                  </Link>
                )}
                <Link to="/profile/orders" className="px-4 py-3 text-xs font-sans font-medium text-black hover:bg-gray-50 flex items-center gap-2">
                  My Orders
                </Link>
                <button 
                  onClick={() => logout()}
                  className="px-4 py-3 text-xs font-sans font-medium text-red-500 hover:bg-gray-50 flex items-center gap-2 text-left w-full border-t border-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/auth" className="hidden md:flex px-4 py-2 border border-black/20 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-black hover:border-black hover:text-white transition-all items-center justify-center">
              Sign In
            </Link>
          )}

          {isAuthenticated && (
            <Link to="/profile/orders" className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors text-black flex items-center justify-center">
              <User className="w-4 h-4" />
            </Link>
          )}
          
          {/* ✅ DÜZƏLİŞ: setIsCartOpen(true) əvəzinə setIsOpen(true) yazıldı */}
          <button 
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group text-black"
          >
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[9px] font-sans font-black flex items-center justify-center rounded-full shadow-lg group-hover:scale-110 transition-transform">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="absolute left-0 top-0 h-full w-full max-w-md bg-white p-12 shadow-2xl animate-in slide-in-from-left duration-500 flex flex-col">
            <div className="flex items-center justify-between mb-20">
              <h2 className="text-xs font-sans font-black tracking-[0.3em] text-gray-400">MENU</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-black">
                <X className="w-8 h-8" />
              </button>
            </div>
            <nav className="flex flex-col gap-10">
              {navLinks.map((link) => (
                <a 
                  key={link.label} 
                  href={link.href}
                  className="text-5xl font-serif font-bold text-black hover:italic transition-all"
                  style={{ fontFamily: "Noto Serif, serif" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              
              {!isAuthenticated && (
                 <Link 
                   to="/auth"
                   className="text-2xl font-serif text-black hover:italic transition-all mt-4"
                   style={{ fontFamily: "Noto Serif, serif" }}
                 >
                   Sign In / Register
                 </Link>
              )}
            </nav>
            <div className="mt-auto pt-20 space-y-4">
              <p className="text-xs font-sans font-bold text-gray-400 tracking-widest uppercase">Contact</p>
              <p className="text-xl font-serif text-black" style={{ fontFamily: "Noto Serif, serif" }}>+994 77 735 13 13</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-32 px-6 md:px-12 border-t border-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="space-y-8">
            <h2 className="text-3xl font-serif font-bold tracking-tight" style={{ fontFamily: "Noto Serif, serif" }}>{t("brand.name")}</h2>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm leading-relaxed font-sans font-medium uppercase tracking-[0.1em]">
                {t("brand.slogan")}
              </p>
              <p className="text-gray-500 text-[10px] font-sans font-black uppercase tracking-[0.3em]">
                {t("brand.location")}
              </p>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <a href="https://www.instagram.com/e1000_atelier_baku?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://api.whatsapp.com/send/?phone=994777351313&text&type=phone_number&app_absent=0&utm_source=ig" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@e1000atelier?is_from_webapp=1&sender_device=pc" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.69a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-sans font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-gray-500">{t("navigation.shop")}</h4>
            <ul className="space-y-4 text-sm font-sans font-medium text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">{t("navigation.allCollections")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("navigation.bespokeOrders")}</a></li>
              <li><a href="/profile/orders" className="hover:text-white transition-colors">{t("navigation.theArchive")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("navigation.careGuide")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-gray-500">{t("atelier.title")}</h4>
            <ul className="space-y-4 text-sm font-sans font-medium text-gray-400">
              <li><a href="/about" className="hover:text-white transition-colors">{t("atelier.ourStory")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("atelier.theArtisans")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("atelier.sustainability")}</a></li>
              <li><a href="https://api.whatsapp.com/send/?phone=994777351313&text&type=phone_number&app_absent=0&utm_source=ig" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">{t("atelier.contact")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-black mb-8 uppercase text-[10px] tracking-[0.3em] text-gray-500">{t("newsletter.title")}</h4>
            <p className="text-sm text-gray-400 mb-6 font-sans font-medium leading-relaxed">{t("newsletter.description")}</p>
            <div className="flex flex-col gap-4">
              <input 
                type="email" 
                placeholder={t("newsletter.placeholder")} 
                className="bg-white/10 border-none rounded-none px-6 py-4 text-sm font-sans focus:ring-1 focus:ring-white placeholder:text-gray-500"
              />
              <button className="bg-white text-black px-8 py-4 rounded-none font-sans font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
                {t("newsletter.subscribe")}
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-gray-500 font-sans font-black uppercase tracking-widest">
          <p>© {new Date().getFullYear()} E1000 LEATHER BAKU ATELIER. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-10 items-center">
            {region && currency && (
              <span className="text-gray-400">
                {region} | {currency}
              </span>
            )}
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};