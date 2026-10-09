import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

export default function Contact() {
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
          className="font-serif text-5xl md:text-7xl font-medium tracking-tight leading-tight mb-8"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          {t("contactPage.title")}
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
          className="font-serif text-xl md:text-2xl italic text-[#6f5a52] leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: "'Noto Serif', serif" }}
        >
          "{t("contactPage.subtitle")}"
        </motion.p>
      </section>

      {/* Grid */}
      <section className="py-12 pb-32 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Telefon & WhatsApp */}
          <div className="p-8 md:p-10 border border-[#e5e5e5] bg-white space-y-4">
            <h3 className="font-sans font-bold uppercase text-[11px] tracking-[0.3em] text-[#6f5a52]">
              {t("contactPage.phoneWhatsapp")}
            </h3>
            <div className="space-y-2">
              <a 
                href="tel:+994777351313" 
                className="block font-serif text-2xl text-[#271310] hover:text-[#6f5a52] transition-colors"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                +994 77 735 13 13
              </a>
              <a 
                href="tel:+994556644921" 
                className="block font-serif text-2xl text-[#271310] hover:text-[#6f5a52] transition-colors"
                style={{ fontFamily: "'Noto Serif', serif" }}
              >
                +994 55 664 49 21
              </a>
            </div>
            <p className="text-xs font-sans text-[#5e5e5d] leading-relaxed pt-2">
              {t("contactPage.hours")}
            </p>
            <div className="pt-2">
              <a 
                href="https://api.whatsapp.com/send/?phone=994777351313" 
                target="_blank" 
                rel="noreferrer"
                className="inline-block border-b border-[#271310] pb-1 font-sans font-bold uppercase text-[11px] tracking-[0.2em] text-[#271310] hover:text-[#6f5a52] hover:border-[#6f5a52] transition-colors"
              >
                {t("contactPage.writeWhatsapp")}
              </a>
            </div>
          </div>

          {/* Rəsmi Email */}
          <div className="p-8 md:p-10 border border-[#e5e5e5] bg-white space-y-4">
            <h3 className="font-sans font-bold uppercase text-[11px] tracking-[0.3em] text-[#6f5a52]">
              {t("contactPage.officialEmail")}
            </h3>
            <a 
              href="mailto:e1000leatherhandmade@mail.ru" 
              className="block font-serif text-xl md:text-2xl text-[#271310] hover:text-[#6f5a52] transition-colors break-all"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              e1000leatherhandmade@mail.ru
            </a>
            <p className="text-xs font-sans text-[#5e5e5d] leading-relaxed pt-2">
              {t("contactPage.emailDesc")}
            </p>
          </div>

          {/* Ünvan */}
          <div className="p-8 md:p-10 border border-[#e5e5e5] bg-white space-y-4">
            <h3 className="font-sans font-bold uppercase text-[11px] tracking-[0.3em] text-[#6f5a52]">
              {t("contactPage.atelierAddress")}
            </h3>
            <p 
              className="font-serif text-2xl text-[#271310]"
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              {t("contactPage.city")}
            </p>
            <p className="text-xs font-sans text-[#5e5e5d] leading-relaxed pt-2">
              {t("contactPage.addressDesc")}
            </p>
          </div>

          {/* Sosial Şəbəkələr */}
          <div className="p-8 md:p-10 border border-[#e5e5e5] bg-white space-y-4">
            <h3 className="font-sans font-bold uppercase text-[11px] tracking-[0.3em] text-[#6f5a52]">
              {t("contactPage.socialChannels")}
            </h3>
            <div className="space-y-2 pt-2 text-sm font-sans">
              <div>
                <a href="https://www.instagram.com/e1000_atelier_baku" target="_blank" rel="noreferrer" className="text-[#271310] hover:text-[#6f5a52] transition-colors">
                  Instagram: <span className="font-medium">@e1000_atelier_baku</span>
                </a>
              </div>
              <div>
                <a href="https://www.tiktok.com/@e1000atelier" target="_blank" rel="noreferrer" className="text-[#271310] hover:text-[#6f5a52] transition-colors">
                  TikTok: <span className="font-medium">@e1000atelier</span>
                </a>
              </div>
              <div>
                <a href="https://www.youtube.com/@E1000atelier" target="_blank" rel="noreferrer" className="text-[#271310] hover:text-[#6f5a52] transition-colors">
                  YouTube: <span className="font-medium">@E1000atelier</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}