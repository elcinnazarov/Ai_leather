import axios from 'axios';
import { toast } from 'react-hot-toast'; // Sənin istifadə etdiyin toast kitabxanası
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Sənin backend ünvanın
  // ... digər ayarlar
});

// XƏTALARI QARŞILAYAN SÜZGƏC (RESPONSE INTERCEPTOR)
api.interceptors.response.use(
  (response) => {
    // Əgər response.data = { success, data, message } strukturundadırsa
    if (response.data && response.data.success !== undefined) {
      return response.data; // unwrap et
    }
    return response;
  },
  (error) => {
    // 1. Backend-dən cavab gəlməyibsə (Server çökübsə)
    if (!error.response) {
      toast.error("Sistemlə əlaqə kəsildi. Zəhmət olmasa yoxlayın.");
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 2. TOKEN ÖLÜB VƏ YA YOXDUR (401) / İCAZƏ YOXDUR (403)
    if (status === 401 || status === 403) {
      const authStore = useAuthStore.getState();
      
      // Əgər istifadəçi doğrudan da login idisə, amma tokeni vaxtını keçibsə
      if (authStore.isAuthenticated) {
         // Tək və peşəkar bir mesaj veririk (Dalbadal spamın qarşısını alır)
         toast.error("Sessiya müddəti bitdi. Təhlükəsizlik üçün yenidən daxil olun.", {
           id: 'session-expired', // Bu ID eyni mesajın eyni anda 3 dəfə çıxmasının qarşısını alır!
           duration: 4000,
         });
         
         // İstifadəçini sistemdən çıxarırıq (Local Storage təmizlənir)
         authStore.logout(); 
         
         // Auth səhifəsinə yönləndiririk
         window.location.href = '/auth';
      }
      
      // Başqa heç bir xəta mesajı göstərmədən səssizcə rədd et
      return Promise.reject(error); 
    }

    // 3. DİGƏR XƏTALAR (500, 400 və s.) ÜÇÜN DAHA PEŞƏKAR MESAJ
    const errorMessage = error.response.data?.message || "Sistemdə müvəqqəti problem var.";
    
    // Eyni xətanın spam olmasının qarşısını almaq üçün ID veririk
    toast.error(errorMessage, { id: 'global-error' });

    return Promise.reject(error);
  }
);

export default api;