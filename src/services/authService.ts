import { api } from "../lib/api"; // Öz import yoluna uyğun saxla
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth"; // Öz import yoluna uyğun saxla

// Helper to manually decode JWT without extra libraries
function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null; // fallback
    }
}

export const authService = {
  
  // 1. NORMAL LOGİN
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    const token = response.data?.token;
    
    if (token) {
      // Daha təhlükəsiz olan parseJwt funksiyasından istifadə edirik
      const decodedPayload = parseJwt(token);
      
      let userRole = 'CUSTOMER'; 
      if (decodedPayload?.authorities && decodedPayload.authorities.length > 0) {
        userRole = decodedPayload.authorities[0].authority.replace('ROLE_', '');
      }
      
      return {
         token: token,
         user: {
           id: decodedPayload?.userId || 0,
           name: data.email.split('@')[0], 
           email: decodedPayload?.sub || data.email,
           role: userRole 
         }
      };
    }
    
    throw new Error("Serverdən token gəlmədi!");
  },

  // 2. QEYDİYYAT (Əskik olan hissə bərpa edildi)
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // 3. GOOGLE İLƏ LOGİN / QEYDİYYAT
  googleLogin: async (googleToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/google', { token: googleToken });
    const token = response.data?.token;
    
    if (token) {
      // Daha təhlükəsiz olan parseJwt funksiyasından istifadə edirik
      const decodedPayload = parseJwt(token);
      
      let userRole = 'CUSTOMER';
      if (decodedPayload?.authorities && decodedPayload.authorities.length > 0) {
        userRole = decodedPayload.authorities[0].authority.replace('ROLE_', '');
      }
      
      return {
         token: token,
         user: {
           id: decodedPayload?.userId || 0,
           name: decodedPayload?.sub?.split('@')[0] || "User",
           email: decodedPayload?.sub,
           role: userRole
         }
      };
    }
    throw new Error("Serverdən token gəlmədi!");
  },
};