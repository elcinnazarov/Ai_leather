import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#271310] selection:bg-[#271310] selection:text-[#FAF9F6]">
      {/* Header Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 lg:px-12 max-w-4xl mx-auto text-center">
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
          {t("about.title")}
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
          "{t("about.subtitle")}"
        </motion.p>
      </section>

      {/* Story Content */}
      <section className="py-20 px-6 lg:px-12 max-w-3xl mx-auto space-y-16 md:space-y-24">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16"
        >
          <h2 className="font-sans font-bold uppercase text-[11px] tracking-[0.3em] text-[#6f5a52] pt-2">The Genesis</h2>
          <p className="font-sans text-sm md:text-base text-[#271310] leading-loose font-light tracking-wide">
            {t("about.origins")}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16"
        >
          <h2 className="font-sans font-bold uppercase text-[11px] tracking-[0.3em] text-[#6f5a52] pt-2">The Philosophy</h2>
          <p className="font-sans text-sm md:text-base text-[#271310] leading-loose font-light tracking-wide">
            {t("about.philosophy")}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16"
        >
          <h2 className="font-sans font-bold uppercase text-[11px] tracking-[0.3em] text-[#6f5a52] pt-2">The Individual</h2>
          <p className="font-sans text-sm md:text-base text-[#271310] leading-loose font-light tracking-wide">
            {t("about.customer")}
          </p>
        </motion.div>

      </section>

      {/* Center Quote */}
      <section className="py-32 px-6 lg:px-12 bg-[#271310] text-[#FAF9F6] text-center my-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="font-serif text-3xl md:text-5xl italic font-light leading-snug" style={{ fontFamily: "'Noto Serif', serif" }}>
            "{t("about.quote")}"
          </h3>
        </motion.div>
      </section>

      {/* Vision Section */}
      <section className="py-20 pb-40 px-6 lg:px-12 max-w-3xl mx-auto text-center">
          <p className="font-sans text-sm md:text-base text-[#6f5a52] leading-loose font-light tracking-wide">
            {t("about.vision")}
          </p>
          <div className="mt-16">
            <a 
              href="/materials" 
              className="inline-block border-b border-[#271310] pb-2 font-sans font-bold uppercase text-xs tracking-[0.3em] hover:text-[#6f5a52] hover:border-[#6f5a52] transition-colors"
            >
              {t("orders.explore_btn")}
            </a>
          </div>
      </section>

    </div>
  );
}
