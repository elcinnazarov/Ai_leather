import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { leatherService } from "../services/leatherService";
import { LeatherDetailResponse } from "../types/leather";
import { useAITranslation } from "../hooks/useAITranslation";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";

export default function LeatherDetails() {
  // Əgər sənin URL strukturun App.tsx-də <Route path="/materials/:id" .../> dursa, 
  // URL-dən gələn parametrin adının 'id' olduğuna əmin ol.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [leather, setLeather] = useState<LeatherDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Ağıllı Tərcümə (Biznes məntiqin qorunur)
  const dynName = useAITranslation(leather?.name || "");
  const dynOrigin = useAITranslation(leather?.origin || "");
  const dynDesc = useAITranslation(leather?.description || "");

  useEffect(() => {
    if (id) {
      leatherService.getShopLeatherDetail(Number(id))
        .then(data => {
          if(data) {
            setLeather(data);
          } else {
            setError(true);
          }
        })
        .catch(err => {
          console.error("Material detalları çəkilə bilmədi:", err);
          setError(true);
        })
        .finally(() => setLoading(false));
    } else {
      setError(true);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-4 h-4 bg-black animate-pulse"></div>
      </div>
    );
  }

  // Əgər API məlumat tapmasa qəza (crash) olmasın deyə istifadəçiyə səliqəli səhv göstəririk
  if (error || !leather) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <p className="font-serif text-2xl text-black mb-4">Material tapılmadı.</p>
        <button onClick={() => navigate(-1)} className="text-[10px] uppercase font-bold tracking-widest border-b border-black">
          Geri Qayıt
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white text-black font-sans min-h-screen pt-32 pb-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Navigasiya */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-[10px] font-bold uppercase tracking-[0.3em] mb-12"
        >
          <ChevronLeft className="w-4 h-4" /> {t("common.back", "Back to Catalog")}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
          {/* Sol: Tekstura Şəkli - Grayscale filtr silindi! */}
          <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
            <img 
              src={leather.textureUrl || "https://images.unsplash.com/photo-1606105961732-6332674f4ee6?auto=format&fit=crop&q=80"} 
              alt={dynName} 
              className="w-full h-full object-cover"
            />
            {leather.grade?.name && (
              <div className="absolute bottom-6 left-6 bg-white px-4 py-2 shadow-sm">
                 <span className="font-sans text-[10px] uppercase font-bold tracking-[0.3em]">{leather.grade.name}</span>
              </div>
            )}
          </div>

          {/* Sağ: Detallar */}
          <div className="flex flex-col justify-center">
            <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-400 mb-6 block">
              {t("catalog.origin", "Origin")}: {dynOrigin}
            </span>
            <h1 className="text-5xl lg:text-7xl font-serif text-black mb-8 leading-[0.95] tracking-tighter" style={{ fontFamily: "Noto Serif, serif" }}>
              {dynName}
            </h1>
            
            <p className="text-gray-600 leading-relaxed font-serif text-lg italic mb-12" style={{ fontFamily: "Noto Serif, serif" }}>
              {dynDesc}
            </p>

            {/* Dərəcə Məlumatı (Backend DTO: GradeInfo). Əgər gəlməzsə çökməsin deyə (?.name) şərti qoyulub */}
            {leather.grade && (
              <div className="border-t border-gray-200 pt-8 mt-auto">
                <h4 className="font-sans text-[10px] uppercase font-bold tracking-[0.3em] text-black mb-4">
                  {t("catalog.grade_info", "Grade Specifications")}
                </h4>
                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                  {leather.grade.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bu dəridən istifadə edilən məhsullar (Backend DTO: usedInProducts) */}
        {leather.usedInProducts && leather.usedInProducts.length > 0 && (
          <section className="border-t border-gray-200 pt-24">
            <h3 className="text-3xl font-serif text-black mb-12 text-center" style={{ fontFamily: "Noto Serif, serif" }}>
              {t("catalog.crafted_with", "Crafted with this Material")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {leather.usedInProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="group cursor-pointer text-center"
                >
                  <div className="aspect-[4/5] bg-gray-50 overflow-hidden mb-6">
                    <img 
                      src={product.primaryImageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h5 className="font-serif text-xl text-black">{product.name}</h5>
                  <span className="text-[10px] uppercase text-gray-400 tracking-[0.2em]">{product.modelType}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}