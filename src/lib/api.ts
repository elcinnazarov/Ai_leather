import axios from 'axios';
import toast from 'react-hot-toast';
import i18n from '../i18n';
import { useCurrencyStore } from '../store/useCurrencyStore';

const BASE_URL = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Zəka Mühərrikimiz (Request Interceptor) - Başlıqları avtomatik qoşur
api.interceptors.request.use(
  (config) => {
    // ----------------------------------------------------
    // DİLİ OXU (Language) - i18next-dən alırıq
    // ----------------------------------------------------
    const lang = i18n.language || 'en';
    config.headers['Accept-Language'] = lang;

    // ----------------------------------------------------
    // TOKENİ OXU (JWT)
    // ----------------------------------------------------
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state && state.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (error) {
          console.error("Token oxuna bilmədi:", error);
        }
      }
    }
    
    // Qeyd: Artıq "X-Currency" başlığı Frontend-dən göndərilmir, 
    // çünki Backend (GeoIP əsaslı) valyuyanı özü müəyyən edir.

    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Qlobal Xəta Tutaqcanı və Context Interceptor (Response Interceptor)
api.interceptors.response.use(
  (response) => {
    // Backend-dən gələn valyuta məlumatlarını tuturuq
    const currency = response.headers['x-currency'] || response.headers['X-Currency'];
    const symbol = response.headers['x-currency-symbol'] || response.headers['X-Currency-Symbol'];
    const region = response.headers['x-region'] || response.headers['X-Region'];

    if (currency && symbol && region) {
      useCurrencyStore.getState().setCurrencyData(currency, symbol, region);
    }
if (response.data && response.data.success !== undefined) {
    // Əgər gələn data Java-nın "ApiResponse" qutusudursa, onu açırıq:
    response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Əgər error response-da da bu məlumatlar gələrsə yeniləyə bilərik
    if (error.response?.headers) {
      const currency = error.response.headers['x-currency'] || error.response.headers['X-Currency'];
      const symbol = error.response.headers['x-currency-symbol'] || error.response.headers['X-Currency-Symbol'];
      const region = error.response.headers['x-region'] || error.response.headers['X-Region'];

      if (currency && symbol && region) {
        useCurrencyStore.getState().setCurrencyData(currency, symbol, region);
      }
    }

    // ----------------------------------------------------
    // YETKİSİZ İCRA(Unauthorized - 401, Forbidden - 403)
    // ----------------------------------------------------
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Aqressiv yönləndirmə (window.location.href = '/auth') ləğv edildi, 
      // çünki bu işi artıq React Router (ProtectedRoute) idarə edir.
      if (!window.location.pathname.includes('/auth')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('auth-storage');
      }
    }

    // Toast üçün dili i18next-dən götürürük
    const lang = i18n.language || 'en';
    
    // Toast konfiqurasiyası: Minimalist, küncləri iti, lüks dizayn (Qara fon)
    const toastStyle = {
      background: '#000000',
      color: '#ffffff',
      borderRadius: '0px',
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      letterSpacing: '0.05em',
      padding: '16px 24px',
      border: '1px solid #333',
    };

    if (error.response) {
      if (error.response.status !== 401 && error.response.status !== 403) {
        // Backend-in qaytardığı "message" field-ni oxuyuruq
        const serverMessage = error.response.data?.message;
        const displayMessage = serverMessage || (lang === 'en' ? 'Unknown server error' : 'Naməlum server xətası');
        
        // Suppress vite proxy 500 error in dev
        if (error.response.status !== 500 || (typeof error.response.data !== 'string' && !error.message.includes('proxy'))) {
          toast.error(displayMessage, {
             style: toastStyle,
             iconTheme: { primary: '#ef4444', secondary: '#fff' },
          });
        }
      }
    } else {
      // Backend-ə ümumiyyətlə çata bilmədikdə (Network Error)
      const fallbackMsg = lang === 'en' ? 'Connection to server lost' : 'Serverlə əlaqə kəsildi';
      
      if (!error.message?.includes('socket hang up') && !error.message?.includes('proxy')) {
        toast.error(fallbackMsg, {
           style: toastStyle,
           iconTheme: { primary: '#ef4444', secondary: '#fff' },
        });
      }
    }

    return Promise.reject(error);
  }
);