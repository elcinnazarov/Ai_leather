import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { XCircle, RefreshCcw, Home } from "lucide-react";

export default function PaymentFailed() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // 🛡️ Birbaşa giriş qoruması:
  // Əgər kimsə URL-i əllə brauzerə yazıbsa, dərhal Ana Səhifəyə at
  useEffect(() => {
    const hasPaymentParam = location.search && location.search.length > 1;
    if (!hasPaymentParam) {
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#271310] flex items-center justify-center px-6 py-24 selection:bg-[#271310] selection:text-[#FAF9F6]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full bg-white border border-[#e5e5e5] p-8 md:p-12 text-center shadow-sm"
      >
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 stroke-[1.5]" />
        </div>

        <p className="font-sans font-bold uppercase text-[10px] tracking-[0.3em] text-[#6f5a52] mb-3">
          {t("brand.name")}
        </p>

        <h1 
          className="font-serif text-3xl md:text-4xl text-[#271310] font-medium tracking-tight mb-4"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          {t("paymentResult.failedTitle")}
        </h1>

        <div className="w-12 h-[1px] bg-[#271310] mx-auto mb-6" />

        <p className="font-sans text-sm text-[#504442] font-light leading-relaxed mb-8">
          {t("paymentResult.failedDesc")}
        </p>

        <div className="space-y-3">
          <Link
            to="/profile/orders"
            className="w-full bg-[#271310] hover:bg-[#1a0d0b] text-white py-4 px-6 font-sans text-[11px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>{t("paymentResult.tryAgain")}</span>
          </Link>

          <Link
            to="/"
            className="w-full border border-[#271310] text-[#271310] hover:bg-[#271310]/5 py-4 px-6 font-sans text-[11px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{t("paymentResult.toHome")}</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}