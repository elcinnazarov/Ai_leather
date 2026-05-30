import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Globe, CheckCircle2 } from "lucide-react";
import { api } from '../../lib/api'; // Backend əlaqəsi qorunub
import logoImg from "../../public/logo.png"; // Loqonun yolu eyni qəbul edilib

// --- DİL LÜĞƏTİ (DICTIONARY) ---
const translations = {
  en: {
    title: "Reset Password",
    desc: "Enter your email to receive reset instructions.",
    email: "Email Address",
    btnSend: "Send Instructions",
    processing: "Sending...",
    backToLogin: "Back to Login",
    successTitle: "Check Your Email",
    successDesc: "If an account exists with this email, you will receive password reset instructions shortly."
  },
  az: {
    title: "Şifrəni Yenilə",
    desc: "Yeniləmə təlimatlarını almaq üçün e-poçtunuzu daxil edin.",
    email: "E-poçt Ünvanı",
    btnSend: "Təlimatları Göndər",
    processing: "Göndərilir...",
    backToLogin: "Girişə Qayıt",
    successTitle: "E-poçtunuzu Yoxlayın",
    successDesc: "Əgər bu e-poçtla bağlı hesab varsa, tezliklə şifrə yeniləmə təlimatlarını alacaqsınız."
  }
};

type LangType = "en" | "az";

export default function ForgotPassword() {
  const [lang, setLang] = useState<LangType>("en");
  const t = translations[lang];

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // MƏNTİQ DƏYİŞMƏYİB: API Sorğusu eynilə qalır
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccess(response.data?.message || (lang === 'az' ? 'Şifrə yeniləmə təlimatları e-poçtunuza göndərildi.' : 'Password reset instructions have been sent to your email.'));
    } catch (err: any) {
      setError(err.response?.data?.message || (lang === 'az' ? 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.' : 'An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full border-0 border-b border-gray-300 rounded-none bg-transparent px-0 py-3 text-sm font-sans focus:ring-0 focus:border-black transition-colors";

  return (
    <div className="min-h-screen flex bg-white text-black relative">
      
      {/* 🌍 DİL SEÇİMİ (Sağ Üst Künc) */}
      <div className="absolute top-8 right-8 md:right-16 z-50 flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
        <Globe className="w-4 h-4 text-gray-500" />
        <button 
          type="button"
          onClick={() => setLang("en")}
          className={`text-xs font-bold tracking-widest ${lang === "en" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
        >
          EN
        </button>
        <span className="text-gray-300">|</span>
        <button 
          type="button"
          onClick={() => setLang("az")}
          className={`text-xs font-bold tracking-widest ${lang === "az" ? "text-black" : "text-gray-400 hover:text-gray-600"}`}
        >
          AZ
        </button>
      </div>

      {/* SOL TƏRƏF: E1000 Brendinqi */}
      <div className="hidden lg:flex lg:w-3/5 bg-[#FAF9F6] items-center justify-center relative overflow-hidden border-r border-gray-200">
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          src={logoImg} 
          alt="E1000 Leather Atelier"
          className="w-1/2 max-w-md object-contain mix-blend-multiply opacity-90"
        />
        <div className="absolute bottom-16 w-full flex flex-col items-center">
          <h2 className="text-2xl font-serif font-bold tracking-[0.2em] uppercase text-[#111]">
            E1000_ATELIER_BAKU
          </h2>
          <p className="text-gray-500 font-sans tracking-[0.4em] uppercase text-[10px] mt-3">
            BREND LEATHER HANDMADE
          </p>
        </div>
      </div>

      {/* SAĞ TƏRƏF: Forma */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 md:px-16 py-12 relative overflow-y-auto bg-white">
        
        {/* Geri Qayıt Düyməsi */}
        <button 
          type="button"
          onClick={() => navigate("/auth")}
          className="absolute top-10 left-8 md:left-16 flex items-center gap-2 text-gray-500 hover:text-black font-sans text-xs uppercase font-bold tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t.backToLogin}
        </button>

        <div className="max-w-md w-full mx-auto mt-16 lg:mt-0">
          
          <div className="flex flex-col items-center justify-center lg:hidden mb-8">
             <img src={logoImg} alt="E1000 Logo" className="w-24 h-24 object-contain mix-blend-multiply mb-4" />
             <h2 className="text-lg font-serif font-bold tracking-[0.2em] uppercase text-[#111]">E1000_ATELIER_BAKU</h2>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              /* UĞURLU GÖNDƏRİŞ EKRANI */
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="flex justify-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500" strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl font-serif font-bold tracking-tighter" style={{ fontFamily: "Noto Serif, serif" }}>
                  {t.successTitle}
                </h1>
                <p className="text-gray-500 font-sans text-sm tracking-wide leading-relaxed">
                  {t.successDesc}
                </p>
                <div className="pt-8">
                  <Link 
                    to="/auth"
                    className="inline-block w-full bg-[#111] text-white px-8 py-4 text-xs font-sans font-black uppercase tracking-widest hover:bg-black transition-colors rounded-xl shadow-lg"
                  >
                    {t.backToLogin}
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* FORM EKRANI */
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h1 className="text-3xl font-serif font-bold tracking-tighter" style={{ fontFamily: "Noto Serif, serif" }}>
                    {t.title}
                  </h1>
                  <p className="text-gray-500 font-sans text-sm tracking-wide">
                    {t.desc}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-sans font-black uppercase tracking-widest text-gray-400">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required
                      placeholder="example@mail.com"
                      className={inputClasses}
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-600 text-xs font-sans tracking-wide"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#111] text-white px-8 py-4 text-xs font-sans font-black uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 rounded-xl shadow-lg"
                    >
                      {loading ? t.processing : t.btnSend}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}