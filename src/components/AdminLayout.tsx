import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Tag,
  TrendingUp,
  Truck,
  Globe,
  Menu, // Mobil menyu açmaq üçün
  X     // Mobil menyu bağlamaq üçün
} from "lucide-react";
import { cn } from "../lib/utils";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobil görünüş state-i

  // Səhifə dəyişəndə mobil menyunu avtomatik bağlamaq üçün
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { id: "/admin/leathers", label: "Dəri İnventarı", icon: <Package className="w-5 h-5" /> },
    { id: "/admin/products", label: "Məhsul Modelləri", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "/admin/orders", label: "Müştəri Sifarişləri", icon: <ShoppingBag className="w-5 h-5" /> },
    { id: "/admin/price_master", label: "Əsas Qiymətlər", icon: <Tag className="w-5 h-5" /> },
    { id: "/admin/pricing", label: "Qiymət Qaydaları", icon: <TrendingUp className="w-5 h-5" /> },
    { id: "/admin/shipping", label: "Çatdırılma Yolları", icon: <Truck className="w-5 h-5" /> },
    { id: "/admin/shipping-countries", label: "Çatdırılma Ölkələri", icon: <Globe className="w-5 h-5" /> },
    { id: "/admin/settings", label: "Tənzimləmələr", icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex overflow-hidden font-sans">
      
      {/* Mobil Qaranlıq Arxa Plan (Overlay) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sabit Sol Panel (Sidebar) */}
      <aside className={cn(
        "w-64 bg-[#0f172a] text-white fixed h-full left-0 top-0 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <Link to="/admin/products" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-black text-2xl tracking-wide text-slate-50">ATELIER</span>
          </Link>
          {/* Mobil bağlama düyməsi */}
          <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="px-4 space-y-1.5">
            <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Əsas Menyu</p>
            {menuItems.map((item) => {
              
              // XƏTANIN HƏLLİ: Exact match (tam uyğunluq) və ya alt səhifələrioxumaq üçün "/" ilə yoxlanış
              const isActive = location.pathname === item.id || location.pathname.startsWith(`${item.id}/`);
              
              return (
                <Link
                  key={item.id}
                  to={item.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative",
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_4px_15px_-3px_rgba(99,102,241,0.4)]"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                  )}
                  <span className={cn(
                    "transition-transform duration-300",
                    isActive ? "text-white scale-110" : "text-slate-500 group-hover:text-white group-hover:scale-110"
                  )}>
                    {item.icon}
                  </span>
                  <span className={cn("font-medium text-sm tracking-wide", isActive ? "font-semibold" : "")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/60">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sistemdən Çıxış</span>
          </button>
        </div>
      </aside>

      {/* Sağ Əsas Məzmun Sahəsi */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full transition-all duration-300">
        
        {/* Üst Naviqasiya Paneli */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm">
          
          <div className="flex items-center gap-3">
            {/* Mobil menyu açma düyməsi */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="relative hidden sm:block w-64 lg:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Sistemdə axtarış..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative group">
              <Bell className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            
            <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Admin</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Super Admin</p>
              </div>
              
              {/* ADMİN ŞƏKLİ - PROFESSİONAL KÖLGƏ EFEKTİ İLƏ */}
              <div className="relative">
                <div className="w-11 h-11 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] ring-2 ring-indigo-50 transition-transform duration-300 group-hover:scale-105">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
                    alt="Admin Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Aktiv (Online) bildirişi */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm z-10"></div>
              </div>

            </div>
          </div>
        </header>

        {/* BÜTÜN ADMİN SƏHİFƏLƏRİ BURADA SAZLANIR */}
        <main className="flex-1 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}