/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GradeType {
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
  EXOTIC = "EXOTIC",
}

export enum PaymentStatus {
  WAITING = "WAITING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
}

export enum Currency {
  AZN = "AZN",
  USD = "USD",
  EUR = "EUR",
}

export enum NotificationType {
  ORDER_CONFIRMATION = "ORDER_CONFIRMATION",
  ORDER_SHIPPED = "ORDER_SHIPPED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  ADMIN_NEW_ORDER = "ADMIN_NEW_ORDER",
}

export enum DesignProcessStatus {
  GENERATING = "GENERATING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

export enum ProductCategory {
  BAG = "BAG",
  BELT = "BELT",
  WALLET = "WALLET",
}

export enum OrderType {
  READY_PRODUCT = "READY_PRODUCT",
  AI_CUSTOM_DESIGN = "AI_CUSTOM_DESIGN",
}

export enum FavoriteTargetType {
  PRODUCT_MODEL = "PRODUCT_MODEL",
  AI_DESIGN = "AI_DESIGN",
}

export enum MinioFolderType {
  PRODUCT = "PRODUCT",
  LEATHER = "LEATHER",
  AI = "AI",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  UNISEX = "UNISEX",
}

export enum DesignCategory {
  CLASSIC = "CLASSIC",
  MODERN = "MODERN",
  LUXURY = "LUXURY",
  MINIMALIST = "MINIMALIST",
  VINTAGE = "VINTAGE",
}

export enum CacheKeyType {
  STANDARD = "STANDARD",
  CUSTOM = "CUSTOM",
  UNKNOWN = "UNKNOWN",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  MANUFACTURING = "MANUFACTURING",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum AvailabilityStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export enum Country {
  AZERBAIJAN = "AZERBAIJAN",
  GERMANY = "GERMANY",
  FRANCE = "FRANCE",
  ITALY = "ITALY",
  UNITED_KINGDOM = "UNITED_KINGDOM",
  SWITZERLAND = "SWITZERLAND",
  USA = "USA",
  CANADA = "CANADA",
  JAPAN = "JAPAN",
  AUSTRALIA = "AUSTRALIA",
  UAE = "UAE",
  SAUDI_ARABIA = "SAUDI_ARABIA",
  INTERNATIONAL_OTHER = "INTERNATIONAL_OTHER",
}

export interface PricingRuleResponse {
  id: number;
  targetCurrency: Currency;
  fixedAmount: number;
  multiplier: number;
  roundTo99: boolean;
  formulaDisplay: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingRuleRequest {
  targetCurrency: Currency;
  fixedAmount: number;
  multiplier: number;
  roundTo99: boolean;
}

export interface UpdatePricingRuleRequest {
  fixedAmount: number;
  multiplier: number;
  roundTo99: boolean;
  isActive: boolean;
}

export interface LeatherResponse {
  id: number;
  leatherName: string;
  textureImageUrl: string;
  color: string;
  origin: string;
  isActive: boolean;
  availabilityStatus: AvailabilityStatus;
  gradeType: GradeType;
  description?: string;
  gradeId?: number;
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

export interface ProductImageResponse {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductModelResponse {
  id: number;
  modelname: string;
  modelType: ProductCategory;
  primaryImageUrl: string;
  images: ProductImageResponse[];
  description: string;
  dimensions: string;
  availabilityStatus: AvailabilityStatus;
  createdAt: string;
}

export interface CreateProductModelRequest {
  modelName: string;
  modelType: ProductCategory;
  description: string;
  dimensions?: string;
}

export interface UpdateProductModelRequest {
  modelName?: string;
  modelType?: ProductCategory;
  description?: string;
  dimensions?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

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
  productId: number;
  prices: ProductPriceResponse[];
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

export interface PriceDetail {
  amount: number;
  source: string; // BASE, MANUAL, AUTO
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
  grades: GradePriceDetail[];
}

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
  prices: CreateManualPriceRequest[];
}

export interface DeleteManualPriceRequest {
  gradeId: number;
  currency: Currency;
}

export interface ListDeleteManualPricesRequest {
  manualPrices: DeleteManualPriceRequest[];
}

export interface AdminShippingLocationResponse {
  id: number;
  country: Country;
  cityName: string;
  fee: number;
  currency: Currency;
  freeThreshold: number;
  requiresPostalCode: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateShippingLocationRequest {
  country: Country;
  cityName?: string;
  fee: number;
  currency: Currency;
  freeThreshold?: number;
  requiresPostalCode?: boolean;
}

export interface UpdateShippingLocationRequest {
  country: Country;
  cityName?: string;
  fee: number;
  currency: Currency;
  freeThreshold?: number;
  requiresPostalCode?: boolean;
  isActive: boolean;
}

export interface AdminOrderListResponse {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingFee: number;
  subTotal: number;
  finalPrice: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  itemCount: number;
}

export interface CustomerInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface OrderItemDetail {
  id: number;
  productModelId: number;
  productModelName: string;
  leatherId: number;
  leatherName: string;
  leatherImageUrl?: string; // <--- YENİ ƏLAVƏ EDİLDİ (Dərinin şəkli)
  renderImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface PaymentDetail {
  id: number;
  provider: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  createdAt: string;
  confirmedAt: string;
}

export interface AdminOrderDetailResponse {
  id: number;
  orderNumber: string;
  customer: CustomerInfo;
  finalPrice: number;
  subTotal: number;
  shippingFee: number;
  currency: Currency;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  designStatus: DesignProcessStatus;
  orderType: OrderType;
  createdAt: string;
  updatedAt: string;
  paidAt: string;
  completedAt: string;
  items: OrderItemDetail[];
  payment: PaymentDetail;
}

export interface OrderStatusUpdateResponse {
  orderId: number;
  orderNumber: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  message: string;
  updatedAt: string;
  paidAt: string;
  completedAt: string;
}

export interface UpdateOrderStatusRequest {
  newStatus: OrderStatus;
  notes?: string;
}

export interface OrderFilter {
  id?: number;
  orderNumber?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerEmail?: string;
  customerName?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
