import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { ProductSummary, ProductCategory, ProductFilterRequest } from "../types/product";
import { useTranslation } from "react-i18next";
import { Search, Loader2, Star, Hammer, BadgeCheck, Clock, Volume2, VolumeX, Play, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

// Media bazası: Lokalda localhost:9000, canlıda https://e1000leather.com
const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL || "";

export default function ProductCatalog() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.split("-")[0] || "az") as "az" | "en";
  const navigate = useNavigate();

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

  const cachedState = useRef(readCachedState()).current;
  const initialScrollY = useRef(Number(sessionStorage.getItem(CATALOG_SCROLL_KEY)) || 0).current;
  const isRestoring = initialScrollY > 0;

  const [products, setProducts] = useState<ProductSummary[]>(() => cachedState?.products || []);
  const [loading, setLoading] = useState(() => !cachedState);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(() => cachedState?.hasNext || false);

  // Səhifə skroll olanadək ekran gizli qalır
  const [isReadyToDisplay, setIsReadyToDisplay] = useState(!isRestoring);

  const [filter, setFilter] = useState<ProductFilterRequest>(() => cachedState?.filter || {
    modelType: null,
    search: "",
    page: 0,
    size: 12,
  });

  // Hero Video üçün performans nəzarəti
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [isHeroMuted, setIsHeroMuted] = useState(true);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollDoneRef = useRef(false);

  // Reels bölməsi üçün vəziyyətlər
  const reelsSectionRef = useRef<HTMLDivElement>(null);
  const reelsScrollRef = useRef<HTMLDivElement>(null);
  const reelWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeReelIndex, setActiveReelIndex] = useState<number>(0);
  const [isReelsInView, setIsReelsInView] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Proqram təminatı ilə sürüşmə zamanı scroll hadisəsinin indeksi pozmasının qarşısını alır
  const isProgrammaticScrollRef = useRef(false);

  const [reelPlayStates, setReelPlayStates] = useState<boolean[]>([false, false, false, false, false]);
  const [reelMuteStates, setReelMuteStates] = useState<boolean[]>([false, false, false, false, false]);

  const activeReelIndexRef = useRef(activeReelIndex);
  const reelMuteStatesRef = useRef(reelMuteStates);
  useEffect(() => {
    activeReelIndexRef.current = activeReelIndex;
    reelMuteStatesRef.current = reelMuteStates;
  }, [activeReelIndex, reelMuteStates]);

  // Siçanla sürükləmə (drag) üçün referanslar
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollStartRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);

  const reels = useRef([
    { src: `${MEDIA_BASE}/ui-videos/Catalog1.mp4` },
    { src: `${MEDIA_BASE}/ui-videos/Catalog2.mp4` },
    { src: `${MEDIA_BASE}/ui-videos/Catalog3.mp4` },
    { src: `${MEDIA_BASE}/ui-videos/Catalog4.mp4` },
    { src: `${MEDIA_BASE}/ui-videos/Catalog5.mp4` }
  ]).current;

  // Optimizasiya 1: Hero Video ekrandan çıxanda avtomatik dayanır (GPU və batareya qənaəti)
  useEffect(() => {
    const section = heroSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (heroVideoRef.current) {
          if (entry.isIntersecting) {
            heroVideoRef.current.play().catch(() => {});
          } else {
            heroVideoRef.current.pause();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Optimizasiya 2: İstifadəçinin ilk toxunuşunda qlobal səs kilidini cəmi 1 dəfə açır
  useEffect(() => {
    const unlockAudio = () => {
      const currentIdx = activeReelIndexRef.current;
      const activeVideo = videoRefs.current[currentIdx];
      if (activeVideo && !reelMuteStatesRef.current[currentIdx]) {
        activeVideo.muted = false;
      }
    };
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  // Konteynerdə təbii sürüşdürmə zamanı aktiv videonu və ox düymələrini yeniləyir
  const updateActiveReel = useCallback(() => {
    const container = reelsScrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 25);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 25);

    if (isProgrammaticScrollRef.current) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIdx = 0;
    let minDistance = Infinity;

    reelWrapperRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    setActiveReelIndex(closestIdx);
  }, []);

  const handleContainerScroll = useCallback(() => {
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      updateActiveReel();
    });
  }, [updateActiveReel]);

  // Reels bölməsinin ekranda görünüb-görünmədiyini izləyir
  useEffect(() => {
    const section = reelsSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsReelsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Optimizasiya 3: Aktiv videonun oynadılması və renderlərin azaldılması
  useEffect(() => {
    if (!isReelsInView) {
      videoRefs.current.forEach((el) => {
        if (el && !el.paused) el.pause();
      });
      return;
    }

    reels.forEach((reel, i) => {
      const videoEl = videoRefs.current[i];
      if (!videoEl) return;

      if (i === activeReelIndex) {
        if (!videoEl.src || !videoEl.src.includes(reel.src)) {
          videoEl.src = reel.src;
        }
        videoEl.muted = reelMuteStates[i];
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            videoEl.muted = true;
            videoEl.play().catch(() => {});
          });
        }
      } else {
        if (!videoEl.paused) {
          videoEl.pause();
        }
      }
    });
  }, [isReelsInView, activeReelIndex, reelMuteStates, reels]);

  useEffect(() => {
    const handleResize = () => updateActiveReel();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateActiveReel]);

  const scrollToReel = (idx: number) => {
    const container = reelsScrollRef.current;
    const targetEl = reelWrapperRefs.current[idx];
    if (!container || !targetEl) return;

    isProgrammaticScrollRef.current = true;
    setActiveReelIndex(idx);

    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    
    const targetScrollLeft =
      container.scrollLeft +
      (targetRect.left - containerRect.left) -
      (containerRect.width / 2 - targetRect.width / 2);

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    });

    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      if (container) {
        setCanScrollLeft(container.scrollLeft > 25);
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 25);
      }
    }, 450);
  };

  const scrollPrev = () => {
    const prevIdx = Math.max(activeReelIndex - 1, 0);
    scrollToReel(prevIdx);
  };

  const scrollNext = () => {
    const nextIdx = Math.min(activeReelIndex + 1, reels.length - 1);
    scrollToReel(nextIdx);
  };

  const handleCardClick = (idx: number) => {
    if (hasDraggedRef.current) return;
    if (activeReelIndex !== idx) {
      scrollToReel(idx);
    } else {
      toggleReelPlay(idx);
    }
  };

  const toggleReelPlay = (idx: number) => {
    const el = videoRefs.current[idx];
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  const toggleReelMute = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const el = videoRefs.current[idx];
    if (!el) return;
    const nextMuted = !el.muted;
    el.muted = nextMuted;
    setReelMuteStates(prev => prev.map((m, i) => (i === idx ? nextMuted : m)));
  };

  // Kompüterdə mouse ilə dartıb-sürüşdürmə
  const handleReelsMouseDown = (e: React.MouseEvent) => {
    const container = reelsScrollRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.pageX - container.offsetLeft;
    dragScrollStartRef.current = container.scrollLeft;
    container.style.scrollSnapType = "none";
  };

  const handleReelsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const container = reelsScrollRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = x - dragStartXRef.current;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = dragScrollStartRef.current - walk;
  };

  const stopReelsDragging = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const container = reelsScrollRef.current;
    if (container) {
      container.style.scrollSnapType = "x mandatory";
      setTimeout(updateActiveReel, 50);
    }
  };

  // Skroll bərpası (Before Paint)
  useLayoutEffect(() => {
    if (scrollDoneRef.current || !isRestoring) {
      setIsReadyToDisplay(true);
      return;
    }

    if (products.length > 0) {
      window.scrollTo({ top: initialScrollY, behavior: "instant" });
      sessionStorage.removeItem(CATALOG_SCROLL_KEY);
      scrollDoneRef.current = true;
      setIsReadyToDisplay(true);
    }
  }, [products.length, initialScrollY, isRestoring]);

  // Optimizasiya 4: products.length ref-ə alındı, double fetch dövrü dayandırıldı
  const productsLengthRef = useRef(products.length);
  useEffect(() => {
    productsLengthRef.current = products.length;
  }, [products.length]);

  const fetchProducts = useCallback(async (isLoadMore = false, silent = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else if (!silent) {
      setLoading(true);
    }

    try {
      const currentLen = productsLengthRef.current;
      const queryFilter = {
        ...filter,
        size: Math.max(filter.size || 12, currentLen || 12)
      };

      const data = await productService.getShopProducts(queryFilter);

      if (isLoadMore) {
        setProducts(prev => [...prev, ...(data.content || [])]);
      } else {
        setProducts(data.content || []);
      }
      setHasNext(data.hasNext);

      try {
        sessionStorage.setItem(
          CATALOG_STATE_KEY,
          JSON.stringify({
            filter,
            products: isLoadMore ? [...products, ...(data.content || [])] : (data.content || []),
            hasNext: data.hasNext
          })
        );
      } catch {}
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => {
    const isSilent = isRestoring && !scrollDoneRef.current;
    const timeoutId = setTimeout(() => {
      fetchProducts(false, isSilent);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [filter.search, filter.modelType, fetchProducts]);

  useEffect(() => {
    if (filter.page > 0) {
      fetchProducts(true, false);
    }
  }, [filter.page]);

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

  const formatPrice = (price: number | null | undefined, currency: string | null | undefined) => {
    if (price == null) return t("catalog.noPrice", lang === "az" ? "Qiymət yoxdur" : "No price");
    const safeCurrency = currency || "AZN";
    const locale = safeCurrency === "AZN" ? "az-AZ" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
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
      if (idx !== currentIndex && videoEl && !videoEl.paused) {
        videoEl.pause();
      }
    });
  };

  const pillarsData = [
    { icon: Hammer, title: t("pillars.handcrafted.title", lang === "az" ? "Əl İşi Ustalıq" : "Handcrafted Masterpiece"), desc: t("pillars.handcrafted.desc", lang === "az" ? "Hər bir məhsul ustalarımızın əl əməyi ilə tək-tək hazırlanır." : "Each piece is meticulously crafted by hand.") },
    { icon: BadgeCheck, title: t("pillars.fullGrain.title", lang === "az" ? "Həqiqi Dəri" : "Full-Grain Leather"), desc: t("pillars.fullGrain.desc", lang === "az" ? "Yalnız ən yüksək keyfiyyətli təbii dərilərdən istifadə olunur." : "Only the highest grade authentic leather is selected.") },
    { icon: Clock, title: t("pillars.madeToLast.title", lang === "az" ? "Ömürlük Dözümlülük" : "Made To Last"), desc: t("pillars.madeToLast.desc", lang === "az" ? "İllər keçdikcə gözəlləşən və xarakter qazanan zamansız dizayn." : "Timeless designs that age gracefully over years.") }
  ];

  const CUSTOMER_EXPERIENCES_BASE_URL = `${MEDIA_BASE}/customer-experiences`;
  const reviews = [
    { image: `${CUSTOMER_EXPERIENCES_BASE_URL}/userlike1.jpg` },
    { image: `${CUSTOMER_EXPERIENCES_BASE_URL}/userlike2.jpg` },
    { image: `${CUSTOMER_EXPERIENCES_BASE_URL}/userlike3.jpg` },
    { image: `${CUSTOMER_EXPERIENCES_BASE_URL}/userlike4.jpg` }
  ];

  return (
    <div 
      style={{ opacity: isReadyToDisplay ? 1 : 0 }} 
      className="bg-[#faf9f9] text-[#1b1c1c] antialiased min-h-screen font-sans selection:bg-[#c9c6c5] selection:text-black transition-opacity duration-150"
    >
      {/* Hero Video Section — Ekrandan çıxanda avtomatik pauza olunur */}
      <section ref={heroSectionRef} className="relative h-[88dvh] md:h-[100dvh] w-full overflow-hidden flex flex-col bg-[#1b1c1c]">
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <video
            ref={heroVideoRef}
            autoPlay
            loop
            muted={isHeroMuted}
            playsInline
            className="relative z-10 w-full h-full object-cover md:object-contain bg-gradient-to-br from-[#2c2c2c] to-[#141414]"
          >
            <source src={`${MEDIA_BASE}/ui-videos/anasehife2.MOV`} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10 z-20" />
        </div>

        <button
          onClick={() => setIsHeroMuted(!isHeroMuted)}
          className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-40 p-3 md:p-3.5 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md border border-white/20 transition-all duration-300"
          aria-label={isHeroMuted ? t("reels.unmute", lang === "az" ? "Səsi aç" : "Unmute") : t("reels.mute", lang === "az" ? "Səsi bağla" : "Mute")}
        >
          {isHeroMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
        </button>

        <div className="relative z-30 mt-auto mb-16 md:mb-24 text-center px-6">
          <button 
            onClick={() => { document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="bg-white text-[#1b1c1c] px-10 md:px-14 py-4 text-[11px] md:text-[12px] uppercase tracking-[0.25em] font-medium hover:bg-[#e9c176] hover:text-white transition-colors duration-500 cursor-pointer"
          >
            {t("catalog.heroCta", lang === "az" ? "KOLLEKSİYANI KƏŞF ET" : "DISCOVER THE COLLECTION")}
          </button>
        </div>
      </section>

      {/* Reels Section */}
      <section ref={reelsSectionRef} className="relative py-20 md:py-28 bg-[#faf9f9] overflow-hidden">
        
        {/* Sol Naviqasiya Oxu (Kompüter üçün) */}
        {canScrollLeft && (
          <button
            onClick={scrollPrev}
            aria-label={t("reels.prev", lang === "az" ? "Əvvəlki video" : "Previous video")}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 text-[#1b1c1c] hover:bg-[#1b1c1c] hover:text-white shadow-xl backdrop-blur-md border border-[#c4c7c7]/40 items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[1.75]" />
          </button>
        )}

        {/* Sağ Naviqasiya Oxu (Kompüter üçün) */}
        {canScrollRight && (
          <button
            onClick={scrollNext}
            aria-label={t("reels.next", lang === "az" ? "Növbəti video" : "Next video")}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 text-[#1b1c1c] hover:bg-[#1b1c1c] hover:text-white shadow-xl backdrop-blur-md border border-[#c4c7c7]/40 items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[1.75]" />
          </button>
        )}

        <div
          ref={reelsScrollRef}
          onScroll={handleContainerScroll}
          onMouseDown={handleReelsMouseDown}
          onMouseMove={handleReelsMouseMove}
          onMouseUp={stopReelsDragging}
          onMouseLeave={stopReelsDragging}
          className="flex overflow-x-auto hide-scrollbar gap-5 sm:gap-6 md:gap-8 px-5 sm:px-8 md:px-14 lg:px-20 snap-x snap-mandatory max-w-[1440px] mx-auto cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-6"
        >
          {reels.map((reel, idx) => (
            <div
              key={idx}
              ref={(el) => { reelWrapperRefs.current[idx] = el; }}
              data-reel-index={idx}
              onClick={() => handleCardClick(idx)}
              className={cn(
                "flex-none snap-center transition-all duration-500 ease-out cursor-pointer",
                "w-[250px] sm:w-[280px] md:w-[320px] lg:w-[350px]",
                activeReelIndex === idx 
                  ? "scale-100 opacity-100 z-10 shadow-2xl" 
                  : "scale-[0.93] opacity-60 hover:opacity-85 z-0"
              )}
            >
              <div className="group aspect-[9/16] relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a3632] to-[#1b1c1c] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                    if (el) el.muted = reelMuteStates[idx];
                  }}
                  src={reel.src}
                  preload="metadata"
                  playsInline
                  loop
                  muted={reelMuteStates[idx]}
                  onPlay={() => { 
                    handleVideoPlay(idx); 
                    setReelPlayStates(prev => (prev[idx] ? prev : prev.map((p, i) => (i === idx ? true : p)))); 
                  }}
                  onPause={() => {
                    setReelPlayStates(prev => (!prev[idx] ? prev : prev.map((p, i) => (i === idx ? false : p))));
                  }}
                  className="w-full h-full object-cover outline-none"
                />

                {/* Aşağı qara gradient */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

                {/* Play İkonu */}
                {!reelPlayStates[idx] && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReelPlay(idx);
                    }}
                    aria-label={t("reels.play", lang === "az" ? "Videonu oynat" : "Play video")}
                    className="absolute inset-0 flex items-center justify-center z-20"
                  >
                    <span className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/25 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Play className="w-6 h-6 md:w-7 md:h-7 text-white fill-white translate-x-[1px]" />
                    </span>
                  </button>
                )}

                {/* Səs düyməsi */}
                <button
                  onClick={(e) => toggleReelMute(idx, e)}
                  aria-label={reelMuteStates[idx] ? t("reels.unmute", lang === "az" ? "Səsi aç" : "Unmute") : t("reels.mute", lang === "az" ? "Səsi bağla" : "Mute")}
                  className="absolute bottom-3 right-3 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md border border-white/20 transition-all duration-300"
                >
                  {reelMuteStates[idx] ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {/* Sonuncu Kart: Bütün Kolleksiya */}
          <div
            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            className={cn(
              "flex-none snap-center transition-all duration-500 ease-out cursor-pointer",
              "w-[250px] sm:w-[280px] md:w-[320px] lg:w-[350px] aspect-[9/16]",
              "rounded-3xl border border-[#c4c7c7]/80 bg-white/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] hover:border-[#1b1c1c] hover:shadow-2xl flex flex-col items-center justify-center p-8 text-center group"
            )}
          >
            <div className="w-16 h-16 rounded-full bg-[#1b1c1c] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <ArrowRight className="w-6 h-6 stroke-[1.75] transition-transform duration-300 group-hover:translate-x-1" />
            </div>

            <p className="text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-[#747878] font-medium mb-2">
              {t("reels.endTag", lang === "az" ? "E1000 ATELYE" : "E1000 ATELIER")}
            </p>

            <h4 className="font-serif text-[18px] md:text-[21px] text-[#1b1c1c] mb-2 leading-snug">
              {t("reels.endTitle", lang === "az" ? "Bütün Kolleksiya" : "Full Collection")}
            </h4>

            <p className="text-[12px] md:text-[13px] text-[#5e5e5d] font-light max-w-[210px] mb-6 leading-relaxed">
              {t("reels.endDesc", lang === "az" ? "Əl işi premium dəri məhsullarımızı kəşf edin" : "Discover our premium handcrafted leather goods")}
            </p>

            <span className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-medium text-[#1b1c1c] border-b border-[#1b1c1c] pb-1 group-hover:border-[#e9c176] group-hover:text-[#e9c176] transition-colors duration-300">
              {t("reels.endBtn", lang === "az" ? "Kataloqa Keç" : "Explore Catalog")}
            </span>
          </div>
        </div>
      </section>

      {/* Catalog Grid Section */}
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
                    "px-5 md:px-7 py-2.5 md:py-3 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-all duration-300 active:scale-95 cursor-pointer",
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
                {products.map((product) => {
                  return (
                    <div 
                      key={product.id}
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
                          className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                        />
                      </div>

                      <div className="text-center md:text-left px-0.5 md:px-1 flex flex-col flex-grow">
                        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-[#9ca3af] mb-1.5 font-medium">
                          E1000 HANDMADE
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
                    </div>
                  );
                })}
              </div>

              {hasNext && (
                <div className="mt-16 md:mt-24 flex justify-center">
                  <button 
                    onClick={() => setFilter(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={loadingMore}
                    className="w-full md:w-auto px-14 md:px-20 py-5 bg-[#1b1c1c] text-white text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-[#e9c176] hover:text-black transition-all duration-500 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
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

      {/* Customer Experiences */}
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
            <div 
              key={idx}
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
            </div>
          ))}
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-20 md:py-28 border-t border-[#e9e8e8] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 px-5 md:px-20 text-center max-w-[1440px] mx-auto">
          {pillarsData.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="space-y-5">
                <div className="w-11 h-11 bg-[#1b1c1c] rounded-full flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5 text-white stroke-[1.5]" />
                </div>
                <h3 className="text-[11px] font-medium text-[#1b1c1c] tracking-[0.25em] uppercase">
                  {pillar.title}
                </h3>
                <p className="text-[14px] md:text-[15px] text-[#5e5e5d] font-light max-w-[280px] mx-auto leading-[1.7] tracking-wide">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}