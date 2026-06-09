import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shippingService } from '../services/shippingService'; 
import { AdminShippingLocationResponse } from '../types'; 
import { Loader2, Plus, Edit, Trash2, Power, Globe, MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShippingLocationList() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<AdminShippingLocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLocations = async (currentPage: number) => {
    try {
      setLoading(true);
      const data = await shippingService.getAllLocations(currentPage, size);
      
      setLocations(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (error) {
      console.error("Göndərmə bölgələri yüklənərkən xəta:", error);
      toast.error("Məlumatları yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(page);
  }, [page]);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const loadingToast = toast.loading("Status yenilənir...");
    try {
      await shippingService.toggleLocationStatus(id);
      
      setLocations(prev => 
        prev.map(loc => loc.id === id ? { ...loc, isActive: !currentStatus } : loc)
      );
      toast.success("Status uğurla dəyişdirildi", { id: loadingToast });
    } catch (error) {
      console.error("Status dəyişmə xətası:", error);
      toast.error("Statusu dəyişmək mümkün olmadı", { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu bölgəni silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.")) {
      return;
    }

    const loadingToast = toast.loading("Silinir...");
    try {
      await shippingService.deleteLocation(id);
      
      setLocations(prev => prev.filter(loc => loc.id !== id));
      toast.success("Bölgə uğurla silindi", { id: loadingToast });
      
      if (locations.length === 1 && page > 0) {
        setPage(prev => prev - 1);
      }
    } catch (error) {
      console.error("Silmə xətası:", error);
      toast.error("Bölgəni silmək mümkün olmadı", { id: loadingToast });
    }
  };

  if (loading && page === 0) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#111]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#111] tracking-wide mb-2">
              Çatdırılma Bölgələri
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
              Ölkə, şəhər və çatdırılma qiymətlərinin idarəsi
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/admin/shipping/new')}
            className="bg-[#111] text-white px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yeni Bölgə Əlavə Et
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bölgə (Ölkə/Şəhər)</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qiymət</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pulsuz Limit</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Poçt Kodu Tələbi</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-sans text-sm">
                      <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      Heç bir çatdırılma bölgəsi tapılmadı.
                    </td>
                  </tr>
                ) : (
                  locations.map((loc) => (
                    <tr key={loc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-gray-200 flex items-center justify-center">
                            {loc.cityName ? <MapPin className="w-4 h-4 text-gray-600" /> : <Globe className="w-4 h-4 text-gray-600" />}
                          </div>
                          <div>
                            <p className="font-bold text-[#111] text-sm">{loc.country}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{loc.cityName || 'Bütün Şəhərlər'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-sm text-[#111]">{loc.fee} {loc.currency}</span>
                      </td>
                      <td className="py-4 px-6">
                        {loc.freeThreshold ? (
                          <span className="text-sm text-green-600 font-medium">≥ {loc.freeThreshold} {loc.currency}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${loc.requiresPostalCode ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          {loc.requiresPostalCode ? 'Bəli' : 'Xeyr'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleToggleStatus(loc.id, loc.isActive)}
                          className={`flex items-center gap-1.5 mx-auto text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${
                            loc.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {loc.isActive ? 'Aktiv' : 'Passiv'}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => navigate(`/admin/shipping/${loc.id}/edit`)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Redaktə Et"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(loc.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-500 disabled:opacity-30 hover:text-black transition-colors"
            >
              Əvvəlki
            </button>
            <span className="text-xs font-bold text-[#111]">
              Səhifə {page + 1} / {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-500 disabled:opacity-30 hover:text-black transition-colors"
            >
              Növbəti
            </button>
          </div>
        )}

      </div>
    </div>
  );
}