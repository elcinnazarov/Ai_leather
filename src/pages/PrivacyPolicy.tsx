import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#271310] selection:bg-[#271310] selection:text-[#FAF9F6]">
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-24 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-sans font-black uppercase text-[10px] tracking-[0.4em] text-[#6f5a52] mb-6 block"
        >
          {t("brand.name")}
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="font-serif text-4xl md:text-6xl font-medium tracking-tight leading-tight mb-8"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          {t("privacyPolicy.title")}
        </motion.h1>
          
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.4 }}
          className="w-16 h-[1px] bg-[#271310] mx-auto mb-10"
        />
          
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          className="font-serif text-xl italic text-[#6f5a52] leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          "{t("privacyPolicy.subtitle")}"
        </motion.p>
      </section>

      {/* Policy Details */}
      <section className="py-12 pb-32 px-6 lg:px-12 max-w-3xl mx-auto space-y-14">
        
        <div className="space-y-4">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-[0.25em] text-[#6f5a52]">
            {t("privacyPolicy.sec1Title")}
          </h2>
          <p className="font-sans text-sm md:text-base text-[#271310] leading-relaxed font-light">
            {t("privacyPolicy.sec1Text")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-[0.25em] text-[#6f5a52]">
            {t("privacyPolicy.sec2Title")}
          </h2>
          <p className="font-sans text-sm md:text-base text-[#271310] leading-relaxed font-light">
            {t("privacyPolicy.sec2Text")}
          </p>
        </div>

        <div className="space-y-4 p-8 border border-[#e5e5e5] bg-white">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-[0.25em] text-[#6f5a52]">
            {t("privacyPolicy.sec3Title")}
          </h2>
          <p className="font-sans text-sm md:text-base text-[#271310] leading-relaxed font-light mb-4">
            {t("privacyPolicy.sec3Text")}
          </p>
          <div className="space-y-3 text-sm text-[#504442] font-sans">
            <p>
              • {t("privacyPolicy.sec3Card")}
            </p>
            <p>
              • {t("privacyPolicy.sec3Secure")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-sans font-bold uppercase text-[12px] tracking-[0.25em] text-[#6f5a52]">
            {t("privacyPolicy.sec4Title")}
          </h2>
          <div className="space-y-1 font-sans text-sm text-[#5e5e5d]">
            <p>• Email: <a href="mailto:e1000leatherhandmade@mail.ru" className="text-[#271310] underline">e1000leatherhandmade@mail.ru</a></p>
            <p>• {t("contactPage.phoneWhatsapp")}: +994 77 735 13 13 / +994 55 664 49 21</p>
            <p>• {t("contactPage.atelierAddress")}: {t("contactPage.city")}</p>
          </div>
        </div>

      </section>
    </div>
  );
}