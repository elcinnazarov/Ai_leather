import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { leatherGradeService } from "../services/leatherGradeService";
import { LeatherGradeDetailResponse } from "../types/leatherGrade";
import { motion } from "motion/react";

export default function LeatherGradeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gradeDetail, setGradeDetail] = useState<LeatherGradeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradeDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await leatherGradeService.getGradeDetail(parseInt(id));
        setGradeDetail(response);
      } catch (error) {
        console.error("Failed to fetch grade detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGradeDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f9f9f9]">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="w-4 h-4 bg-[#271310] rounded-full"></div>
          <p className="text-[#271310] font-sans uppercase tracking-[0.3em] text-[10px] opacity-50">Retrieving Standard...</p>
        </div>
      </div>
    );
  }

  if (!gradeDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f9f9f9] space-y-12">
        <h2 className="text-5xl font-serif text-[#271310] tracking-tight">Standard not found.</h2>
        <button onClick={() => navigate("/grades")} className="text-[#271310] font-sans text-[10px] uppercase tracking-[0.3em] hover:opacity-50 transition-opacity">
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans selection:bg-[#fadcd2] selection:text-[#271310] min-h-screen pb-32">
      
      {/* Hero Section: Full Width Grade Image */}
      <section className="relative w-full h-[530px] overflow-hidden">
        <img 
          alt={`${gradeDetail.gradeType} leather hide`} 
          className="w-full h-full object-cover" 
          src="https://images.unsplash.com/photo-1606105961732-6332674f4ee6?auto=format&fit=crop&q=80&w=1920"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#271310]/40 to-transparent"></div>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Grade Header & Narrative */}
        <article className="-mt-16 relative z-10">
          <div className="bg-white p-8 md:p-12 lg:w-2/3 shadow-[0_20px_40px_rgba(39,19,16,0.06)]">
            <span className="text-[#6f5a52] font-sans uppercase tracking-[0.2em] text-xs mb-4 block">Premium Selection</span>
            <h2 className="font-serif text-5xl md:text-7xl text-[#271310] leading-none mb-6">{gradeDetail.gradeType} Grade</h2>
            <p className="text-[#504442] text-lg leading-relaxed max-w-2xl font-light">
              {gradeDetail.description}
            </p>
          </div>
        </article>

        {/* Technical Specifications: Bento-style Asymmetric Grid */}
        <section className="mt-24">
          <h3 className="font-serif text-3xl text-[#271310] mb-12">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Spec 1 */}
            <div className="bg-[#f3f3f3] p-8 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#271310] text-sm uppercase tracking-widest mb-2">Thickness Range</h4>
              </div>
              <p className="font-serif text-3xl text-[#6f5a52] italic">1.8 - 2.2 mm</p>
            </div>
            
            {/* Spec 2 */}
            <div className="bg-[#271310] text-white p-8 rounded-xl md:row-span-2 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white/60 text-sm uppercase tracking-widest mb-2">Tanning Method</h4>
                <p className="text-2xl font-serif mt-6">Traditional Vegetable Oak Bark Tanning</p>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mt-4">
                A 12-month immersion process using sustainable bark extracts, ensuring structural integrity and a natural fragrance.
              </p>
            </div>
            
            {/* Spec 3 */}
            <div className="bg-[#e8e8e8] p-8 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#271310] text-sm uppercase tracking-widest mb-2">Durability</h4>
              </div>
              <p className="font-serif text-3xl text-[#6f5a52] italic">Exemplary</p>
            </div>
            
            {/* Spec 4 */}
            <div className="bg-[#6f5a52]/10 p-8 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#6f5a52] text-sm uppercase tracking-widest mb-2">Grain Type</h4>
              </div>
              <p className="font-serif text-3xl text-[#271310] italic">Full Grain</p>
            </div>
            
            {/* Spec 5 */}
            <div className="bg-[#f3f3f3] p-8 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#271310] text-sm uppercase tracking-widest mb-2">Finish</h4>
              </div>
              <p className="font-serif text-3xl text-[#6f5a52] italic">Aniline Wax</p>
            </div>
          </div>
        </section>

        {/* Available Materials Grid */}
        <section className="mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h3 className="font-serif text-3xl text-[#271310] mb-2">Available Materials in this Grade</h3>
              <p className="text-[#504442]">Each swatch represents a unique finish and color within the {gradeDetail.gradeType} family.</p>
            </div>
            <button 
              onClick={() => navigate("/materials")}
              className="text-[#271310] font-bold text-sm border-b-2 border-[#271310]/20 hover:border-[#271310] transition-all pb-1 uppercase tracking-tighter"
            >
              View Full Catalog
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {gradeDetail.leathers.map((leather, index) => (
              <motion.div 
                key={leather.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/materials/${leather.id}`)}
              >
                <div className="aspect-square bg-white rounded-full overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow relative">
                  <img 
                    alt={`${leather.name} leather swatch`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    src={leather.textureUrl || `https://images.unsplash.com/photo-1606105961732-6332674f4ee6?auto=format&fit=crop&q=80&w=400`}
                    referrerPolicy="no-referrer"
                  />
                  {index === 2 && ( // Just adding a "Limited" badge to one for visual interest
                    <div className="absolute top-2 right-2 bg-[#360700] text-white text-[8px] px-2 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">
                      Limited
                    </div>
                  )}
                </div>
                <p className="text-center font-bold text-[#271310] text-xs uppercase tracking-widest">{leather.name}</p>
                <p className="text-center text-[#6f5a52] text-[10px] italic mt-1">{leather.origin}</p>
              </motion.div>
            ))}
            
            {/* "More Tones" placeholder */}
            <div className="group cursor-pointer" onClick={() => navigate("/materials")}>
              <div className="aspect-square bg-white rounded-full overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center border border-dashed border-[#d3c3c0]">
                <span className="text-[#6f5a52] text-2xl">+</span>
              </div>
              <p className="text-center font-bold text-[#6f5a52] text-xs uppercase tracking-widest">More Tones</p>
            </div>
          </div>
        </section>

        {/* Craftsmanship Badge Inset */}
        <section className="mt-32 text-center">
          <div className="inline-flex flex-col items-center p-12 bg-[#eeeeee] rounded-3xl border border-[#d3c3c0]/30">
            <div className="w-16 h-16 rounded-full bg-[#360700] flex items-center justify-center mb-6 shadow-xl">
              <span className="text-white text-2xl">⚗️</span>
            </div>
            <h4 className="font-serif text-2xl text-[#271310] mb-2">Master Saddler Approved</h4>
            <p className="text-[#504442] max-w-sm mx-auto">This grade is exclusively reserved for bespoke footwear and high-integrity luggage construction.</p>
          </div>
        </section>

      </main>
    </div>
  );
}
