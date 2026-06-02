import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminProductService } from '../../../services/adminProductService';
import { AdminProductModelResponse, ProductModelFilter } from '../../../types/adminProduct';

import { Search, Plus, Loader2, Filter, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductGallery() {
  const [products, setProducts] = useState<AdminProductModelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  // ARTIQ "as any" YOXDUR! Çünki interfeysi DTO-ya uyğunlaşdırdıq
  const [filter, setFilter] = useState<ProductModelFilter>({
    page: 0,
    size: 12, 
    modelname: undefined,
    availabilityStatus: undefined,
    modelType: undefined,
  });

  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Zəncir 1: Service bizə təmiz PageResponse qaytarır
      const pageData = await adminProductService.getProducts(filter);
      
      console.log("COMPONENT LAYER: Service-dən gələn təmiz data:", pageData);

      if (!pageData || !pageData.content) {
         setProducts([]);
         setTotalPages(0);
         return;
      }

      // Backend-dən gələn adın düzgünlüyünü sığortalayırıq
      const normalizedData = pageData.content.map((item: any) => ({
        ...item,
        modelname: item.modelname || item.modelName || 'Adsız Model', 
        primaryImageUrl: item.primaryImageUrl || item.imageUrl || null
      }));

      setProducts(normalizedData as AdminProductModelResponse[]);
      setTotalPages(pageData.totalPages || 0);

    } catch (error) {
      console.error("Məhsullar yüklənərkən xəta:", error);
      toast.error("Məhsulları yükləmək mümkün olmadı.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // TS XƏTASI YOXDUR: Çünki filterin içindəkiləri destructure edirik
  const { page, modelname, availabilityStatus, modelType } = filter;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  // Yalnız lazımi filter dəyərlərini izləyirik
  }, [page, modelname, availabilityStatus, modelType]);

  const handleFilterChange = (key: keyof ProductModelFilter, value: any) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
      page: 0 
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans">
      
      {/* Üst Başlıq */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111] tracking-wide">Məhsul Qalereyası</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Bütün modellərin vizual idarəedilməsi</p>
        </div>
        
        <button 
          onClick={() => navigate('/admin/products/new')}
          className="bg-[#111] text-white px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Yeni Model
        </button>
      </div>

      {/* Filtrlər */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-end">
        <div className="w-full md:w-1/3 relative">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Model Adı</label>
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Axtarış..."
              value={filter.modelname || ''}
              onChange={(e) => handleFilterChange('modelname', e.target.value)}
              className="w-full bg-transparent border-0 border-b border-gray-300 pl-8 pr-4 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none"
            />
          </div>
        </div>

        <div className="w-full md:w-1/4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Kategoriya</label>
          <select 
            value={filter.modelType || ''}
            onChange={(e) => handleFilterChange('modelType', e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors cursor-pointer outline-none"
          >
            <option value="">Bütün Növlər</option>
            <option value="BAG">Çanta (Bag)</option>
            <option value="WALLET">Pulqabı (Wallet)</option>
            <option value="BELT">Kəmər (Belt)</option>
            <option value="ACCESSORY">Aksesuar</option>
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status</label>
          <select 
            value={filter.availabilityStatus || ''}
            onChange={(e) => handleFilterChange('availabilityStatus', e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors cursor-pointer outline-none"
          >
            <option value="">Bütün Statuslar</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="DRAFT">Qaralama</option>
            <option value="ARCHIVED">Arxiv</option>
          </select>
        </div>
      </div>

      {/* Məhsullar Grid-i */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#111]" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center py-24">
          <Filter className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-gray-500 font-sans text-sm">Heç bir model tapılmadı.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/admin/products/${product.id}`)}
                className="group cursor-pointer flex flex-col bg-transparent"
              >
                <div className="w-full aspect-square bg-white border border-gray-100 rounded-xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-all duration-300">
                  {product.primaryImageUrl ? (
                    <img 
                      src={product.primaryImageUrl} 
                      alt={product.modelname} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Şəkil yoxdur</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-widest border border-white px-4 py-2 rounded-full">
                      İdarə Et
                    </span>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm ${
                      product.availabilityStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      product.availabilityStatus === 'DRAFT' ? 'bg-gray-200 text-gray-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {product.availabilityStatus || 'DRAFT'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 px-1">
                  <h3 className="text-[#111] font-bold text-sm truncate">{product.modelname}</h3> 
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">{product.modelType || 'BİLİNMİR'}</p>
                    <p className="text-gray-400 text-[10px]">{product.dimensions || ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between">
              <button 
                onClick={() => handleFilterChange('page', Math.max(0, (filter.page || 0) - 1))}
                disabled={(filter.page || 0) === 0}
                className="text-xs font-bold uppercase tracking-widest text-gray-500 disabled:opacity-30 hover:text-[#111]"
              >
                Əvvəlki
              </button>
              <span className="text-xs font-bold text-gray-400">
                Səhifə {(filter.page || 0) + 1} / {totalPages}
              </span>
              <button 
                onClick={() => handleFilterChange('page', Math.min(totalPages - 1, (filter.page || 0) + 1))}
                disabled={(filter.page || 0) === totalPages - 1}
                className="text-xs font-bold uppercase tracking-widest text-gray-500 disabled:opacity-30 hover:text-[#111]"
              >
                Sonrakı
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}