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
        if (get().isInitialized) return;
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          if (data && data.country) {
            const currency = getCurrencyForIsoCode(data.country);
            const symbol = getCurrencySymbol(currency);
            set({
              currency,
              symbol,
              region: data.country_name || data.country,
              isInitialized: true
            });
          }
        } catch (error) {
          console.error("GeoIP parse failed:", error);
          set({ isInitialized: true });
        }
      }
    }),
    {
      name: 'currency-storage',
    }
  )
);

