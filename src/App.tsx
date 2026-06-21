/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

// Store
import { useAuthStore } from "./store/useAuthStore";

// Components & Layouts
import AdminLayout from "./components/AdminLayout";
import ShopLayout from "./components/ShopLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import CartDrawer from "./components/CartDrawer";

// Pages - Shop
import ProductCatalog from "./components/ProductCatalog";
import ProductDetail from "./components/ProductDetail";
import LeatherCatalog from "./components/LeatherCatalog";
import LeatherProfile from "./components/LeatherProfile";
import LeatherGradeCatalog from "./components/LeatherGradeCatalog";
import LeatherGradeProfile from "./components/LeatherGradeProfile";
import AboutUs from "./pages/AboutUs";

// Pages - Auth
import AuthPage from "./pages/auth/AuthPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Pages - Profile & Checkout
import CheckoutPage from "./pages/checkout/CheckoutPage";
import MyOrders from "./pages/profile/MyOrders";
import OrderDetail from "./pages/profile/OrderDetail";

// === LÜKS ADMİN SƏHİFƏLƏRİ ===
import AdminProductGallery from "./pages/auth/admin/AdminProductGallery";
import AdminProductCreate from "./pages/auth/admin/AdminProductCreate";
import AdminProductStudio from "./pages/auth/admin/AdminProductStudio";
import AdminLeathersList from "./pages/auth/admin/AdminLeathersList";
import AdminLeatherForm from "./pages/auth/admin/AdminLeatherForm";

// === KÖHNƏ ADMİN KOMPONENTLƏRİ ===
import OrderList from "./components/OrderList";
import OrderDetails from "./components/OrderDetails";
import PricingRuleList from "./components/PricingRuleList";
import PricingRuleForm from "./components/PricingRuleForm";
import GlobalPriceList from "./components/GlobalPriceList";
import ShippingLocationList from "./components/ShippingLocationList";
import ShippingLocationForm from "./components/ShippingLocationForm";

// Services
import { leatherService } from "./services/leatherService";
import { productService } from "./services/productService";
import { pricingService } from "./services/pricingService";
import { shippingService } from "./services/shippingService";
import { adminLeatherService } from "./services/adminLeatherService";

// Types
import { 
  ProductModelResponse, 
  PricingRuleResponse, 
  Currency,
  CreateShippingLocationRequest,
  UpdateShippingLocationRequest
} from "./types";

