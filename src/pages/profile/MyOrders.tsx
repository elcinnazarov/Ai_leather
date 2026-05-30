import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { orderService } from "../../services/orderService";
import { OrderSummaryResponse, OrderStatus } from "../../types/order";
import { Box, Package, CheckCircle, Clock, XCircle } from "lucide-react";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { useAITranslation } from "../../hooks/useAITranslation";

function OrderListItem({ order, index, t, symbol, navigate, getStatusColorClass, getStatusIcon }: any) {
  const dynModelName = useAITranslation(order.firstProductName);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/profile/orders/${order.orderId}`)}
      className="group bg-white p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:shadow-[0_15px_35px_rgba(39,19,16,0.03)] transition-all duration-300 relative overflow-hidden border-b border-[#f3f3f3] md:border-b-0"
    >
      {/* Subtle side line decorator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#271310] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-4">
          <span className="font-sans font-black text-xs text-[#271310] uppercase tracking-widest">{order.orderNumber}</span>
          <span className={`px-3 py-1 rounded-none text-[9px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 border ${getStatusColorClass(order.status)}`}>
            {getStatusIcon(order.status)}
            {t(`orders.status.${order.status}` as any, order.status)}
          </span>
        </div>
        <div>
          <h3 className="font-serif text-xl text-[#271310]" style={{ fontFamily: "Noto Serif, serif" }}>{dynModelName}</h3>
          {order.itemCount > 1 && (
            <p className="font-sans text-[11px] text-[#6f5a52] mt-1">
              {t(order.itemCount === 2 ? "orders.other_items_one" : "orders.other_items_other", { count: order.itemCount - 1 })}
            </p>
          )}
        </div>
        <div className="font-sans text-[10px] text-[#6f5a52] uppercase tracking-wider flex gap-4">
          <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex items-center justify-between md:flex-col md:items-end gap-2 md:gap-4 md:w-48 text-right">
        <div className="font-serif text-2xl text-[#271310]" style={{ fontFamily: "Noto Serif, serif" }}>
          <span className="text-sm pr-1">{symbol}</span>
          {order.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <span className="font-sans text-[10px] font-bold text-[#6f5a52] uppercase tracking-[0.2em] group-hover:text-[#271310] transition-colors border-b border-transparent group-hover:border-[#271310] pb-0.5">
          {t("orders.view_dossier")}
        </span>
      </div>
    </motion.div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { symbol } = useCurrencyStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Realistically pass page/size as needed
        const data = await orderService.getMyOrders();
        setOrders(data.content || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (status: OrderStatus | string) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock className="w-4 h-4 text-amber-600" />;
      case OrderStatus.PROCESSING: return <Package className="w-4 h-4 text-blue-600" />;
      case OrderStatus.SHIPPED: return <Box className="w-4 h-4 text-indigo-600" />;
      case OrderStatus.DELIVERED: return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case OrderStatus.CANCELLED: return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColorClass = (status: OrderStatus | string) => {
    switch (status) {
      case OrderStatus.PENDING: return "bg-amber-50 text-amber-800 border-amber-200";
      case OrderStatus.PROCESSING: return "bg-blue-50 text-blue-800 border-blue-200";
      case OrderStatus.SHIPPED: return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case OrderStatus.DELIVERED: return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case OrderStatus.CANCELLED: return "bg-red-50 text-red-800 border-red-200";
      default: return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center pt-32">
        <div className="animate-pulse font-sans text-xs uppercase tracking-widest text-[#6f5a52]">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] selection:bg-[#fadcd2] selection:text-[#271310] pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        
        <header className="mb-20">
          <span className="text-[#6f5a52] font-sans uppercase tracking-[0.2em] text-[10px] mb-4 block">{t("orders.title")}</span>
          <h1 className="font-serif text-5xl text-[#271310] leading-none tracking-tight" style={{ fontFamily: "Noto Serif, serif" }}>{t("orders.my_acquisitions")}</h1>
        </header>

        {orders.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#d3c3c0] bg-white">
            <h3 className="font-serif text-2xl text-[#271310] italic mb-2" style={{ fontFamily: "Noto Serif, serif" }}>{t("orders.no_orders")}</h3>
            <p className="text-sm font-sans text-[#6f5a52] mb-8">{t("orders.explore_msg")}</p>
            <button 
              onClick={() => navigate("/materials")}
              className="text-[#271310] font-sans font-black text-[10px] uppercase tracking-[0.3em] border-b border-[#271310] hover:text-[#6f5a52] hover:border-[#6f5a52] transition-colors pb-1"
            >
              {t("orders.explore_btn")}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <OrderListItem 
                key={order.orderId}
                order={order}
                index={index}
                t={t}
                symbol={symbol}
                navigate={navigate}
                getStatusColorClass={getStatusColorClass}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
