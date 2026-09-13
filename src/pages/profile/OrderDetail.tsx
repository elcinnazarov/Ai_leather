import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { orderService } from "../../services/orderService";
import { OrderDetailResponse, OrderStatus } from "../../types/order";
import { ArrowLeft, FileText, MapPin, Truck, Copy, Check, ArrowRightLeft } from "lucide-react";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { getCurrencySymbol } from "../../lib/currencyMapper";
import { useTranslation } from "react-i18next";
import { useAITranslation } from "../../lib/hooks/useAITranslation";
import CheckoutPaymentButton from "../../payment/handlePaymentRedirect";
import { toast } from "react-hot-toast";

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.70,
  EUR: 1.9765,
};

function OrderItemInfo({ item, symbol }: { item: any; symbol: string }) {
  const dynModelName = useAITranslation(item.productModelName);
  const dynLeatherName = useAITranslation(item.leatherName);
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row gap-8 bg-white p-6 shadow-sm border-b border-[#f3f3f3] sm:border-0"
    >
      <div className="w-32 h-44 bg-[#f9f9f9] overflow-hidden flex-shrink-0 relative">
        <img
          src={
            item.renderImageUrl ||
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400"
          }
          alt={dynModelName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between py-2">
        <div>
          <h4 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#271310] mb-2 font-bold">
            {dynModelName}
          </h4>
          <p
            className="font-serif text-sm text-[#6f5a52] italic mb-6"
            style={{ fontFamily: "Noto Serif, serif" }}
          >
            {dynLeatherName}
          </p>
        </div>
        <div className="flex justify-between items-end border-t border-[#f3f3f3] pt-4">
          <span className="font-sans text-[10px] font-bold text-[#6f5a52] uppercase tracking-[0.2em]">
            {t("orders.items", "Məhsullar")} {item.quantity}
          </span>
          <div className="text-right">
            <p className="font-sans text-[10px] text-[#d3c3c0] mb-1">
              {symbol}{" "}
              {item.unitPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p
              className="font-serif text-xl text-[#271310]"
              style={{ fontFamily: "Noto Serif, serif" }}
            >
              {symbol}{" "}
              {item.totalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const { symbol: globalSymbol } = useCurrencyStore();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await orderService.getMyOrderDetail(parseInt(id));
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        toast.error(t("orders.detailError", "Sifariş detalı yüklənərkən xəta baş verdi"));
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, t]);

  const orderSymbol = useMemo(() => {
    if (!order?.currency) return globalSymbol;
    try {
      return getCurrencySymbol(order.currency as any) || (order.currency === "USD" ? "$" : order.currency === "EUR" ? "€" : "₼");
    } catch {
      return order.currency === "USD" ? "$" : order.currency === "EUR" ? "€" : "₼";
    }
  }, [order?.currency, globalSymbol]);

  // ✅ AZN qarşılığı
  const approxAznAmount = useMemo(() => {
    if (!order?.finalPrice || order.currency === "AZN") return null;
    const rate = EXCHANGE_RATES[order.currency as string] || 1.70;
    return (order.finalPrice * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [order?.finalPrice, order?.currency]);

  const handleCancel = async () => {
    if (!order || !id) return;
    if (!window.confirm(t("orders.cancelConfirm", "Bu sifarişi ləğv etmək istədiyinizə əminsiniz?"))) {
      return;
    }

    try {
      setCancelling(true);
      const updatedOrder = await orderService.cancelOrder(parseInt(id));
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: updatedOrder.status,
              paymentStatus: updatedOrder.paymentStatus,
            }
          : null
      );
      toast.success(t("orders.cancelSuccess", "Sifariş ləğv edildi"));
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error(t("orders.cancelError", "Sifarişi ləğv edərkən xəta baş verdi"));
    } finally {
      setCancelling(false);
    }
  };

  const copyTrackingNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t("orders.tracking_copied", "İzləmə nömrəsi kopyalandı"));
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center pt-32">
        <div className="animate-pulse font-sans text-xs uppercase tracking-[0.3em] text-[#6f5a52]">
          {t("orders.loading_archive", "Sənədlər yüklənir...")}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center pt-32 space-y-6">
        <h2
          className="font-serif text-3xl text-[#271310]"
          style={{ fontFamily: "Noto Serif, serif" }}
        >
          {t("orders.no_orders", "Heç bir qeyd tapılmadı.")}
        </h2>
        <button
          onClick={() => navigate("/profile/orders")}
          className="text-[#271310] font-sans text-[10px] uppercase tracking-[0.3em] hover:opacity-50 transition-opacity border-b border-[#271310] pb-1 cursor-pointer"
        >
          {t("orders.back_to_records", "Arxivə Qayıt")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] selection:bg-[#fadcd2] selection:text-[#271310] pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        {/* Top Nav */}
        <button
          onClick={() => navigate("/profile/orders")}
          className="group flex items-center gap-3 text-[#6f5a52] hover:text-[#271310] transition-colors mb-12 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
            {t("orders.back_to_records", "Arxivə Qayıt")}
          </span>
        </button>

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-[#d3c3c0]/50 pb-10">
          <div>
            <span className="text-[#6f5a52] font-sans uppercase tracking-[0.2em] text-[10px] mb-4 block">
              {t("orders.dossier", "Sifariş Dosyesi")}
            </span>
            <h1
              className="font-serif text-5xl text-[#271310] leading-none mb-6"
              style={{ fontFamily: "Noto Serif, serif" }}
            >
              {order.orderNumber}
            </h1>
            <div className="flex flex-wrap gap-4">
              <span
                className={`px-4 py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-none inline-flex items-center gap-2 ${
                  order.status === OrderStatus.CANCELLED
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-[#271310] text-white"
                }`}
              >
                {t("orders.status_label", "Status")}:{" "}
                {t(`orders.status.${order.status}` as any, order.status)}
              </span>
              <span className="px-4 py-2 bg-white border border-[#d3c3c0] text-[10px] font-sans font-bold uppercase tracking-wider text-[#6f5a52] inline-flex items-center gap-2">
                {t("orders.type", "Tip")}: {order.orderType}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#6f5a52] mb-1">
              {t("orders.placed_on", "Sifariş Tarixi")}
            </p>
            <p
              className="font-serif text-xl text-[#271310]"
              style={{ fontFamily: "Noto Serif, serif" }}
            >
              {new Date(order.createdAt).toLocaleDateString(
                t("orders.date_locale", "az-AZ") as string,
                { day: "2-digit", month: "long", year: "numeric" }
              )}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24">
          {/* Left Col: Manifest */}
          <div className="lg:col-span-2 space-y-12">
            <h3
              className="font-serif text-2xl text-[#271310] italic"
              style={{ fontFamily: "Noto Serif, serif" }}
            >
              {t("orders.manifest", "Məhsul Siyahısı")}
            </h3>

            <div className="space-y-8">
              {order.items.map((item) => (
                <OrderItemInfo key={item.orderItemId || item.orderItemId} item={item} symbol={orderSymbol} />
              ))}
            </div>

            {/* Withdraw Action */}
            <AnimatePresence>
              {order.status === OrderStatus.PENDING && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-10 overflow-hidden"
                >
                  <div className="bg-[#fcf8f8] p-8 border-l border-red-900/20">
                    <h4
                      className="font-serif text-lg text-red-900 mb-2"
                      style={{ fontFamily: "Noto Serif, serif" }}
                    >
                      {t("orders.modify_request", "Dəyişiklik Sorğusu")}
                    </h4>
                    <p className="font-sans text-sm text-red-900/70 mb-6 leading-relaxed max-w-lg">
                      {t(
                        "orders.cancel_desc",
                        "Sifarişiniz təsdiq gözləyir. Fikrinizi dəyişmisinizsə, sifarişi indi ləğv edə bilərsiniz."
                      )}
                    </p>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="bg-transparent border-b border-red-900/30 text-red-900 px-0 pb-1 font-sans text-[10px] uppercase font-black tracking-widest hover:border-red-900 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {cancelling
                        ? t("orders.withdrawing", "Ləğv edilir...")
                        : t("orders.withdraw", "Sifarişi Ləğv Et")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Col: Ledger & Logistics */}
          <div className="space-y-12">
            {/* The Ledger */}
            <section className="bg-white p-10 shadow-[0_20px_40px_rgba(39,19,16,0.03)] selection:bg-[#271310] selection:text-white">
              <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#6f5a52] mb-8 flex items-center gap-2">
                <FileText className="w-3 h-3" /> {t("orders.ledger", "Hesabat")}
              </h3>

              <div className="space-y-6 mb-8 text-sm font-sans">
                <div className="flex justify-between text-[#6f5a52]">
                  <span>{t("orders.subtotal", "Məbləğ")}</span>
                  <span className="text-[#271310]">
                    {orderSymbol}{" "}
                    {order.subTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-[#6f5a52]">
                  <span>{t("orders.shipping", "Çatdırılma")}</span>
                  <span className="text-[#271310]">
                    {orderSymbol}{" "}
                    {order.shippingFee.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#d3c3c0] pt-6 flex justify-between items-end mb-6">
                <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-[#271310]">
                  {t("orders.total_settled", "Yekun Ödəniş")}
                </span>
                <span
                  className="font-serif text-3xl text-[#271310]"
                  style={{ fontFamily: "Noto Serif, serif" }}
                >
                  <span className="text-xl pr-1">{orderSymbol}</span>
                  {order.finalPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="bg-[#f9f9f9] p-4 text-center">
                <span
                  className={`font-sans text-[10px] uppercase tracking-widest font-black ${
                    order.paymentStatus === "SUCCESS"
                      ? "text-emerald-700"
                      : "text-[#271310]"
                  }`}
                >
                  {t("orders.paymentStatus", "Ödəniş")}:{" "}
                  {t(
                    `orders.paymentStatus.${order.paymentStatus}` as any,
                    order.paymentStatus
                  )}
                </span>
              </div>

              {/* 🔴 Ödəniş Düyməsinin Üzərində Qırmızı Valyuta Bildirişi */}
              {order.status === OrderStatus.PENDING && order.paymentStatus !== "SUCCESS" && (
                <div className="mt-6 border-t border-[#d3c3c0] pt-6 space-y-3">
                  {approxAznAmount && (
                    <div className="p-3 bg-red-50/90 border border-red-200/90 rounded text-red-700 font-sans">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <span className="text-xs font-bold tracking-wider">
                          {order.finalPrice.toFixed(2)} {order.currency} ➔ ~{approxAznAmount} AZN
                        </span>
                      </div>
                      <p className="text-[10px] text-red-600/90 leading-relaxed">
                        {t("checkout.currency_conversion_note", "Ödəniş AZN ilə icra olunacaq. Bankınız konvertasiyanı avtomatik edəcək.")}
                      </p>
                    </div>
                  )}

                  <div className="w-full">
                    <CheckoutPaymentButton orderId={parseInt(id!)} />
                  </div>
                </div>
              )}
            </section>

            {/* Logistics & Shipment */}
            <section className="bg-white p-10 shadow-[0_20px_40px_rgba(39,19,16,0.03)]">
              <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#6f5a52] mb-8 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {t("orders.logistics", "Logistika")}
              </h3>

              <div className="space-y-6">
                {(order.trackingNumber || order.carrierName) && (
                  <div className="border-b border-[#f3f3f3] pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-3.5 h-3.5 text-[#6f5a52]" />
                      <p className="font-sans text-[9px] uppercase tracking-widest text-[#d3c3c0]">
                        {t("orders.carrier", "Kuryer / Daşıyıcı")}
                      </p>
                    </div>
                    <p
                      className="font-serif text-lg text-[#271310]"
                      style={{ fontFamily: "Noto Serif, serif" }}
                    >
                      {order.carrierName || t("orders.courier_dispatch", "Kuryer Çatdırılması")}
                    </p>

                    {order.trackingNumber && (
                      <div className="mt-3 flex items-center justify-between bg-[#f9f9f9] p-3 border border-[#f3f3f3]">
                        <div>
                          <p className="font-sans text-[8px] uppercase tracking-widest text-[#a89692]">
                            {t("orders.tracking_number", "İzləmə Nömrəsi")}
                          </p>
                          <p className="font-mono text-xs font-bold text-[#271310] tracking-wider">
                            {order.trackingNumber}
                          </p>
                        </div>
                        <button
                          onClick={() => copyTrackingNumber(order.trackingNumber!)}
                          className="p-1.5 hover:bg-white text-[#6f5a52] hover:text-[#271310] transition-colors cursor-pointer"
                          title={t("orders.tracking_number", "Kopyala")}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Destination */}
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-widest text-[#d3c3c0] mb-2">
                    {t("orders.destination", "Təyinat")}
                  </p>
                  <p
                    className="font-serif text-lg text-[#271310] leading-relaxed"
                    style={{ fontFamily: "Noto Serif, serif" }}
                  >
                    {order.deliveryAddress}
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-widest text-[#d3c3c0] mb-2">
                    {t("orders.contact", "Əlaqə")}
                  </p>
                  <p className="font-sans text-sm text-[#271310]">
                    {order.customerPhone || "—"}
                  </p>
                  <p className="font-sans text-sm text-[#271310]">
                    {order.customerEmail || "—"}
                  </p>
                </div>

                {/* Concierge Notes */}
                {order.notes && (
                  <div>
                    <p className="font-sans text-[9px] uppercase tracking-widest text-[#d3c3c0] mb-2">
                      {t("orders.concierge_notes", "Xüsusi Qeyd")}
                    </p>
                    <p className="font-sans text-sm text-[#6f5a52] italic">
                      "{order.notes}"
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}