import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminLeatherService } from '../../../services/adminLeatherService';
import { CreateLeatherRequest, UpdateLeatherRequest, AvailabilityStatus } from '../../../types/adminLeather';
import { ArrowLeft, UploadCloud, X, Save, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminLeatherForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Yüklənmə və Xəta state-ləri
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Forma məlumatları
  const [formData, setFormData] = useState({
    leatherName: '',
    origin: '',
    color: '',
    gradeId: 1, // Default olaraq 1
    description: '',
    availabilityStatus: 'DRAFT' as AvailabilityStatus
  });

  // Şəkil üçün state-lər
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);

  // Memory leak-in qarşısını almaq üçün şəkil linkini təmizləyirik
  useEffect(() => {
    return () => {
      if (previewUrl && !hasExistingImage) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, hasExistingImage]);

  // Redaktə rejimində datanı gətir
 useEffect(() => {
    if (isEditMode && id) {
      const fetchLeather = async () => {
        try {
          const data = await adminLeatherService.getLeatherById(Number(id));
          setFormData({
            leatherName: data.leathername || data.leathername || '', 
            origin: data.origin || '',
            color: data.color || '',
            gradeId: data.id || 1, 
            description: data.description || '',
            availabilityStatus: data.availabilityStatus || 'DRAFT'
          });
          
          const imageUrl = data.imageUrl || data.imageUrl;
          if (imageUrl) { 
            setPreviewUrl(imageUrl);
            setHasExistingImage(true);
          }
        } catch (err) {
          setError('Məlumatları gətirərkən xəta baş verdi.');
        } finally {
          setLoading(false);
        }
      };
      fetchLeather();
    }
  }, [id, isEditMode]);

  // Input dəyişiklikləri
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Şəkil yükləmə
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setHasExistingImage(false); // Yeni şəkil seçildiyinə görə köhnəni unut
    }
  };

  // Şəkli silmə (Hələ form təsdiqlənmədən UI-dan silmək)
  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  // FORMU GÖNDƏRMƏ (Əsas Məntiq)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!isEditMode) {
        // --- YENİ YARATMA (POST) ---
        if (!imageFile) {
          setError('Zəhmət olmasa şəkil yükləyin.');
          setSaving(false);
          return;
        }
        const request: CreateLeatherRequest = {
          leatherName: formData.leatherName,
          origin: formData.origin,
          color: formData.color,
          description: formData.description,
          gradeId: Number(formData.gradeId)
        };
        await adminLeatherService.createLeather(request, imageFile);
      } else {
        // --- REDAKTƏ ETMƏ (PUT) ---
        const leatherId = Number(id);
        
        // 1. Məlumatları yenilə
        const updateReq: UpdateLeatherRequest = {
          leatherName: formData.leatherName,
          origin: formData.origin,
          color: formData.color,
          description: formData.description,
          gradeId: Number(formData.gradeId)
        };
        await adminLeatherService.updateLeather(leatherId, updateReq);

        // 2. Status dəyişibsə yenilə
        await adminLeatherService.updateLeatherStatus(leatherId, formData.availabilityStatus);

        // 3. Şəkil dəyişibsə yenilə və ya sil
        if (imageFile) {
          await adminLeatherService.updateLeatherImage(leatherId, imageFile);
        } else if (!previewUrl && hasExistingImage) {
          // Əgər əvvəl şəkil var idisə və indi UI-da (previewUrl) yoxdursa, deməli silinib
          await adminLeatherService.deleteLeatherImage(leatherId);
        }
      }
      
      // Hər şey uğurludursa siyahıya qayıt
      navigate('/admin/leathers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Əməliyyat zamanı xəta baş verdi.');
    } finally {
      setSaving(false);
    }
  };

  // Tamamilə silmə məntiqi (Yalnız Edit rejimində)
  const handleDeleteLeather = async () => {
    if (window.confirm("Bu dərini tamamilə silmək istədiyinizə əminsiniz?")) {
      try {
        await adminLeatherService.deleteLeather(Number(id));
        navigate('/admin/leathers');
      } catch (err) {
        setError('Silinmə zamanı xəta baş verdi.');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]"><Loader2 className="w-8 h-8 animate-spin text-[#111]" /></div>;
  }

  // --- UI RENDER (Quiet Luxury Dizayn) ---
  const inputBaseClass = "w-full bg-transparent border-0 border-b border-gray-300 py-3 text-sm focus:ring-0 focus:border-[#111] transition-colors placeholder:text-gray-400";
  const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1";

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-12 font-sans">
      
      {/* Başlıq */}
      <div className="max-w-5xl mx-auto flex items-center gap-6 mb-10">
        <button onClick={() => navigate('/admin/leathers')} className="p-2 text-gray-400 hover:text-black transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111] tracking-wide">
            {isEditMode ? 'Materialı Redaktə Et' : 'Yeni Material'}
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">
            İnventar bazasına yeni dəri əlavə edin
          </p>
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto mb-6 p-4 bg-red-50 text-red-600 text-xs uppercase tracking-widest font-bold border border-red-100">
          {error}
        </div>
      )}

      {/* Forma Strukturu (2 Sütunlu Grid) */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* SOL SÜTUN: Şəkil və Status */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-[#111] uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Material Şəkli</h3>
            
            {/* Şəkil Yükləmə Sahəsi */}
            <div className="relative group rounded-lg overflow-hidden border-2 border-dashed border-gray-200 hover:border-black transition-colors aspect-square flex items-center justify-center bg-gray-50">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-6 cursor-pointer">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-400 font-medium">Şəkil yükləmək üçün klikləyin</p>
                </div>
              )}
              {/* Gizli Input */}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Şəkil seçin"
              />
            </div>
          </div>

          {isEditMode && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <label className={labelClass}>Material Statusu</label>
              <select 
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleChange}
                className={inputBaseClass}
              >
                <option value="ACTIVE">Aktiv (Satışda)</option>
                <option value="DRAFT">Qaralama (Gizli)</option>
                <option value="OUT_OF_STOCK">Anbarda Bitib</option>
                <option value="ARCHIVED">Arxivlənib</option>
              </select>
            </div>
          )}
        </div>

        {/* SAĞ SÜTUN: Məlumatlar */}
        <div className="lg:col-span-2 space-y-8 bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100 relative">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>Dərinin Adı</label>
              <input 
                required 
                type="text" 
                name="leatherName" 
                value={formData.leatherName} 
                onChange={handleChange} 
                placeholder="Məs: Konyak Rəngli İtalyan Dərisi"
                className={inputBaseClass} 
              />
            </div>

            <div>
              <label className={labelClass}>Rəngi</label>
              <input 
                required 
                type="text" 
                name="color" 
                value={formData.color} 
                onChange={handleChange} 
                placeholder="Məs: Konyak (Cognac)"
                className={inputBaseClass} 
              />
            </div>

            <div>
              <label className={labelClass}>Mənşə (Origin)</label>
              <input 
                required 
                type="text" 
                name="origin" 
                value={formData.origin} 
                onChange={handleChange} 
                placeholder="Məs: Tuscany, Italy"
                className={inputBaseClass} 
              />
            </div>

            <div>
              <label className={labelClass}>Keyfiyyət (Grade ID)</label>
              {/* Gələcəkdə bunu /api/admin/grades endpointindən çəkib dinamik Select edə bilərik */}
              <input 
                required 
                type="number" 
                name="gradeId" 
                value={formData.gradeId} 
                onChange={handleChange} 
                min="1"
                className={inputBaseClass} 
              />
            </div>
          </div>

          <div className="pt-4">
            <label className={labelClass}>Ətraflı Təsvir</label>
            <textarea 
              required
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={4}
              placeholder="Materialın qısaca hekayəsini və xüsusiyyətlərini yazın..."
              className={`${inputBaseClass} resize-none`}
            />
          </div>

          {/* DÜYMƏLƏR */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
            {isEditMode ? (
              <button 
                type="button" 
                onClick={handleDeleteLeather}
                className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Materialı Sil
              </button>
            ) : <div />} {/* Layout-u qorumaq üçün boş div */}

            <button 
              type="submit" 
              disabled={saving}
              className="bg-[#111] text-white px-10 py-4 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-3 disabled:opacity-50 shadow-md"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditMode ? 'Dəyişiklikləri Saxla' : 'Materialı Yarat'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}