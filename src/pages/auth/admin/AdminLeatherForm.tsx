import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminLeatherService } from '../../../services/adminLeatherService';
import { AvailabilityStatus, GradeType, CreateLeatherRequest, UpdateLeatherRequest } from '../../../types/adminLeather';
import { Loader2, ArrowLeft, Upload, Save, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLeatherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id); 

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  
  // Zəncir məntiqi üçün dərinin orijinal (ilkin) statusunu yadda saxlayırıq
  const [originalStatus, setOriginalStatus] = useState<AvailabilityStatus>('ACTIVE');

  interface LeatherFormData {
    leatherName: string;
    color: string;
    origin: string;
    description: string;
    availabilityStatus: AvailabilityStatus;
    gradeType: GradeType; // UI-da ENUM göstərmək üçün
    gradeId: number;      // DB və DTO-ya (Entity JoinColumn) ID göndərmək üçün
  }

  const [formData, setFormData] = useState<LeatherFormData>({
    leatherName: '',
    color: '',
    origin: '',
    description: '',
    availabilityStatus: 'DRAFT', // Entity default dəyərinizə əsasən DRAFT etdim
    gradeType: 'STANDARD',
    gradeId: 1
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (isEditMode && id) {
      fetchLeatherDetails(Number(id));
    }
  }, [id]);

  const fetchLeatherDetails = async (leatherId: number) => {
    try {
      const response = await adminLeatherService.getLeatherById(leatherId);
      
      let data = response as any;
      if (data?.data?.data) {
        data = data.data.data;
      } else if (data?.data) {
        data = data.data;
      }

      // Backend API-dən gələn ENUM (LeatherResponse-dakı gradeType)
      const bEndGradeType = (data.gradeType as GradeType) || 'STANDARD';
      
      // Həmin ENUM-a uyğun API-yə (UpdateLeatherRequest) gedəcək DB ID-sini hesablayırıq
      let mappedGradeId = 1;
      if (bEndGradeType === 'PREMIUM') mappedGradeId = 2;
      if (bEndGradeType === 'EXOTIC') mappedGradeId = 3;

      setFormData({
        // DTO-nuz leatherName gözləyir, Entity-niz leathername verir. Hər ikisini ehtiyatlı yoxlayırıq
        leatherName: data.leatherName || data.leathername || '', 
        color: data.color || '',
        origin: data.origin || '',
        description: data.description || '',
        availabilityStatus: data.availabilityStatus || 'DRAFT',
        gradeType: bEndGradeType, // Form üçün
        gradeId: mappedGradeId    // Backend Payload üçün
      });

      setOriginalStatus(data.availabilityStatus || 'ACTIVE');
      
      // Sizin DTO-da textureImageUrl-dir, ancaq entity-də imageUrl. 
      setPreviewUrl(data.textureImageUrl || data.imageUrl || null);
    } catch (error) {
      console.error("Dəri məlumatı tapılmadı:", error);
      toast.error("Məlumatı yükləmək mümkün olmadı");
      navigate('/admin/leathers');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Əgər istifadəçi dropdown-dan dərəcə (ENUM) dəyişirsə
    if (name === 'gradeType') {
      let numericId = 1;
      if (value === 'PREMIUM') numericId = 2;
      if (value === 'EXOTIC') numericId = 3;

      setFormData((prev: LeatherFormData) => ({
        ...prev,
        gradeType: value as GradeType, // UI yenilənir (ENUM)
        gradeId: numericId             // Arxa planda Backend DTO üçün ID yenilənir
      }));
    } else {
      setFormData((prev: LeatherFormData) => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditMode && !imageFile) {
      toast.error("Zəhmət olmasa dəri üçün şəkil yükləyin");
      return;
    }

    setLoading(true);
    try {
      // 100% Sizin UpdateLeatherRequest / CreateLeatherRequest DTO-ya uyğun paket
      // Əsla status və ya ENUM getmir, ancaq gradeId gedir!
      const requestData = {
        leatherName: formData.leatherName,
        origin: formData.origin,
        description: formData.description,
        gradeId: formData.gradeId, // JoinColumn-un tələb etdiyi RƏQƏM
        color: formData.color
      };

      if (isEditMode) {
        // ZƏNCİRVARİ UPDATE (Biznes məntiqi tam qorunur)
        if (originalStatus !== 'ACTIVE') {
           toast.loading("Dəri sistemdə aktivləşdirilir...", { id: 'save-toast' });
           await adminLeatherService.updateStatus(Number(id), 'ACTIVE');
        }

        toast.loading("Məlumatlar yenilənir...", { id: 'save-toast' });
        await adminLeatherService.updateLeather(Number(id), requestData as unknown as UpdateLeatherRequest);

        if (formData.availabilityStatus !== 'ACTIVE') {
           await adminLeatherService.updateStatus(Number(id), formData.availabilityStatus);
        }

        toast.success("Dəri uğurla yeniləndi!", { id: 'save-toast' });
      } else {
        // CREATE 
        toast.loading("Yeni dəri yaradılır...", { id: 'save-toast' });
        await adminLeatherService.createLeather(requestData as unknown as CreateLeatherRequest, imageFile as File);
        toast.success("Yeni lüks dəri uğurla yaradıldı!", { id: 'save-toast' });
      }
      
      navigate('/admin/leathers');
    } catch (error) {
      console.error("Yadda saxlayarkən xəta:", error);
      toast.error("Əməliyyat uğursuz oldu. Zəhmət olmasa yenidən yoxlayın.", { id: 'save-toast' });
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
      
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-10">
        <div>
          <button 
            onClick={() => navigate('/admin/leathers')}
            className="text-gray-400 hover:text-[#111] flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Geri Qayıt
          </button>
          <h1 className="text-3xl font-serif font-bold text-[#111] tracking-wide">
            {isEditMode ? 'Dərini Redaktə Et' : 'Yeni Dəri Yarat'}
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

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-full aspect-square bg-[#FAF9F6] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden mb-4 group cursor-pointer">
              
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Şəkil Seç</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">PNG, JPG (Max 5MB)</p>
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Dəri Adı</label>
                <input 
                  type="text" 
                  name="leatherName"
                  value={formData.leatherName}
                  onChange={handleInputChange}
                  placeholder="Məs: Premium Togo"
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Rəng</label>
                <input 
                  type="text" 
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Məs: Tünd Qəhvəyi"
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mənşə (Origin)</label>
                <input 
                  type="text" 
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  placeholder="Məs: İtaliya"
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Status</label>
                <select 
                  name="availabilityStatus"
                  value={formData.availabilityStatus}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors cursor-pointer outline-none"
                >
                  <option value="ACTIVE">Aktiv</option>
                  <option value="DRAFT">Qaralama</option>
                  <option value="OUT_OF_STOCK">Bitib</option>
                  <option value="ARCHIVED">Arxiv</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Keyfiyyət Səviyyəsi (Grade)</label>
                <select 
                  name="gradeType" // DÜZƏLİŞ: UI-da ENUM oxuyur
                  value={formData.gradeType}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors cursor-pointer outline-none"
                >
                  <option value="STANDARD">STANDARD</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="EXOTIC">EXOTIC</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Geniş Təsvir</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Dərinin strukturu, kəsimi və istifadə yerləri barədə..."
                  className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-sm focus:ring-0 focus:border-[#111] transition-colors outline-none resize-none"
                  required
                ></textarea>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}