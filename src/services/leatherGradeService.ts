import { api } from "../lib/api";
import { ApiResponse } from "../types";
import { GradeListResponse, LeatherGradeDetailResponse } from "../types/leatherGrade";

const API_BASE_URL = "/leatherGrade";

export const leatherGradeService = {
  getAllGrades: async (): Promise<GradeListResponse[]> => {
    const response = await api.get<ApiResponse<GradeListResponse[]>>(API_BASE_URL);
    return response.data.data;
  },

  getGradeDetail: async (id: number): Promise<LeatherGradeDetailResponse> => {
    const response = await api.get<ApiResponse<LeatherGradeDetailResponse>>(`${API_BASE_URL}/${id}`);
    return response.data.data;
  }
};
