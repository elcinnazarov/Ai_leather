// src/pages/checkout/CheckoutPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "../../store/useCartStore";
import { cartService } from "../../services/cartService";
import { useOrders } from "../../lib/hooks/useOrders";
import { useAITranslation } from "../../lib/hooks/useAITranslation";
import { OrderType, Country } from "../../types/order";
import { useTranslation } from "react-i18next";
import { getCurrencySymbol, getCurrencyForCountry } from "../../lib/currencyMapper";
// DİQQƏT: ChevronDown ikonu əlavə edildi (Modern Dropdown görünüşü üçün)
import { Loader2, ShoppingBag, Check, Truck, Info, ChevronDown } from "lucide-react"; 
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { ALL_COUNTRIES } from "../../constants/countries";

// ============================================
// 🌍 AZƏRBAYCAN ŞƏHƏRLƏRİNİN TAM SİYAHISI
// ============================================
const AZ_CITIES = [
  "Bakı", "Sumqayıt", "Gəncə", "Xırdalan", "Mingəçevir", "Şirvan", "Naxçıvan", 
  "Lənkəran", "Şəki", "Quba", "Qəbələ", "Şamaxı", "Zaqatala", "Masallı", 
  "Cəlilabad", "Göyçay", "Bərdə", "Şəmkir", "Qusar", "Xaçmaz", "Ağdam", 
  "Füzuli", "Şuşa", "Xankəndi", "Laçın", "Kəlbəcər", "Zəngilan", "Qubadlı"
];

