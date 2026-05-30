import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react"; 
import { Eye, EyeOff, ArrowLeft, Globe } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/useAuthStore";
import logoImg from "../../public/logo.png"; 
import { GoogleLogin } from '@react-oauth/google';

// --- DİL LÜĞƏTİ (DICTIONARY) ---
const translations = {
  en: {
    signInTitle: "Welcome Back",
    signUpTitle: "Create Account",
    signInDesc: "Enter your details to access the archives.",
    signUpDesc: "Become a member to access bespoke collections.",
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot password?",
    btnSignIn: "Sign In",
    btnSignUp: "Register",
    processing: "Processing...",
    noAccount: "Don't have an account? Create one",
    hasAccount: "Already have an account? Sign in",
    backHome: "Back to Home",
    orContinue: "OR"
  },
  az: {
    signInTitle: "Yenidən Xoş Gəldiniz",
    signUpTitle: "Hesab Yarat",
    signInDesc: "Davam etmək üçün məlumatlarınızı daxil edin.",
    signUpDesc: "E1000 lüks dünyasına qatılın.",
    fullName: "Ad və Soyad",
    email: "E-poçt Ünvanı",
    password: "Şifrə",
    confirmPassword: "Şifrəni Təsdiqlə",
    forgotPassword: "Şifrəni unutmusan?",
    btnSignIn: "Daxil Ol",
    btnSignUp: "Qeydiyyatdan Keç",
    processing: "Gözləyin...",
    noAccount: "Hesabınız yoxdur? Qeydiyyat",
    hasAccount: "Artıq hesabınız var? Giriş",
    backHome: "Ana Səhifə",
    orContinue: "VƏ YA"
  }
};

type LangType = "en" | "az";

export default function AuthPage() {
  const [lang, setLang] = useState<LangType>("en");
  const t = translations[lang];

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthStoreLogin, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate((location.state as any)?.from?.pathname || '/');
    }
  }, [isAuthenticated, navigate, location]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(""); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLogin) {
      if (formData.password.length < 8) {
        setError(lang === "az" ? "Şifrə ən azı 8 simvol olmalıdır." : "Password must be at least 8 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(lang === "az" ? "Şifrələr uyğun gəlmir." : "Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const data = await authService.login({
          email: formData.email,
          password: formData.password,
        });
        setAuthStoreLogin(data);
      } else {
        const data = await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setAuthStoreLogin(data);
      }
      
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Xəta baş verdi / Error occurred");
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

      {/* SOL TƏRƏF: Mərkəzləşdirilmiş Lüks E1000 Loqosu və Brend Yazısı */}
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

      {/* SAĞ TƏRƏF: Auth Forması */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 md:px-16 py-12 relative overflow-y-auto bg-white">
        
        <button 
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-10 left-8 md:left-16 flex items-center gap-2 text-gray-500 hover:text-black font-sans text-xs uppercase font-bold tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t.backHome}
        </button>

        <div className="max-w-md w-full mx-auto space-y-12 mt-16 lg:mt-0">
          
          <div className="flex flex-col items-center justify-center lg:hidden mb-8">
             <img src={logoImg} alt="E1000 Logo" className="w-24 h-24 object-contain mix-blend-multiply mb-4" />
             <h2 className="text-lg font-serif font-bold tracking-[0.2em] uppercase text-[#111]">E1000_ATELIER_BAKU</h2>
             <p className="text-gray-500 font-sans tracking-[0.3em] uppercase text-[8px] mt-1">BREND LEATHER HANDMADE</p>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-serif font-bold tracking-tighter" style={{ fontFamily: "Noto Serif, serif" }}>
              {isLogin ? t.signInTitle : t.signUpTitle}
            </h1>
            <p className="text-gray-500 font-sans text-sm tracking-wide">
              {isLogin ? t.signInDesc : t.signUpDesc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-sans font-black uppercase tracking-widest text-gray-400">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className={inputClasses}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-sans font-black uppercase tracking-widest text-gray-400">
                {t.email}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-sans font-black uppercase tracking-widest text-gray-400">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {isLogin && (
                <div className="text-right pt-2">
                  <Link to="/forgot-password" className="text-gray-500 hover:text-black font-sans text-[10px] uppercase tracking-wide transition-colors">
                    {t.forgotPassword}
                  </Link>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-sans font-black uppercase tracking-widest text-gray-400">
                    {t.confirmPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      className={inputClasses}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                {loading ? t.processing : isLogin ? t.btnSignIn : t.btnSignUp}
              </button>
            </div>
          </form>

          {/* ========================================== */}
          {/* GOOGLE LOGIN BÖLMƏSİ (YENİ ƏLAVƏ)          */}
          {/* ========================================== */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-sans tracking-widest text-[10px] uppercase">
                  {t.orContinue}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    setLoading(true);
                    // Google-dan gələn tokeni Backend-ə atırıq
                    const data = await authService.googleLogin(credentialResponse.credential!);
                    setAuthStoreLogin(data); // Həmişəki kimi store-a yazırıq
                    
                    const from = (location.state as any)?.from?.pathname || "/";
                    navigate(from);
                  } catch (err: any) {
                    console.error(err);
                    setError(lang === "az" ? "Google ilə giriş zamanı xəta baş verdi." : "Error occurred during Google login.");
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError(lang === "az" ? "Google Login pəncərəsi bağlandı və ya xəta verdi." : "Google Login failed or was closed.");
                }}
                useOneTap 
              />
            </div>
          </div>
          {/* ========================================== */}

          <div className="text-center border-t border-gray-200 pt-8 mt-8">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({ name: "", email: "", password: "", confirmPassword: "" });
              }}
              className="text-gray-500 hover:text-black font-sans text-xs tracking-widest uppercase transition-colors"
            >
              {isLogin ? t.noAccount : t.hasAccount}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}