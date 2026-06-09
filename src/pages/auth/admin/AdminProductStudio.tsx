import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminProductService } from '../../../services/adminProductService';
import { productPriceService } from '../../../services/productPriceService'; 
import { AdminProductModelResponse, AvailabilityStatus, AdminCalculatedPriceResponse } from '../../../types/adminProduct';
import { ArrowLeft, Star, Trash2, UploadCloud, Loader2, Image as ImageIcon, Check, Archive, CheckCircle2, AlertCircle, FileEdit, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductStudio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [product, setProduct] = useState<AdminProductModelResponse | null>(null);
  const [calculatedPrices, setCalculatedPrices] = useState<AdminCalculatedPriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'INFO' | 'MEDIA' | 'PRICING'>('INFO');
  
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ modelName: '', modelType: 'BAG', description: '', dimensions: '' });

  // 🚀 YENİ: MODERN MODAL (POPUP) ÜÇÜN STATE
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'CREATE_BASE' | 'EDIT_BASE' | 'MANUAL_OVERRIDE';
    gradeId?: number;
    gradeType?: string;
    currency?: 'USD' | 'EUR';
  }>({ isOpen: false, type: 'CREATE_BASE' });
  const [modalInput, setModalInput] = useState('');
  const [modalGradeSelect, setModalGradeSelect] = useState('1'); // 1=STANDARD, 2=PREMIUM, 3=EXOTIC
  const [modalLoading, setModalLoading] = useState(false);

  const statusConfig: Record<AvailabilityStatus, { label: string, icon: any, color: string }> = {
    ACTIVE: { label: 'Aktivləşdir', icon: CheckCircle2, color: 'border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-300' },
    ARCHIVED: { label: 'Arxivlə', icon: Archive, color: 'border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 hover:border-rose-300' },
    DRAFT: { label: 'Qaralama et', icon: FileEdit, color: 'border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300' },
    OUT_OF_STOCK: { label: 'Stok Bitdi', icon: AlertCircle, color: 'border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100 hover:border-amber-300' },
  };

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    if (!product || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const updatedItem = await adminProductService.updateProductStatus(product.id, newStatus);
      setProduct((prev: any) => ({ ...prev, availabilityStatus: updatedItem.availabilityStatus || newStatus }));
      toast.success(`Status ${statusConfig[newStatus].label} olaraq yeniləndi!`);
    } catch (error) {
      toast.error("Status dəyişdirilərkən xəta baş verdi.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await adminProductService.getProductById(Number(id));
      const productData = (response as any)?.data?.data || (response as any)?.data || response;

      if (productData) {
        setProduct(productData);
        setInfoForm({
          modelName: productData.modelName || productData.modelname || '',
          modelType: productData.modelType || 'BAG',
          description: productData.description || '',
          dimensions: productData.dimensions || ''
        });
      }

      const priceRes = await adminProductService.getCalculatedPrices(Number(id));
      const calcData = (priceRes as any)?.data?.data || (priceRes as any)?.data || priceRes;
      setCalculatedPrices(calcData);
    } catch (error) {
      console.error("Məlumatlar yüklənərkən xəta yarandı", error);
    } finally {
      setLoading(false);
    }
  };

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
      toast.success("Məlumatlar yeniləndi!");
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product || !e.target.files?.length) return;
    try {
      await adminProductService.addImages(product.id, Array.from(e.target.files));
      fetchProduct();
    } catch (err) {
      console.error("Şəkil yüklənə bilmədi", err);
    }
  };

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

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const getAvailableTransitions = (currentStatus: AvailabilityStatus): AvailabilityStatus[] => {
    if (currentStatus === 'ACTIVE') return ['OUT_OF_STOCK', 'ARCHIVED'];
    if (currentStatus === 'DRAFT' || currentStatus === 'OUT_OF_STOCK') return ['ACTIVE', 'ARCHIVED'];
    if (currentStatus === 'ARCHIVED') return ['ACTIVE'];
    return [];
  };

  // 🚀 YENİ: MODAL ÜÇÜN SUBMİT FUNKSİYASI
  const handleModalSubmit = async () => {
    if (!product || !modalInput || isNaN(Number(modalInput))) {
      toast.error("Zəhmət olmasa düzgün qiymət daxil edin.");
      return;
    }
    setModalLoading(true);
    try {
      if (modalConfig.type === 'CREATE_BASE') {
        await productPriceService.createProductPrices(product.id, {
          prices: [{ gradeId: Number(modalGradeSelect), price: Number(modalInput) }]
        });
        toast.success("Baza qiyməti uğurla yaradıldı!");
      } 
      else if (modalConfig.type === 'EDIT_BASE') {
        await adminProductService.updateProductPrice(product.id, modalConfig.gradeId!, { price: Number(modalInput) });
        toast.success("Baza qiyməti yeniləndi!");
      } 
      else if (modalConfig.type === 'MANUAL_OVERRIDE') {
        await adminProductService.createManualPrices(product.id, {
          manualPrices: [{
            gradeId: modalConfig.gradeId!,
            currency: modalConfig.currency as any,
            manualPrice: Number(modalInput)
          }]
        });
        toast.success(`${modalConfig.currency} üçün yeni qiymət təyin edildi!`);
      }
      
      closeModal();
      fetchProduct();
    } catch (err) {
      console.error("Xəta baş verdi:", err);
      toast.error("Əməliyyat uğursuz oldu.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: 'CREATE_BASE' });
    setModalInput('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]"><Loader2 className="w-8 h-8 animate-spin text-[#111]" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">Məhsul tapılmadı.</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans pb-20 relative">
      
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

            <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-6 mt-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3">Mövcud Vəziyyət</p>
                <div className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-3 w-full justify-center transition-all duration-500
                  ${product.availabilityStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-4 ring-emerald-50/50' :
                    product.availabilityStatus === 'DRAFT' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                    product.availabilityStatus === 'OUT_OF_STOCK' ? 'bg-amber-50 text-amber-700 border-amber-100 ring-4 ring-amber-50/50' :
                    'bg-rose-50 text-rose-700 border-rose-100 ring-4 ring-rose-50/50'}`}
                >
                  <div className={`w-2 h-2 rounded-full animate-pulse ${product.availabilityStatus === 'ACTIVE' ? 'bg-emerald-500' : product.availabilityStatus === 'OUT_OF_STOCK' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  {statusConfig[product.availabilityStatus as AvailabilityStatus]?.label.replace('lə', '').replace(' et', '').replace(' Qaytar', '') || product.availabilityStatus}
                </div>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black mb-3">Statusu Dəyiş</p>
                <div className="grid grid-cols-1 gap-2">
                  {updatingStatus ? (
                    <div className="flex items-center justify-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Prosess gedir...
                    </div>
                  ) : (
                    getAvailableTransitions(product.availabilityStatus as AvailabilityStatus).map((nextStatus) => {
                      const Config = statusConfig[nextStatus];
                      if (!Config) return null;
                      return (
                        <button
                          key={nextStatus}
                          onClick={() => handleStatusChange(nextStatus)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] uppercase tracking-[0.15em] font-black transition-all duration-300 border shadow-sm ${Config.color}`}
                        >
                          <span className="flex items-center gap-2">
                          <Config.icon className="w-3.5 h-3.5" />
                          {Config.label}
                          </span>
                          <Check className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ TƏRƏF (DİNAMİK TABLAR) */}
        <div className="lg:col-span-8">
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

          {activeTab === 'PRICING' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              
              {/* 1. SEKTOR: BAZA QİYMƏTLƏR (AZN) */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-[#111] uppercase tracking-widest">1. Baza Qiymətlər (AZN)</h3>
                    <p className="text-xs text-gray-400 mt-1">Hər bir material dərəcəsinə (Grade) görə məhsulun zavod çıxış qiyməti.</p>
                  </div>
                  
                  {/* MODALI AÇAN DÜYMƏ */}
                  <button 
                    onClick={() => {
                      setModalConfig({ isOpen: true, type: 'CREATE_BASE' });
                      setModalInput('');
                    }}
                    className="bg-[#111] text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" /> Yeni Qiymət
                  </button>
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
                                onClick={() => {
                                  setModalInput(gp.price.toString());
                                  setModalConfig({ isOpen: true, type: 'EDIT_BASE', gradeId: gp.gradeId, gradeType: gp.gradeType });
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

              {/* 2. SEKTOR: BEYNƏLXALQ DİNAMİK QİYMƏTLƏR (GRADE-Ə GÖRƏ QRUPLAŞDIRILIB) */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-sm font-bold text-[#111] uppercase tracking-widest">2. Beynəlxalq Qiymətlər və İstisnalar</h3>
                  <p className="text-xs text-gray-400 mt-1">Sistem tərəfindən dinamik hesablanmış və ya manual təyin edilmiş beynəlxalq satış qiymətləri.</p>
                </div>

                <div className="space-y-10">
                  {product.gradePrices && product.gradePrices.length > 0 ? (
                    product.gradePrices.map((grade) => {
                      const gradeCalc = calculatedPrices?.grades?.find(g => g.gradeId === grade.gradeId);

                      return (
                        <div key={grade.gradeId} className="border border-gray-100 rounded-xl overflow-hidden">
                          {/* Grade Başlığı */}
                          <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-bold text-xs uppercase tracking-widest text-[#111]">
                              {grade.gradeType || `Grade ${grade.gradeId}`} MATERIALI
                            </span>
                            <span className="font-mono text-xs text-gray-500 font-medium">Baza: {grade.price} AZN</span>
                          </div>

                          {/* Valyutalar (USD və EUR) */}
                          <div className="divide-y divide-gray-100">
                            {['USD', 'EUR'].map((currency) => {
                              const manualPriceValue = currency === 'USD' ? grade.manualUsd : grade.manualEur;
                              const hasOverride = !!manualPriceValue;
                              const dynamicPrice = currency === 'USD' ? gradeCalc?.usd?.amount || 0 : gradeCalc?.eur?.amount || 0;

                              return (
                                <div key={currency} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50/30 transition-colors">
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
                                        ? `Bu valyuta üçün sabit qiymət təyin olunub.` 
                                        : `AZN məzənnəsindən avtomatik olaraq konvertasiya edilib.`}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                      <span className="text-[10px] text-gray-400 block uppercase tracking-widest font-bold mb-0.5">Satış Qiyməti</span>
                                      <span className="font-mono font-bold text-base text-[#111]">
                                        {hasOverride ? manualPriceValue.toFixed(2) : dynamicPrice.toFixed(2)} {currency === 'USD' ? '$' : '€'}
                                      </span>
                                    </div>

                                    <div className="flex gap-2">
                                      {/* 🚀 QİYMƏT YENİLƏ DÜYMƏSİ */}
                                      <button 
                                        onClick={() => {
                                          setModalInput(hasOverride ? manualPriceValue.toString() : dynamicPrice.toFixed(2));
                                          setModalConfig({ 
                                            isOpen: true, 
                                            type: 'MANUAL_OVERRIDE', 
                                            gradeId: grade.gradeId, 
                                            gradeType: grade.gradeType,
                                            currency: currency as 'USD' | 'EUR' 
                                          });
                                        }}
                                        className="bg-white border border-gray-200 text-[#111] hover:bg-black hover:text-white hover:border-black px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all"
                                      >
                                        Qiymət yenilə
                                      </button>

                                      {hasOverride && (
                                        <button 
                                          onClick={async () => {
                                            if(window.confirm("Xüsusi qiyməti silib yenidən avtomatik rejimə qayıtmaq istəyirsiniz?")) {
                                              try {
                                                await adminProductService.deleteManualPrices(product.id, {
                                                  manualPrices: [{ gradeId: grade.gradeId, currency: currency as any }]
                                                });
                                                fetchProduct();
                                              } catch (err) {
                                                console.error("Silinmə xətası:", err);
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
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-400 text-xs uppercase tracking-wider py-4">
                      Beynəlxalq qiymətlərin yaranması üçün əvvəlcə yuxarıdan baza (AZN) qiyməti təyin edin.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 🚀 YENİ: MODERN MODAL (POPUP) PƏNCƏRƏSİ */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-[#111] mb-2">
              {modalConfig.type === 'CREATE_BASE' && 'Yeni Baza Qiyməti (AZN)'}
              {modalConfig.type === 'EDIT_BASE' && `${modalConfig.gradeType} - Redaktə Et`}
              {modalConfig.type === 'MANUAL_OVERRIDE' && `${modalConfig.gradeType} - ${modalConfig.currency} Qiyməti`}
            </h3>
            <p className="text-xs text-gray-500 mb-6 line-clamp-2">
              {modalConfig.type === 'CREATE_BASE' ? 'Sistemin məhsulu satması üçün materiala uyğun baza zavod qiymətini təyin edin.' 
               : 'Aşağıdakı xanaya yeni qiyməti rəqəmlə daxil edin.'}
            </p>

            <div className="space-y-5">
              {/* CREATE zamanı Grade seçimi (İstifadəçi "Premium" seçir, sistem 2 göndərir) */}
              {modalConfig.type === 'CREATE_BASE' && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Materialın Dərəcəsi</label>
                  <select 
                    value={modalGradeSelect} 
                    onChange={(e) => setModalGradeSelect(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-gray-300 py-3 text-sm focus:ring-0 focus:border-[#111] transition-colors cursor-pointer"
                  >
                    <option value="1">Standart (STANDARD)</option>
                    <option value="2">Premium (PREMIUM)</option>
                    <option value="3">Ekzotik (EXOTIC)</option>
                  </select>
                </div>
              )}

              {/* Məbləğ Inputu */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Qiymət ({modalConfig.type === 'MANUAL_OVERRIDE' ? modalConfig.currency : 'AZN'})
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">
                    {modalConfig.type === 'MANUAL_OVERRIDE' ? (modalConfig.currency === 'USD' ? '$' : '€') : '₼'}
                  </span>
                  <input 
                    type="number" 
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-0 border-b border-gray-300 py-3 pl-8 text-lg font-mono focus:ring-0 focus:border-[#111] transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              <button 
                onClick={handleModalSubmit}
                disabled={modalLoading || !modalInput}
                className="w-full bg-[#111] text-white py-4 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Təsdiq Et
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}