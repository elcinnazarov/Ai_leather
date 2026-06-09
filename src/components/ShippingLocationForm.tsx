import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { shippingService } from '../services/shippingService';
import { Loader2, ArrowLeft, Save, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShippingLocationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const [formData, setFormData] = useState({
    country: 'AZERBAIJAN',
    cityName: '',
    fee: '',
    currency: 'AZN',
    freeThreshold: '',
    requiresPostalCode: false,
    isActive: true
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchLocationDetails(Number(id));
    }
  }, [id]);

  const fetchLocationDetails = async (locationId: number) => {
    try {
      const data = await shippingService.getLocationById(locationId);
      
      setFormData({
        country: data.country || 'AZERBAIJAN',
        cityName: data.cityName || '',
        fee: data.fee?.toString() || '',
        currency: data.currency || 'AZN',
        freeThreshold: data.freeThreshold ? data.freeThreshold.toString() : '',
        requiresPostalCode: data.requiresPostalCode || false,
        isActive: data.isActive !== undefined ? data.isActive : true
      });
    } catch (error) {
      console.error("Məlumat tapılmadı:", error);
      toast.error("Bölgə məlumatını yükləmək mümkün olmadı");
      navigate('/admin/shipping');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ƏSAS DÜZƏLİŞ: cityName boşdursa null göndər, "" yox
      const cityNameValue = formData.cityName.trim() || undefined;
      const freeThresholdValue = formData.freeThreshold ? Number(formData.freeThreshold) : undefined;

      const requestBody: any = {
        country: formData.country,
        cityName: cityNameValue, // undefined olacaq əgər boşdursa
        fee: Number(formData.fee),
        currency: formData.currency,
        freeThreshold: freeThresholdValue,
        requiresPostalCode: formData.requiresPostalCode
      };

      if (isEditMode) {
        toast.loading("Məlumatlar yenilənir...", { id: 'save-toast' });
        await shippingService.updateLocation(Number(id), requestBody);
        toast.success("Bölgə uğurla yeniləndi!", { id: 'save-toast' });
      } else {
        toast.loading("Yeni bölgə yaradılır...", { id: 'save-toast' });
        await shippingService.createLocation(requestBody);
        toast.success("Yeni bölgə uğurla yaradıldı!", { id: 'save-toast' });
      }
      
      navigate('/admin/shipping');
    } catch (error: any) {
      console.error("Yadda saxlayarkən xəta:", error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.data 
        || "Əməliyyat uğursuz oldu";
      
      toast.error(errorMessage, { id: 'save-toast' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#111]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-10">
        <div>
          <button 
            onClick={() => navigate('/admin/shipping')}
            className="text-gray-400 hover:text-[#111] flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Geri Qayıt
          </button>
          <h1 className="text-3xl font-serif font-bold text-[#111] tracking-wide">
            {isEditMode ? 'Bölgəni Redaktə Et' : 'Yeni Çatdırılma Bölgəsi'}
          </h1>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#111] text-white px-8 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditMode ? 'Yadda Saxla' : 'Yarat'}
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form className="space-y-8" onSubmit={handleSubmit}>
          
          <div className="space-y-6 pb-6 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Coğrafi Məlumatlar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Ölkə (Country)</label>
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none cursor-pointer disabled:opacity-50"
                  required
                >
                  <option value="AZERBAIJAN">Azərbaycan</option>
                  <option value="GERMANY">Almaniya</option>
                  <option value="FRANCE">Fransa</option>
                  <option value="ITALY">İtaliya</option>
                  <option value="UNITED_KINGDOM">Böyük Britaniya</option>
                  <option value="SWITZERLAND">İsveçrə</option>
                  <option value="USA">ABŞ</option>
                  <option value="CANADA">Kanada</option>
                  <option value="JAPAN">Yaponiya</option>
                  <option value="AUSTRALIA">Avstraliya</option>
                  <option value="UAE">BƏƏ</option>
                  <option value="SAUDI_ARABIA">Səudiyyə Ərəbistanı</option>
                  <option value="INTERNATIONAL_OTHER">Digər (Qlobal)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Şəhər (İstəyə bağlı)</label>
                <input 
                  type="text" 
                  name="cityName"
                  value={formData.cityName}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  placeholder="Məs: Bakı (Boş qalsa ölkə üzrə olacaq)"
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pb-6 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Qiymətləndirmə</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Çatdırılma Haqqı (Fee)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="fee"
                  value={formData.fee}
                  onChange={handleInputChange}
                  placeholder="Məs: 5.00"
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Valyuta</label>
                <select 
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none cursor-pointer disabled:opacity-50"
                  required
                >
                  <option value="AZN">AZN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pulsuz Çatdırılma Limiti (Opsional)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="freeThreshold"
                  value={formData.freeThreshold}
                  onChange={handleInputChange}
                  placeholder="Məs: 100.00 (Sifariş bu məbləği keçərsə çatdırılma pulsuz olar)"
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tənzimləmələr</h3>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="requiresPostalCode"
                  checked={formData.requiresPostalCode}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                />
                <span className="text-sm font-bold text-[#111]">Bu bölgə üçün Poçt Kodu (Zip Code) tələb olunsun</span>
              </label>

              {isEditMode && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                  />
                  <span className="text-sm font-bold text-[#111]">Aktivdir (İstifadəyə Açıq)</span>
                </label>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}