import { Currency } from "../types";

export enum OrderType {
  STANDARD = "STANDARD",
  BESPOKE = "BESPOKE"
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  REFUNDED = "REFUNDED"
}

export enum DesignProcessStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  APPROVED = "APPROVED"
}

import { Country } from "../types";

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
  orderType: OrderType | string;
  country: Country | string;
  cityName?: string;
  postalCode?: string;
  deliveryAddress: string;
  customerPhone?: string;
  notes?: string;
  currency: Currency | string;
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
  orderType: OrderType | string;
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  designStatus: DesignProcessStatus | string;
  subTotal: number;
  shippingFee: number;
  finalPrice: number;
  currency: Currency | string;
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
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  finalPrice: number;
  currency: Currency | string;
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
  orderType: OrderType | string;
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  designStatus: DesignProcessStatus | string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  notes: string;
  subTotal: number;
  shippingFee: number;
  finalPrice: number;
  currency: Currency | string;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  items: OrderItemResponse[];
}
