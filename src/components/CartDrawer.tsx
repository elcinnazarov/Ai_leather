// src/components/CartDrawer.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/useCartStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { cartService } from '../services/cartService';
import { CartPreviewResponse } from '../types/cart';
import { X, Trash2, ShoppingBag, AlertTriangle, Loader2, Minus, Plus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { t } = useTranslation();
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, updateSeenPrice } = useCartStore();
  
  const { currency: storeCurrency } = useCurrencyStore();
  const navigate = useNavigate();

  const [previewData, setPreviewData] = useState<CartPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const itemsSignature = items.map(i => `${i.cartItemId}-${i.quantity}`).join('|');

  const activeCartCurrency = (items.length > 0 && items[0].currency) ? items[0].currency : storeCurrency;

  useEffect(() => {
    if (isOpen && items.length > 0) {
      validateCart();
    }
  }, [isOpen, activeCartCurrency, itemsSignature]);

  const validateCart = async () => {
    try {
      setLoading(true);
      const request = {
        currency: activeCartCurrency,
        items: items.map(i => ({
          productModelId: i.productModelId,
          leatherId: i.leatherId,
          quantity: i.quantity,
          seenPrice: i.seenPrice,
          customRenderUrl: i.customRenderUrl || undefined
        }))
      };
      
      const response = await cartService.previewCart(request);
      setPreviewData(response);

      if (response?.items) {
        response.items.forEach(backendItem => {
          if (backendItem.priceChanged) {
            const localId = `${backendItem.productModelId}-${backendItem.leatherId}`;
            updateSeenPrice(localId, backendItem.currentUnitPrice);
          }
        });
      }
    } catch (error: any) {
      console.error("Cart validation error:", error);
      if (error.response?.status === 404) {
        toast.error(t('cart.errors.endpointNotFound', 'Səbət xidməti müvəqqəti olaraq əlçatan deyil'));
      } else {
        toast.error(t('cart.errors.syncFailed', 'Səbət məlumatları yenilənərkən xəta baş verdi'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!previewData?.valid) {
      toast.error(t('cart.errors.resolveBeforeCheckout', 'Zəhmət olmasa səbətdəki xətaları düzəldin'));
      return;
    }
    setIsOpen(false);
    navigate('/checkout');
  };

  const displayCurrency = previewData?.currency || activeCartCurrency;

  // 📱 DÜZƏLİŞ 1: Mobile Swipe Təkmilləşdirilməsi
  // Artıq istifadəçi məhsullara baxmaq üçün aşağı-yuxarı sürüşdürəndə səbət qəfil bağlanmayacaq.
  // Yalnız horizontal (sağa) xüsusi sürüşdürmə olduqda bağlanacaq.
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const deltaX = touchStart.x - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStart.y - e.changedTouches[0].clientY);
    
    // Əgər istifadəçi şaquli (aşağı-yuxarı) yox, üfüqi (sağa) ən azı 60px sürüşdürübsə bağla
    if (deltaX < -60 && deltaY < 50) {
      setIsOpen(false);
    }
    setTouchStart(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ✅ DÜZƏLİŞ 2: Z-Index 100 edildi (Bütün naviqasiyalardan üstdə qalması üçün) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            // ✅ DÜZƏLİŞ 3: h-[100dvh] (Dynamic Viewport Height) iOS Safari / Chrome xətalarının qarşısını alır
            className="fixed right-0 top-0 w-full sm:w-[420px] bg-[#FAF9F6] shadow-2xl z-[100] flex flex-col"
            style={{ height: "100dvh" }} 
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#111]" />
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#111] tracking-wide">
                  {t('cart.title', 'Səbətiniz')}
                </h2>
                <span className="bg-[#111] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {items.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              </div>
              
              {/* ✅ DÜZƏLİŞ 4: Düymənin basılma sahəsi böyüdüldü (p-3) və xüsusi stopPropagation əlavə edildi */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }} 
                className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all active:scale-90 touch-manipulation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* BODY (Məhsullar Siyahısı) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-sans overscroll-contain">
              
              {previewData?.globalErrors && previewData.globalErrors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-xl mb-4 border border-red-100">
                  {previewData.globalErrors.map((err, i) => (
                    <p key={i} className="text-red-600 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {err}
                    </p>
                  ))}
                </div>
              )}

              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-medium tracking-widest uppercase">
                    {t('cart.empty', 'Səbətiniz boşdur')}
                  </p>
                  <button 
                    onClick={() => { setIsOpen(false); navigate('/'); }}
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1"
                  >
                    {t('cart.continueShopping', 'Alış-verişə Davam Et')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(localItem => {
                    const backendItem = previewData?.items.find(
                      b => b.productModelId === localItem.productModelId && b.leatherId === localItem.leatherId
                    );

                    const finalImage = backendItem?.finalImageUrl || localItem.image || localItem.customRenderUrl;
                    const priceToShow = backendItem?.totalPrice || (localItem.seenPrice * localItem.quantity);
                    const isError = backendItem && !backendItem.available;
                    
                    return (
                      <div 
                        key={localItem.cartItemId} 
                        className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all ${
                          isError ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100 shadow-sm'
                        }`}
                      >
                        {/* Şəkil */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {finalImage ? (
                            <img src={finalImage} alt={localItem.productModelName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6"/>
                            </div>
                          )}
                        </div>

                        {/* Məlumat */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-sm font-bold text-[#111] leading-tight truncate">
                                {localItem.productModelName}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 uppercase tracking-wider">
                                {localItem.leatherName}
                              </p>
                              {backendItem?.isCustomDesign && (
                                <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded mt-1">
                                  AI DESIGN
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => removeItem(localItem.cartItemId)} 
                              className="text-gray-300 hover:text-red-500 transition-colors p-2 shrink-0 touch-manipulation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {isError && (
                            <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="w-3 h-3" /> 
                              {backendItem?.itemErrorMessage || t('cart.itemUnavailable', 'Məhsul mövcud deyil')}
                            </p>
                          )}
                          
                          {backendItem?.priceChanged && backendItem.available && (
                            <p className="text-[10px] font-bold text-orange-500 mt-1">
                              {t('cart.priceUpdated', 'Qiymət yeniləndi')}
                            </p>
                          )}

                          {/* Say və Qiymət */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                              <button 
                                onClick={() => updateQuantity(localItem.cartItemId, localItem.quantity - 1)} 
                                className="p-2 sm:p-2 hover:bg-gray-50 disabled:opacity-50 active:scale-90 transition-all touch-manipulation" 
                                disabled={localItem.quantity <= 1}
                              >
                                <Minus className="w-3 h-3 text-[#111]" />
                              </button>
                              <span className="w-6 sm:w-8 text-center text-xs font-bold text-[#111]">
                                {localItem.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(localItem.cartItemId, localItem.quantity + 1)} 
                                className="p-2 sm:p-2 hover:bg-gray-50 active:scale-90 transition-all touch-manipulation"
                              >
                                <Plus className="w-3 h-3 text-[#111]" />
                              </button>
                            </div>
                            
                            <div className="text-right">
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                              ) : (
                                <span className="text-sm font-bold text-[#111]">
                                  {priceToShow.toFixed(2)} {displayCurrency}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FOOTER (ÖDƏNİŞ) */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 bg-white border-t border-gray-200 space-y-3 sm:space-y-4 shrink-0 pb-safe">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {t('cart.total', 'Yekun')}
                  </span>
                  <span className="text-lg sm:text-xl font-serif font-bold text-[#111]">
                    {loading ? "..." : `${previewData?.totalAmount?.toFixed(2) || '0.00'} ${displayCurrency}`}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={loading || !previewData?.valid}
                  className="w-full bg-[#111] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group active:scale-[0.98] touch-manipulation"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {!loading && (
                    <>
                      {previewData?.valid ? (
                        <>
                          {t('cart.checkout', 'Ödənişə Keç')}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      ) : (
                        t('cart.resolveErrors', 'Xətaları Düzəldin')
                      )}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}