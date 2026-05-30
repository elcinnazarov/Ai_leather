import React from "react";
import { Menu, Package, BarChart3, Factory, Settings, User, TrendingUp, Tag, Truck, ShoppingBag } from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const navItems = [
    { id: "inventory", label: "Leather Inventory", icon: <Package className="w-5 h-5" /> },
    { id: "products", label: "Product Models", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "orders", label: "Customer Orders", icon: <ShoppingBag className="w-5 h-5" /> },
    { id: "price_master", label: "Price Master", icon: <Tag className="w-5 h-5" /> },
    { id: "pricing", label: "Pricing Rules", icon: <TrendingUp className="w-5 h-5" /> },
    { id: "shipping", label: "Shipping Hub", icon: <Truck className="w-5 h-5" /> },
    { id: "suppliers", label: "Suppliers", icon: <Factory className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#263143] py-8 z-50">
        <div className="px-8 mb-12">
          <h1 className="font-['Manrope'] font-black text-white tracking-widest text-xl uppercase">
            Leather Corp
          </h1>
        </div>
        <nav className="flex-1 flex flex-col space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center px-8 py-3 transition-all text-sm tracking-wide font-medium",
                activeTab === item.id
                  ? "bg-[#4f46e5] text-white rounded-r-full mr-4"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              <span className="mr-4">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="flex justify-between items-center w-full px-8 py-6 bg-[#f9f9ff] sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[#263143]">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-['Manrope'] font-bold tracking-tight text-2xl text-[#263143]">
              Atelier Admin
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center space-x-6 text-sm font-medium">
              <span className="text-[#3525cd] font-bold">Inventory</span>
              <span className="text-[#263143] opacity-70 hover:bg-[#f1f1f9] transition-colors cursor-pointer px-2 py-1 rounded">
                Archive
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#4f46e5] flex items-center justify-center text-white font-bold overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 px-8 py-4 max-w-7xl mx-auto w-full">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-[#263143]/10 rounded-t-[2rem] shadow-[0_-4px_24px_rgba(17,28,45,0.04)]">
          <button
            onClick={() => onTabChange("inventory")}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all",
              activeTab === "inventory"
                ? "text-[#3525cd] bg-[#3525cd]/5"
                : "text-[#263143]/50 hover:text-[#3525cd]"
            )}
          >
            <Package className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Inventory</span>
          </button>
          <button
            onClick={() => onTabChange("details")}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all",
              activeTab === "details"
                ? "text-[#3525cd] bg-[#3525cd]/5"
                : "text-[#263143]/50 hover:text-[#3525cd]"
            )}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Details</span>
          </button>
          <button
            onClick={() => onTabChange("create")}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all",
              activeTab === "create"
                ? "text-[#3525cd] bg-[#3525cd]/5"
                : "text-[#263143]/50 hover:text-[#3525cd]"
            )}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Create</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
