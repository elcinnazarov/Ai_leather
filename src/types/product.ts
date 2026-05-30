import {  Currency } from "../types";

export type ProductCategory = "BAG" | "WALLET" | "BELT" | "ACCESSORY";

// ProductSummary DTO-su
export interface ProductSummary {
  id: number;
  modelName: string;
  modelType: ProductCategory;
  primaryImageUrl: string;
  basePrice: number | null; // Null gəlmə ehtimalına qarşı sığortalı
  formattedPrice: string;
  currency: Currency;
  createdAt: string;
}

export interface ProductCatalogResponse {
  content: ProductSummary[];
  pageNumber: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ProductFilterRequest DTO-su
export interface ProductFilterRequest {
  modelType?: ProductCategory | null;
  search?: string | null;
  page: number;
  size: number;
}
export interface ProductImageDTO {
  id: number;
  imageUrl: string;
  imageOrder: number;
  isPrimary: boolean;
}

export interface GradePriceSummary {
  gradeId: number;
  gradeType: string;
  amount: number;
  formatted: string;
}

export interface ProductDetailResponse {
  id: number;
  modelName: string;
  modelType: ProductCategory;
  description: string;
  dimensions: string;
  images: ProductImageDTO[];
  primaryImageUrl: string;
  gradePrices: GradePriceSummary[];
  currentCurrency: Currency;
  createdAt: string;
  updatedAt: string;
}

export interface PriceDetail {
  amount: number;
  formatted: string;
  source: string; // BASE, MANUAL, AUTO, CACHE
}

export interface GradePriceMatrix {
  gradeId: number;
  gradeType: string;
  // Java-dakı Map<Currency, PriceDetail> TypeScript-də Record kimi yazılır
  prices: Record<string, PriceDetail>; 
}

export interface ProductPriceMatrixResponse {
  productId: number;
  productName: string;
  matrix: Record<string, GradePriceMatrix>; 
}
export interface P_AvailableLeatherResponse {
  id: number;
  name: string;
  color: string;
  imageUrl: string;
  gradeType: string;
  origin: string;
}
