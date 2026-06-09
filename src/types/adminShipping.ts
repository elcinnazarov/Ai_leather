// Qeyd: PageResponse qlobal types.ts faylınızda olduğu üçün oradan import edirik
import { PageResponse } from '../types'; // və ya '../types' layihənizin import strukturuna uyğun

export type CountryEnum = string;  // Backend-dəki Enums.Country
export type CurrencyEnum = string; // Backend-dəki Enums.Currency

export interface AdminShippingLocationResponse {
    id: number;
    country: CountryEnum;
    cityName: string | null;
    fee: number;
    currency: CurrencyEnum;
    freeThreshold: number | null;
    requiresPostalCode: boolean;
    isActive: boolean;
    createdAt: string;
}

export interface CreateShippingLocationRequest {
    country: CountryEnum;
    cityName?: string | null;
    fee: number;
    currency: CurrencyEnum;
    freeThreshold?: number | null;
    requiresPostalCode: boolean;
}

export interface UpdateShippingLocationRequest {
    fee: number;
    freeThreshold?: number | null;
    requiresPostalCode: boolean;
    isActive: boolean;
}