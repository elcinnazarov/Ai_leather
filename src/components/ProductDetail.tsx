import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { ProductDetailResponse, P_AvailableLeatherResponse } from "../types/product";
import { ArrowLeft, Loader2, ShoppingBag, X, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { useCartStore } from "../store/useCartStore";
import { useAITranslation } from "../lib/hooks/useAITranslation";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrencySymbol } from '../lib/currencyMapper';

// ============================================
// 🎨 MODERN LEATHER SEÇİM KOMPONENTİ
// ============================================
interface LeatherOptionProps {
  leather: P_AvailableLeatherResponse;
  isActive: boolean;
  onClick: () => void;
}

function LeatherOption({ leather, isActive, onClick }: LeatherOptionProps) {
  const dynName = useAITranslation(leather?.name || "");
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 group"
    >
      <div className={cn(
        "relative w-20 h-20 rounded-2xl overflow-hidden transition-all duration-500",
        isActive 
          ? "ring-[3px] ring-offset-[3px] ring-black shadow-[0_8px_30px_rgba(0,0,0,0.15)] scale-105" 
          : "ring-1 ring-gray-200 hover:ring-gray-400 hover:shadow-lg"
      )}>
        <img 
          src={leather?.imageUrl || 'https://via.placeholder.com/150'} 
          alt={dynName} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 bg-black/20 flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-4 h-4 text-black" strokeWidth={3} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center space-y-0.5">
        <span className={cn(
          "font-sans text-[10px] uppercase tracking-widest text-center leading-tight block max-w-[80px]",
          isActive ? "text-black font-bold" : "text-gray-500 font-medium"
        )}>
          {dynName}
        </span>
      </div>
    </motion.button>
  );
}

// ============================================
// 🏷️ GRADE BAŞLIQ KOMPONENTİ
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
        <h4 className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
          {gradeLabel} {collectionText}
        </h4>
        <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
      </div>
      
      <div className="flex overflow-x-auto gap-5 pb-4 pt-1 scrollbar-hide snap-x px-1">
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
// 📦 ƏSAS KOMPONENT
// ============================================
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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
  const tAddToCart = useAITranslation("Səbətə Əlavə Et");

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
    <div className="flex items-center justify-center h-screen bg-[#FAF9F6]">
      <Loader2 className="w-10 h-10 animate-spin text-black" />
    </div>
  );

  if (!product) return (
    <div className="flex items-center justify-center h-screen bg-[#FAF9F6]">
      <h2 className="text-2xl font-serif text-black">Məhsul tapılmadı</h2>
    </div>
  );

  return (
    // Mobil ekranda sticky button altda qalmasın deyə pb-36 (144px) əlavə olundu
    <div className="bg-[#FAF9F6] min-h-screen pt-24 pb-36 lg:pb-20 overflow-x-hidden">
      
      <AnimatePresence>
        {isPopupOpen && selectedMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 md:p-8 bg-black/30 backdrop-blur-md"
            onClick={() => setIsPopupOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm md:max-w-md"
            >
              <button
                onClick={() => setIsPopupOpen(false)}
                className="absolute -top-12 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
                <img 
                  src={selectedMaterial.imageUrl} 
                  alt="Selected" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="mt-4 bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg text-center">
                <h3 className="text-xl font-serif font-bold text-[#111]">
                  {tSelectedMaterialName}
                </h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                  {tSelectedMaterialGrade}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* 📱 TOP NAVI: Desktop üçün "Geri", Mobile üçün "X" Yuxarı Sağ Küncdə */}
        <div className="flex items-center justify-end md:justify-start mb-6">
          <button 
            onClick={() => navigate("/")}
            className="hidden md:flex items-center gap-2 text-gray-500 hover:text-black font-sans text-xs uppercase font-bold tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {tGoBack}
          </button>

          {/* Mobil X Düyməsi */}
          <button
            onClick={() => navigate("/")}
            className="md:hidden w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 text-[#111] hover:bg-gray-50 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
          
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div 
              className="bg-[#f5f5f5] rounded-3xl overflow-hidden aspect-[4/5] shadow-sm w-full relative"
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
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 lg:hidden">
                  {product.images.map((img) => (
                    <div 
                      key={img.id} 
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        activeImage === img.imageUrl ? "bg-[#111] w-6" : "bg-white/60 w-1.5"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {product?.images && product.images.length > 1 && (
              <div className="hidden lg:flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={cn(
                      "w-20 h-24 border-2 rounded-xl overflow-hidden flex-shrink-0 transition-all",
                      activeImage === img.imageUrl 
                        ? "border-black scale-105 shadow-md" 
                        : "border-gray-200 opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col justify-start lg:justify-center pt-6 lg:pt-0">
            
            <div className="mb-6">
              <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-2">
                {product?.modelType || ""} Series
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#111] font-bold leading-tight mb-3">
                {dynamicModelName}
              </h1>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPrice}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-2xl md:text-3xl font-sans font-medium text-[#111] flex items-center gap-2"
                >
                  <span>{displaySymbol}</span>
                  <span>{(currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  {selectedMaterial && (
                    <span className="text-xs text-gray-400 font-normal normal-case tracking-normal">
                      / {tSelectedMaterialGrade}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="font-serif text-gray-600 text-sm leading-relaxed mb-8">
              {dynamicDescription}
            </p>

            {Object.keys(groupedLeathers).length > 0 && (
              <div className="space-y-8 mb-10 border-t border-gray-200 pt-8">
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
              <div className="flex items-center gap-3 mb-6 p-3 bg-white rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img src={selectedMaterial?.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#111]">{tSelectedMaterialName}</p>
                  <p className="text-[10px] text-gray-500 uppercase">
                    {tSelectedMaterialGrade}
                  </p>
                </div>
                <div className="text-sm font-bold text-[#111]">
                  {displaySymbol}{(currentPrice || 0).toFixed(2)}
                </div>
              </div>
            )}

            {/* 🛒 STICKY MOBILE SƏBƏT DÜYMƏSİ */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-50 lg:static lg:bg-transparent lg:border-none lg:p-0 lg:z-auto shadow-[0_-10px_30px_rgba(0,0,0,0.05)] lg:shadow-none transition-all">
              <button 
                onClick={handleAddToCart}
                disabled={!selectedMaterial}
                className="w-full flex items-center justify-center gap-3 bg-[#111] text-white px-8 py-5 rounded-2xl font-sans text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-black/10"
              >
                <ShoppingBag className="w-5 h-5" />
                {tAddToCart}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}