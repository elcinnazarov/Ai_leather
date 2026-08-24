import axios from 'axios';

// Backend-dən gələcək cavabın strukturu (Sənin CheckoutResponse DTO-na uyğun)
export interface CheckoutResponse {
  orderId: number;
  providerOrderId: string;
  paymentUrl: string;
}

export const paymentService = {
  // Sifarişin ID-sini göndərib Payriff linkini alan funksiya
  initiateCheckout: async (orderId: number): Promise<CheckoutResponse> => {
    // Sənin PaymentController-dəki endpointin: POST /api/payments/checkout/{orderId}
    const response = await axios.post(`/api/payments/checkout/${orderId}`);
    
    // ApiResponse<CheckoutResponse> qaytardığın üçün data.data kimi götürürük
    return response.data.data; 
  }
};