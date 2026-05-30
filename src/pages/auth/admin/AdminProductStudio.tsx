import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminProductService } from '../../../services/adminProductService';
import { AdminProductModelResponse, AvailabilityStatus, AdminCalculatedPriceResponse } from '../../../types/adminProduct';
import { ArrowLeft, Star, Trash2, UploadCloud, Loader2, Image as ImageIcon, Check } from 'lucide-react';

export default function AdminProductStudio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<AdminProductModelResponse | null>(null);
  // Beynəlxalq dinamik qiymətlər üçün state
  const [calculatedPrices, setCalculatedPrices] = useState<AdminCalculatedPriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'INFO' | 'MEDIA' | 'PRICING'>('INFO');
  
  // Tab 1 (Info) üçün state
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ modelName: '', modelType: 'BAG', description: '', dimensions: '' });

  // Məhsulu və hesablanmış qiymətləri yükləmək
  const fetchProduct = async () => {
    try {
      // Məhsul məlumatlarını gətiririk
      const response = await adminProductService.getProductById(Number(id));
      const productData = (response as any)?.data || response;

      if (productData) {
        setProduct(productData);
        setInfoForm({
          modelName: productData.modelName || productData.modelname || '',
          modelType: productData.modelType || 'BAG',
          description: productData.description || '',
          dimensions: productData.dimensions || ''
        });
      }

      // Eyni zamanda hesablanmış qiymətləri (calculated-prices) gətiririk
      const priceRes = await adminProductService.getCalculatedPrices(Number(id));
      setCalculatedPrices((priceRes as any)?.data || priceRes);
    } catch (error) {
      console.error("Məlumatlar yüklənərkən xəta yarandı", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  // ==========================================
  // MİKRO-YENİLƏNMƏ (MICRO-UPDATES) MƏNTİQİ
  // ==========================================

  // 1. Status Dəyişdir (Yekun Doğru Forma - Enum Keçid Qaydalarına Uyğun)
  const toggleStatus = async () => {
    if (!product) return;
    
    let nextStatus: AvailabilityStatus = 'ACTIVE';
    
    if (product.availabilityStatus === 'ACTIVE') {
      nextStatus = 'OUT_OF_STOCK'; 
    } else if (product.availabilityStatus === 'DRAFT' || product.availabilityStatus === 'OUT_OF_STOCK') {
      nextStatus = 'ACTIVE';
    } else if (product.availabilityStatus === 'ARCHIVED') {
      nextStatus = 'ACTIVE';
    }

    try {
      await adminProductService.updateProductStatus(product.id, nextStatus);
      fetchProduct();
    } catch (err) {
      console.error("Status dəyişmədi", err);
    }
  };

  // 2. Əsas Məlumatları Yenilə (Tab 1)
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setIsUpdatingInfo(true);
    try {
      await adminProductService.updateProduct(product.id, {
        modelName: infoForm.modelName,
        modelType: infoForm.modelType as any,
        description: infoForm.description,
        dimensions: infoForm.dimensions
      });
      fetchProduct();
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  // 3. Şəkil Yüklə (Tab 2)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product || !e.target.files?.length) return;
    try {
      await adminProductService.addImages(product.id, Array.from(e.target.files));
      fetchProduct();
    } catch (err) {
      console.error("Şəkil yüklənə bilmədi", err);
    }
  };

  // 4. Şəkil Sil & Əsas Şəkil Seç (Tab 2)
  const handleDeleteImage = async (imageId: number) => {
    if(window.confirm("Bu şəkli silmək istədiyinizə əminsiniz?")) {
      await adminProductService.deleteImage(imageId);
      fetchProduct();
    }
  };

  const handleMakePrimary = async (imageId: number) => {
    if (!product) return;
    await adminProductService.setPrimaryImage(product.id, imageId);
    fetchProduct();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]"><Loader2 className="w-8 h-8 animate-spin text-[#111]" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">Məhsul tapılmadı.</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans pb-20">
      
      {/* ÜST NAVİQASİYA */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/products')} className="text-gray-400 hover:text-[#111] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-serif font-bold text-[#111]">{product.modelname || product.modelname}</h1>
        </div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          ID: {product.id} • {product.modelType}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* SOL TƏRƏF (VİZUAL LÖVBƏR VƏ STATUS) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden relative">
              {product.primaryImageUrl ? (
                <img src={product.primaryImageUrl} alt="Primary" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-xs">Əsas şəkil yoxdur</span>
                </div>
              )}
            </div>
            
            {/* iOS Tərzi Status Toggle Switch (YENİLƏNDİ) */}
            <div className="mt-6 flex items-center justify-between px-2 pb-2">
              <div>
                <p className="text-sm font-bold text-[#111]">Vitrində Görünmə</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                  Cari: {product.availabilityStatus}
                </p>
              </div>
              <button 
                onClick={toggleStatus}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${product.availabilityStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${product.availabilityStatus === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* SAĞ TƏRƏF (DİNAMİK TABLAR) */}
        <div className="lg:col-span-8">
          
          {/* TAB MENYUSU */}
          <div className="flex border-b border-gray-200 mb-8 gap-8">
            {['INFO', 'MEDIA', 'PRICING'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === tab ? 'text-[#111]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab === 'INFO' ? 'Əsas Məlumatlar' : tab === 'MEDIA' ? 'Qalereya' : 'Qiymət Mühərriki'}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#111]" />}
              </button>
            ))}
          </div>

          {/* TAB 1: ƏSAS MƏLUMATLAR */}
          {activeTab === 'INFO' && (
            <form onSubmit={handleUpdateInfo} className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-100 space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Modelin Adı</label>
                  <input required type="text" value={infoForm.modelName} onChange={(e) => setInfoForm({...infoForm, modelName: e.target.value})} className="w-full bg-transparent border-0 border-b border-gray-300 py-3 text-sm focus:ring-0 focus:border-[#111] transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Kateqoriya</label>
                  <select value={infoForm.modelType} onChange={(e) => setInfoForm({...infoForm, modelType: e.target.value})} className="w-full bg-transparent border-0 border-b border-gray-300 py-3 text-sm focus:ring-0 focus:border-[#111] transition-colors cursor-pointer">
                    <option value="BAG">Çanta</option>
                    <option value="WALLET">Cüzdan</option>
                    <option value="BELT">Kəmər</option>
                    <option value="ACCESSORY">Aksessuar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Ölçülər</label>
                <input type="text" value={infoForm.dimensions} onChange={(e) => setInfoForm({...infoForm, dimensions: e.target.value})} className="w-full bg-transparent border-0 border-b border-gray-300 py-3 text-sm focus:ring-0 focus:border-[#111] transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Təsvir</label>
                <textarea rows={4} value={infoForm.description} onChange={(e) => setInfoForm({...infoForm, description: e.target.value})} className="w-full bg-transparent border-0 border-b border-gray-300 py-3 text-sm focus:ring-0 focus:border-[#111] transition-colors resize-none" />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isUpdatingInfo} className="bg-[#111] text-white px-8 py-4 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black flex items-center gap-2">
                  {isUpdatingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Məlumatları Yenilə
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MEDIA */}
          {activeTab === 'MEDIA' && (
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-bold text-[#111] uppercase tracking-widest">Məhsul Şəkilləri ({product.images?.length || 0})</h3>
                <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#111] px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Yeni Yüklə
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {product.images?.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-gray-50">
                    <img src={img.imageUrl} alt="Product Media" className="w-full h-full object-cover" />
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-md">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      {!img.isPrimary && (
                        <button onClick={() => handleMakePrimary(img.id)} title="Əsas şəkil et" className="p-2 bg-white text-[#111] rounded-full hover:scale-110 transition-transform">
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDeleteImage(img.id)} title="Sil" className="p-2 bg-white text-red-500 rounded-full hover:scale-110 transition-transform">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRICING ENGINE */}
          {activeTab === 'PRICING' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              
              {/* 1. SEKTOR: BAZA QİYMƏTLƏR (AZN) */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-sm font-bold text-[#111] uppercase tracking-widest">1. Baza Qiymətlər (AZN)</h3>
                  <p className="text-xs text-gray-400 mt-1">Hər bir material dərəcəsinə (Grade) görə məhsulun zavod çıxış qiyməti.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                        <th className="py-4 px-4">Grade (Material)</th>
                        <th className="py-4 px-4">Qiymət (AZN)</th>
                        <th className="py-4 px-4 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {product.gradePrices && product.gradePrices.length > 0 ? (
                        product.gradePrices.map((gp) => (
                          <tr key={gp.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-4 font-medium text-[#111]">{gp.gradeType || `Grade ${gp.gradeId}`}</td>
                            <td className="py-4 px-4 font-mono font-bold text-[#111]">{gp.price.toFixed(2)} AZN</td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                onClick={async () => {
                                  const newPrice = prompt("Yeni AZN qiymətini daxil edin:", gp.price.toString());
                                  if (newPrice && !isNaN(Number(newPrice))) {
                                    try {
                                      await adminProductService.updateProductPrice(product.id, gp.gradeId, { price: Number(newPrice) });
                                      fetchProduct(); 
                                    } catch (err) {
                                      console.error("Qiymət yenilənərkən xəta:", err);
                                    }
                                  }
                                }}
                                className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider transition-colors"
                              >
                                Redaktə
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-gray-400 text-xs uppercase tracking-wider">
                            Bu model üçün hələ qiymət təyin edilməyib.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. SEKTOR: BEYNƏLXALQ DİNAMİK QİYMƏTLƏR */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-sm font-bold text-[#111] uppercase tracking-widest">2. Beynəlxalq Qiymətlər və İstisnalar</h3>
                  <p className="text-xs text-gray-400 mt-1">Sistem tərəfindən dinamik hesablanmış (Calculated Engine) və ya manual təyin edilmiş qiymətlər.</p>
                </div>

                <div className="space-y-6">
                  {['USD', 'EUR'].map((currency) => {
                    // Mövcud gradePrices-dən manual qiymət override olub-olmadığını yoxlayırıq
                    const firstGrade = product.gradePrices?.[0];
                    const manualPriceValue = currency === 'USD' ? firstGrade?.manualUsd : firstGrade?.manualEur;
                    const hasOverride = !!manualPriceValue;

                     // Backend-dəki 'grades' listindən istifadə edirik:
                   const gradeCalc = calculatedPrices?.grades?.find(g => g.gradeId === firstGrade?.gradeId);
                   const dynamicPrice = currency === 'USD' 
                     ? gradeCalc?.usd?.amount || 0 
                     : gradeCalc?.eur?.amount || 0;

                    return (
                      <div key={currency} className="border border-gray-100 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-200 transition-colors bg-[#FAF9F6]/50">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-[#111] tracking-wider">{currency}</span>
                            {hasOverride ? (
                              <span className="bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-amber-100">
                                Manuel İstisna
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                Avtomatik Sistem
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1.5 max-w-md">
                            {hasOverride 
                              ? `Bu valyuta üçün xüsusi sabit qiymət təyin olunub: ${manualPriceValue} ${currency === 'USD' ? '$' : '€'}` 
                              : `Zavod AZN qiymətindən avtomatik olaraq konvertasiya edilib.`}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <span className="text-xs text-gray-400 block uppercase tracking-widest font-medium mb-0.5">Satış Qiyməti</span>
                            <span className="font-mono font-bold text-base text-[#111]">
                              {hasOverride ? manualPriceValue.toFixed(2) : dynamicPrice.toFixed(2)} {currency === 'USD' ? '$' : '€'}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {/* İstisna Qoy (Manual Price) */}
                            <button 
                              onClick={async () => {
                                const manualPrice = prompt(`${currency} üçün xüsusi sabit qiymət daxil edin:`);
                                if (manualPrice && !isNaN(Number(manualPrice))) {
                                  const currentGradeId = product.gradePrices?.[0]?.gradeId;
                                  if (!currentGradeId) {
                                    alert("Əvvəlcə AZN baza qiyməti (Grade) təyin edilməlidir!");
                                    return;
                                  }

                                  try {
                                    await adminProductService.createManualPrices(product.id, {
                                      manualPrices: [{
                                        gradeId: currentGradeId,
                                        currency: currency as any,
                                        manualPrice: Number(manualPrice)
                                      }]
                                    });
                                    fetchProduct();
                                  } catch (err) {
                                    console.error("Manuel qiymət xətası:", err);
                                  }
                                }
                              }}
                              className="bg-white border border-gray-200 text-[#111] hover:bg-gray-50 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                              Sifariş Et
                            </button>

                            {/* İstisnanı Sil */}
                            {hasOverride && (
                              <button 
                                onClick={async () => {
                                  if(window.confirm("Xüsusi qiyməti silib yenidən avtomatik rejimə qayıtmaq istəyirsiniz?")) {
                                    const currentGradeId = product.gradePrices?.[0]?.gradeId;
                                    if (currentGradeId) {
                                      try {
                                        await adminProductService.deleteManualPrices(product.id, {
                                          manualPrices: [{
                                            gradeId: currentGradeId,
                                            currency: currency as any
                                          }]
                                        });
                                        fetchProduct();
                                      } catch (err) {
                                        console.error("Silinmə xətası:", err);
                                      }
                                    }
                                  }
                                }}
                                className="text-gray-400 hover:text-red-500 p-2 rounded transition-colors"
                                title="Avtomatik rejimə qaytar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}