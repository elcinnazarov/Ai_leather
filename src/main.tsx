import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // CSS faylının adı fərqlidirsə, özündəki kimi saxla
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

// 1️⃣ .env FAYLINDAN GOOGLE ID-ni OXUYURUK (Vite üsulu ilə)
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 2️⃣ BÜTÜN APP-i GOOGLE PROVIDER İLƏ BÜRÜYÜRÜK */}
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)