import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { orderService } from "../../services/orderService";
import { OrderSummaryResponse, OrderStatus } from "../../types/order";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { getCurrencySymbol } from "../../lib/currencyMapper";
import { useTranslation } from "react-i18next";
import { ArrowRight, Archive } from "lucide-react";
import { toast } from "react-hot-toast";

// ✅ Sifarişin öz valyutasına uyğun simvolu təyin edən köməkçi funksiya
const resolveOrderSymbol = (currency?: string, defaultSymbol: string = "₼") => {
  if (!currency) return defaultSymbol;
  try {
    return getCurrencySymbol(currency as any) || (currency === "USD" ? "$" : currency === "EUR" ? "€" : "₼");
  } catch {
    return currency === "USD" ? "$" : currency === "EUR" ? "€" : "₼";
  }
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { symbol: globalSymbol } = useCurrencyStore();
  const { t, i18n } = useTranslation();

  // Ödəniş nəticəsini URL-dən tutub Toast çıxarmaq
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");

    if (paymentStatus) {
      if (paymentStatus === "success") {
        toast.success(t("payment.success", "Payment successfully!"));
      } else if (paymentStatus === "cancel") {
        toast.error(t("payment.cancel", "Payment cancelled"));
      } else if (paymentStatus === "decline") {
        toast.error(t("payment.decline", "Please try again"));
      }

      navigate("/profile/orders", { replace: true });
    }
  }, [searchParams, navigate, t]);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (pageNumber: number) => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders(pageNumber, 10);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.SHIPPED:
      case OrderStatus.COMPLETED:
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case OrderStatus.CANCELLED:
        return "text-red-800 bg-red-50 border-red-200";
      case OrderStatus.PAID:
        return "text-emerald-800 bg-emerald-100 border-emerald-300";
      case OrderStatus.PENDING:
      case OrderStatus.MANUFACTURING:
      default:
        return "text-[#271310] bg-[#f3f3f3] border-[#d3c3c0]";
    }
  };

  if (loading && page === 0) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center pt-32">
        <div className="animate-pulse font-sans text-xs uppercase tracking-[0.3em] text-[#6f5a52]">
          {t("orders.loading_archive", "Accessing Archives...")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] selection:bg-[#fadcd2] selection:text-[#271310] pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <header className="mb-16 border-b border-[#d3c3c0]/50 pb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-[#6f5a52] font-sans uppercase tracking-[0.2em] text-[10px] mb-4 block">
              {t("orders.client_portal", "Client Portal")}
            </span>
            <h1 className="font-serif text-5xl text-[#271310] leading-none" style={{ fontFamily: "Noto Serif, serif" }}>
              {t("orders.my_records", "Order Archives")}
            </h1>
          </div>
          <div className="text-[#6f5a52] font-sans text-[10px] uppercase tracking-widest flex items-center gap-2">
            <Archive className="w-4 h-4" />
            <span>{orders.length} {t("orders.records_found", "Records")}</span>
          </div>
        </header>

        {orders.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <Archive className="w-12 h-12 mb-6 text-[#d3c3c0]" />
            <h3 className="font-serif text-2xl text-[#271310] mb-2" style={{ fontFamily: "Noto Serif, serif" }}>
              {t("orders.no_orders", "No records found.")}
            </h3>
            <button 
              onClick={() => navigate("/")}
              className="border-b border-[#271310] pb-1 text-[#271310] font-sans text-[10px] uppercase tracking-[0.2em] cursor-pointer"
            >
              {t("orders.start_journey", "Begin a Commission")}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              // ✅ HƏR SİFARİŞİN ÖZ VALYUTA SİMBOLU HESABLANIR:
              const currentOrderSymbol = resolveOrderSymbol(order.currency as any, globalSymbol);

              return (
                <motion.div 
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/profile/orders/${order.orderId}`)}
                  className="group cursor-pointer bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-transparent hover:border-[#d3c3c0] shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="font-serif text-2xl text-[#271310]" style={{ fontFamily: "Noto Serif, serif" }}>
                        {order.orderNumber}
                      </span>
                      <span className={`px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                        {t(`orders.status.${order.status}` as any, order.status)}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#6f5a52]">
                      {new Date(order.createdAt).toLocaleDateString(i18n.language === 'az' ? 'az-AZ' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} 
                      <span className="mx-2 opacity-30">|</span> 
                      {order.itemCount} {t("orders.items", "Items")}
                      {order.firstProductName && (
                        <span className="italic ml-2 text-[#a89692]">({order.firstProductName}{order.itemCount > 1 ? ', ...' : ''})</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-8 border-t border-[#f3f3f3] md:border-0 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="font-sans text-[9px] uppercase tracking-widest text-[#d3c3c0] mb-1">{t("orders.settled", "Settled")}</p>
                      {/* ✅ DÜZƏLİŞ: Sifarişin öz valyutası göstərilir */}
                      <p className="font-serif text-xl text-[#271310]" style={{ fontFamily: "Noto Serif, serif" }}>
                        {currentOrderSymbol} {order.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#f9f9f9] group-hover:bg-[#271310] flex items-center justify-center transition-colors duration-300">
                      <ArrowRight className="w-4 h-4 text-[#271310] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-8">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#6f5a52] hover:text-[#271310] disabled:opacity-30 transition-colors cursor-pointer"
            >
              {t("common.previous", "Previous")}
            </button>
            <span className="font-serif italic text-sm text-[#a89692]" style={{ fontFamily: "Noto Serif, serif" }}>
              {page + 1} / {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#6f5a52] hover:text-[#271310] disabled:opacity-30 transition-colors cursor-pointer"
            >
              {t("common.next", "Next")}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}