import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  User, 
  X
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useCartStore } from "../../store/useCartStore";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import LanguageSwitcher from "../LanguageSwitcher";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import logoImg from "../../public/logo.png"; 

interface ShopLayoutProps {
  children: React.ReactNode;
  cartCount?: number; 
}

export default function ShopLayout({ children, cartCount: propCartCount = 0 }: ShopLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { setIsOpen, getItemCount } = useCartStore();
  const { currency, region, initializeGeoCurrency } = useCurrencyStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  
  // ✅ i18n OBYEKTİNİ ƏLAVƏ ETDİK Kİ, DİLİ BİRBAŞA DƏYİŞƏ BİLƏK
  const { t, i18n } = useTranslation();

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
    <div className="min-h-screen bg-[#faf9f9] flex flex-col selection:bg-black selection:text-white">
      
      {/* ========================================== */}
      {/* 1. PREMIUM ZARA STİLİ NAVBAR               */}
      {/* ========================================== */}
      <nav className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500 flex items-center justify-between px-5 md:px-12",
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0px_rgba(0,0,0,0.05)] py-3 md:py-4" 
          : "bg-transparent py-5 md:py-6"
      )}>
        
        <div className="flex items-center gap-8 w-1/3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="group flex flex-col justify-center items-start gap-[5px] p-2 cursor-pointer transition-transform active:scale-95"
          >
            <span className="w-6 h-[1.2px] bg-black transition-all duration-300 ease-out group-hover:w-4"></span>
            <span className="w-4 h-[1.2px] bg-black transition-all duration-300 ease-out group-hover:w-6"></span>
            <span className="w-6 h-[1.2px] bg-black transition-all duration-300 ease-out group-hover:w-4"></span>
          </button>
          
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href}
                className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-black/60 hover:text-black transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:w-0 after:bg-black hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </a>
            ))}

            <div className="flex items-center gap-4 pl-4 border-l border-black/10">
              <a href="https://www.instagram.com/e1000_atelier_baku?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="text-black/60 hover:text-black transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://www.tiktok.com/@e1000atelier?is_from_webapp=1&sender_device=pc" target="_blank" rel="noreferrer" className="text-black/60 hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.69a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
              <a href="https://api.whatsapp.com/send/?phone=994777351313&text&type=phone_number&app_absent=0&utm_source=ig" target="_blank" rel="noreferrer" className="text-black/60 hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center cursor-pointer group">
          <img 
            src={logoImg} 
            alt="E1000 Leather Handmade Logo" 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
          />
          <span className="mt-1 text-[7px] md:text-[8px] font-sans font-semibold uppercase tracking-[0.35em] text-black/80 group-hover:text-black transition-colors">
            E1000 leather handmade
          </span>
        </Link>

        <div className="flex items-center justify-end gap-4 md:gap-6 w-1/3">
          <div className="hidden xl:flex items-center gap-1.5 font-sans text-[9px] font-semibold tracking-[0.25em] uppercase text-black/50 select-none">
            {region && currency && (
              <>
                <span className="hover:text-black transition-colors cursor-pointer">{region}</span>
                <span className="opacity-30">|</span>
                <span className="hover:text-black transition-colors cursor-pointer">{currency}</span>
              </>
            )}
          </div>

          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <button className="p-1.5 text-black hover:opacity-60 transition-opacity hidden sm:block">
            <Search className="w-[18px] h-[18px] stroke-[1.5]" />
          </button>

          {isAuthenticated ? (
            <div className="relative group hidden md:block">
              <button className="p-1.5 text-black hover:opacity-60 transition-opacity flex items-center justify-center">
                <User className="w-[18px] h-[18px] stroke-[1.5]" />
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col z-50 border border-[#f0f0f0]">
                <div className="px-5 py-4 border-b border-[#f0f0f0] bg-[#faf9f9]">
                   <p className="text-[11px] font-sans font-bold text-black tracking-wider uppercase">{user?.name || 'User'}</p>
                   <p className="text-[10px] font-sans text-[#5e5e5d] truncate mt-1">{user?.email}</p>
                </div>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="px-5 py-3 text-[11px] font-sans font-semibold text-black tracking-wider uppercase hover:bg-[#faf9f9] border-b border-[#f0f0f0] transition-colors">
                    Admin Panel
                  </Link>
                )}
                <Link to="/profile/orders" className="px-5 py-3 text-[11px] font-sans font-semibold text-black tracking-wider uppercase hover:bg-[#faf9f9] transition-colors">
                  My Orders
                </Link>
                <button 
                  onClick={() => logout()}
                  className="px-5 py-3 text-[11px] font-sans font-semibold text-black tracking-wider uppercase hover:bg-[#faf9f9] text-left w-full border-t border-[#f0f0f0] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/auth" className="hidden md:flex text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-black hover:opacity-60 transition-opacity items-center">
              Sign In
            </Link>
          )}

          {isAuthenticated && (
            <Link to="/profile/orders" className="md:hidden p-1.5 text-black hover:opacity-60 transition-opacity">
              <User className="w-[18px] h-[18px] stroke-[1.5]" />
            </Link>
          )}
          
          <button 
            onClick={() => setIsOpen(true)}
            className="relative p-1.5 text-black hover:opacity-60 transition-opacity group"
          >
            <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[9px] font-sans font-bold flex items-center justify-center rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ========================================== */}
      {/* 2. YENİLƏNMİŞ PREMIUM MOBİL MENYU DARTMASI */}
      {/* ========================================== */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex font-sans">
          {/* Overlay Arxa Plan */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500" 
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sürüşən Panel (Mobil üçün tam ekran, tablet üçün 400px limitli) */}
          <div className="relative w-full sm:w-[400px] h-full bg-white shadow-2xl animate-in slide-in-from-left duration-500 flex flex-col z-10">
            
            {/* 2.1 MENYU BAŞLIĞI VƏ XÜSUSİ DİL DƏYİŞDİRİCİ */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
              
              {/* Zərif və Peşəkar Dil Dəyişdirici */}
              <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.25em] uppercase">
                <button 
                  onClick={() => i18n.changeLanguage('az')}
                  className={cn(
                    "transition-all duration-300 pb-1 border-b", 
                    i18n.language === 'az' || i18n.language?.startsWith('az')
                      ? "text-black border-black" 
                      : "text-[#9ca3af] border-transparent hover:text-black"
                  )}
                >
                  AZ
                </button>
                <span className="text-[#e5e5e5] pb-1">|</span>
                <button 
                  onClick={() => i18n.changeLanguage('en')}
                  className={cn(
                    "transition-all duration-300 pb-1 border-b", 
                    i18n.language === 'en' || i18n.language?.startsWith('en')
                      ? "text-black border-black" 
                      : "text-[#9ca3af] border-transparent hover:text-black"
                  )}
                >
                  EN
                </button>
              </div>

              {/* Bağlama Düyməsi */}
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="p-2 -mr-2 text-black hover:rotate-90 transition-transform duration-500"
              >
                <X className="w-6 h-6 stroke-[1.2]" />
              </button>
            </div>
            
            {/* 2.2 MENYU LİNKLƏRİ (Mərkəzə doğru, Staggered Animasiya) */}
            <nav className="flex-1 flex flex-col justify-center gap-8 px-10 py-10 overflow-y-auto">
              {navLinks.map((link, index) => (
                <a 
                  key={link.label} 
                  href={link.href}
                  className="text-3xl md:text-4xl font-serif text-black hover:text-[#737373] hover:translate-x-3 transition-all duration-300 animate-in slide-in-from-left fade-in"
                  style={{ animationFillMode: "both", animationDelay: `${index * 75}ms` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              
              <div className="w-8 h-[1px] bg-black/20 my-2 animate-in slide-in-from-left fade-in" style={{ animationDelay: "300ms", animationFillMode: "both" }}></div>
              
              {/* Hesab Hissəsi */}
              <div className="animate-in slide-in-from-left fade-in" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
                {isAuthenticated ? (
                  <Link 
                    to="/profile/orders"
                    className="flex items-center gap-4 text-xs font-sans font-bold uppercase tracking-widest text-black/70 hover:text-black transition-colors group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition-transform" />
                    My Account
                  </Link>
                ) : (
                  <Link 
                    to="/auth"
                    className="inline-block text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-black relative after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:w-0 after:bg-black hover:after:w-full after:transition-all after:duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </nav>

            {/* 2.3 FOOTER HİSSƏSİ (Əlaqə və Sosial İkonlar) */}
            <div className="px-10 py-8 bg-[#faf9f9] border-t border-[#f0f0f0]">
              <p className="text-[9px] font-sans font-bold text-[#9ca3af] tracking-[0.3em] uppercase mb-4">Contact Us</p>
              <a href="tel:+994777351313" className="block text-xl md:text-2xl font-serif text-black hover:opacity-60 transition-opacity mb-8">
                +994 77 735 13 13
              </a>
              
              <div className="flex items-center gap-6">
                <a href="https://www.instagram.com/e1000_atelier_baku" target="_blank" rel="noreferrer" className="text-black/50 hover:text-black transition-colors hover:scale-110 duration-300">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="https://www.tiktok.com/@e1000atelier" target="_blank" rel="noreferrer" className="text-black/50 hover:text-black transition-colors hover:scale-110 duration-300">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.69a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
                <a href="https://api.whatsapp.com/send/?phone=994777351313" target="_blank" rel="noreferrer" className="text-black/50 hover:text-black transition-colors hover:scale-110 duration-300">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ƏSAS MƏZMUN (Dəyişməz) */}
      <main className="flex-1">
        {children}
      </main>

      {/* ========================================== */}
      {/* 3. PREMIUM MINIMALIST FOOTER               */}
      {/* ========================================== */}
      <footer className="bg-white text-black py-20 md:py-28 px-6 md:px-12 border-t border-[#e5e5e5]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-black tracking-tight">{t("brand.name")}</h2>
            <div className="space-y-2">
              <p className="text-[#5e5e5d] text-[11px] font-sans font-semibold uppercase tracking-[0.2em] leading-relaxed">
                {t("brand.slogan")}
              </p>
              <p className="text-[#9ca3af] text-[9px] font-sans font-bold uppercase tracking-[0.3em]">
                {t("brand.location")}
              </p>
            </div>
            
            <div className="flex items-center gap-5 pt-4">
              <a href="https://www.instagram.com/e1000_atelier_baku?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="text-black hover:opacity-50 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://api.whatsapp.com/send/?phone=994777351313&text&type=phone_number&app_absent=0&utm_source=ig" target="_blank" rel="noreferrer" className="text-black hover:opacity-50 transition-opacity">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@e1000atelier?is_from_webapp=1&sender_device=pc" target="_blank" rel="noreferrer" className="text-black hover:opacity-50 transition-opacity">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.69a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-sans font-bold mb-6 uppercase text-[10px] tracking-[0.25em] text-black">{t("navigation.shop")}</h4>
            <ul className="space-y-3.5 text-[12px] font-sans font-medium text-[#5e5e5d]">
              <li><a href="#" className="hover:text-black transition-colors">{t("navigation.allCollections")}</a></li>
              <li><a href="#" className="hover:text-black transition-colors">{t("navigation.bespokeOrders")}</a></li>
              <li><a href="/profile/orders" className="hover:text-black transition-colors">{t("navigation.theArchive")}</a></li>
              <li><a href="#" className="hover:text-black transition-colors">{t("navigation.careGuide")}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-sans font-bold mb-6 uppercase text-[10px] tracking-[0.25em] text-black">{t("atelier.title")}</h4>
            <ul className="space-y-3.5 text-[12px] font-sans font-medium text-[#5e5e5d]">
              <li><a href="/about" className="hover:text-black transition-colors">{t("atelier.ourStory")}</a></li>
              <li><a href="#" className="hover:text-black transition-colors">{t("atelier.theArtisans")}</a></li>
              <li><a href="#" className="hover:text-black transition-colors">{t("atelier.sustainability")}</a></li>
              <li><a href="https://api.whatsapp.com/send/?phone=994777351313&text&type=phone_number&app_absent=0&utm_source=ig" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">{t("atelier.contact")}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-sans font-bold mb-6 uppercase text-[10px] tracking-[0.25em] text-black">{t("newsletter.title")}</h4>
            <p className="text-[12px] text-[#5e5e5d] mb-5 font-sans font-medium leading-relaxed">{t("newsletter.description")}</p>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder={t("newsletter.placeholder")} 
                className="bg-[#faf9f9] border border-[#e5e5e5] rounded-none px-4 py-3 text-[12px] font-sans focus:outline-none focus:border-black transition-colors placeholder:text-[#9ca3af]"
              />
              <button className="bg-black text-white px-6 py-3.5 rounded-none font-sans font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#333] transition-colors">
                {t("newsletter.subscribe")}
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-[1440px] mx-auto mt-24 pt-8 border-t border-[#e5e5e5] flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-[#9ca3af] font-sans font-bold uppercase tracking-[0.25em]">
          <p>© {new Date().getFullYear()} E1000 LEATHER BAKU ATELIER. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8 items-center">
            {region && currency && (
              <span className="text-[#5e5e5d]">
                {region} | {currency}
              </span>
            )}
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}