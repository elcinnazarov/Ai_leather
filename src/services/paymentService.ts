
import api from "./api";
// Backend-dən gələcək cavabın strukturu (Sənin CheckoutResponse DTO-na uyğun)
export interface CheckoutResponse {
  orderId: number;
  providerOrderId: string;
  paymentUrl: string;
}

export const paymentService = {
  initiateCheckout: async (orderId: number) => {
    // api.post() istifadə etdikdə avtomatik olaraq :8080 portuna və JWT tokenlə göndərir:
    const response = await api.post(`/api/payments/checkout/${orderId}`);
    return response.data?.data || response.data;
  }
};