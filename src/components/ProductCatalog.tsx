import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { ProductSummary, ProductCategory, ProductFilterRequest } from "../types/product";
import { useTranslation } from "react-i18next";
import { Search, Loader2, Star, Hammer, BadgeCheck, Clock, Volume2, VolumeX } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export default function ProductCatalog() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.split("-")[0] || "az") as "az" | "en";

  const CATALOG_STATE_KEY = "productCatalogState";
  const CATALOG_SCROLL_KEY = "productCatalogScrollY";

  const readCachedState = (): { filter: ProductFilterRequest; products: ProductSummary[]; hasNext: boolean } | null => {
    try {
      const raw = sessionStorage.getItem(CATALOG_STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [products, setProducts] = useState<ProductSummary[]>(() => readCachedState()?.products || []);
  const [loading, setLoading] = useState(() => !readCachedState());
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(() => readCachedState()?.hasNext || false);

  const [filter, setFilter] = useState<ProductFilterRequest>(() => readCachedState()?.filter || {
    modelType: null,
    search: "",
    page: 0,
    size: 12,
  });
  
  const [isHeroMuted, setIsHeroMuted] = useState(true);

  const navigate = useNavigate();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const isFirstSearchEffect = useRef(true);
  const isFirstPageEffect = useRef(true);
  
  // ==========================================
  // 1. AĞILLI ANİMASİYA VƏ SCROLL İDARƏETMƏSİ
  // ==========================================
  const hasRestoredScrollRef = useRef(false);
  const hasInitializedRestored = useRef(false);
  const isRestored = useRef(false);

  if (!hasInitializedRestored.current) {
    try {
      isRestored.current = !!sessionStorage.getItem(CATALOG_SCROLL_KEY);
    } catch {}
    hasInitializedRestored.current = true;
  }

  const restoredCount = useRef(products.length);
  const skipSectionAnim = isRestored.current;

  useLayoutEffect(() => {
    if (hasRestoredScrollRef.current) return;

    if (products.length > 0) {
      try {
        const savedY = sessionStorage.getItem(CATALOG_SCROLL_KEY);
        if (savedY) {
          window.scrollTo({ top: parseInt(savedY, 10), behavior: "instant" });
          sessionStorage.removeItem(CATALOG_SCROLL_KEY); 
        }
      } catch (e) {
        console.error("Scroll bərpası xətası", e);
      }
      hasRestoredScrollRef.current = true;
    }
  }, [products.length]);

  // ==========================================

  const categories = [
    { id: null, label: t("catalog.all", lang === "az" ? "BÜTÜN MƏHSULLAR" : "ALL PRODUCTS") },
    { id: "WALLET", label: t("catalog.wallets", lang === "az" ? "CÜZDANLAR" : "WALLETS") },
    { id: "BAG", label: t("catalog.bags", lang === "az" ? "ÇANTALAR" : "BAGS") },
    { id: "BELT", label: t("catalog.belts", lang === "az" ? "KƏMƏRLƏR" : "BELTS") },
    { id: "ACCESSORY", label: t("catalog.accessories", lang === "az" ? "AKSESUARLAR" : "ACCESSORIES") },
  ] as const;

  const translateModelType = (type: string | undefined) => {
    if (!type) return "";
    return t(`catalog.modelTypes.${type.toUpperCase()}`, type);
  };

  const reels = [
    { src: "http://localhost:9000/ui-videos/Catalog1.mp4" },
    { src: "http://localhost:9000/ui-videos/anasehife2.MOV" },
    { src: "http://localhost:9000/ui-videos/Catalog2.mp4" },
    { src: "http://localhost:9000/ui-videos/Catalog3.mp4" },
    { src: "http://localhost:9000/ui-videos/Catalog4.mp4" },
    { src: "http://localhost:9000/ui-videos/Catalog5.mp4" }
  ];

  const pillarsData = [
    { icon: Hammer, title: t("pillars.handcrafted.title"), desc: t("pillars.handcrafted.desc") },
    { icon: BadgeCheck, title: t("pillars.fullGrain.title"), desc: t("pillars.fullGrain.desc") },
    { icon: Clock, title: t("pillars.madeToLast.title"), desc: t("pillars.madeToLast.desc") }
  ];

  const CUSTOMER_EXPERIENCES_BASE_URL = "http://localhost:9000/customer-experiences";
  const reviews = [
    { image: `${CUSTOMER_EXPERIENCES_BASE_URL}/userlike1.jpg` },
    { image: `${CUSTOMER_EXPERIENCES_BASE_URL}/userlike2.jpg` },
    { image: `${CUSTOMER_EXPERIENCES_BASE_URL}/userlike3.jpg` },
    { image: `${CUSTOMER_EXPERIENCES_BASE_URL}/userlike4.jpg` }
  ];

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
    if (isFirstSearchEffect.current) {
      isFirstSearchEffect.current = false;
      if (readCachedState()) {
        setLoading(false);
        return;
      }
    }
    const timeoutId = setTimeout(() => {
      fetchProducts(false);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filter.search, filter.modelType]);

  useEffect(() => {
    if (isFirstPageEffect.current) {
      isFirstPageEffect.current = false;
      return;
    }
    if (filter.page > 0) {
      fetchProducts(true);
    }
  }, [filter.page]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CATALOG_STATE_KEY, JSON.stringify({ filter, products, hasNext }));
    } catch {
      // sessionStorage əlçatan deyilsə, sükutla keç
    }
  }, [filter, products, hasNext]);

  const formatPrice = (price: number | null | undefined, currency: string | null | undefined) => {
    if (price == null) return t("catalog.noPrice", "Qiymət yoxdur");
    const safeCurrency = currency || 'AZN';
    const locale = safeCurrency === 'AZN' ? 'az-AZ' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleCategoryChange = (catId: ProductCategory | null) => {
    setFilter(prev => ({ ...prev, modelType: catId, page: 0 }));
  };

  const handleVideoPlay = (currentIndex: number) => {
    videoRefs.current.forEach((videoEl, idx) => {
      if (idx !== currentIndex && videoEl) {
        videoEl.pause();
      }
    });
  };

  return (
    <div className="bg-[#faf9f9] text-[#1b1c1c] antialiased min-h-screen font-sans selection:bg-[#c9c6c5] selection:text-black">
      
    <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col bg-[#1b1c1c]">
        <header className="absolute top-0 w-full z-50 py-5 px-6 md:px-16 flex justify-center items-center bg-gradient-to-b from-black/40 to-transparent">
          <div className="absolute left-1/2 -translate-x-1/2">
             <img src="/logo.png" alt="Ai Atelye" className="h-10 md:h-14 drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </header>

        {/* --- VİDEO BÖLMƏSİ (YENİLƏNMİŞ) --- */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          {/* 1. Desktop üçün Bulanık Arxa Plan (Qıraqdakı qara boşluqları doldurmaq üçün) */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute w-full h-full object-cover opacity-40 blur-2xl hidden md:block scale-110"
          >
            <source src="http://localhost:9000/ui-videos/anasehife2.MOV" type="video/mp4" />
          </video>
         

          {/* 2. Əsas Video */}
          <video
            autoPlay
            loop
            muted={isHeroMuted}
            playsInline
            // Mobildə 'cover' (tam doldurur), Desktopda 'contain' (kəsilmədən tam göstərir)
            className="relative z-10 w-full h-full object-cover md:object-contain"
          >
            <source src="http://localhost:9000/ui-videos/anasehife2.MOV" type="video/mp4" />
          </video>
          
          {/* Yüngül qaraltı (Mətnlər və logo yaxşı oxunsun deyə) */}
          <div className="absolute inset-0 bg-black/10 z-20" />
        </div>
        {/* --- VİDEO BÖLMƏSİNİN SONU --- */}

        <button
          onClick={() => setIsHeroMuted(!isHeroMuted)}
          className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-40 p-3 md:p-3.5 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md border border-white/20 transition-all duration-300"
          aria-label={isHeroMuted ? "Səsi aç" : "Səsi bağla"}
        >
          {isHeroMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
        </button>

        <motion.div 
          initial={skipSectionAnim ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: skipSectionAnim ? 0 : 1.2, delay: skipSectionAnim ? 0 : 0.2 }}
          className="relative z-30 mt-auto mb-16 md:mb-24 text-center px-6"
        >
          <button 
            onClick={() => { document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="bg-white text-[#1b1c1c] px-10 md:px-14 py-4 text-[11px] md:text-[12px] uppercase tracking-[0.25em] font-medium hover:bg-[#e9c176] hover:text-white transition-colors duration-500"
          >
            {t("catalog.heroCta", lang === "az" ? "KOLLEKSİYANI KƏŞF ET" : "DISCOVER THE COLLECTION")}
          </button>
        </motion.div>
      </section>

      <section className="py-20 md:py-28 bg-[#faf9f9]">
        <div className="flex overflow-x-auto hide-scrollbar gap-5 md:gap-8 px-5 md:px-20 snap-x snap-mandatory max-w-[1440px] mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {reels.map((reel, idx) => (
            <div key={idx} className="flex-none w-[240px] md:w-72 snap-start">
              <div className="aspect-[9/16] relative overflow-hidden bg-[#e9e8e8] shadow-sm">
                <video
                  ref={(el) => { videoRefs.current[idx] = el; }}
                  src={`${reel.src}#t=0.1`}
                  controls
                  preload="metadata"
                  playsInline
                  onPlay={() => handleVideoPlay(idx)}
                  className="w-full h-full object-cover outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="catalog" className="bg-[#f4f3f3] py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-5 md:px-20 space-y-10 md:space-y-14">

          <div className="space-y-6 md:space-y-8">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#747878] stroke-[1.5]" />
              <input 
                type="text" 
                placeholder={t("catalog.search", "Axtarış (Məs: Premium Çanta)...")}
                value={filter.search || ""}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value, page: 0 }))}
                className="w-full pl-12 pr-6 py-4 bg-white/60 border-[0.5px] border-[#c4c7c7] rounded-full text-[15px] font-light focus:ring-0 focus:border-[#1b1c1c] transition-colors outline-none placeholder:text-[#9ca3af] tracking-wide"
              />
            </div>

            <div className="flex items-center space-x-2.5 md:space-x-3 overflow-x-auto hide-scrollbar -mx-5 px-5 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categories.map((cat) => (
                <button 
                  key={cat.id || 'all'}
                  onClick={() => handleCategoryChange(cat.id as ProductCategory | null)}
                  className={cn(
                    "px-5 md:px-7 py-2.5 md:py-3 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-all duration-300 active:scale-95",
                    filter.modelType === cat.id 
                      ? "bg-[#1b1c1c] text-white" 
                      : "bg-white/70 text-[#1b1c1c] border-[0.5px] border-[#c4c7c7] hover:bg-white hover:border-[#1b1c1c]"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#c4c7c7]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-28 md:py-36">
              <p className="text-[#5e5e5d] font-serif text-[22px] md:text-[28px] italic font-light">
                {t("catalog.empty", "Məhsul tapılmadı.")}
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 md:gap-y-16 gap-x-3 sm:gap-x-5 md:gap-x-8">
                {products.map((product, index) => {
                  const skipProductAnim = isRestored.current && index < restoredCount.current;
                  
                  return (
                    <motion.div 
                      key={product.id} 
                      initial={skipProductAnim ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      whileInView={skipProductAnim ? undefined : { opacity: 1, y: 0 }}
                      animate={skipProductAnim ? { opacity: 1, y: 0 } : undefined}
                      viewport={skipProductAnim ? undefined : { once: true, margin: "-60px" }}
                      transition={skipProductAnim ? { duration: 0 } : { duration: 0.6, delay: (index % 4) * 0.06 }}
                      onClick={() => {
                        try {
                          sessionStorage.setItem(CATALOG_SCROLL_KEY, String(window.scrollY));
                        } catch (e) {}
                        navigate(`/product/${product.id}`);
                      }}
                      className="group cursor-pointer flex flex-col"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#efeded] mb-4 md:mb-5">
                        <img
                          src={product.primaryImageUrl || 'https://via.placeholder.com/800x1066?text=No+Image'} 
                          alt={product.modelName}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                        />
                      </div>

                      <div className="text-center md:text-left px-0.5 md:px-1 flex flex-col flex-grow">
                        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-[#9ca3af] mb-1.5 font-medium">
                          Ai ATELYE
                        </p>
                        <h3 className="font-serif text-[13px] sm:text-[15px] md:text-[17px] leading-[1.25] mb-2 md:mb-2.5 text-[#1b1c1c] group-hover:text-[#5e5e5d] transition-colors duration-300 line-clamp-2 md:line-clamp-1 tracking-tight">
                          {product.modelName}
                        </h3>

                        <div className="mt-auto flex flex-col md:flex-row md:items-center md:justify-between space-y-1 md:space-y-0">
                          <span className="text-[12px] sm:text-[13px] md:text-[15px] font-light text-[#5e5e5d] tracking-wide">
                            {formatPrice(product.basePrice, product.currency)}
                          </span>
                          <span className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] text-[#5e5e5d] bg-[#e0dfde] px-2 py-[3px] self-center md:self-start font-medium">
                            {translateModelType(product.modelType)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {hasNext && (
                <div className="mt-16 md:mt-24 flex justify-center">
                  <button 
                    onClick={() => setFilter(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={loadingMore}
                    className="w-full md:w-auto px-14 md:px-20 py-5 bg-[#1b1c1c] text-white text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-[#e9c176] hover:text-black transition-all duration-500 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t("catalog.discoverMore", "DAHA ÇOX KƏŞF ET")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 md:py-28 bg-[#faf9f9]">
        <div className="px-5 md:px-20 text-center mb-12 md:mb-16 max-w-[1440px] mx-auto">
          <h2 className="font-serif text-[clamp(1.25rem,3vw,1.75rem)] text-[#1b1c1c] mb-3 tracking-tight">
            {t("catalog.reviewsTitle", lang === "az" ? "Müştəri Təcrübələri" : "Customer Experiences")}
          </h2>
          <div className="flex justify-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#c5a059] text-[#c5a059]" />
            ))}
          </div>
        </div>
        
        <div className="flex overflow-x-auto hide-scrollbar gap-5 md:gap-6 px-5 md:px-20 max-w-[1440px] mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {reviews.map((review, idx) => (
            <motion.div 
              key={idx}
              initial={skipSectionAnim ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              whileInView={skipSectionAnim ? undefined : { opacity: 1, x: 0 }}
              animate={skipSectionAnim ? { opacity: 1, x: 0 } : undefined}
              viewport={skipSectionAnim ? undefined : { once: true }}
              transition={skipSectionAnim ? { duration: 0 } : { delay: idx * 0.1 }}
              className="flex-none w-[260px] md:w-[300px] overflow-hidden rounded-md shadow-sm"
            >
              <div className="w-full aspect-[4/5] bg-[#f4f3f3] relative group">
                <img 
                  src={review.image} 
                  alt={`Müştəri təcrübəsi ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  loading="lazy" 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28 border-t border-[#e9e8e8] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 px-5 md:px-20 text-center max-w-[1440px] mx-auto">
          {pillarsData.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div 
                key={i}
                initial={skipSectionAnim ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                whileInView={skipSectionAnim ? undefined : { opacity: 1, y: 0 }}
                animate={skipSectionAnim ? { opacity: 1, y: 0 } : undefined}
                viewport={skipSectionAnim ? undefined : { once: true, margin: "-60px" }}
                transition={skipSectionAnim ? { duration: 0 } : { delay: i * 0.12, duration: 0.7 }}
                className="space-y-5"
              >
                <div className="w-11 h-11 bg-[#1b1c1c] rounded-full flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5 text-white stroke-[1.5]" />
                </div>
                <h3 className="text-[11px] font-medium text-[#1b1c1c] tracking-[0.25em] uppercase">
                  {pillar.title}
                </h3>
                <p className="text-[14px] md:text-[15px] text-[#5e5e5d] font-light max-w-[280px] mx-auto leading-[1.7] tracking-wide">
                  {pillar.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

