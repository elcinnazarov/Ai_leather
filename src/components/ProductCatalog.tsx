import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { ProductSummary, ProductCategory, ProductFilterRequest } from "../types/product";
import { useLanguageStore } from '../store/useLanguageStore'; // Doğru faylı import edirik
import { Search, Plus, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export default function ProductCatalog() {
  // 🛠️ DÜZƏLİŞ: 'language' dəyərini çəkib bu fayl üçün 'lang' kimi adlandırırıq
  const { language: lang } = useLanguageStore(); 
  
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  
  const [filter, setFilter] = useState<ProductFilterRequest>({
    modelType: null,
    search: "",
    page: 0,
    size: 12,
  });
  
  const navigate = useNavigate();

  // --- DİL LÜĞƏTİ VƏ KATEQORİYALAR ---
  const t = {
    az: {
      archive: "Arxiv",
      searchPlaceholder: "Axtarış (Məs: Premium Çanta)...",
      notFound: "Məhsul tapılmadı.",
      noPrice: "Qiymət yoxdur",
      discoverMore: "DAHA ÇOX KƏŞF ET"
    },
    en: {
      archive: "The Archive",
      searchPlaceholder: "Search (e.g., Premium Bag)...",
      notFound: "No products found.",
      noPrice: "Price unavailable",
      discoverMore: "DISCOVER MORE"
    }
  }[lang as 'az' | 'en']; // TypeScript Zəmanəti

  const categories = {
    az: [
      { id: null, label: "BÜTÜN MƏHSULLAR" },
      { id: "WALLET", label: "CÜZDANLAR" },
      { id: "BAG", label: "ÇANTALAR" },
      { id: "BELT", label: "KƏMƏRLƏR" }
    ],
    en: [
      { id: null, label: "ALL PRODUCTS" },
      { id: "WALLET", label: "WALLETS" },
      { id: "BAG", label: "BAGS" },
      { id: "BELT", label: "BELTS" }
    ]
  };

  // API Sorğusu
  const fetchProducts = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const data = await productService.getShopProducts(filter);
      if (isLoadMore) {
        setProducts(prev => [...prev, ...data.content]);
      } else {
        setProducts(data.content || []);
      }
      setHasNext(data.hasNext);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(false);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filter.search, filter.modelType]);

  useEffect(() => {
    if (filter.page > 0) {
      fetchProducts(true);
    }
  }, [filter.page]);

  const handleCategoryChange = (cat: ProductCategory | null) => {
    const formatPrice = (price: number | null | undefined, currency: string | null | undefined) => {
    if (price == null) return t.noPrice;
    
    // Əgər backend nədənsə valyuta göndərməzsə, ehtiyat (fallback) olaraq AZN götürürük
    const safeCurrency = currency || 'AZN'; 

    return new Intl.NumberFormat(lang === 'az' ? 'az-AZ' : 'en-US', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };
    setFilter(prev => ({ ...prev, modelType: cat, page: 0 }));
  };

  return (
    <div className="space-y-32 py-24 bg-[#FAF9F6] min-h-screen">
      <header className="px-6 md:px-12 max-w-7xl mx-auto space-y-8">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-gray-500 font-sans font-black text-[10px] tracking-[0.4em] uppercase">
            {t.archive}
          </span>
          <h2 className="text-6xl md:text-8xl font-serif font-bold text-[#111] tracking-tighter leading-tight">
            E1000 Leather <br />
            <span className="text-[#333] italic font-light">Baku</span>
          </h2>
        </div>
        
        {/* Filtrlər Paneli */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-12">
          {/* Axtarış */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={filter.search || ""}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value, page: 0 }))}
              className="w-full bg-white border border-gray-200 rounded-full pl-14 pr-6 py-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm"
            />
          </div>
          
          {/* Dinamik Kateqoriyalar */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {categories[lang as 'az' | 'en'].map((cat) => (
              <button 
                key={cat.id || 'all'}
                onClick={() => handleCategoryChange(cat.id as ProductCategory | null)}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] font-sans font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  filter.modelType === cat.id 
                    ? "bg-black text-white border-black shadow-md" 
                    : "bg-transparent text-gray-600 border-gray-200 hover:border-black"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Məhsullar Grid-i */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-gray-500 font-serif text-2xl">{t.notFound}</p>
        </div>
      ) : (
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="group cursor-pointer flex flex-col"
              >
                {/* Şəkil Qutusu */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-6">
                  <img
                    src={product.primaryImageUrl || 'https://via.placeholder.com/400x500?text=No+Image'} 
                    alt={product.modelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                      <Plus className="w-5 h-5 text-black" />
                    </div>
                  </div>
                </div>

                {/* Məlumat */}
                <div className="flex justify-between items-start px-1">
                  <div>
                    <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#111] mb-1">
                      {product.modelName}
                    </h3>
                    <p className="font-sans text-[10px] text-gray-500 uppercase tracking-widest">
                      {product.modelType}
                    </p>
                  </div>
                  <span className="font-sans text-[12px] font-medium text-[#111]">
                    {product.basePrice != null ? `${product.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${product.currency || 'USD'}` : t.noPrice}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Daha Çox Yüklə (Paginasiya) */}
          {hasNext && (
            <div className="mt-24 flex justify-center">
              <button 
                onClick={() => setFilter(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={loadingMore}
                className="px-12 py-4 border border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.discoverMore}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}