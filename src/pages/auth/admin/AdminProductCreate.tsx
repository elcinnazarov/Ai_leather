import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminProductService } from '../../../services/adminProductService';
import { CreateProductModelRequest, ProductCategory } from '../../../types/adminProduct';
import { ArrowLeft, UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminProductCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Məlumatları (DTO-ya 100% uyğun)
  const [formData, setFormData] = useState<CreateProductModelRequest>({
    modelName: '',
    modelType: 'BAG', // Default olaraq Çanta
    description: '',
    dimensions: ''
  });

  // Çoxlu Şəkil Yükləmə (Multiple Images) üçün State-lər
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Memory leak-in qarşısını almaq üçün şəkil linklərini təmizləyirik
  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  // Input dəyişiklikləri
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateProductModelRequest) => ({ ...prev, [name]: value }));
  };

  // Çoxlu Şəkil Seçimi
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Həm faylları, həm də vizual önizləmələri (previews) state-ə əlavə edirik
      setImageFiles((prev: File[]) => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev: string[]) => [...prev, ...newPreviews]);
    }
  };

  // Seçilmiş şəkli silmək
  const removeImage = (indexToRemove: number) => {
    setImageFiles((prev: File[]) => prev.filter((_, index) => index !== indexToRemove));
    setPreviewUrls((prev: string[]) => prev.filter((_, index) => index !== indexToRemove));
  };

  // FORMU GÖNDƏRMƏ (Backend-ə POST Sorğusu)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (imageFiles.length === 0) {
      setError('Zəhmət olmasa ən azı 1 şəkil yükləyin.');
      setLoading(false);
      return;
    }

    try {
      // adminProductService avtomatik olaraq form-data yaradıb göndərir
      const response = await adminProductService.createProduct(formData, imageFiles);
      const newProductId = (response as any)?.data?.id || response.id;

      // Uğurla yarandıqdan sonra dərhal həmin məhsulun "İdarəetmə Studiyasına" yönləndiririk
      navigate(`/admin/products/${newProductId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Məhsul yaradılarkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClass = "w-full bg-transparent border-0 border-b border-gray-300 py-3 text-sm focus:ring-0 focus:border-[#111] transition-colors placeholder:text-gray-400";
  const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1";

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans flex flex-col">
      
      {/* Üst Başlıq və Geri Düyməsi */}
      <div className="max-w-6xl mx-auto w-full flex items-center gap-6 mb-12">
        <button onClick={() => navigate('/admin/products')} className="p-2 text-gray-400 hover:text-[#111] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111] tracking-wide">Yeni Model Yarat</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Kolleksiyaya yeni sənət əsəri əlavə edin</p>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto w-full mb-6 p-4 bg-red-50 text-red-600 text-xs uppercase tracking-widest font-bold border border-red-100">
          {error}
        </div>
      )}

      {/* Əsas Forma (2 Sütunlu Layout) */}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-12 flex-1">
        
        {/* SOL SÜTUN: Məlumatlar (3 Sütun genişliyində) */}
        <div className="lg:col-span-3 space-y-10 bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>Modelin Adı</label>
              <input 
                required 
                type="text" 
                name="modelName" 
                value={formData.modelName} 
                onChange={handleChange} 
                placeholder="Məs: Classic Konyak Cüzdan"
                className={inputBaseClass} 
              />
            </div>

            <div>
              <label className={labelClass}>Kateqoriya</label>
              <select 
                name="modelType" 
                value={formData.modelType} 
                onChange={handleChange}
                className={`${inputBaseClass} cursor-pointer`}
              >
               <option value="BAG">Çanta (Bag)</option>
  <option value="BELT">Kəmər (Belt)</option>
  <option value="WALLET">Pulqabı (Wallet)</option>
  <option value="ACCESSORY">Aksessuar (Accessory)</option> {/* Value mütləq "ACCESSORY" olmalıdır */}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Ölçülər (Dimensions)</label>
            <input 
              type="text" 
              name="dimensions" 
              value={formData.dimensions} 
              onChange={handleChange} 
              placeholder="Məs: 20cm x 15cm x 5cm (İstəyə bağlı)"
              className={inputBaseClass} 
            />
          </div>

          <div>
            <label className={labelClass}>Təsvir Və Hekayə</label>
            <textarea 
              required
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={5}
              placeholder="Bu modelin dizayn hekayəsini və xüsusiyyətlərini yazın..."
              className={`${inputBaseClass} resize-none`}
            />
          </div>

        </div>

        {/* SAĞ SÜTUN: Qalereya / Şəkillər (2 Sütun genişliyində) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#111] uppercase tracking-widest">Modelin Şəkilləri</h3>
              <span className="text-[10px] text-gray-400 font-bold">{imageFiles.length} Şəkil Seçilib</span>
            </div>
            
            {/* Şəkil Qalereyası (Grid) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* Yeni Şəkil Əlavə Et (Upload Zone) */}
              <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-[#111] transition-colors flex flex-col items-center justify-center bg-gray-50 cursor-pointer group">
                <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#111] transition-colors mb-2" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-[#111]">Yüklə</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#111] text-white px-6 py-4 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-3 disabled:opacity-50 shadow-md"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Yaradılır...' : 'Modeli Yarat'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}