function AppRoutes() {
  // DİQQƏT: Bura 'any[]' edildi ki, TypeScript xəta verməsin və Vite işləsin!
  const [leathers, setLeathers] = useState<any[]>([]);
  const [products, setProducts] = useState<ProductModelResponse[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleResponse[]>([]);
  
  const [selectedPricingRule, setSelectedPricingRule] = useState<PricingRuleResponse | null>(null);
  const [selectedShippingLocation, setSelectedShippingLocation] = useState<any | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore(); 

  const fetchLeathers = async () => {
    try {
      const data = await leatherService.getAllLeathers();
      // DİQQƏT: 'as any' əlavə edildi
      setLeathers((data as any) || []);
    } catch (error) {
      console.error("Dərilər yüklənərkən xəta:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Məhsullar yüklənərkən xəta:", error);
    }
  };

  const fetchPricingRules = async () => {
    try {
      const data = await pricingService.getAllPricingRules(false);
      setPricingRules(data || []);
    } catch (error) {
      console.error("Qiymət qaydaları yüklənərkən xəta:", error);
    }
  };

  useEffect(() => {
    fetchPricingRules();
  }, []);

  const handleCreateLeather = async (formData: any, image: File) => {
    try {
      if (!image) {
        toast.error("Şəkil mütləqdir!");
        return;
      }
      await adminLeatherService.createLeather(formData, image);
      toast.success("Yeni lüks dəri uğurla əlavə edildi");
      await fetchLeathers();
      navigate("/admin/leathers");
    } catch (error) {
      toast.error("Dəri əlavə edilərkən xəta baş verdi");
    }
  };

  const handleCreatePricingRule = async (data: any) => {
    try {
      await pricingService.createPricingRule(data);
      toast.success("Qiymət qaydası yaradıldı");
      fetchPricingRules();
    } catch (error) {
      toast.error("Qayda yaradıla bilmədi");
    }
  };

  const handleUpdatePricingRule = async (data: any) => {
    if (!selectedPricingRule) return;
    try {
      await pricingService.updatePricingRule(selectedPricingRule.targetCurrency, data);
      toast.success("Qiymət qaydası yeniləndi");
      fetchPricingRules();
    } catch (error) {
      toast.error("Qayda yenilənə bilmədi");
    }
  };

  const handleDeletePricingRule = async (currency: Currency) => {
    if (!window.confirm(`${currency} üçün olan qiymət qaydasını silmək istəyirsiniz?`)) return;
    try {
      await pricingService.deletePricingRule(currency);
      toast.success("Qiymət qaydası silindi");
      fetchPricingRules();
    } catch (error) {
      toast.error("Qayda silinə bilmədi");
    }
  };

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/" element={<ShopLayout cartCount={0}><ProductCatalog /></ShopLayout>} />
      <Route path="/product/:id" element={<ShopLayout cartCount={0}><ProductDetail /></ShopLayout>} />
      <Route path="/materials" element={<ShopLayout cartCount={0}><LeatherCatalog /></ShopLayout>} />
      <Route path="/materials/:id" element={<ShopLayout cartCount={0}><LeatherProfile /></ShopLayout>} />
      <Route path="/grades" element={<ShopLayout cartCount={0}><LeatherGradeCatalog /></ShopLayout>} />
      <Route path="/grades/:id" element={<ShopLayout cartCount={0}><LeatherGradeProfile /></ShopLayout>} />
      <Route path="/about" element={<ShopLayout cartCount={0}><AboutUs /></ShopLayout>} />

      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<ShopLayout cartCount={0}><CheckoutPage /></ShopLayout>} />
        <Route path="/profile/orders" element={<ShopLayout cartCount={0}><MyOrders /></ShopLayout>} />
        <Route path="/profile/orders/:id" element={<ShopLayout cartCount={0}><OrderDetail /></ShopLayout>} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="products" replace />} />
          
          <Route path="products" element={<AdminProductGallery />} />
          <Route path="products/new" element={<AdminProductCreate />} />
          <Route path="products/:id" element={<AdminProductStudio />} />
          
          <Route path="leathers" element={<AdminLeathersList />} />
          <Route path="leathers/new" element={<AdminLeatherForm />} />
          <Route path="leathers/edit/:id" element={<AdminLeatherForm />} />

          <Route path="price_master" element={<GlobalPriceList />} />
          
          <Route path="pricing" element={
            <PricingRuleList 
              rules={pricingRules} 
              onEdit={(r) => { setSelectedPricingRule(r); navigate("/admin/pricing/edit"); }} 
              onDelete={handleDeletePricingRule} 
              onCreate={() => navigate("/admin/pricing/new")} 
            />
          } />
          
          <Route path="pricing/new" element={
            <PricingRuleForm 
              onSubmit={async (d: any) => { await handleCreatePricingRule(d); navigate("/admin/pricing"); }} 
              onCancel={() => navigate("/admin/pricing")} 
            />
          } />
          
          <Route path="pricing/edit" element={
            <PricingRuleForm 
              rule={selectedPricingRule || undefined} 
              onSubmit={async (d: any) => { await handleUpdatePricingRule(d); navigate("/admin/pricing"); }} 
              onCancel={() => navigate("/admin/pricing")} 
            />
          } />

          <Route path="shipping" element={<ShippingLocationList />} />
          <Route path="shipping/new" element={<ShippingLocationForm />} />
          <Route path="shipping/:id/edit" element={<ShippingLocationForm />} />

          <Route path="orders" element={
            <OrderList onViewOrder={(id) => { setSelectedOrderId(id); navigate("/admin/orders/details"); }} />
          } />
          
          <Route path="orders/details" element={
            selectedOrderId ? <OrderDetails orderId={selectedOrderId} onBack={() => navigate("/admin/orders")} /> : <Navigate to="/admin/orders" replace />
          } />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <CartDrawer />
      <AppRoutes />
    </>
  );
}