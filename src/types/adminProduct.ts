// ==========================================
// 1. QLOBAL ENUM-LAR VƏ GENERİC TİPLƏR
// ==========================================
export type AvailabilityStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_STOCK';
export type ProductCategory = 'BAG' | 'BELT' | 'WALLET' | 'ACCESSORY';
export type Currency = 'AZN' | 'USD' | 'EUR';

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

export interface ProductModelFilter {
  // Sizin Backend filter sahələriniz bura əlavə oluna bilər (məsələn, search, status və s.)
  page?: number;
  size?: number;
}

// ==========================================
// 2. MƏHSUL (PRODUCT MODEL) TİPLƏRİ
// ==========================================
export interface AdminProductImageResponse {
  id: number;
  imageUrl: string;
  isPrimary?: boolean;
}

export interface AdminGradePriceResponse {
  id: number;
  gradeId: number;
  gradeType: string;
  price: number; // AZN base price
  currency: string;
  manualUsd?: number; // Backend DTO-dan gələn sahələr
  manualEur?: number;
}
export interface AdminProductModelResponse {
  id: number;
  modelname: string; // DIQQƏT: Backend-də kiçik 'n' ilə
  modelType: ProductCategory;
  description: string;
  dimensions: string;
  isActive: boolean;
  availabilityStatus: AvailabilityStatus;
  createdAt: string;
  updatedAt: string;
  images: AdminProductImageResponse[];
  primaryImageUrl: string;
  gradePrices: AdminGradePriceResponse[];
  imageCount: number;
  gradePriceCount: number;
  favoriteCount: number;
}

export interface ProductModelResponse {
  id: number;
  modelname: string;
  modelType: ProductCategory;
  primaryImageUrl: string;
  images: AdminProductImageResponse[];
  description: string;
  dimensions: string;
  availabilityStatus: AvailabilityStatus;
  createdAt: string;
}

export interface CreateProductModelRequest {
  modelName: string; // DIQQƏT: Backend-də böyük 'N' ilə
  modelType: ProductCategory;
  description: string;
  dimensions?: string;
}

export interface UpdateProductModelRequest {
  modelName: string;
  modelType: ProductCategory;
  description: string;
  dimensions?: string;
}

// ==========================================
// 3. QİYMƏT (PRICING ENGINE) TİPLƏRİ
// ==========================================
export interface ProductPriceResponse {
  id: number;
  productModelId: number;
  productModelName: string;
  gradeId: number;
  gradeType: string;
  priceAzn: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListProductPriceResponse {
  productModelId: number;
  productModelName: string;
  prices: ProductPriceResponse[];
  totalCount: number;
  successCount: number;
  errors: string[];
}

export interface CreateProductPriceRequest {
  gradeId: number;
  price: number;
}

export interface ListCreateProductPricesRequest {
  prices: CreateProductPriceRequest[];
}

export interface UpdateProductPriceRequest {
  price: number;
}

// HESABLANMIŞ QİYMƏTLƏR (CALCULATED)
export interface PriceDetail {
  amount: number;
  source: string; // 'BASE', 'MANUAL', 'AUTO'
  formula: string;
  ruleMultiplier: number;
  ruleFixed: number;
  ruleRoundTo99: boolean;
}

export interface GradePriceDetail {
  gradeId: number;
  gradeType: string;
  azn: PriceDetail;
  usd: PriceDetail;
  eur: PriceDetail;
}

export interface AdminCalculatedPriceResponse {
  productId: number;
  productName: string;
  grades: Array<{
    gradeId: number;
    gradeType: string;
    azn: { amount: number };
    usd: { amount: number };
    eur: { amount: number };
  }>;
}
// ==========================================
// 4. MANUEL QİYMƏTLƏR TİPLƏRİ
// ==========================================
export interface ManualPriceResponse {
  id: number;
  productModelId: number;
  productModelName: string;
  gradeId: number;
  gradeType: string;
  currency: Currency;
  manualPrice: number;
  autoCalculated: number;
  isOverridden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListManuelPricesResponse {
  productModelId: number;
  productModelName: string;
  manualPrices: ManualPriceResponse[];
  totalCount: number;
  successCount: number;
  errors: string[];
}

export interface CreateManualPriceRequest {
  gradeId: number;
  currency: Currency;
  manualPrice: number;
}

export interface ListCreateManualPricesRequest {
  manualPrices: CreateManualPriceRequest[];
}

export interface DeleteManualPriceRequest {
  gradeId: number;
  currency: Currency;
}

export interface ListDeleteManualPricesRequest {
  manualPrices: DeleteManualPriceRequest[];
}

export interface ProductPriceFilter {
  productId?: number;
  gradeId?: number;
  currency?: Currency;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}