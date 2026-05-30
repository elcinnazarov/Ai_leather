import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useCartStore } from "../../store/useCartStore";
import { cartService } from "../../services/cartService";
import { orderService } from "../../services/orderService";
import { CartPreviewResponse } from "../../types/cart";
import { OrderType } from "../../types/order";
import { Currency, Country } from "../../types";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { useTranslation } from "react-i18next";
import { getCurrencyForCountry, getCurrencySymbol } from "../../lib/currencyMapper";
import { useAITranslation } from "../../hooks/useAITranslation";

function CheckoutItem({ item, localSymbol, t }: any) {
  const dynModelName = useAITranslation(item.productModelName);
  const dynLeatherName = useAITranslation(item.leatherName);
  
  return (
    <div className="flex gap-6 items-start">
      <div className="w-20 h-28 bg-[#f9f9f9] overflow-hidden flex-shrink-0">
        <img 
          src={item.finalImageUrl || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400"} 
          alt={dynModelName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#271310] mb-1">
          {dynModelName}
        </h4>
        <p className="font-serif text-xs text-[#6f5a52] italic mb-3" style={{ fontFamily: "Noto Serif, serif" }}>
          {dynLeatherName}
        </p>
        <div className="flex justify-between items-baseline border-b border-dashed border-[#d3c3c0] pb-2">
          <span className="font-sans text-[10px] text-[#6f5a52]">{t("checkout.qty")}: {item.quantity}</span>
          <span className="font-sans text-xs font-bold text-[#271310]">{localSymbol} {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { cartItems, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState<CartPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form State
  const [formData, setFormData] = useState({
    country: Country.AZERBAIJAN,
    cityName: "",
    postalCode: "",
    deliveryAddress: "",
    customerPhone: "",
    notes: ""
  });

  const localSymbol = getCurrencySymbol(getCurrencyForCountry(formData.country as Country));

  useEffect(() => {
    if (cartItems.length === 0) {
      // If empty, usually we redirect to shop, but keep it graceful
      return;
    }
    
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const mappedCurrency = getCurrencyForCountry(formData.country as Country);
        const response = await cartService.previewCart({
          items: cartItems.map(item => ({
            productModelId: item.productModelId,
            leatherId: item.leatherId,
            quantity: item.quantity,
            seenPrice: item.seenPrice,
            customRenderUrl: item.customRenderUrl
          })),
          currency: mappedCurrency
        });
        setPreviewData(response);
      } catch (error) {
        console.error("Failed to load checkout preview:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [cartItems, formData.country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Reset postal code and its error if switching to Azerbaijan
      if (name === 'country' && value === Country.AZERBAIJAN) {
        newData.postalCode = '';
      }
      return newData;
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    // Specially clear postalCode error if switching to AZ
    if (name === 'country' && value === Country.AZERBAIJAN && errors.postalCode) {
      setErrors(prev => ({ ...prev, postalCode: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.cityName) newErrors.cityName = t("checkout.validation.required_city");
    
    // Postal code validation logic
    if (formData.country !== Country.AZERBAIJAN) {
      if (!formData.postalCode || formData.postalCode.trim() === '') {
        newErrors.postalCode = t("checkout.validation.postal_code_invalid");
      }
    }
    
    if (!formData.deliveryAddress) newErrors.deliveryAddress = t("checkout.validation.required_address");
    if (!formData.customerPhone) {
      newErrors.customerPhone = t("checkout.validation.required_phone");
    } else if (formData.customerPhone.length < 5) {
      newErrors.customerPhone = t("checkout.validation.invalid_phone");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewData?.valid || cartItems.length === 0) return;
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const response = await orderService.createOrder({
        orderType: OrderType.STANDARD,
        country: formData.country,
        cityName: formData.cityName || undefined,
        postalCode: formData.postalCode ? formData.postalCode : undefined,
        deliveryAddress: formData.deliveryAddress,
        customerPhone: formData.customerPhone,
        notes: formData.notes,
        currency: getCurrencyForCountry(formData.country as Country),
        items: previewData.items.map(item => ({
          productModelId: item.productModelId,
          productModelName: item.productModelName,
          leatherId: item.leatherId,
          leatherName: item.leatherName,
          quantity: item.quantity,
          unitPrice: item.currentUnitPrice,
          renderImageUrl: item.finalImageUrl
        }))
      });

      // Clear cart on success
      clearCart();
      // Redirect to the newly created order
      navigate(`/profile/orders/${response.orderId}`);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to create order. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f9]">
        <h2 className="font-serif text-3xl text-[#271310] mb-4" style={{ fontFamily: "Noto Serif, serif" }}>{t("cart.empty")}</h2>
        <button 
          onClick={() => navigate("/materials")} 
          className="text-xs font-sans uppercase tracking-[0.2em] border-b border-[#271310] pb-1 text-[#271310]"
        >
          {t("orders.explore_btn")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] selection:bg-[#fadcd2] selection:text-[#271310] flex flex-col pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
        
        {/* Left Column: Checkout Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="py-12"
        >
          <div className="mb-16">
            <span className="text-[#6f5a52] font-sans uppercase tracking-[0.2em] text-[10px] mb-4 block">{t("checkout.secure")}</span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#271310] leading-none mb-4 tracking-tight" style={{ fontFamily: "Noto Serif, serif" }}>
              {t("checkout.title")}
            </h1>
          </div>

          <form onSubmit={handleCheckout} className="space-y-10">
            {/* Country & City Row */}
            <div className="grid grid-cols-2 gap-8">
              <div className="relative group">
                <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-1">{t("checkout.country")}</label>
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-[#d3c3c0] rounded-none py-3 pl-0 pr-8 text-[#271310] focus:ring-0 focus:border-[#271310] transition-colors appearance-none font-sans"
                >
                  {Object.values(Country).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="relative group">
                <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-1">{t("checkout.city")}</label>
                {formData.country === Country.AZERBAIJAN ? (
                  <select
                    name="cityName"
                    value={formData.cityName}
                    onChange={handleInputChange}
                    className={`w-full bg-transparent border-0 border-b ${errors.cityName ? 'border-red-500' : 'border-[#d3c3c0]'} rounded-none py-3 pl-0 pr-8 text-[#271310] focus:ring-0 focus:border-[#271310] transition-colors appearance-none font-sans`}
                  >
                    <option value="" disabled>Seçmək üçün vurun</option>
                    <option value="Baku">Bakı</option>
                    <option value="Sumqayit">Sumqayıt</option>
                    <option value="Ganja">Gəncə</option>
                    <option value="Xirdalan">Xırdalan</option>
                    <option value="Mingachevir">Mingəçevir</option>
                    <option value="Shirvan">Şirvan</option>
                    <option value="Nakhchivan">Naxçıvan</option>
                    <option value="Lankaran">Lənkəran</option>
                    <option value="Shaki">Şəki</option>
                    <option value="Quba">Quba</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    name="cityName"
                    value={formData.cityName}
                    onChange={handleInputChange}
                    placeholder="Baku"
                    className={`w-full bg-transparent border-0 border-b ${errors.cityName ? 'border-red-500' : 'border-[#d3c3c0]'} rounded-none py-3 px-0 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 focus:border-[#271310] transition-colors font-sans`}
                  />
                )}
                {errors.cityName && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.cityName}</span>}
              </div>
            </div>

            {/* Postal Code & Phone */}
            <div className="grid grid-cols-2 gap-8">
              <div className="relative group">
                <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-1">{t("checkout.postalCode")}</label>
                <input 
                  type="text" 
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder={formData.country === Country.AZERBAIJAN ? "" : "e.g. 10001"}
                  disabled={formData.country === Country.AZERBAIJAN}
                  className={`w-full bg-transparent border-0 border-b ${errors.postalCode ? 'border-red-500' : 'border-[#d3c3c0]'} rounded-none py-3 px-0 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 focus:border-[#271310] transition-colors font-sans disabled:opacity-50`}
                />
                {errors.postalCode && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.postalCode}</span>}
              </div>
              <div className="relative group">
                <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-1">{t("checkout.phone")}</label>
                <input 
                  type="tel" 
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="+994.."
                  className={`w-full bg-transparent border-0 border-b ${errors.customerPhone ? 'border-red-500' : 'border-[#d3c3c0]'} rounded-none py-3 px-0 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 focus:border-[#271310] transition-colors font-sans`}
                />
                {errors.customerPhone && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.customerPhone}</span>}
              </div>
            </div>

            {/* Address */}
            <div className="relative group">
              <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-1">{t("checkout.address")}</label>
              <input 
                type="text" 
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                className={`w-full bg-transparent border-0 border-b ${errors.deliveryAddress ? 'border-red-500' : 'border-[#d3c3c0]'} rounded-none py-3 px-0 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 focus:border-[#271310] transition-colors font-sans`}
              />
              {errors.deliveryAddress && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.deliveryAddress}</span>}
            </div>

            {/* Notes */}
            <div className="relative group">
              <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-1">{t("checkout.notes")}</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-transparent border-0 border-b border-[#d3c3c0] rounded-none py-3 px-0 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 focus:border-[#271310] transition-colors font-sans resize-none"
              />
            </div>

            <div className="pt-12">
              <button 
                type="submit"
                disabled={!previewData?.valid || submitting}
                className="w-full bg-[#271310] text-white py-6 rounded-none font-sans font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#3e2723] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t("checkout.submitting") : t("checkout.submit")}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right Column: Order Summary (Invoice format) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:pl-16 lg:border-l border-[#d3c3c0]/30"
        >
          <div className="sticky top-40 bg-white p-12 shadow-[0_20px_40px_rgba(39,19,16,0.03)] rounded-none">
            <h3 className="font-serif text-2xl text-[#271310] italic mb-8" style={{ fontFamily: "Noto Serif, serif" }}>{t("checkout.summary")}</h3>
            
            {loading ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-20 bg-[#eeeeee]"></div>
                    <div className="flex-1 space-y-2 py-2">
                      <div className="h-3 w-2/3 bg-[#eeeeee]"></div>
                      <div className="h-3 w-1/3 bg-[#eeeeee]"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {previewData?.items.map((item, idx) => (
                  <CheckoutItem 
                    key={idx}
                    item={item}
                    localSymbol={localSymbol}
                    t={t}
                  />
                ))}

                <div className="pt-8 mb-4 border-t border-[#271310]">
                  <div className="flex justify-between text-sm mb-4">
                    <span className="font-sans text-[#6f5a52]">{t("checkout.subtotal")}</span>
                    <span className="font-sans text-[#271310]">{localSymbol} {(previewData?.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-6">
                    <span className="font-sans text-[#6f5a52]">{t("checkout.shipping")}</span>
                    <span className="font-sans text-[10px] text-[#271310] uppercase tracking-widest">{t("cart.taxes_calculated")}</span>
                  </div>
                  <div className="flex justify-between items-end pt-6 border-t border-[#271310]">
                    <span className="font-sans font-black text-[10px] uppercase tracking-widest text-[#271310]">{t("checkout.total")}</span>
                    <span className="font-serif text-3xl text-[#271310]" style={{ fontFamily: "Noto Serif, serif" }}>
                      <span className="text-xl pr-1">{localSymbol}</span>{(previewData?.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
