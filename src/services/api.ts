import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  // ✅ baseURL sadəcə server portu olmalıdır (beləliklə /api/orders və /api/payments tam düzgün birləşir):
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// =========================================================================
// 1. TOKEN ƏLAVƏ EDƏN SÜZGƏC (REQUEST INTERCEPTOR) — ƏSAS ÇATIŞMAYAN HİSSƏ!
// =========================================================================
api.interceptors.request.use(
  (config) => {
    // Tokeni authStore-dan və ya localStorage-dən götürürük:
    const token = useAuthStore.getState().token || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================================
// 2. XƏTALARI QARŞILAYAN SÜZGƏC (RESPONSE INTERCEPTOR)
// =========================================================================
api.interceptors.response.use(
  (response) => {
    // Əgər backend ApiResponse { success, data, message } qaytarırsa
    if (response.data && response.data.success !== undefined) {
      return response.data; // data zərfini unwrap edirik
    }
    return response;
  },
  (error) => {
    // A) Server çökübsə və ya internet yoxdursa
    if (!error.response) {
      toast.error("Serverlə əlaqə kəsildi. Zəhmət olmasa backend-in işlədiyini yoxlayın.", { id: 'network-error' });
      return Promise.reject(error);
    }

    const status = error.response.status;

    // B) 401 UNAUTHORIZED: Həqiqətən istifadəçinin tokeninin vaxtı bitibsə
    if (status === 401) {
      const authStore = useAuthStore.getState();
      
      if (authStore.isAuthenticated) {
        toast.error("Sessiya müddəti bitdi. Zəhmət olmasa yenidən daxil olun.", {
          id: 'session-expired',
          duration: 4000,
        });
        
        authStore.logout();
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }

    // C) 403 FORBIDDEN: İcazə yoxdur (İstifadəçini logout ETMİRİK, sadəcə xəbərdarlıq edirik)
    if (status === 403) {
      toast.error("Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur.", { id: 'forbidden-error' });
      return Promise.reject(error);
    }

    // D) DİGƏR XƏTALAR (400, 500 və s.)
    const errorMessage = error.response.data?.message || error.response.data?.error || "Xəta baş verdi.";
    toast.error(errorMessage, { id: 'global-error' });

    return Promise.reject(error);
  }
);

export default api;