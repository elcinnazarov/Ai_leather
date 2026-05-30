import React from "react";
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
  Truck
} from "lucide-react";
import { cn } from "../lib/utils";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: "/admin/leathers", label: "Dəri İnventarı", icon: <Package className="w-5 h-5" /> },
    { id: "/admin/products", label: "Məhsul Modelləri", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "/admin/orders", label: "Müştəri Sifarişləri", icon: <ShoppingBag className="w-5 h-5" /> },
    { id: "/admin/price_master", label: "Əsas Qiymətlər", icon: <Tag className="w-5 h-5" /> },
    { id: "/admin/pricing", label: "Qiymət Qaydaları", icon: <TrendingUp className="w-5 h-5" /> },
    { id: "/admin/shipping", label: "Çatdırılma Yolları", icon: <Truck className="w-5 h-5" /> },
    { id: "/admin/settings", label: "Tənzimləmələr", icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sabit Sol Panel (Sidebar) */}
      <aside className="w-64 bg-[#1e293b] text-white fixed h-full left-0 top-0 z-50 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-700/50">
          <Link to="/admin/products" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-['Manrope'] font-black text-xl tracking-tight">ATELIER</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.id);
            return (
              <Link
                key={item.id}
                to={item.id}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <span className={cn(
                  "transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                )}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Çıxış</span>
          </button>
        </div>
      </aside>

      {/* Sağ Əsas Məzmun Sahəsi */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Üst Naviqasiya Paneli */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Axtarış..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">Admin</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* BÜTÜN ADMİN SƏHİFƏLƏRİ BURADA SAZLANIR */}
        <main className="flex-1 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}