// ============================================
// 🎨 CHECKOUT ITEM KOMPONENTİ
// ============================================
function CheckoutItem({ item, localSymbol }: { item: any; localSymbol: string }) {
  const dynModelName = useAITranslation(item.productModelName);
  const dynLeatherName = useAITranslation(item.leatherName);

  return (
    <div className="flex gap-6 items-start">
      <div className="w-20 h-28 bg-[#f9f9f9] overflow-hidden flex-shrink-0">
        <img
          src={item.finalImageUrl || item.renderImageUrl || "https://via.placeholder.com/150"}
          alt={dynModelName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#271310] mb-1">
          {dynModelName}
        </h4>
        <p className="font-serif text-xs text-[#6f5a52] italic mb-3">
          {dynLeatherName}
        </p>
        <div className="flex justify-between items-baseline border-b border-dashed border-[#d3c3c0] pb-2">
          <span className="font-sans text-[10px] text-[#6f5a52]">
            qty: {item.quantity}
          </span>
          <span className="font-sans text-xs font-bold text-[#271310]">
            {localSymbol} {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 📦 ƏSAS CHECKOUT KOMPONENTİ
// ============================================
export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cartItems = useCartStore((s) => s.items);
  const { currency: storeCurrency } = useCurrencyStore();
  const { createOrder, creating } = useOrders();

  const [previewData, setPreviewData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [showCountryWarning, setShowCountryWarning] = useState(false);

  const [formData, setFormData] = useState({
    uiCountryCode: "AZ",
    backendCountryEnum: Country.AZERBAIJAN,
    cityName: "",
    postalCode: "",
    deliveryAddress: "",
    phoneCode: "+994",
    phoneNumber: "",
    notes: ""
  });

  // 🔴 YENİ: Valyuta birbaşa seçilmiş ölkədən (Enum) asılı olaraq təyin edilir
  const activeCurrency = useMemo(() => {
    return getCurrencyForCountry(formData.backendCountryEnum as any);
  }, [formData.backendCountryEnum]);
  
  const displayCurrency = previewData?.currency || activeCurrency;
  const displaySymbol = useMemo(() => getCurrencySymbol(displayCurrency), [displayCurrency]);

  useEffect(() => {
    if (cartItems.length === 0) return;

    const fetchPreview = async () => {
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
          currency: activeCurrency // <--- Backend-ə hər dəfə yeni valyuta gedir
        });
        setPreviewData(response);
      } catch (error) {
        console.error("Failed to load checkout preview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [cartItems, activeCurrency]); // activeCurrency dəyişəndə yenidən hesablanır

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'uiCountryCode') {
        const selectedCountryData = ALL_COUNTRIES.find(c => c.code === value);
        
        if (selectedCountryData) {
          newData.backendCountryEnum = selectedCountryData.enum; 
          newData.phoneCode = selectedCountryData.phoneCode;     
          
          if (selectedCountryData.enum === Country.AZERBAIJAN) {
            newData.postalCode = ''; 
          }

          setShowCountryWarning(true);
          setTimeout(() => setShowCountryWarning(false), 8000);
        }
      }

      return newData;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.cityName?.trim()) {
      newErrors.cityName = t("checkout.validation.required_city", "Şəhər seçilməlidir");
    }

    if (formData.backendCountryEnum !== Country.AZERBAIJAN && !formData.postalCode?.trim()) {
      newErrors.postalCode = t("checkout.validation.postal_code_required", "Poçt indeksi tələb olunur");
    }

    if (!formData.deliveryAddress?.trim()) {
      newErrors.deliveryAddress = t("checkout.validation.required_address", "Ünvan doldurulmalıdır");
    }

    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = t("checkout.validation.required_phone", "Telefon nömrəsi tələb olunur");
    } else if (formData.phoneNumber.length < 5) {
      newErrors.phoneNumber = t("checkout.validation.invalid_phone", "Keçərsiz telefon nömrəsi");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewData?.valid || cartItems.length === 0) return;
    if (!validateForm()) return;

    try {
      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const fullPhoneNumber = `${formData.phoneCode} ${formData.phoneNumber}`.trim();

      const orderRequest = {
        orderType: OrderType.READY_PRODUCT,
        country: formData.backendCountryEnum,
        cityName: formData.cityName || undefined,
        postalCode: formData.postalCode || undefined,
        deliveryAddress: formData.deliveryAddress,
        customerPhone: fullPhoneNumber,
        notes: formData.notes || undefined,
        currency: displayCurrency, 
        idempotencyKey,
        items: previewData.items.map((item: any) => ({
          productModelId: item.productModelId,
          productModelName: item.productModelName,
          leatherId: item.leatherId,
          leatherName: item.leatherName,
          quantity: item.quantity,
          unitPrice: item.currentUnitPrice,
          renderImageUrl: item.finalImageUrl || item.renderImageUrl
        }))
      };

      await createOrder(orderRequest);

    } catch (error: any) {
      console.error("Checkout failed:", error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f9]">
        <ShoppingBag className="w-16 h-16 text-[#d3c3c0] mb-6" />
        <h2 className="font-serif text-3xl text-[#271310] mb-4">
          {t("cart.empty", "Səbətiniz boşdur")}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="text-xs font-sans uppercase tracking-[0.2em] border-b border-[#271310] pb-1 text-[#271310] hover:text-[#6f5a52] transition-colors"
        >
          {t("cart.continue_shopping", "Alış-verişə davam et")}
        </button>
      </div>
    );
  }

  const finalTotal = (previewData?.totalAmount || 0);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] selection:bg-[#fadcd2] selection:text-[#271310] flex flex-col pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">

        {/* Left: Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="py-12">
          <div className="mb-12">
            <span className="text-[#6f5a52] font-sans uppercase tracking-[0.2em] text-[10px] mb-4 block">
              {t("checkout.secure", "Təhlükəsiz ödəniş")}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#271310] leading-none mb-4 tracking-tight">
              {t("checkout.title", "Sifariş")}
            </h1>
          </div>

          <AnimatePresence>
            {showCountryWarning && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-[#f2ebe9] border-l-2 border-[#271310] flex gap-3 items-start overflow-hidden"
              >
                <Info className="w-5 h-5 text-[#271310] flex-shrink-0 mt-0.5" />
                <p className="font-sans text-[11px] text-[#6f5a52] leading-relaxed">
                  {t("checkout.country_warning", "Seçdiyiniz ölkəyə əsasən vergilər və çatdırılma xərcləri dəyişə bilər. Yekun məbləğ hesablanacaq.")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleCheckout} className="space-y-10">

            {/* Country & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ÖLKƏ SEÇİMİ (Modern Dizayn) */}
              <div className="relative group">
                <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-2">
                  {t("checkout.country", "Ölkə")}
                </label>
                <div className="relative border-b border-[#d3c3c0] focus-within:border-[#271310] transition-colors">
                  <select
                    name="uiCountryCode"
                    value={formData.uiCountryCode}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 rounded-none py-3 pl-0 pr-10 text-[#271310] focus:ring-0 appearance-none font-sans cursor-pointer text-base"
                  >
                    {ALL_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {t(`countries.${c.name.toLowerCase().replace(/ /g, '_')}`, c.name)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5a52] pointer-events-none" />
                </div>
              </div>

              {/* ŞƏHƏR SEÇİMİ (Modern Dizayn) */}
              <div className="relative group">
                <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-2">
                  {t("checkout.city", "Şəhər")}
                </label>
                {formData.backendCountryEnum === Country.AZERBAIJAN ? (
                  <div className="relative border-b border-[#d3c3c0] focus-within:border-[#271310] transition-colors">
                    <select
                      name="cityName"
                      value={formData.cityName}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 rounded-none py-3 pl-0 pr-10 text-[#271310] focus:ring-0 appearance-none font-sans cursor-pointer text-base"
                    >
                      <option value="" disabled>{t("checkout.select_city", "Seçin")}</option>
                      {AZ_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5a52] pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    name="cityName"
                    value={formData.cityName}
                    onChange={handleInputChange}
                    placeholder={t("checkout.placeholders.city", "e.g. New York, Berlin")}
                    className={`w-full bg-transparent border-0 border-b ${errors.cityName ? 'border-red-500' : 'border-[#d3c3c0]'} rounded-none py-3 px-0 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 focus:border-[#271310] transition-colors font-sans text-base`}
                  />
                )}
                {errors.cityName && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.cityName}</span>}
              </div>
            </div>

            {/* Postal Code & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative group order-2 md:order-1">
                <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-2">
                  {t("checkout.postalCode", "Poçt indeksi")}
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder={formData.backendCountryEnum === Country.AZERBAIJAN ? "-" : t("checkout.placeholders.postalCode", "e.g. 10001")}
                  disabled={formData.backendCountryEnum === Country.AZERBAIJAN}
                  className={`w-full bg-transparent border-0 border-b ${errors.postalCode ? 'border-red-500' : 'border-[#d3c3c0]'} rounded-none py-3 px-0 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 focus:border-[#271310] transition-colors font-sans text-base disabled:opacity-30`}
                />
                {errors.postalCode && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.postalCode}</span>}
              </div>

              {/* 🔴 NÖMRƏ BÖLMƏSİ (Tam Yenilənmiş Lüks Görünüş) */}
              <div className="relative group order-1 md:order-2">
                <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-2">
                  {t("checkout.phone", "Telefon")}
                </label>
                
                {/* Vahid xətt daxilində Select və Input qruplaşdırılması */}
                <div className={`flex relative border-b ${errors.phoneNumber ? 'border-red-500' : 'border-[#d3c3c0]'} focus-within:border-[#271310] transition-colors`}>
                  
                  {/* Kod Seçimi Hissəsi */}
                  <div className="relative flex-shrink-0 w-[130px] md:w-[150px]">
                    <select
                      name="phoneCode"
                      value={formData.phoneCode}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 rounded-none py-3 pl-0 pr-8 text-[#271310] focus:ring-0 appearance-none font-sans text-base cursor-pointer"
                    >
                      {ALL_COUNTRIES.map(c => (
                        <option key={`phone-${c.code}`} value={c.phoneCode}>
                          {c.name} ({c.phoneCode})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f5a52] pointer-events-none" />
                  </div>

                  {/* Zərif Ayırıcı Xətt */}
                  <div className="w-[1px] h-6 bg-[#d3c3c0] self-center mx-2 opacity-50"></div>
                  
                  {/* Nömrə Inputu */}
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder={t("checkout.placeholders.phone", "50 123 45 67")}
                    className="flex-1 w-full bg-transparent border-0 rounded-none py-3 px-2 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 font-sans text-base"
                  />
                </div>
                {errors.phoneNumber && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.phoneNumber}</span>}
              </div>
            </div>

            {/* Address */}
            <div className="relative group">
              <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-2">
                {t("checkout.address", "Ünvan")}
              </label>
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                placeholder={t("checkout.placeholders.address", "Küçə, bina, mənzil")}
                className={`w-full bg-transparent border-0 border-b ${errors.deliveryAddress ? 'border-red-500' : 'border-[#d3c3c0]'} rounded-none py-3 px-0 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 focus:border-[#271310] transition-colors font-sans text-base`}
              />
              {errors.deliveryAddress && <span className="text-red-500 text-[10px] mt-1 block font-sans">{errors.deliveryAddress}</span>}
            </div>

            {/* Notes */}
            <div className="relative group">
              <label className="block text-[10px] font-sans uppercase tracking-widest text-[#6f5a52] mb-2">
                {t("checkout.notes", "Qeydlər")}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder={t("checkout.placeholders.notes", "Sifarişinizlə bağlı əlavə qeydlər...")}
                className="w-full bg-transparent border-0 border-b border-[#d3c3c0] rounded-none py-3 px-0 text-[#271310] placeholder:text-[#d3c3c0] focus:ring-0 focus:border-[#271310] transition-colors font-sans resize-none text-base"
              />
            </div>

            {/* Submit */}
            <div className="pt-12">
              <button
                type="submit"
                disabled={!previewData?.valid || creating}
                className="w-full bg-[#271310] text-white py-6 rounded-none font-sans font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#3e2723] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("checkout.submitting", "Göndərilir...")}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {t("checkout.submit", "Sifarişi təsdiqlə")}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right: Order Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:pl-16 lg:border-l border-[#d3c3c0]/30">
          <div className="sticky top-40 bg-white p-12 shadow-[0_20px_40px_rgba(39,19,16,0.03)] rounded-none">
            <h3 className="font-serif text-2xl text-[#271310] italic mb-8">
              {t("checkout.summary", "Sifariş xülasəsi")}
            </h3>

            {loading ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-20 bg-[#eeeeee]" />
                    <div className="flex-1 space-y-2 py-2">
                      <div className="h-3 w-2/3 bg-[#eeeeee]" />
                      <div className="h-3 w-1/3 bg-[#eeeeee]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {previewData?.items?.map((item: any, idx: number) => (
                  <CheckoutItem
                    key={idx}
                    item={item}
                    localSymbol={displaySymbol}
                  />
                ))}

                <div className="pt-8 border-t border-[#271310]">
                  <div className="flex justify-between text-sm mb-4">
                    <span className="font-sans text-[#6f5a52]">{t("checkout.subtotal", "Məbləğ")}</span>
                    <span className="font-sans text-[#271310]">
                      {displaySymbol} {(previewData?.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm mb-4">
                    <span className="font-sans text-[#6f5a52] flex items-center gap-2">
                      <Truck className="w-3 h-3" />
                      {t("checkout.shipping", "Çatdırılma")}
                    </span>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-green-600">
                      {t("checkout.free_shipping", "Pulsuz")}
                    </span>
                  </div>

                  <div className="flex justify-between items-end pt-6 border-t border-[#271310]">
                    <span className="font-sans font-black text-[10px] uppercase tracking-widest text-[#271310]">
                      {t("checkout.total", "Yekun")}
                    </span>
                    <span className="font-serif text-3xl text-[#271310]">
                      <span className="text-xl pr-1">{displaySymbol}</span>
                      {finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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