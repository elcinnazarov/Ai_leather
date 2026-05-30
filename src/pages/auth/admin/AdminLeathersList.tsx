import React, { useEffect, useState } from 'react';
import { adminLeatherService } from '../../../services/adminLeatherService';
import { LeatherResponseAdmin, LeatherFilter, AvailabilityStatus, GradeType } from '../../../types/adminLeather';
import { Search, Plus, Edit2, Trash2, Loader2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminLeathersList() {
  const [leathers, setLeathers] = useState<LeatherResponseAdmin[]>([]); // Boş massiv default qalır
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filtrlər və Paginasiya üçün State (Backend-ə tam uyğun)
  const [filter, setFilter] = useState<LeatherFilter>({
    page: 0,
    size: 10,
    leathername: undefined, // Boş string yerinə undefined istifadə edirik ki, ilk açılışda filter tətbiq olunmasın
    availabilityStatus: undefined,
    gradeType: undefined,
  });

  const navigate = useNavigate();

  // API-dən məlumatları çəkmək
  const fetchLeathers = async () => {
    setLoading(true);
    try {
    const apiResponse = await adminLeatherService.getLeathers(filter);
      
      // apiResponse = { success, message, data: { content, totalPages } }
      const pageData = apiResponse.data;

      if (pageData && Array.isArray(pageData.content)) {
        setLeathers(pageData.content);
        setTotalPages(pageData.totalPages || 0);
      } else {
        setLeathers([]);
      }
    } catch (error) {
      console.error("Xəta:", error);
      setLeathers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtr dəyişəndə (və ya səhifə dəyişəndə) API-ni çağır
  useEffect(() => {
    // Axtarış üçün Debounce (İstifadəçi hər hərf yazanda serveri yormamaq üçün 0.5 saniyə gözləyir)
    const delayDebounceFn = setTimeout(() => {
      fetchLeathers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filter]);

  // Input dəyişikliklərini idarə edən funksiya
  const handleFilterChange = (key: keyof LeatherFilter, value: any) => {
    setFilter((prev: LeatherFilter) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
      page: 0 // Yeni axtarış edəndə həmişə 1-ci səhifəyə qayıt
    }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bu materialı silmək istədiyinizə əminsiniz?")) {
      try {
        await adminLeatherService.deleteLeather(id);
        fetchLeathers();
      } catch (error) {
        console.error("Silinmə zamanı xəta:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans">
      
      {/* Üst Başlıq və Əlavə Et Düyməsi */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111] tracking-wide">Dəri İnventarı</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Mövcud materialların idarəedilməsi</p>
        </div>
        
        {/* Mərhələ 3-də yaradacağımız Form səhifəsinə yönləndirir */}
        <button 
          onClick={() => navigate('/admin/leathers/new')}
          className="bg-[#111] text-white px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Yeni Material
        </button>
      </div>

      {/* Filtrləmə Paneli (Quiet Luxury dizayn) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-end">
        
        {/* Axtarış Inputu */}
        <div className="w-full md:w-1/3 relative">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Dəri Adı</label>
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Axtarış..."
              value={filter.leathername || ''}
              onChange={(e) => handleFilterChange('leathername', e.target.value)}
              className="w-full bg-transparent border-0 border-b border-gray-300 pl-8 pr-4 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors"
            />
          </div>
        </div>

        {/* Status Filteri */}
        <div className="w-full md:w-1/4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status</label>
          <select 
            value={filter.availabilityStatus || ''}
            onChange={(e) => handleFilterChange('availabilityStatus', e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors cursor-pointer"
          >
            <option value="">Bütün Statuslar</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="DRAFT">Qaralama</option>
            <option value="ARCHIVED">Arxiv</option>
            <option value="OUT_OF_STOCK">Bitib</option>
          </select>
        </div>

        {/* Növ (Grade) Filteri */}
        <div className="w-full md:w-1/4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Keyfiyyət (Grade)</label>
          <select 
            value={filter.gradeType || ''}
            onChange={(e) => handleFilterChange('gradeType', e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors cursor-pointer"
          >
            <option value="">Bütün Növlər</option>
            <option value="PREMIUM">Premium</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="STANDARD">Standard</option>
          </select>
        </div>
      </div>

      {/* Cədvəl Hissəsi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : leathers.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-sans text-sm">Heç bir dəri tapılmadı.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 font-bold">Material</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 font-bold">Mənşə (Origin)</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 font-bold">Keyfiyyət</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 font-bold">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 font-bold text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {leathers.map((leather) => (
                <tr key={leather.id} className="group hover:bg-[#FAF9F6] transition-colors">
                  
                  {/* Şəkil və Ad (Dairəvi Şəkil - Circular Swatches) */}
                  <td className="px-6 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 p-0.5">
                        <img 
                          src={leather.imageUrl || (leather as any).textureImageUrl || 'https://via.placeholder.com/150'} 
                          alt={leather.leathername || (leather as any).leatherName} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-[#111] text-sm">
                          {leather.leathername || (leather as any).leatherName}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{leather.color}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 border-b border-gray-50 text-sm text-gray-600">
                    {leather.origin}
                  </td>

                  <td className="px-6 py-4 border-b border-gray-50">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-700">
                      {leather.gradeName || leather.gradeType}
                    </span>
                  </td>

                  <td className="px-6 py-4 border-b border-gray-50">
                    <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5
                      ${leather.availabilityStatus === 'ACTIVE' ? 'text-green-600' : 
                        leather.availabilityStatus === 'DRAFT' ? 'text-gray-400' : 
                        leather.availabilityStatus === 'OUT_OF_STOCK' ? 'text-red-500' : 'text-orange-500'}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full 
                        ${leather.availabilityStatus === 'ACTIVE' ? 'bg-green-600' : 
                          leather.availabilityStatus === 'DRAFT' ? 'bg-gray-400' : 
                          leather.availabilityStatus === 'OUT_OF_STOCK' ? 'bg-red-500' : 'bg-orange-500'}
                      `}></span>
                      {leather.availabilityStatus}
                    </span>
                  </td>

                  {/* İdarəetmə Düymələri */}
                  <td className="px-6 py-4 border-b border-gray-50 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Mərhələ 3-ə hazırlıq: Edit səhifəsinə yönləndirmə */}
                      <button 
                        onClick={() => navigate(`/admin/leathers/edit/${leather.id}`)}
                        className="p-2 text-gray-400 hover:text-[#111] transition-colors"
                        title="Redaktə et"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(leather.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginasiya */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
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
      </div>

    </div>
  );
}