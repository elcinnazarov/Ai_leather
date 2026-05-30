export type AvailabilityStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_STOCK';
export type GradeType = 'A' | 'B' | 'C' | 'PREMIUM' | 'STANDARD'; // Öz bazandakı grade-lərə uyğunlaşdıra bilərsən

// Generics (Əgər başqa faylda varsa, oradan da import edə bilərsən)
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Responses
export interface LeatherResponseAdmin {
  id: number;
  leathername: string; 
  imageUrl: string; 
  color: string;
  origin: string;
  description: string;
  isActive: boolean;
  availabilityStatus: AvailabilityStatus;
  gradeType: string;
  gradeName?: string;
}

export interface LeatherResponse {
  id: number;
  leatherName: string; // Java-da: leatherName
  textureImageUrl: string;
  color: string;
  origin: string;
  isActive: boolean;
  availabilityStatus: AvailabilityStatus;
  gradeType: GradeType;
}

// Requests (Filters and Payloads)
export interface LeatherFilter {
  id?: number;
  leathername?: string;
  origin?: string;
  color?: string;
  gradeType?: GradeType;
  availabilityStatus?: AvailabilityStatus;
  isActive?: boolean;
  from?: string; // Format: 'YYYY-MM-DD'
  to?: string;   // Format: 'YYYY-MM-DD'
  page?: number; // Paginasiya üçün
  size?: number; // Paginasiya üçün
}

export interface CreateLeatherRequest {
  leatherName: string;
  origin: string;
  description: string;
  gradeId: number;
  color: string;
}

export interface UpdateLeatherRequest {
  leatherName?: string;
  color?: string;
  origin?: string;
  description?: string;
  gradeId?: number;
}