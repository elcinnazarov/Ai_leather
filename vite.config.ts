import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // 1. Portu 3000-ə sabitləyirik
      port: 3000,
      
      // 2. HMR ayarı
      hmr: process.env.DISABLE_HMR !== 'true',

      // 3. PROXY - Tomcat xətasından təmizlənmiş körpü
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          
          // ƏN CRITICAL HİSSƏ: Tomcat-in TCP buferinin dondurulmasının qarşısını alır.
          // Hər dev sorğusundan sonra tuneli təmizləyir.
          headers: {
            'Connection': 'close'
          },
          
          // Sorğu arxaya getməzdən əvvəl zibilli başlıqları yolda təmizləyən filtr
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              // Tomcat-i çaşdıran Node.js daxili başlıqlarını bloklayırıq
              proxyReq.removeHeader('keep-alive');
            });
            proxy.on('error', (err, _req, _res) => {
              console.error('Proxy xətası:', err);
            });
          }
        }
      }
    },
  };
});