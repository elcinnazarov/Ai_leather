import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { 
  ProductDetailResponse, 
  P_AvailableLeatherResponse 
} from "../types/product";
import { ArrowLeft, Loader2, ShoppingBag, X } from "lucide-react";
import { cn } from "../lib/utils";
import { useCartStore } from "../store/useCartStore";
import { useCurrencyStore } from "../store/useCurrencyStore";
import { useAITranslation } from "../hooks/useAITranslation";
import { motion, AnimatePresence } from "framer-motion";

// --- DƏRİ QUTUSU (THUMBNAIL) KOMPONENTİ ---
function LeatherOption({ leather, isActive, onClick }: { leather: P_AvailableLeatherResponse, isActive: boolean, onClick: () => void }) {
  const dynName = useAITranslation(leather.name);
  
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 transition-all group min-w-[72px] snap-center"
    >
      <div className={cn(
        "w-16 h-16 rounded-full overflow-hidden transition-all duration-300 border-[3px] shadow-sm",
        isActive ? "border-black scale-110 shadow-md" : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
      )}>
        <img 
          src={leather.imageUrl || 'https://via.placeholder.com/150'} 
          alt={dynName} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <span className={cn(
        "font-sans text-[9px] uppercase tracking-widest text-center leading-tight transition-colors line-clamp-2 mt-1",
        isActive ? "text-black font-bold" : "text-gray-500 font-medium"
      )}>
        {dynName}
      </span>
    </button>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, setIsCartOpen } = useCartStore();
  const { symbol } = useCurrencyStore();
  
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [leathers, setLeathers] = useState<P_AvailableLeatherResponse[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<P_AvailableLeatherResponse | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // API ÇAĞIRIŞLARI
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
        
        if (leathersData && leathersData.length > 0) {
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

  // QRUPLAŞDIRMA VƏ QİYMƏT
  const groupedLeathers = useMemo(() => {
    return leathers.reduce((groups, leather) => {
      const grade = leather.gradeType || "STANDART";
      if (!groups[grade]) {
        groups[grade] = [];
      }
      groups[grade].push(leather);
      return groups;
    }, {} as Record<string, P_AvailableLeatherResponse[]>);
  }, [leathers]);

  const currentPrice = useMemo(() => {
    if (!product || !product.gradePrices) return 0;
    const currentGradeType = selectedMaterial?.gradeType || product.gradePrices[0]?.gradeType || "GRADE_I";
    const activePriceObj = product.gradePrices.find(g => g.gradeType === currentGradeType);
    return activePriceObj ? activePriceObj.amount : 0;
  }, [product, selectedMaterial]);

  // TƏRCÜMƏLƏR
  const dynamicModelName = useAITranslation(product?.modelName || "");
  const dynamicDescription = useAITranslation(product?.description || "");
  const selectedMaterialName = useAITranslation(selectedMaterial?.name || "");

  const handleMaterialClick = (leather: P_AvailableLeatherResponse) => {
    setSelectedMaterial(leather);
    setIsPopupOpen(true);
  };

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
    <div className="bg-[#FAF9F6] min-h-screen pt-24 pb-28 lg:pb-20 overflow-x-hidden">
      
      {/* 🌟 GLASSMORPHISM POPUP 🌟 */}
      <AnimatePresence>
        {isPopupOpen && selectedMaterial && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 md:p-8 bg-white/40 shadow-2xl"
          >
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-white/80 hover:bg-black hover:text-white rounded-full flex items-center justify-center text-black transition-all shadow-md z-50"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm md:max-w-md aspect-square rounded-3xl border-4 md:border-8 border-white shadow-2xl overflow-hidden mb-6 md:mb-8 bg-gray-100"
            >
              <img 
                src={selectedMaterial.imageUrl} 
                alt="Selected Leather" 
                className="w-full h-full object-cover scale-105"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center bg-white/95 backdrop-blur-md px-8 py-4 md:px-12 md:py-6 rounded-3xl shadow-lg w-full max-w-sm md:max-w-md"
            >
              <h3 className="text-2xl md:text-3xl font-serif text-black font-bold tracking-tight text-center">
                {selectedMaterialName}
              </h3>
              <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-500 mt-2 text-center">
                Material: {selectedMaterial.gradeType.replace('_', ' ')}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-black font-sans text-xs uppercase font-bold tracking-widest transition-colors mb-6 lg:mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Qayıt
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
          
          {/* SOL TƏRƏF: ANA ŞƏKİL */}
          <div className="lg:col-span-7">
            {/* 🛠️ DÜZƏLİŞ BURADADIR: aspect-[4/5] veririk, absolute/inset-0 silirik!
                Şəkil artıq səhifədə real yer tutur və altındakı elementləri itələyir. */}
            <div className="lg:sticky top-28 bg-[#f5f5f5] rounded-3xl overflow-hidden aspect-[4/5] shadow-sm w-full">
              <img 
                src={product.primaryImageUrl || 'https://via.placeholder.com/800x1000'} 
                alt={dynamicModelName} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
          </div>

          {/* SAĞ TƏRƏF (Mobildə şəklin ALTI): DETALLAR */}
          <div className="lg:col-span-5 flex flex-col justify-start lg:justify-center pt-6 lg:pt-0">
            
            {/* BAŞLIQ VƏ QİYMƏT (Həm mobil, həm desktop üçün eyni yerdədir) */}
            <div className="mb-6 lg:mb-8">
              <span className="block font-sans text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-2 lg:mb-3">
                E1000 {product.modelType} Series
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#111] font-bold leading-tight mb-3 lg:mb-4">
                {dynamicModelName}
              </h1>
              <div className="text-2xl md:text-3xl font-sans font-medium text-[#111] transition-all duration-300">
                {symbol} {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <p className="font-serif text-gray-600 text-sm md:text-[15px] leading-relaxed mb-8 md:mb-10">
              {dynamicDescription}
            </p>

            {/* QRUPLAŞDIRILMIŞ DƏRİLƏR */}
            {Object.keys(groupedLeathers).length > 0 && (
              <div className="space-y-8 mb-10 border-t border-gray-200 pt-8">
                {Object.entries(groupedLeathers).map(([grade, leatherList]) => (
                  <div key={grade} className="space-y-4">
                    <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#111]">
                      {grade.replace('_', ' ')} Kolleksiyası
                    </h4>
                    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {leatherList.map((leather) => (
                        <LeatherOption 
                          key={leather.id}
                          leather={leather}
                          isActive={selectedMaterial?.id === leather.id}
                          onClick={() => handleMaterialClick(leather)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => {
                addItem({
                  productModelId: product.id,
                  leatherId: selectedMaterial?.id || 1,
                  quantity: 1,
                  seenPrice: currentPrice,
                  customRenderUrl: product.primaryImageUrl 
                });
                setIsCartOpen(true);
              }}
              className="w-full flex items-center justify-center gap-3 bg-[#111] text-white px-8 py-5 rounded-2xl font-sans text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10 mt-auto lg:mt-0"
            >
              <ShoppingBag className="w-5 h-5" /> Səbətə Əlavə Et
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
}