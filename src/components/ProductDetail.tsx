import React, { useEffect, useLayoutEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { ProductDetailResponse, P_AvailableLeatherResponse } from "../types/product";
import { ArrowLeft, Loader2, ShoppingBag, X } from "lucide-react";
import { cn } from "../lib/utils";
import { useCartStore } from "../store/useCartStore";
import { useAITranslation } from "../lib/hooks/useAITranslation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrencySymbol } from '../lib/currencyMapper';

// ============================================
// RƏNG PALİTRASI (bu versiyada fərqli ton) — komment olaraq referans:
// bg (ağ):        #ffffff
// bg-alt (boz):    #f7f7f7
// text primary:    #111111
// text secondary:  #767676
// border:          #e5e5e5
// accent (wine):   #6f2c3f   ← qızılı əvəzinə "leather wine" ton, hover/seçim üçün
// ============================================

// ============================================
// LEATHER SEÇİM KOMPONENTİ — dairəvi swatch (moda saytlarındakı rəng seçici kimi)
// ============================================
interface LeatherOptionProps {
  leather: P_AvailableLeatherResponse;
  isActive: boolean;
  onClick: () => void;
}

function LeatherOption({ leather, isActive, onClick }: LeatherOptionProps) {
  const dynName = useAITranslation(leather?.name || "");
  
  // LC Waikiki-də olduğu kimi: rəng/material seçimi kiçik KVADRAT şəkil
  // "swatch"-ları ilə göstərilir (dairə yox). Seçim border-highlight ilə
  // bildirilir, əlavə badge/overlay yoxdur — sayt strukturuna sadiq qalındı.
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 group flex-shrink-0"
    >
      <div className={cn(
        "relative w-[56px] h-[56px] overflow-hidden transition-all duration-200 bg-[#f7f7f7]",
        isActive
          ? "border-2 border-[#111111]"
          : "border border-[#e5e5e5] group-hover:border-[#a8a8a8]"
      )}>
        <img 
          src={leather?.imageUrl || 'https://via.placeholder.com/150'} 
          alt={dynName} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <span className={cn(
        "font-sans text-[10px] uppercase tracking-[0.1em] text-center leading-tight block max-w-[70px]",
        isActive ? "text-[#111111] font-semibold" : "text-[#767676] font-medium"
      )}>
        {dynName}
      </span>
    </motion.button>
  );
}

