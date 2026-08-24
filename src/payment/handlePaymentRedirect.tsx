import React, { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { paymentService } from "../services/paymentService"
import { useTranslation } from "react-i18next";

export default function CheckoutPaymentButton({ orderId }: { orderId: number }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useTranslation();

  const handlePaymentRedirect = async () => {
    if (!orderId) return;
    
    try {
      setIsProcessing(true);
      
      // 1. Sənin Spring Boot Backend-inə sorğu atırıq
      const checkoutData = await paymentService.initiateCheckout(orderId);

      // 2. Backend-dən Payriff-in ödəniş linki (paymentUrl) gəlirsə...
      if (checkoutData && checkoutData.paymentUrl) {
        
        // 3. ƏSAS MƏNTİQ: İstifadəçini birbaşa Payriff-in ekranına atırıq!
        window.location.href = checkoutData.paymentUrl;
        
      } else {
        alert(t("checkout.payment_error", "Ödəniş linki yaradıla bilmədi. Zəhmət olmasa təkrar cəhd edin."));
        setIsProcessing(false);
      }

    } catch (error) {
      console.error("Ödənişə yönləndirmə xətası:", error);
      alert(t("checkout.system_error", "Sistem xətası baş verdi."));
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      <button
        onClick={handlePaymentRedirect}
        disabled={isProcessing}
        className="w-full md:w-auto px-16 py-4 bg-[#271310] text-white font-sans text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#3d1f1a] transition-colors disabled:opacity-70"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("checkout.redirecting", "Təhlükəsiz Ödənişə Yönləndirilir...")}
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            {t("checkout.pay_now", "Sifarişi Təsdiqlə və Ödə")}
          </>
        )}
      </button>

      <p className="mt-4 text-[10px] font-sans text-[#6f5a52] flex items-center gap-1 uppercase tracking-widest">
        Powered by <span className="font-bold text-[#271310]">Payriff</span>
      </p>
    </div>
  );
}