import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { paymentService } from "../services/paymentService";

interface CheckoutPaymentButtonProps {
  orderId: number;
  className?: string;
}

export default function CheckoutPaymentButton({
  orderId,
  className = "",
}: CheckoutPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handlePayment = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const checkoutData = await paymentService.initiateCheckout(orderId);

      if (checkoutData && checkoutData.paymentUrl) {
        window.location.href = checkoutData.paymentUrl;
      } else {
        toast.error(
          t("checkout.payment_error", "Ödəniş linki alına bilmədi. Zəhmət olmasa yenidən cəhd edin.")
        );
      }
    } catch (error) {
      console.error("Payment redirect error:", error);
      toast.error(
        t("checkout.payment_error", "Ödənişə yönləndirilərkən xəta baş verdi")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className={`w-full bg-[#271310] hover:bg-[#1a0d0b] text-white py-5 px-6 font-sans text-[11px] font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#271310]/15 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>{t("checkout.redirecting", "YÖNLƏNDİRİLİR...")}</span>
        </>
      ) : (
        <>
          <Lock className="w-3.5 h-3.5 opacity-80 shrink-0" />
          {/* ✅ Birbaşa sizin qeyd etdiyiniz açar istifadə olunur */}
          <span className="text-center leading-relaxed">
            {t("checkout.submit_and_pay", "SİFARİŞİ TƏSDİQLƏ VƏ ÖDƏ")}
          </span>
        </>
      )}
    </button>
  );
}