// ============================================
// GRADE BAŞLIQ KOMPONENTİ — sol-aligned label, brend saytı tərzi (mərkəzləşməmiş)
// ============================================
function GradeSection({ 
  grade, 
  leathers, 
  selectedId, 
  onSelect
}: { 
  grade: string; 
  leathers: P_AvailableLeatherResponse[]; 
  selectedId: number | null; 
  onSelect: (l: P_AvailableLeatherResponse) => void;
}) {
  const safeGrade = grade || "STANDART";
  const gradeLabel = useAITranslation(safeGrade.replace('_', ' '));
  const collectionText = useAITranslation("Kolleksiya");
  
  return (
    <div className="space-y-3">
      <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#111111]">
        {gradeLabel} <span className="text-[#767676] font-medium">— {collectionText}</span>
      </h4>
      
      <div className="flex overflow-x-auto gap-4 pb-2 pt-1 scrollbar-hide snap-x">
        {leathers.map((leather) => (
          <LeatherOption 
            key={leather.id}
            leather={leather}
            isActive={selectedId === leather.id}
            onClick={() => onSelect(leather)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// ƏSAS KOMPONENT
// ============================================
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ DÜZƏLİŞ: `history.scrollRestoration = "manual"` qlobal olaraq
  // ProductCatalog-da təyin olunub — bu o deməkdir ki, artıq HEÇ KİM
  // (nə brauzer, nə React Router) route dəyişəndə scroll-u avtomatik
  // sıfırlamır. Ona görə buraya open olanda scroll mövqeyi kataloqdan
  // (və ya hər hansı digər səhifədən) "daşınmış" köhnə dəyərdə qala bilirdi
  // — nəticədə məhsulun ƏVVƏLİ deyil, təsadüfi bir aşağı nöqtəsi görünürdü.
  // useLayoutEffect seçilib ki, bu, brauzer ekranı boyamazdan ƏVVƏL,
  // sinxron şəkildə baş versin — flaş/görünən sıçrayış olmasın.
useEffect(() => {
    window.scrollTo(0, 0); // Məhsula daxil olanda ən yuxarıdan başlasın
  }, [id]);
  
  const { t } = useTranslation();
  
  const cartStore = useCartStore() as any;
  const addItemToCart = cartStore.addItem;
  const openCartPanel = cartStore.setIsOpen || cartStore.setIsCartOpen;
  
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [leathers, setLeathers] = useState<P_AvailableLeatherResponse[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<P_AvailableLeatherResponse | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState<string>("");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [prodData, leathersData] = await Promise.all([
          productService.getProductDetail(parseInt(id)),
          productService.getProductAvailableLeathers(parseInt(id))
        ]);
        
        setProduct(prodData);
        setLeathers(leathersData || []);
        
        if (prodData) {
          setActiveImage(prodData.primaryImageUrl || 'https://via.placeholder.com/800x1000');
        }
        
        if (leathersData?.length > 0) {
          setSelectedMaterial(leathersData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !product?.images) return;
    const distance = touchStartX - e.changedTouches[0].clientX;
    const minSwipeDistance = 50;
    const currentIndex = product.images.findIndex(img => img.imageUrl === activeImage);
    
    if (Math.abs(distance) > minSwipeDistance) {
      const newIndex = distance > 0 
        ? (currentIndex + 1) % product.images.length 
        : (currentIndex - 1 + product.images.length) % product.images.length;
      setActiveImage(product.images[newIndex].imageUrl);
    }
    setTouchStartX(null);
  };

  const groupedLeathers = useMemo(() => {
    return leathers.reduce((groups, leather) => {
      const grade = leather?.gradeType || "STANDART";
      if (!groups[grade]) groups[grade] = [];
      groups[grade].push(leather);
      return groups;
    }, {} as Record<string, P_AvailableLeatherResponse[]>);
  }, [leathers]);

  const currentPrice = useMemo(() => {
    if (!product?.gradePrices || product.gradePrices.length === 0) return 0;
    const fallbackGrade = product.gradePrices[0]?.gradeType || "STANDART";
    const currentGradeType = selectedMaterial?.gradeType || fallbackGrade;
    const activePriceObj = product.gradePrices.find(g => g.gradeType === currentGradeType);
    return activePriceObj?.amount || 0; 
  }, [product, selectedMaterial]);

  const displaySymbol = useMemo(() => {
    return getCurrencySymbol(product?.currentCurrency || "AZN");
  }, [product]);

  // HOOK-lar
  const dynamicModelName = useAITranslation(product?.modelName || "");
  const dynamicDescription = useAITranslation(product?.description || "");
  const tSelectedMaterialName = useAITranslation(selectedMaterial?.name || "");
  const tSelectedMaterialGrade = useAITranslation((selectedMaterial?.gradeType || 'STANDART').replace('_', ' '));
  const tGoBack = useAITranslation("Geri Qayıt");

  const handleMaterialSelect = useCallback((leather: P_AvailableLeatherResponse) => {
    setSelectedMaterial(leather);
    setIsPopupOpen(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedMaterial || !addItemToCart) return;

    addItemToCart({
      cartItemId: `${product.id}-${selectedMaterial.id}`,
      productModelId: product.id,
      productModelName: product.modelName,
      leatherId: selectedMaterial.id,
      leatherName: selectedMaterial.name,
      quantity: 1,
      seenPrice: currentPrice,
      currency: product.currentCurrency || "AZN",
      image: activeImage,
      customRenderUrl: undefined
    });
    
    if (openCartPanel) openCartPanel(true);
  }, [product, selectedMaterial, currentPrice, activeImage, addItemToCart, openCartPanel]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <Loader2 className="w-7 h-7 animate-spin text-[#111111]" />
    </div>
  );

  if (!product) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <h2 className="text-xl font-sans uppercase tracking-[0.15em] text-[#111111]">Məhsul tapılmadı</h2>
    </div>
  );

  return (
    // Mobil ekranda sticky button altda qalmasın deyə pb-36 (144px) əlavə olundu
    <div className="bg-white min-h-screen pt-20 pb-36 lg:pb-16 overflow-x-hidden">
      
      {/* ================= MATERIAL POPUP ================= */}
      <AnimatePresence>
        {isPopupOpen && selectedMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 md:p-8 bg-[#111111]/60"
            onClick={() => setIsPopupOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm md:max-w-md bg-white"
            >
              <button
                onClick={() => setIsPopupOpen(false)}
                className="absolute top-3 right-3 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              >
                <X className="w-4 h-4 text-[#111111]" />
              </button>
              
              <div className="aspect-square overflow-hidden bg-[#f7f7f7]">
                <img 
                  src={selectedMaterial.imageUrl} 
                  alt="Selected" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="p-6 text-center border-t border-[#e5e5e5]">
                <h3 className="text-lg font-sans font-bold uppercase tracking-[0.1em] text-[#111111]">
                  {tSelectedMaterialName}
                </h3>
                <p className="text-[11px] text-[#767676] mt-1.5 uppercase tracking-[0.2em]">
                  {tSelectedMaterialGrade}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* ================= TOP NAV ================= */}
        <div className="flex items-center justify-end md:justify-start mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="hidden md:flex items-center gap-2 text-[#111111] hover:text-[#6f2c3f] font-sans text-[11px] uppercase font-bold tracking-[0.2em] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {tGoBack}
          </button>

          {/* Mobil X Düyməsi */}
          <button
            onClick={() => navigate(-1)}
            className="md:hidden w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-sm border border-[#e5e5e5] text-[#111111] active:scale-95 transition-all"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* ================= SOL — Şəkil qalereyası (daha iri) ================= */}
          <div className="lg:col-span-8 flex flex-col gap-2">
            <div 
              className="bg-[#f7f7f7] overflow-hidden aspect-[4/5] w-full relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={activeImage} 
                alt={dynamicModelName} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                draggable={false}
              />
              
              {product?.images && product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 lg:hidden">
                  {product.images.map((img) => (
                    <div 
                      key={img.id} 
                      className={cn(
                        "h-[3px] transition-all",
                        activeImage === img.imageUrl ? "bg-[#111111] w-7" : "bg-[#111111]/25 w-[6px]"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {product?.images && product.images.length > 1 && (
              <div className="hidden lg:flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={cn(
                      "w-[72px] h-[86px] overflow-hidden flex-shrink-0 transition-all border",
                      activeImage === img.imageUrl 
                        ? "border-[#111111]" 
                        : "border-transparent opacity-50 hover:opacity-100"
                    )}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= SAĞ — Detallar (brend saytı tərzi tipoqrafiya) ================= */}
          <div className="lg:col-span-4 flex flex-col justify-start lg:justify-center pt-4 lg:pt-0">
            
            <div className="mb-7">
              <span className="block font-sans text-[11px] tracking-[0.2em] uppercase text-[#767676] mb-2 font-medium">
                {product?.modelType || ""} · E1000 ATELYE
              </span>
              <h1 className="text-[22px] md:text-[26px] font-sans font-normal uppercase tracking-[0.02em] leading-[1.3] text-[#111111] mb-3">
                {dynamicModelName}
              </h1>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPrice}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[19px] font-sans font-semibold text-[#6f2c3f] flex items-baseline gap-1.5"
                >
                  <span>{displaySymbol}</span>
                  <span>{(currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  {selectedMaterial && (
                    <span className="text-[11px] text-[#767676] font-normal normal-case tracking-normal ml-1">
                      / {tSelectedMaterialGrade}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="font-sans text-[#767676] text-[13px] leading-[1.7] mb-8 max-w-md">
              {dynamicDescription}
            </p>

            {Object.keys(groupedLeathers).length > 0 && (
              <div className="space-y-6 mb-8 pt-6 border-t border-[#e5e5e5]">
                {Object.entries(groupedLeathers).map(([grade, leatherList]) => (
                  <GradeSection
                    key={grade}
                    grade={grade}
                    leathers={leatherList}
                    selectedId={selectedMaterial?.id || null}
                    onSelect={handleMaterialSelect}
                  />
                ))}
              </div>
            )}

            {selectedMaterial && (
              <div className="flex items-center gap-3 mb-7 py-3 border-t border-b border-[#e5e5e5]">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[#e5e5e5]">
                  <img src={selectedMaterial?.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#111111] truncate uppercase tracking-[0.05em]">{tSelectedMaterialName}</p>
                  <p className="text-[10px] text-[#767676] uppercase tracking-[0.15em]">
                    {tSelectedMaterialGrade}
                  </p>
                </div>
                <div className="text-[13px] font-semibold text-[#6f2c3f] whitespace-nowrap">
                  {displaySymbol}{(currentPrice || 0).toFixed(2)}
                </div>
              </div>
            )}

            {/* ================= SƏBƏTƏ ƏLAVƏ ET — brend saytı tərzi: tam-künc, iri tracking ================= */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white/95 backdrop-blur-lg border-t border-[#e5e5e5] z-50 lg:static lg:bg-transparent lg:border-none lg:p-0 lg:z-auto transition-all duration-500">
              <button 
                onClick={handleAddToCart}
                disabled={!selectedMaterial}
                className="w-full flex items-center justify-center gap-3 bg-[#111111] text-white px-8 py-[18px] font-sans text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-[#6f2c3f] transition-colors duration-300 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#111111]"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                <span>{t('cart.add_to_cart')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  
}