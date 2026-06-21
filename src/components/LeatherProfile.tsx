import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { leatherService } from "../services/leatherService";
import { LeatherDetailResponse } from "../types/leather";
import { motion, AnimatePresence } from "framer-motion"; // motion/react əvəzinə
import { ArrowLeft } from "lucide-react";
import { useAITranslation } from "../lib/hooks/useAITranslation";

function TranslatedText({ text, className }: { text: string; className?: string }) {
  const translatedText = useAITranslation(text);
  return <span className={className}>{translatedText}</span>;
}

export default function LeatherProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const catalogImage = location.state?.catalogImage;

  const [leather, setLeather] = useState<LeatherDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeatherDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await leatherService.getShopLeatherDetail(parseInt(id));
        setLeather(response);
      } catch (error) {
        console.error("Failed to fetch leather detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeatherDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="w-4 h-4 bg-black rounded-none"></div>
          <p className="text-black font-sans uppercase tracking-[0.3em] text-[10px]">Retrieving Material...</p>
        </div>
      </div>
    );
  }

  if (!leather) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white space-y-12">
        <h2 className="text-5xl font-serif text-black tracking-tight" style={{ fontFamily: "Noto Serif, serif" }}>Material not found.</h2>
        <button onClick={() => navigate("/materials")} className="text-black font-sans text-[10px] uppercase tracking-[0.3em] hover:opacity-50 transition-opacity">
          Return to Library
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white text-black font-sans selection:bg-gray-200 min-h-screen">
      {/* Navigation Layer overlay */}
      <div className="fixed top-0 left-0 w-full z-10 px-6 md:px-12 pt-8 pointer-events-none">
        <button 
          onClick={() => navigate("/materials")}
          className="pointer-events-auto flex items-center gap-4 text-white hover:text-gray-300 font-sans text-[10px] uppercase tracking-[0.3em] bg-black/40 backdrop-blur-md px-4 py-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Library
        </button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* HUGE Edge-to-Edge Image Section (Left, takes 60% width on desktop) */}
        <div className="lg:w-[60%] min-h-screen relative bg-black flex-shrink-0">
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.img 
                key={leather.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src={leather.textureUrl || catalogImage || `https://images.unsplash.com/photo-1606105961732-6332674f4ee6?auto=format&fit=crop&q=80&w=1600`}
                alt={`${leather.name} texture`} 
         
                className="absolute inset-0 w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Detail Section (Right layout with massive whitespace) */}
        <div className="lg:w-[40%] py-32 px-10 md:px-16 lg:px-24 flex flex-col justify-center bg-white">
          <div className="space-y-24 max-w-xl">
            
            <div className="space-y-6">
              <span className="block font-sans text-[10px] tracking-[0.4em] uppercase text-gray-400">
                E1000 Reference Archive
              </span>
              <h1 className="text-5xl md:text-[5rem] font-serif text-black leading-[1.05] tracking-tighter" style={{ fontFamily: "Noto Serif, serif" }}>
                <TranslatedText text={leather.name} />
              </h1>
            </div>

            <div className="space-y-6 border-t border-gray-200 mt-12 py-12">
              <div className="flex justify-between items-baseline py-4 border-b border-gray-100">
                <span className="text-gray-500 font-sans tracking-widest uppercase text-[10px]">Origin</span>
                <TranslatedText text={leather.origin} className="text-black font-serif italic text-xl" />
              </div>
              <div className="flex justify-between items-baseline py-4 border-b border-gray-100">
                <span className="text-gray-500 font-sans tracking-widest uppercase text-[10px]">Grade</span>
                {/* DÜZƏLİŞ: Backend-dən grade boş gələrsə çökməsin deyə təhlükəsizlik əlavə edildi */}
                <span className="text-black font-sans font-black text-sm uppercase tracking-[0.2em]">
                  {leather.grade?.name ? leather.grade.name.replace('_', ' ') : ''}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-4 border-b border-gray-100">
                <span className="text-gray-500 font-sans tracking-widest uppercase text-[10px]">Finish</span>
                <span className="text-black font-serif italic text-xl" style={{ fontFamily: "Noto Serif, serif" }}>Aniline</span>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="font-sans text-[10px] uppercase font-black tracking-[0.3em] text-black">
                The Anatomy of the Hide
              </h3>
              <p className="font-serif italic text-black opacity-80 text-xl leading-relaxed" style={{ fontFamily: "Noto Serif, serif" }}>
                "<TranslatedText text={leather.description} />"
              </p>
            </div>

            <div className="pt-16">
              <button 
                onClick={() => navigate("/")}
                className="w-full border border-black text-black px-8 py-8 font-sans text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-300"
              >
                View Handcrafted Products
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}