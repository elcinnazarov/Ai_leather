import { Currency } from "../types";

export interface LocalCartItem {
  productModelId: number;
  leatherId: number;
  quantity: number;
  seenPrice: number;
  customRenderUrl?: string;
}

export interface CartItemRequest {
  productModelId: number;
  leatherId: number;
  quantity: number;
  seenPrice: number;
  customRenderUrl?: string;
}

export interface CartPreviewRequest {
  items: CartItemRequest[];
  currency: Currency | string;
}

export interface CartItemResponse {
  productModelId: number;
  productModelName: string;
  leatherId: number;
  leatherName: string;
  finalImageUrl: string;
  quantity: number;
  currentUnitPrice: number;
  oldSeenPrice: number;
  totalPrice: number;
  priceChanged: boolean;
  available: boolean;
  isCustomDesign: boolean;
  itemErrorMessage?: string;
}

export interface CartPreviewResponse {
  valid: boolean;
  items: CartItemResponse[];
  totalAmount: number;
  currency: Currency | string;
  globalErrors: string[];
}
