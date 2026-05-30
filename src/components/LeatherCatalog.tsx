import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leatherService } from "../services/leatherService";
import { LeatherListResponse } from "../types/leather";
import { motion } from "motion/react";
import { useAITranslation } from "../hooks/useAITranslation";
import { useTranslation } from "react-i18next";

function LeatherCatalogItem({ leather, index, onClick }: any) {
  const dynName = useAITranslation(leather.name);
  const dynOrigin = useAITranslation(leather.origin);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      onClick={() => onClick(leather.id)}
      className="group cursor-pointer flex flex-col"
    >
      {/* Massive Swatch Image */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden mb-8 relative">
        <img 
          alt={dynName} 
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 filter grayscale contrast-125" 
          src={leather.imageUrl || `https://images.unsplash.com/photo-1606105961732-6332674f4ee6?auto=format&fit=crop&q=80&w=1200`}
          referrerPolicy="no-referrer"
        />
        {/* Number indicator */}
        <div className="absolute top-6 left-6 flex items-center justify-center bg-white px-4 py-2">
          <span className="font-serif text-lg text-black" style={{ fontFamily: "Noto Serif, serif" }}>
            No. 0{index + 1}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-start border-b border-gray-200 pb-6">
        <div>
          <h5 className="text-3xl lg:text-4xl font-serif text-black mb-2" style={{ fontFamily: "Noto Serif, serif" }}>
            {dynName}
          </h5>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-sans">
            Origin: {dynOrigin}
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="font-sans text-[10px] black uppercase tracking-[0.3em] bg-black text-white px-3 py-1.5">
            {leather.gradeType.replace('_', ' ')}
          </span>
          <span className="font-serif italic text-gray-400 mt-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: "Noto Serif, serif" }}>
            View Swatch
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function LeatherCatalog() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [leathers, setLeathers] = useState<LeatherListResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeGrade, setActiveGrade] = useState<"GRADE_I" | "GRADE_II">("GRADE_I");

  useEffect(() => {
    const fetchLeathers = async () => {
      try {
        setLoading(true);
        const response = await leatherService.getShopLeathers({ size: 50 });
        if (response && response.content && response.content.length > 0) {
          setLeathers(response.content);
        } else if (response && response.content) {
          setLeathers(response.content);
        } else {
          setLeathers([]);
        }
      } catch (error) {
        console.error("Failed to fetch leathers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeathers();
  }, []);

  const filteredLeathers = leathers.filter(l => l.gradeType === activeGrade);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="w-4 h-4 bg-black rounded-none"></div>
          <p className="text-black font-sans uppercase tracking-[0.3em] text-[10px]">{t("catalog.loading_materials", "Loading Materials...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black font-sans selection:bg-gray-200 selection:text-black min-h-screen">
      <main className="pt-32 px-6 lg:px-12 max-w-[1800px] mx-auto pb-40">
        {/* Massive Editorial Header */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-8 flex flex-col justify-center">
              <span className="text-gray-400 font-sans text-[10px] uppercase tracking-[0.4em] mb-6 block">{t("catalog.material_library", "Material Library")}</span>
              <h2 className="text-6xl md:text-[6rem] font-serif font-bold text-black leading-[0.95] tracking-tighter" style={{ fontFamily: "Noto Serif, serif" }}>
                {t("catalog.source", "Source")} <br />
                <span className="italic font-normal">{t("catalog.excellence", "Excellence.")}</span>
              </h2>
            </div>
            <div className="md:col-span-4 relative flex flex-col justify-end h-full">
              <p className="text-gray-600 leading-relaxed text-lg font-serif italic" style={{ fontFamily: "Noto Serif, serif" }}>
                "{t("catalog.hide_story", "Every hide tells a story of origin, tanning, and time. Select the foundation of your bespoke creation from our curated grades.")}"
              </p>
            </div>
          </div>
        </section>

        {/* Grade Selector Toggle (Understated line approach) */}
        <div className="flex border-b border-gray-200 mb-20 w-fit">
          <button 
            onClick={() => setActiveGrade("GRADE_I")}
            className={`pb-4 px-8 font-sans font-black text-[10px] uppercase tracking-[0.3em] transition-all border-b-2 ${activeGrade === "GRADE_I" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"}`}
          >
            {t("catalog.grade_1", "Grade I")}
          </button>
          <button 
            onClick={() => setActiveGrade("GRADE_II")}
            className={`pb-4 px-8 font-sans font-black text-[10px] uppercase tracking-[0.3em] transition-all border-b-2 ${activeGrade === "GRADE_II" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"}`}
          >
            {t("catalog.grade_2", "Grade II")}
          </button>
        </div>

        {/* Material Book - Huge Swatch layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {filteredLeathers.map((leather, index) => (
            <LeatherCatalogItem
              key={leather.id}
              leather={leather}
              index={index}
              onClick={(id: number) => navigate(`/materials/${id}`)}
            />
          ))}
        </div>

        {/* Technical Specs - Massive Editorial Block */}
        <section className="mt-40 bg-black text-white px-10 py-32 lg:p-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-16">
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-500">{t("catalog.methodology", "Methodology")}</span>
              <h3 className="text-5xl lg:text-7xl font-serif text-white leading-[0.95]" style={{ fontFamily: "Noto Serif, serif" }}>
                {t("catalog.heritage", "The Heritage")} <br />
                <span className="italic text-gray-400">{t("catalog.difference", "Difference.")}</span>
              </h3>
              <div className="space-y-12">
                <div className="flex gap-6 border-t border-gray-800 pt-8">
                  <div>
                    <h6 className="font-sans text-xs uppercase tracking-widest text-white mb-4">{t("catalog.sustainable_alchemy", "Sustainable Alchemy")}</h6>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm">{t("catalog.organic_desc", "We use only organic tanning agents: mimosa, chestnut, and quebracho. No harsh chemicals, just the chemistry of nature.")}</p>
                  </div>
                </div>
                <div className="flex gap-6 border-t border-gray-800 pt-8">
                  <div>
                    <h6 className="font-sans text-xs uppercase tracking-widest text-white mb-4">{t("catalog.tactile_integrity", "Tactile Integrity")}</h6>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm">{t("catalog.tactile_desc", "Minimal surface treatment allows the leather to breathe, ensuring it never cracks and only gains resilience.")}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-full min-h-[60vh] relative">
              <img 
                alt="Craftsmanship Process" 
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125" 
                src="https://images.unsplash.com/photo-1556196741-001490ce7875?auto=format&fit=crop&q=80&w=1200"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
