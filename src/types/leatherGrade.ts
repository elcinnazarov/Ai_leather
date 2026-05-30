import { GradeType } from "../types";

export interface GradeListResponse {
  id: number;
  gradeType: GradeType | string;
  description: string;
}

export interface LeatherSummary {
  id: number;
  name: string;
  color: string;
  textureUrl: string;
  origin: string;
}

export interface LeatherGradeDetailResponse {
  id: number;
  gradeType: GradeType | string;
  description: string;
  leathers: LeatherSummary[];
  createdAt: string;
}
