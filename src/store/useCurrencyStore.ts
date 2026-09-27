import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrencyForIsoCode, getCurrencySymbol } from '../lib/currencyMapper';

interface CurrencyState {
  currency: string;
  symbol: string;
  region: string;
  isInitialized: boolean;
  setCurrencyData: (currency: string, symbol: string, region: string) => void;
  initializeGeoCurrency: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'AZN', 
      symbol: '₼',
      region: 'Azerbaijan',
      isInitialized: false,
      setCurrencyData: (currency, symbol, region) => set({ currency, symbol, region }),
      initializeGeoCurrency: async () => {
        // 1. Əgər yaddaşda (localStorage) artıq varsa, heç bir sorğu atmır (0 ms)
        if (get().isInitialized) return;

        // 2. Maksimum 2 saniyəlik timeout (ipapi.co gecikərsə saytı ləngitməsin)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        try {
          const response = await fetch('https://ipapi.co/json/', {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`GeoIP status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data && data.country && !data.error) {
            const currency = getCurrencyForIsoCode(data.country);
            const symbol = getCurrencySymbol(currency);
            set({
              currency,
              symbol,
              region: data.country_name || data.country,
              isInitialized: true
            });
          } else {
            // Əgər limit bitibsə və ya xəta varsa, yenə də isInitialized: true edirik ki,
            // hər səhifə açılanda təkrar ipapi-yə sorğu atıb saytı dondurmasın
            set({ isInitialized: true });
          }
        } catch (error) {
          // Xəta və ya timeout olduqda susmaya görə AZN saxlayır və təkrar sorğunu dayandırır
          console.warn("GeoIP parse failed, fallback to default AZN:", error);
          set({ isInitialized: true });
        }
      }
    }),
    {
      name: 'currency-storage',
    }
  )
);