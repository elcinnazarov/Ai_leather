// src/types/order.ts
import { Currency } from "../types";

export enum OrderType {
  READY_PRODUCT = "READY_PRODUCT",
  AI_CUSTOM_DESIGN = "AI_CUSTOM_DESIGN"
}

export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  MANUFACTURING = "MANUFACTURING",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum PaymentStatus {
  WAITING = "WAITING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export enum DesignProcessStatus {
  GENERATING = "GENERATING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED"
}

export enum Country {
  AZERBAIJAN = "AZERBAIJAN",
  TURKEY = "TURKEY",
  RUSSION = "RUSSION",
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
  INTERNATIONAL_OTHER = "INTERNATIONAL_OTHER"
}

export interface OrderItemRequest {
  productModelId: number;
  productModelName?: string;
  leatherId: number;
  leatherName?: string;
  renderImageUrl?: string;
  designId?: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  orderType: OrderType;
  country: Country;
  cityName?: string;
  postalCode?: string;
  deliveryAddress: string;
  customerPhone: string;
  notes?: string;
  currency: Currency;
  items: OrderItemRequest[];
  idempotencyKey?: string;
}

export interface OrderItemResponse {
  orderItemId: number;
  productModelId: number;
  productModelName: string;
  leatherId: number;
  leatherName: string;
  renderImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  designStatus: DesignProcessStatus;
  subTotal: number;
  shippingFee: number;
  finalPrice: number;
  currency: Currency;
  deliveryAddress: string;
  customerPhone: string;
  notes: string;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  items: OrderItemResponse[];
}

export interface OrderSummaryResponse {
  orderId: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  finalPrice: number;
  currency: Currency;
  createdAt: string;
  itemCount: number;
  firstProductName: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface OrderDetailResponse {
  orderId: number;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  designStatus: DesignProcessStatus;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  subTotal: number;
  shippingFee: number;
  finalPrice: number;
  currency: Currency;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  items: OrderItemResponse[];
}

export interface OrderFilter {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  from?: string;
  to?: string;
}