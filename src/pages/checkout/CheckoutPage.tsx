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
import {
  Loader2,
  ShoppingBag,
  Check,
  Truck,
  Info,
  ChevronDown,
  MapPin,
  Phone,
  CreditCard,
  AlertCircle,
  Package
} from "lucide-react";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { ALL_COUNTRIES } from "../../constants/countries";

// ============================================
// AZƏRBAYCAN ŞƏHƏRLƏRİ
// ============================================
const AZ_CITIES = [
  "Bakı", "Sumqayıt", "Gəncə", "Xırdalan", "Mingəçevir", "Şirvan", "Naxçıvan",
  "Lənkəran", "Şəki", "Quba", "Qəbələ", "Şamaxı", "Zaqatala", "Masallı",
  "Cəlilabad", "Göyçay", "Bərdə", "Şəmkir", "Qusar", "Xaçmaz", "Ağdam",
  "Füzuli", "Şuşa", "Xankəndi", "Laçın", "Kəlbəcər", "Zəngilan", "Qubadlı"
];

// ============================================
// CHECKOUT ITEM KOMPONENTİ
// ============================================
function CheckoutItem({ item, localSymbol }: { item: any; localSymbol: string }) {
  const dynModelName = useAITranslation(item.productModelName);
  const dynLeatherName = useAITranslation(item.leatherName);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-5 items-start group"
    >
      <div className="relative w-24 h-32 bg-[#f5f3f1] rounded-sm overflow-hidden flex-shrink-0 ring-1 ring-[#e8e0dd]">
        <img
          src={item.finalImageUrl || item.renderImageUrl || "https://via.placeholder.com/150"}
          alt={dynModelName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <h4 className="font-sans text-xs uppercase tracking-[0.12em] text-[#271310] mb-1 truncate">
          {dynModelName}
        </h4>
        <p className="font-serif text-sm text-[#8b7a72] italic mb-4">
          {dynLeatherName}
        </p>
        <div className="flex justify-between items-baseline border-b border-dashed border-[#d8cfcb] pb-2">
          <span className="font-sans text-[11px] text-[#8b7a72] uppercase tracking-wider">
            qty {item.quantity}
          </span>
          <span className="font-sans text-sm font-semibold text-[#271310] tabular-nums">
            {localSymbol} {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// SKELETON LOADER
// ============================================
function CheckoutSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-5 animate-pulse">
          <div className="w-24 h-32 bg-[#ede8e5] rounded-sm flex-shrink-0" />
          <div className="flex-1 space-y-3 py-2">
            <div className="h-3 w-1/2 bg-[#ede8e5] rounded" />
            <div className="h-3 w-1/3 bg-[#ede8e5] rounded" />
            <div className="h-3 w-2/3 bg-[#ede8e5] rounded mt-4" />
          </div>
        </div>
      ))}
      <div className="pt-6 border-t border-[#e8e0dd] space-y-3">
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-[#ede8e5] rounded" />
          <div className="h-3 w-24 bg-[#ede8e5] rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-[#ede8e5] rounded" />
          <div className="h-3 w-16 bg-[#ede8e5] rounded" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// ƏSAS CHECKOUT KOMPONENTİ
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  const activeCurrency = useMemo(() => {
    return getCurrencyForCountry(formData.backendCountryEnum as any);
  }, [formData.backendCountryEnum]);

  const displayCurrency = previewData?.currency || activeCurrency;
  const displaySymbol = useMemo(() => getCurrencySymbol(displayCurrency), [displayCurrency]);

  // Cart preview fetch
  useEffect(() => {
    if (cartItems.length === 0) return;

    const fetchPreview = async () => {
      try {
        setLoading(true);
        const response = await cartService.previewCart({
          items: cartItems.map((item) => ({
            productModelId: item.productModelId,
            leatherId: item.leatherId,
            quantity: item.quantity,
            seenPrice: item.seenPrice,
            customRenderUrl: item.customRenderUrl
          })),
          currency: activeCurrency
        });
        setPreviewData(response);
      } catch (error) {
        console.error("Failed to load checkout preview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [cartItems, activeCurrency]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "uiCountryCode") {
        const selectedCountryData = ALL_COUNTRIES.find((c) => c.code === value);

        if (selectedCountryData) {
          newData.backendCountryEnum = selectedCountryData.enum;
          newData.phoneCode = selectedCountryData.phoneCode;

          if (selectedCountryData.enum === Country.AZERBAIJAN) {
            newData.postalCode = "";
          }

          setShowCountryWarning(true);
          setTimeout(() => setShowCountryWarning(false), 8000);
        }
      }

      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.cityName?.trim()) {
      newErrors.cityName = t("checkout.validation.required_city", "Şəhər seçilməlidir");
    }

    if (
      formData.backendCountryEnum !== Country.AZERBAIJAN &&
      !formData.postalCode?.trim()
    ) {
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

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#faf9f8] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#f0ebe8] flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-[#a89890]" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-3xl text-[#271310] mb-3">
            {t("cart.empty", "Səbətiniz boşdur")}
          </h2>
          <p className="font-sans text-sm text-[#8b7a72] mb-8 max-w-xs mx-auto leading-relaxed">
            {t("cart.empty_description", "Sifariş vermək üçün əvvəlcə səbətinizə məhsul əlavə edin")}
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-[#271310] border-b border-[#271310] pb-1 hover:text-[#5a3d35] hover:border-[#5a3d35] transition-colors"
          >
            <Package className="w-3 h-3" />
            {t("cart.continue_shopping", "Alış-verişə davam et")}
          </button>
        </motion.div>
      </div>
    );
  }

  const finalTotal = previewData?.totalAmount || 0;

  return (
    <div className="min-h-screen bg-[#faf9f8] text-[#1a1c1c] selection:bg-[#fadcd2] selection:text-[#271310]">
      {/* Header Section */}
      <div className="bg-[#271310] text-white pt-32 pb-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#c4b5ad] font-sans uppercase tracking-[0.25em] text-[10px] mb-3 block">
              {t("checkout.secure", "Təhlükəsiz ödəniş")}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight">
              {t("checkout.title", "Sifariş")}
            </h1>
            <div className="mt-6 flex items-center gap-2 text-[#c4b5ad]">
              <CreditCard className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-sans text-[11px] uppercase tracking-wider">
                SSL {t("checkout.protected", "qorumalı")}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Form (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <AnimatePresence>
              {showCountryWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 bg-[#f5f0ed] border-l-3 border-[#271310] rounded-r-sm flex gap-4 items-start">
                    <Info className="w-5 h-5 text-[#271310] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="font-sans text-[12px] text-[#5a4a42] leading-relaxed">
                      {t(
                        "checkout.country_warning",
                        "Seçdiyiniz ölkəyə əsasən vergilər və çatdırılma xərcləri dəyişə bilər. Yekun məbləğ hesablanacaq."
                      )}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleCheckout} className="space-y-10" noValidate>
              {/* Country & City */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-4 h-4 text-[#8b7a72]" strokeWidth={1.5} />
                  <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#8b7a72] font-medium">
                    {t("checkout.delivery_info", "Çatdırılma məlumatları")}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                  {/* Country */}
                  <div className="relative">
                    <label className="block text-[10px] font-sans uppercase tracking-[0.15em] text-[#8b7a72] mb-2">
                      {t("checkout.country", "Ölkə")} *
                    </label>
                    <div className="relative">
                      <select
                        name="uiCountryCode"
                        value={formData.uiCountryCode}
                        onChange={handleInputChange}
                        className="w-full appearance-none bg-white border border-[#e0d8d4] rounded-md py-3.5 pl-4 pr-12 text-[13px] text-[#271310] focus:outline-none focus:ring-2 focus:ring-[#271310]/10 focus:border-[#271310] transition-all cursor-pointer font-sans"
                      >
                        {ALL_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {t(`countries.${c.name.toLowerCase().replace(/ /g, "_")}`, c.name)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b7a72] pointer-events-none" />
                    </div>
                  </div>

                  {/* City */}
                  <div className="relative">
                    <label className="block text-[10px] font-sans uppercase tracking-[0.15em] text-[#8b7a72] mb-2">
                      {t("checkout.city", "Şəhər")} *
                    </label>
                    {formData.backendCountryEnum === Country.AZERBAIJAN ? (
                      <div className="relative">
                        <select
                          name="cityName"
                          value={formData.cityName}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur("cityName")}
                          className={`w-full appearance-none bg-white border rounded-md py-3.5 pl-4 pr-12 text-[13px] text-[#271310] focus:outline-none focus:ring-2 focus:ring-[#271310]/10 focus:border-[#271310] transition-all cursor-pointer font-sans ${
                            errors.cityName && touched.cityName ? "border-red-400" : "border-[#e0d8d4]"
                          }`}
                        >
                          <option value="" disabled>
                            {t("checkout.select_city", "Seçin")}
                          </option>
                          {AZ_CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b7a72] pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="cityName"
                        value={formData.cityName}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("cityName")}
                        placeholder={t("checkout.placeholders.city", "Məsələn: Berlin")}
                        className={`w-full bg-white border rounded-md py-3.5 px-4 text-[13px] text-[#271310] placeholder:text-[#c4bbb5] focus:outline-none focus:ring-2 focus:ring-[#271310]/10 focus:border-[#271310] transition-all font-sans ${
                          errors.cityName && touched.cityName ? "border-red-400" : "border-[#e0d8d4]"
                        }`}
                      />
                    )}
                    <AnimatePresence>
                      {errors.cityName && touched.cityName && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-red-500 text-[11px] mt-1.5 block font-sans flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.cityName}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>

              {/* Postal & Phone */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                  {/* Postal Code */}
                  <div className="relative">
                    <label className="block text-[10px] font-sans uppercase tracking-[0.15em] text-[#8b7a72] mb-2">
                      {t("checkout.postalCode", "Poçt indeksi")}{" "}
                      {formData.backendCountryEnum !== Country.AZERBAIJAN && "*"}
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("postalCode")}
                      placeholder={
                        formData.backendCountryEnum === Country.AZERBAIJAN
                          ? "-"
                          : t("checkout.placeholders.postalCode", "Məsələn: 10001")
                      }
                      disabled={formData.backendCountryEnum === Country.AZERBAIJAN}
                      className={`w-full bg-white border rounded-md py-3.5 px-4 text-[13px] text-[#271310] placeholder:text-[#c4bbb5] focus:outline-none focus:ring-2 focus:ring-[#271310]/10 focus:border-[#271310] transition-all font-sans disabled:bg-[#f5f3f1] disabled:text-[#a89890] ${
                        errors.postalCode && touched.postalCode ? "border-red-400" : "border-[#e0d8d4]"
                      }`}
                    />
                    <AnimatePresence>
                      {errors.postalCode && touched.postalCode && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-red-500 text-[11px] mt-1.5 block font-sans flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.postalCode}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <label className="block text-[10px] font-sans uppercase tracking-[0.15em] text-[#8b7a72] mb-2">
                      {t("checkout.phone", "Telefon")} *
                    </label>
                    <div
                      className={`flex items-stretch bg-white border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#271310]/10 focus-within:border-[#271310] transition-all ${
                        errors.phoneNumber && touched.phoneNumber ? "border-red-400" : "border-[#e0d8d4]"
                      }`}
                    >
                      <div className="relative flex-shrink-0 w-[140px] border-r border-[#e8e0dd]">
                        <select
                          name="phoneCode"
                          value={formData.phoneCode}
                          onChange={handleInputChange}
                          className="w-full h-full appearance-none bg-transparent py-3.5 pl-4 pr-8 text-[12px] text-[#271310] focus:outline-none cursor-pointer font-sans"
                        >
                          {ALL_COUNTRIES.map((c) => (
                            <option key={`phone-${c.code}`} value={c.phoneCode}>
                              {c.code} {c.phoneCode}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8b7a72] pointer-events-none" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("phoneNumber")}
                        placeholder={t("checkout.placeholders.phone", "50 123 45 67")}
                        className="flex-1 min-w-0 bg-transparent py-3.5 px-4 text-[13px] text-[#271310] placeholder:text-[#c4bbb5] focus:outline-none font-sans"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.phoneNumber && touched.phoneNumber && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-red-500 text-[11px] mt-1.5 block font-sans flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {errors.phoneNumber}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>

              {/* Address */}
              <section>
                <label className="block text-[10px] font-sans uppercase tracking-[0.15em] text-[#8b7a72] mb-2">
                  {t("checkout.address", "Ünvan")} *
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("deliveryAddress")}
                  placeholder={t("checkout.placeholders.address", "Küçə, bina, mənzil")}
                  className={`w-full bg-white border rounded-md py-3.5 px-4 text-[13px] text-[#271310] placeholder:text-[#c4bbb5] focus:outline-none focus:ring-2 focus:ring-[#271310]/10 focus:border-[#271310] transition-all font-sans ${
                    errors.deliveryAddress && touched.deliveryAddress ? "border-red-400" : "border-[#e0d8d4]"
                  }`}
                />
                <AnimatePresence>
                  {errors.deliveryAddress && touched.deliveryAddress && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-red-500 text-[11px] mt-1.5 block font-sans flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.deliveryAddress}
                    </motion.span>
                  )}
                </AnimatePresence>
              </section>

              {/* Notes */}
              <section>
                <label className="block text-[10px] font-sans uppercase tracking-[0.15em] text-[#8b7a72] mb-2">
                  {t("checkout.notes", "Qeydlər")}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t("checkout.placeholders.notes", "Sifarişinizlə bağlı əlavə qeydlər...")}
                  className="w-full bg-white border border-[#e0d8d4] rounded-md py-3.5 px-4 text-[13px] text-[#271310] placeholder:text-[#c4bbb5] focus:outline-none focus:ring-2 focus:ring-[#271310]/10 focus:border-[#271310] transition-all font-sans resize-none"
                />
              </section>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!previewData?.valid || creating}
                  className="w-full bg-[#271310] text-white py-5 rounded-md font-sans font-bold text-[11px] uppercase tracking-[0.25em] hover:bg-[#3e2723] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-3 shadow-lg shadow-[#271310]/20"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("checkout.submitting", "Göndərilir...")}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                      {t("checkout.submit", "Sifarişi təsdiqlə")}
                    </>
                  )}
                </button>
                <p className="text-center mt-4 font-sans text-[10px] text-[#a89890] uppercase tracking-wider">
                  {t("checkout.encrypted", "Bütün məlumatlar şifrələnir")}
                </p>
              </div>
            </form>
          </motion.div>

          {/* Right: Order Summary (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-5"
          >
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-xl shadow-sm shadow-[#271310]/[0.03] border border-[#e8e0dd] overflow-hidden">
                <div className="p-8 lg:p-10">
                  <h3 className="font-serif text-xl text-[#271310] italic mb-8 flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#8b7a72]" strokeWidth={1.5} />
                    {t("checkout.summary", "Sifariş xülasəsi")}
                  </h3>

                  {loading ? (
                    <CheckoutSkeleton />
                  ) : (
                    <div className="space-y-8">
                      <AnimatePresence mode="popLayout">
                        {previewData?.items?.map((item: any, idx: number) => (
                          <CheckoutItem
                            key={`${item.productModelId}-${item.leatherId}-${idx}`}
                            item={item}
                            localSymbol={displaySymbol}
                          />
                        ))}
                      </AnimatePresence>

                      <div className="pt-8 border-t border-[#e8e0dd] space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-sans text-[#8b7a72]">
                            {t("checkout.subtotal", "Məbləğ")}
                          </span>
                          <span className="font-sans text-[#271310] tabular-nums">
                            {displaySymbol}{" "}
                            {(previewData?.totalAmount || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2
                            })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="font-sans text-[#8b7a72] flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {t("checkout.shipping", "Çatdırılma")}
                          </span>
                          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            {t("checkout.free_shipping", "Pulsuz")}
                          </span>
                        </div>

                        <div className="flex justify-between items-end pt-6 border-t-2 border-[#271310]">
                          <span className="font-sans font-bold text-[11px] uppercase tracking-[0.2em] text-[#271310]">
                            {t("checkout.total", "Yekun")}
                          </span>
                          <span className="font-serif text-3xl text-[#271310] tabular-nums">
                            <span className="text-lg font-sans font-medium pr-1">{displaySymbol}</span>
                            {finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust badges */}
                <div className="bg-[#faf9f8] px-8 lg:px-10 py-5 border-t border-[#e8e0dd]">
                  <div className="flex items-center justify-center gap-6 text-[#a89890]">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="text-[10px] font-sans uppercase tracking-wider">
                        {t("checkout.fast_delivery", "Sürətli çatdırılma")}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-[#d8cfcb]" />
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="text-[10px] font-sans uppercase tracking-wider">
                        {t("checkout.quality_guarantee", "Keyfiyyət zəmanəti")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}