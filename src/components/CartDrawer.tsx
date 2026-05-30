import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useCurrencyStore } from "../store/useCurrencyStore";
import { cartService } from "../services/cartService";
import { CartPreviewResponse } from "../types/cart";
import { Currency } from "../types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAITranslation } from "../hooks/useAITranslation";

function CartItem({ item, updateQuantity, removeItem, symbol }: any) {
  const dynModelName = useAITranslation(item.productModelName);
  const dynLeatherName = useAITranslation(item.leatherName);
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-8 group"
    >
      {/* Image */}
      <div className="w-24 h-32 bg-[#eeeeee] rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={item.finalImageUrl || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400"} 
          alt={dynModelName} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col justify-between flex-1 py-1">
        <div>
          <h3 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#271310] mb-1">
            {dynModelName}
          </h3>
          <p className="font-serif text-sm text-[#6f5a52] italic">
            {dynLeatherName}
          </p>
          {item.itemErrorMessage && (
            <p className="font-sans text-[10px] text-red-500/80 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {item.itemErrorMessage}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between mt-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-4 bg-[#eeeeee] px-3 py-1.5 rounded-full">
            <button 
              onClick={() => updateQuantity(item.productModelId, item.leatherId, item.quantity - 1)}
              className="text-[#6f5a52] hover:text-[#271310] transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-sans text-xs font-bold text-[#271310] w-4 text-center">
              {item.quantity}
            </span>
            <button 
              onClick={() => updateQuantity(item.productModelId, item.leatherId, item.quantity + 1)}
              className="text-[#6f5a52] hover:text-[#271310] transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="font-sans text-xs font-bold text-[#271310]">
              {symbol} {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {item.priceChanged && (
              <span className="font-sans text-[9px] uppercase tracking-widest text-red-500/80">
                Price Updated
              </span>
            )}
            <button 
              onClick={() => removeItem(item.productModelId, item.leatherId)}
              className="text-[#6f5a52] hover:text-[#ba1a1a] transition-colors opacity-0 group-hover:opacity-100 mt-1"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeItem } = useCartStore();
  const { symbol } = useCurrencyStore();
  const { t } = useTranslation();
  const [previewData, setPreviewData] = useState<CartPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreview = async () => {
      if (cartItems.length === 0) {
        setPreviewData(null);
        return;
      }
      
      try {
        setLoading(true);
        const response = await cartService.previewCart({
          items: cartItems.map(item => ({
            productModelId: item.productModelId,
            leatherId: item.leatherId,
            quantity: item.quantity,
            seenPrice: item.seenPrice,
            customRenderUrl: item.customRenderUrl
          })),
          currency: Currency.AZN // Defaulting to AZN for now
        });
        setPreviewData(response);
      } catch (error) {
        console.error("Failed to fetch cart preview:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isCartOpen) {
      fetchPreview();
    }
  }, [cartItems, isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-[#1a1c1c]/20 backdrop-blur-sm z-[70]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#f9f9f9] shadow-2xl z-[80] flex flex-col"
          >
            {/* Header */}
            <div className="px-10 pt-12 pb-8 flex items-center justify-between">
              <h2 className="font-serif text-2xl text-[#271310] italic">{t("cart.title")}</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[#e8e8e8] rounded-full transition-colors text-[#271310]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-10 py-4 space-y-12 hide-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                  <p className="font-serif text-xl text-[#271310]">{t("cart.empty")}</p>
                </div>
              ) : (
                previewData?.items.map((item, index) => (
                  <CartItem 
                    key={`${item.productModelId}-${item.leatherId}-${index}`} 
                    item={item} 
                    updateQuantity={updateQuantity} 
                    removeItem={removeItem} 
                    symbol={symbol} 
                  />
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {cartItems.length > 0 && (
              <div className="p-10 bg-white border-t border-[#f3f3f3]">
                
                {/* Global Errors */}
                {previewData?.globalErrors && previewData.globalErrors.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {previewData.globalErrors.map((error, idx) => (
                      <p key={idx} className="font-sans text-[10px] text-red-500/80 flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-end mb-8">
                  <span className="font-sans text-xs uppercase tracking-widest text-[#6f5a52]">{t("cart.total")}</span>
                  <div className="text-right">
                    {loading ? (
                      <div className="h-6 w-24 bg-[#eeeeee] animate-pulse rounded"></div>
                    ) : (
                      <span className="font-serif text-2xl text-[#271310]">
                        {symbol} {(previewData?.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
                
                <button 
                  disabled={!previewData?.valid}
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate("/checkout");
                  }}
                  className="w-full bg-[#271310] text-white py-5 rounded-full font-sans font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#3e2723] transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("cart.checkout")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
