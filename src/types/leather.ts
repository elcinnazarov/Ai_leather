export type GradeType = 'STANDARD' | 'PREMIUM' | 'EXOTIC';
export type AvailabilityStatus = 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';

export interface GradeInfo {
  id: number;
  name: string;
  description: string;
}

export interface LeatherProductSummary {
  id: number;
  name: string;
  modelType: string;
  primaryImageUrl: string;
}

export interface LeatherListResponse {
  id: number;
  name: string;
  color: string;
  imageUrl: string;
  origin: string;
  gradeType: GradeType;
  gradeLevel: number;
  createdAt: string;
}

export interface LeatherFilterRequest {
  color?: string;
  origin?: string;
  gradeType?: GradeType | string;
  page?: number;
  size?: number;
}

export interface LeatherDetailResponse {
  id: number;
  name: string;
  color: string;
  textureUrl: string;
  origin: string;
  description: string;
  grade: GradeInfo;
  usedInProducts: LeatherProductSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface LeatherByGradeResponse {
  id: number;
  name: string;
  color: string;
  imageUrl: string;
  origin: string;
  createdAt: string;
}

export interface GradeListResponse {
  id: number;
  gradeType: GradeType;
  description: string;
  leatherCount: number;
}

export interface LeatherGradeDetailResponse {
  id: number;
  gradeType: GradeType;
  description: string;
  leathers: LeatherListResponse[];
  createdAt: string;
}

// Admin tərəf üçün (Buna toxunmuruq, sadəcə tip olaraq qalır)
export interface AdminLeatherResponse {
  id: number;
  leatherName: string;
  color: string;
  textureImageUrl: string;
  origin: string;
  gradeType: string;
  availabilityStatus: AvailabilityStatus;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}