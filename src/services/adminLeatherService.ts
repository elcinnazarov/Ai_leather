import { api } from '../lib/api'; // Öz Axios instansının yolu
import { 
  LeatherResponseAdmin, 
  LeatherResponse, 
  PageResponse, 
  LeatherFilter, 
  CreateLeatherRequest, 
  UpdateLeatherRequest,
  AvailabilityStatus,
  ApiResponse
} from '../types/adminLeather';

export const adminLeatherService = {
  
  // 1. Bütün dəriləri gətir (Filtrləmə və Paginasiya ilə)
  getLeathers: async (filter: LeatherFilter): Promise<ApiResponse<PageResponse<LeatherResponseAdmin>>> => {
    const response = await api.get<ApiResponse<PageResponse<LeatherResponseAdmin>>>('/admin/leathers', {
      params: filter
    });
    
    // ✅ Interceptor artıq unwrap edibsə, response = ApiResponse obyekti
    return (response as any).data?.success !== undefined ? response as any : (response as any).data ?? response;
  },

  // 2. Yeni Dəri Yarat (JSON Data + Image)
  createLeather: async (request: CreateLeatherRequest, image: File): Promise<LeatherResponse> => {
    const formData = new FormData();
    
    // JSON datanı Blob olaraq əlavə edirik ki, Spring Boot @RequestPart("data") onu tanısın
    formData.append('data', new Blob([JSON.stringify(request)], {
      type: 'application/json'
    }));
    
    // Şəkli əlavə edirik
    formData.append('image', image);

    const response = await api.post<ApiResponse<LeatherResponse>>('/admin/leathers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return (response as any).data;
  },

  // 3. Mövcud dərini yenilə (Yalnız məlumatlar)
 updateLeather: async (id: number, data: any) => {
    const response = await api.put(`/admin/leathers/${id}`, data);
    if (response?.data?.data) return response.data.data;
    return response?.data;
  },

  // 2. STATUSU YENİLƏYƏN METOD (PUT /api/admin/leathers/{id}/status)
  updateStatus: async (id: number, status: string) => {
    const response = await api.put(`/admin/leathers/${id}/status`, null, {
      params: { status }
    });
    if (response?.data?.data) return response.data.data;
    return response?.data;
  },

  // 5. Şəkli yenilə (Multipart)
  updateLeatherImage: async (id: number, image: File): Promise<LeatherResponse> => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.put<ApiResponse<LeatherResponse>>(`/admin/leathers/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return (response as any).data;
  },

  // 6. Şəkli sil
  deleteLeatherImage: async (id: number): Promise<void> => {
    await api.delete(`/admin/leathers/${id}/image`);
  },

  // 7. Dərini tamamilə sil
  deleteLeather: async (id: number): Promise<void> => {
    await api.delete(`/admin/leathers/${id}`);
  },
  
  getLeatherById: async (id: number): Promise<LeatherResponseAdmin> => {
    const response = await api.get<ApiResponse<LeatherResponseAdmin>>(`/admin/leathers/${id}`);
    return (response as any).data;
  },
};