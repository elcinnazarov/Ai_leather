import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminProductService } from '../../../services/adminProductService';
import { AdminProductModelResponse, ProductModelFilter } from '../../../types/adminProduct';
import { Plus, Search, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminProductGallery() {
  const [products, setProducts] = useState<AdminProductModelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Paginasiya və Filter State
  const [filter, setFilter] = useState<ProductModelFilter>({ page: 0, size: 20 });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await adminProductService.getProducts(filter);
        // Backend ApiResponse wrapper istifadə edir: { success: true, data: { content: [...] } }
        // Əvvəlcə Axios-un və ya ApiResponse-un 'data' qatını tapırıq
        const apiRes = (response as any)?.data !== undefined ? (response as any).data : response;
        // Paginasiya obyektini (content sahəsi olan) çıxarırıq
        const payload = apiRes?.content ? apiRes : (apiRes?.data || apiRes);

        if (payload && Array.isArray(payload.content)) {
          setProducts(payload.content);
        }
      } catch (error) {
        console.error('Məhsulları yükləyərkən xəta:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Axtarış üçün qısa gecikmə (Debounce)
    const delay = setTimeout(fetchProducts, 300);
    return () => clearTimeout(delay);
  }, [filter]);

  // Status rənglərini təyin edən funksiya (Status Pili)
  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-300'; // İnaktivdirsə həmişə boz
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'DRAFT': return 'bg-yellow-400';
      case 'OUT_OF_STOCK': return 'bg-red-500';
      case 'ARCHIVED': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans">
      
      {/* Üst Başlıq və Yeni Yarat Düyməsi */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#111] tracking-wide">Kolleksiya</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-3">Mövcud modellərin idarəedilməsi</p>
        </div>
        
        {/* Yeni Məhsul Yaratma Səhifəsinə Yönləndirir */}
        <button 
          onClick={() => navigate('/admin/products/new')}
          className="bg-[#111] text-white px-8 py-4 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-3 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Yeni Model
        </button>
      </div>

      {/* Axtarış (Borderless - Alt xəttli Dizayn) */}
      <div className="mb-12 max-w-md relative group">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#111] transition-colors" />
        <input 
          type="text" 
          placeholder="Modelin adını axtar..."
          value={(filter as any).modelName || ''}
          onChange={(e) => setFilter((prev: ProductModelFilter) => ({ ...prev, modelName: e.target.value, page: 0 } as any))}
          className="w-full bg-transparent border-0 border-b border-gray-300 pl-10 pr-4 py-3 text-sm focus:ring-0 focus:border-[#111] transition-colors placeholder:text-gray-400 font-medium"
        />
      </div>

      {/* Lüks Qalereya (Grid) */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#111]" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-xl border border-gray-100">
          <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-sans text-sm">Hələ heç bir məhsul əlavə edilməyib.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product) => (
            <div 
              key={product.id} 
              onClick={() => navigate(`/admin/products/${product.id}`)}
              className="group cursor-pointer flex flex-col"
            >
              {/* Şəkil Konteyneri (Aspect 4:5 - Beynəlxalq Moda Standartı) */}
              <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm mb-5">
                {product.primaryImageUrl ? (
                  <img 
                    src={product.primaryImageUrl || (product as any).imageUrl} 
                    alt={product.modelname || (product as any).modelName} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-12 h-12 opacity-50" />
                  </div>
                )}
                
                {/* Status İndikatoru (Glassmorphism Kapsul) */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(product.availabilityStatus, product.isActive)}`}></span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-700">
                    {product.isActive ? product.availabilityStatus : 'GİZLİ'}
                  </span>
                </div>
              </div>

              {/* Məhsul Detalları */}
              <div className="px-1 flex flex-col items-center text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
                  {product.modelType}
                </span>
                <h3 className="text-lg font-serif text-[#111] font-medium group-hover:text-gray-600 transition-colors">
                  {product.modelname || (product as any).modelName}
                </h3>
                
                {/* Şəkil və Qiymət Sayı Statistikası (Məlumat üçün) */}
                <span className="mt-2 text-[10px] text-gray-400 font-medium flex items-center gap-2">
                  {product.imageCount} ŞƏKİL • {product.gradePriceCount} QİYMƏT
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}