import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leatherGradeService } from "../services/leatherGradeService";
import { GradeListResponse } from "../types/leatherGrade";
import { motion } from "motion/react";
import { useAITranslation } from "../hooks/useAITranslation";
import { useTranslation } from "react-i18next";

function TranslatedText({ text, className }: { text: string; className?: string }) {
  const translatedText = useAITranslation(text);
  return <span className={className}>{translatedText}</span>;
}

export default function LeatherGradeCatalog() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [grades, setGrades] = useState<GradeListResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const response = await leatherGradeService.getAllGrades();
        if (response && response.length > 0) {
          setGrades(response);
        } else {
          setGrades([]);
        }
      } catch (error) {
        console.error("Failed to fetch grades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f9f9f9]">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="w-4 h-4 bg-[#271310] rounded-full"></div>
          <p className="text-[#271310] font-sans uppercase tracking-[0.3em] text-[10px] opacity-50">Loading Standards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans selection:bg-[#fadcd2] selection:text-[#271310] min-h-screen pb-32">
      <main className="pt-24 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#271310] tracking-tight leading-tight mb-6">
              {t('grades.title')}
            </h2>
            <p className="text-lg md:text-xl text-[#6f5a52] leading-relaxed font-sans max-w-2xl">
              {t('grades.description')}
            </p>
          </div>
        </section>

        {/* Grade Directory: Bento-style Asymmetric Layout */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Grade I: Heritage (Large Feature) */}
          {grades[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-8 group cursor-pointer"
              onClick={() => navigate(`/grades/${grades[0].id}`)}
            >
              <div className="bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(39,19,16,0.06)] flex flex-col md:flex-row">
                <div className="md:w-3/5 h-80 md:h-auto relative overflow-hidden">
                  <img 
                    alt="Heritage Leather Close-up" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src="https://images.unsplash.com/photo-1606105961732-6332674f4ee6?auto=format&fit=crop&q=80&w=1200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-[#360700]/10 backdrop-blur-md px-4 py-1 rounded-full">
                    <span className="text-[#360700] text-xs font-bold tracking-widest uppercase">Signature</span>
                  </div>
                </div>
                <div className="md:w-2/5 p-8 flex flex-col justify-center bg-[#f3f3f3]">
                  <span className="text-[#6f5a52] font-sans text-xs tracking-widest uppercase mb-2">{t('grades.standard_selection')}</span>
                  <h3 className="text-3xl font-serif font-bold text-[#271310] mb-4">{t('grades.grade_prefix')} I: <TranslatedText text={grades[0].gradeType} /></h3>
                  <p className="text-[#504442] font-sans text-sm leading-relaxed mb-6">
                    <TranslatedText text={grades[0].description} />
                  </p>
                  <div className="flex items-center gap-2 text-[#271310] font-semibold text-sm group-hover:underline">
                    <span>{t('grades.explore_grade')}</span>
                    <span className="text-sm">↗</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grade II: Premium (Vertical Tall) */}
          {grades[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-4 group cursor-pointer h-full"
              onClick={() => navigate(`/grades/${grades[1].id}`)}
            >
              <div className="bg-white rounded-xl p-8 h-full flex flex-col border border-[#d3c3c0]/30 hover:shadow-[0_20px_40px_rgba(39,19,16,0.06)] transition-all duration-300">
                <div className="mb-8 overflow-hidden rounded-lg bg-[#eeeeee] h-48 flex items-center justify-center">
                  <img 
                    alt="Premium Leather" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[#6f5a52] font-sans text-xs tracking-widest uppercase mb-2">{t('grades.refined_selection')}</span>
                <h3 className="text-2xl font-serif font-bold text-[#271310] mb-4">{t('grades.grade_prefix')} II: <TranslatedText text={grades[1].gradeType} /></h3>
                <p className="text-[#504442] font-sans text-sm leading-relaxed mb-8 flex-grow">
                  <TranslatedText text={grades[1].description} />
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fadcd2] flex items-center justify-center">
                    <span className="text-[#766057]">✓</span>
                  </div>
                  <span className="text-xs font-sans text-[#6f5a52] uppercase tracking-tighter">{t('grades.certified_grade_a')}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grade III: Studio (Horizontal Small) */}
          {grades[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-6 group cursor-pointer"
              onClick={() => navigate(`/grades/${grades[2].id}`)}
            >
              <div className="bg-[#e8e8e8] rounded-xl p-8 flex gap-6 items-center transition-all duration-300 hover:bg-[#e2e2e2]">
                <div className="hidden sm:block w-24 h-24 flex-shrink-0 bg-[#f9f9f9] rounded-full overflow-hidden border-4 border-white">
                  <img 
                    alt="Studio Leather" 
                    className="w-full h-full object-cover" 
                    src="https://images.unsplash.com/photo-1599643478524-fb5244f96f81?auto=format&fit=crop&q=80&w=400"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#271310] mb-2">{t('grades.grade_prefix')} III: <TranslatedText text={grades[2].gradeType} /></h3>
                  <p className="text-[#504442] font-sans text-sm leading-relaxed">
                    <TranslatedText text={grades[2].description} />
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grade IV: Technical (Horizontal Small) */}
          {grades[3] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-6 group cursor-pointer"
              onClick={() => navigate(`/grades/${grades[3].id}`)}
            >
              <div className="bg-[#271310] text-white rounded-xl p-8 flex gap-6 items-center transition-all duration-300 hover:bg-[#3e2723]">
                <div className="flex-grow">
                  <h3 className="text-xl font-serif font-bold mb-2">{t('grades.grade_prefix')} IV: <TranslatedText text={grades[3].gradeType} /></h3>
                  <p className="text-white/70 font-sans text-sm leading-relaxed">
                    <TranslatedText text={grades[3].description} />
                  </p>
                </div>
                <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                  <span>🛡️</span>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Informational Footer within Content */}
        <section className="mt-24 border-t border-[#d3c3c0]/50 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h4 className="font-serif font-bold text-[#271310] mb-4 italic">{t('grades.process_title')}</h4>
              <p className="text-sm text-[#6f5a52] font-sans leading-relaxed">
                {t('grades.process_desc')}
              </p>
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#271310] mb-4 italic">{t('grades.ethics_title')}</h4>
              <p className="text-sm text-[#6f5a52] font-sans leading-relaxed">
                {t('grades.ethics_desc')}
              </p>
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#271310] mb-4 italic">{t('grades.care_title')}</h4>
              <p className="text-sm text-[#6f5a52] font-sans leading-relaxed">
                {t('grades.care_desc')}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
