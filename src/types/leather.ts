import { GradeType } from "../types";

export interface LeatherListResponse {
  id: number;
  name: string;
  color: string;
  imageUrl: string;
  origin: string;
  gradeType: GradeType | string;
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
