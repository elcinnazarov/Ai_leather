import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { ProductSummary, ProductCategory, ProductFilterRequest } from "../types/product";
import { useTranslation } from "react-i18next";
import { Search, Loader2, Star, Hammer, BadgeCheck, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

// ========================
// 1. SCROLL BƏRPASINI QLOBAL SƏVİYYƏDƏ BAĞLAMAQ
// ========================
// Brauzerin öz native scroll-restoration davranışını söndürürük ki, bizim
// bərpa məntiqimizlə yarışmasın. Bu, komponent yüklənmədən əvvəl işə düşməlidir.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export default function ProductCatalog() {
  // ✅ DÜZƏLİŞ: `useLanguageStore` + inline `dict` obyekti tamamilə çıxarıldı.
  // Layihənin qalan hissəsi (ShopLayout, ProductDetail) artıq `react-i18next`
  // istifadə edir — bu komponent də indi eyni sistemə keçdi, mətnlər isə
  // `src/locales/az.json` və `en.json`-dakı `catalog` / `pillars`
  // namespace-lərindən oxunur.
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.split("-")[0] || "az") as "az" | "en";

  // ========================
  // KEŞ AÇARLARI — geri qayıdanda filtr/məhsul/scroll bərpası üçün
  // ========================
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

  // ========================
  // BİZNES MƏNTİQİ VƏ STATE
  // ========================
  const [products, setProducts] = useState<ProductSummary[]>(() => readCachedState()?.products || []);
  const [loading, setLoading] = useState(() => !readCachedState());
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(() => readCachedState()?.hasNext || false);

  // Bərpa ediləcək scroll mövqeyi varsa, düzgün yerə "atılana" qədər məzmunu gizli saxlayırıq
  const [scrollRestored, setScrollRestored] = useState(() => {
    try {
      return !sessionStorage.getItem(CATALOG_SCROLL_KEY);
    } catch {
      return true;
    }
  });
  
  const [filter, setFilter] = useState<ProductFilterRequest>(() => readCachedState()?.filter || {
    modelType: null,
    search: "",
    page: 0,
    size: 12,
  });
  
  const navigate = useNavigate();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const isFirstSearchEffect = useRef(true);
  const isFirstPageEffect = useRef(true);

  // ========================
  // KATEQORİYALAR — mövcud i18n açarlarından ("catalog.*") istifadə edilir
  // ========================
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

  // ========================
  // STATİK DATALAR & VİDEOLAR
  // ========================
  const reels = [
    { src: "http://localhost:9000/ui-videos/anasehife2.MOV" },
    { src: "http://localhost:9000/ui-videos/Catalog1.mp4" },
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

  // ========================
  // APİ İSTƏKLƏRİ
  // ========================
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

  const hasRestoredScrollRef = useRef(false);

  // ========================
  // OPTİMALLAŞDIRILMIŞ SCROLL BƏRPASI (deterministik, YALNIZ 1 DƏFƏ)
  // ========================
  // DİQQƏT: `history.scrollRestoration = "manual"` etdiyimiz üçün brauzer
  // artıq scroll mövqeyini özü idarə etmir — bu məsuliyyət tam bizim
  // üzərimizdədir. Ona görə BURADA HƏR HALDA (savedY olsun-olmasın) scroll
  // mövqeyini özümüz təyin edirik: ya dəqiq yadda saxlanmış yerə, ya da
  // (belə bir yer yoxdursa) səhifənin lap yuxarısına. Heç bir vəziyyətdə
  // ProductDetail-dən "daşınan" köhnə/təsadüfi scroll dəyərinə etibar
  // etmirik.
  //
  // `hasRestoredScrollRef` MÜTLƏQDİR: `products.length` sonradan "daha çox
  // göstər" düyməsi ilə də dəyişir — əgər qoruma olmasa, istifadəçi
  // scroll edib məhsul yükləyəndə bu effekt YENİDƏN işə düşüb onu təzədən
  // köhnə mövqeyə/yuxarıya atardı.
  useLayoutEffect(() => {
    if (hasRestoredScrollRef.current) return;
    hasRestoredScrollRef.current = true;

    try {
      const savedY = sessionStorage.getItem(CATALOG_SCROLL_KEY);
      if (savedY && products.length > 0) {
        window.scrollTo({
          top: parseInt(savedY, 10),
          behavior: "instant" as ScrollBehavior
        });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }
    } catch {
      window.scrollTo(0, 0);
    } finally {
      setScrollRestored(true);
    }
  }, [products.length]);

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
    <div
      className={cn(
        "bg-[#faf9f9] text-[#1b1c1c] antialiased min-h-screen font-sans selection:bg-[#c9c6c5] selection:text-black transition-opacity duration-150",
        scrollRestored ? "opacity-100" : "opacity-0"
      )}
    >
      {/* ============================================ */}
      {/* 1. HERO SECTION & HEADER                     */}
      {/* ============================================ */}
      <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col">
        <header className="absolute top-0 w-full z-50 py-5 px-6 md:px-16 flex justify-center items-center bg-gradient-to-b from-black/40 to-transparent">
          <div className="absolute left-1/2 -translate-x-1/2">
             <img src="/logo.png" alt="Ai Atelye" className="h-10 md:h-14 drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </header>

        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="http://localhost:9000/ui-videos/anasehife.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative z-10 mt-auto mb-16 md:mb-24 text-center px-6"
        >
          <button 
            onClick={() => { document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="bg-white text-[#1b1c1c] px-10 md:px-14 py-4 text-[11px] md:text-[12px] uppercase tracking-[0.25em] font-medium hover:bg-[#e9c176] hover:text-white transition-colors duration-500"
          >
            {t("catalog.heroCta", "KOLLEKSİYANI KƏŞF ET")}
          </button>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* 2. REELS VİDEOLARI                           */}
      {/* ============================================ */}
      <section className="py-20 md:py-28 bg-[#faf9f9]">
        <div className="px-5 md:px-20 mb-12 md:mb-16 flex justify-between items-end max-w-[1440px] mx-auto">
          <div>
            <h2 className="font-serif text-[clamp(1.5rem,4vw,2.5rem)] text-[#1b1c1c] mb-2 uppercase tracking-wider leading-[1.1]">
              {t("catalog.reelsTitle", "Atelye Hekayələri")}
            </h2>
            <p className="text-[15px] md:text-[16px] text-[#5e5e5d] font-light tracking-wide">
              {t("catalog.reelsSubtitle", "Hər bir parçanın arxasındakı ruh.")}
            </p>
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-5 md:gap-8 px-5 md:px-20 snap-x snap-mandatory max-w-[1440px] mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {reels.map((reel, idx) => (
            <div key={idx} className="flex-none w-[240px] md:w-72 snap-start">
              <div className="aspect-[9/16] relative overflow-hidden bg-[#e9e8e8] shadow-sm">
                <video
                  // ✅ DÜZƏLİŞ: callback ref bir dəyər return etməməlidir (TS2322).
                  // Əvvəlki `el => videoRefs.current[idx] = el` assignment-in
                  // nəticəsini (HTMLVideoElement | null) qaytarırdı; indi
                  // gövdəni {} ilə bağlayaraq return dəyərini `void` edirik.
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

      {/* ============================================ */}
      {/* 3. MASTER CATALOG MƏHSULLAR                  */}
      {/* ============================================ */}
      <section id="catalog" className="bg-[#f4f3f3] py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-5 md:px-20 space-y-10 md:space-y-14">

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="text-[11px] uppercase tracking-[0.25em] font-medium text-[#5e5e5d] mb-5">
              {t("catalog.sectionLabel", "KOLLEKSİYA")}
            </p>
            <h2 className="font-serif text-[clamp(2rem,6vw,3.5rem)] leading-[1.1] mb-6 text-[#1b1c1c] tracking-[-0.01em]">
              {t("catalog.tagline", "Minimalist dizayn və ənənəvi sənətkarlığın möhtəşəm vəhdəti.")}
            </h2>
          </motion.div>

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
                {products.map((product, index) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: (index % 4) * 0.06 }}
                    onClick={() => {
                      try {
                        sessionStorage.setItem(CATALOG_SCROLL_KEY, String(window.scrollY));
                      } catch {
                        // sükutla keç
                      }
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
                ))}
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

      {/* ============================================ */}
      {/* 4. REAL MÜŞTƏRİ RƏYLƏRİ                      */}
      {/* ============================================ */}
      <section className="py-20 md:py-28 bg-[#faf9f9]">
        <div className="px-5 md:px-20 text-center mb-12 md:mb-16 max-w-[1440px] mx-auto">
          <h2 className="font-serif text-[clamp(1.25rem,3vw,1.75rem)] text-[#1b1c1c] mb-3 tracking-tight">
            {t("catalog.reviewsTitle", "Müştəri Təcrübələri")}
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
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
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

      {/* ============================================ */}
      {/* 5. BRAND DƏYƏRLƏRİ                           */}
      {/* ============================================ */}
      <section className="py-20 md:py-28 border-t border-[#e9e8e8] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 px-5 md:px-20 text-center max-w-[1440px] mx-auto">
          {pillarsData.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
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