import { Currency } from "../types";
export interface CartItemRequest {
  productModelId: number;
  leatherId: number;
  quantity: number;
  seenPrice: number;
  customRenderUrl?: string;
}

export interface CartPreviewRequest {
  items: CartItemRequest[];
  currency: string;
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
  itemErrorMessage: string | null;
}

export interface CartPreviewResponse {
  valid: boolean;
  items: CartItemResponse[];
  totalAmount: number;
  currency: string;
  globalErrors: string[];
}
