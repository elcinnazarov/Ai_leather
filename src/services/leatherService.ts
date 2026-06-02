import { api } from "../lib/api";
import { 
  LeatherFilterRequest, LeatherListResponse, PageResponse, 
  LeatherDetailResponse, AdminLeatherResponse, AvailabilityStatus,
  LeatherByGradeResponse, GradeListResponse, LeatherGradeDetailResponse
} from "../types/leather";

const ADMIN_URL = "/admin/leathers";
const SHOP_URL = "/leathers";
const GRADE_URL = "/leatherGrade";

export const leatherService = {
  // ==========================================
  // ADMIN ENDPOINTS (Sənin kodların - toxunulmayıb)
  // ==========================================
  getAllLeathers: async (): Promise<AdminLeatherResponse[]> => {
    const response = await api.get(ADMIN_URL);
    return response?.data?.data || response?.data || [];
  },
  createLeather: async (data: any, image: File): Promise<AdminLeatherResponse> => {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    formData.append("image", image);
    const response = await api.post(ADMIN_URL, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response?.data?.data || response?.data;
  },
  updateLeatherImage: async (id: number, image: File): Promise<AdminLeatherResponse> => {
    const formData = new FormData();
    formData.append("image", image);
    const response = await api.put(`${ADMIN_URL}/${id}/image`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response?.data?.data || response?.data;
  },
  updateLeatherStatus: async (leatherId: number, status: AvailabilityStatus): Promise<AdminLeatherResponse> => {
    const response = await api.put(`${ADMIN_URL}/${leatherId}/status`, null, { params: { status } });
    return response?.data?.data || response?.data;
  },
  deleteLeather: async (leatherId: number): Promise<void> => {
    await api.delete(`${ADMIN_URL}/${leatherId}`);
  },

  // ==========================================
  // SHOP (MÜŞTƏRİ) ENDPOINTS
  // ==========================================
  getShopLeathers: async (filter: LeatherFilterRequest = {}): Promise<PageResponse<LeatherListResponse>> => {
    const params = new URLSearchParams();
    if (filter.color) params.append("color", filter.color);
    if (filter.origin) params.append("origin", filter.origin);
    if (filter.gradeType) params.append("gradeType", filter.gradeType);
    if (filter.page !== undefined) params.append("page", filter.page.toString());
    if (filter.size !== undefined) params.append("size", filter.size.toString());

    const response = await api.get(SHOP_URL, { params });
    return response?.data?.data || response?.data || { content: [] };
  },

  getShopLeatherDetail: async (id: number): Promise<LeatherDetailResponse> => {
    const response = await api.get(`${SHOP_URL}/${id}`);
    return response?.data?.data || response?.data;
  },

  getShopLeathersByGrade: async (gradeType: string, page: number = 0, size: number = 20): Promise<PageResponse<LeatherByGradeResponse>> => {
    const response = await api.get(`${SHOP_URL}/by-grade/${gradeType}`, { params: { page, size } });
    return response?.data?.data || response?.data || { content: [] };
  },

  // ==========================================
  // SHOP LEATHER GRADE ENDPOINTS (Yeni əlavə olundu)
  // ==========================================
  getAllGrades: async (): Promise<GradeListResponse[]> => {
    const response = await api.get(GRADE_URL);
    return response?.data?.data || response?.data || [];
  },

  getGradeDetail: async (id: number): Promise<LeatherGradeDetailResponse> => {
    const response = await api.get(`${GRADE_URL}/${id}`);
    return response?.data?.data || response?.data;
  }
};