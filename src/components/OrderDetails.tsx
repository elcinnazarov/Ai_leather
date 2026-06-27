import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Package, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Settings,
  FileText,
  DollarSign,
  Tag,
  RefreshCw,
  X,
  ZoomIn
} from "lucide-react";
import { 
  AdminOrderDetailResponse, 
  OrderStatus, 
  PaymentStatus, 
  DesignProcessStatus,
  OrderType,
  Currency
} from "../types";
import { orderService } from "../services/orderService";
import { cn } from "../lib/utils";
import { toast } from "react-hot-toast";

interface OrderDetailsProps {
  orderId: number;
  onBack: () => void;
}

export default function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
  const [order, setOrder] = useState<AdminOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [notes, setNotes] = useState("");
  
  // --- YENİ: Dəri şəkli lightbox state ---
  const [activeLeatherImage, setActiveLeatherImage] = useState<string | null>(null);
  const [activeLeatherName, setActiveLeatherName] = useState<string>("");

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // --- YENİ: ESC ilə modal bağlama + scroll bloklama ---
  useEffect(() => {
    if (activeLeatherImage) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeLeatherModal();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [activeLeatherImage]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
      setNewStatus(data.status);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order?.status) return;

    try {
      setUpdating(true);
      await orderService.updateOrderStatus(orderId, { 
        newStatus: newStatus as OrderStatus,
        notes: notes || undefined
      });
      toast.success("Order status updated successfully");
      fetchOrderDetail();
      setNotes("");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  // --- YENİ: Modal aç/bağla ---
  const openLeatherModal = (url: string, name: string) => {
    setActiveLeatherImage(url);
    setActiveLeatherName(name);
  };

  const closeLeatherModal = () => {
    setActiveLeatherImage(null);
    setActiveLeatherName("");
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock className="w-5 h-5 text-yellow-500" />;
      case OrderStatus.PAID: return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case OrderStatus.MANUFACTURING: return <Settings className="w-5 h-5 text-purple-500" />;
      case OrderStatus.SHIPPED: return <Truck className="w-5 h-5 text-indigo-500" />;
      case OrderStatus.COMPLETED: return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case OrderStatus.CANCELLED: return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3525cd]"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-500">
      {/* === YENİ: LEATHER LIGHTBOX MODAL === */}
      {activeLeatherImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-200"
          onClick={closeLeatherModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#111c2d]/80 backdrop-blur-md" />
          
          {/* Modal Content */}
          <div 
            className="relative z-10 w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#c7c4d8]/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#c7c4d8]/10 bg-[#f9f9ff]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#3525cd] rounded-xl flex items-center justify-center text-white">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Selected Leather</p>
                  <p className="text-sm font-bold text-[#111c2d]">{activeLeatherName}</p>
                </div>
              </div>
              <button
                onClick={closeLeatherModal}
                className="w-10 h-10 rounded-2xl bg-white border border-[#c7c4d8]/20 flex items-center justify-center text-[#777587] hover:text-[#3525cd] hover:border-[#3525cd]/30 hover:shadow-md transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image */}
            <div className="relative bg-[#f0f3ff] p-6 md:p-10 flex items-center justify-center">
              <img
                src={activeLeatherImage}
                alt={activeLeatherName}
                className="w-full max-h-[60vh] object-contain rounded-3xl shadow-lg border border-white"
              />
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 bg-white border-t border-[#c7c4d8]/10 flex items-center justify-center gap-2">
              <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">
                Press ESC or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#777587] hover:text-[#3525cd] transition-colors text-xs font-bold uppercase tracking-widest mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Order List / Details
          </button>
          <div className="flex items-center gap-4">
            <h3 className="text-4xl font-['Manrope'] font-extrabold text-[#111c2d] tracking-tight">
              {order.orderNumber}
            </h3>
            <span className={cn(
              "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm",
              order.status === OrderStatus.COMPLETED ? "bg-green-100 text-green-800" : "bg-[#f0f3ff] text-[#3525cd]"
            )}>
              {order.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Placed On</p>
            <p className="font-bold text-[#111c2d]">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Info & Items */}
        <div className="lg:col-span-8 space-y-8">
          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-[#c7c4d8]/15 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Total Price</span>
              </div>
              <p className="text-2xl font-['Manrope'] font-extrabold text-[#111c2d]">
                {order.finalPrice.toLocaleString()} {order.currency}
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-[#c7c4d8]/15 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Payment</span>
              </div>
              <p className={cn(
                "text-2xl font-['Manrope'] font-extrabold",
                order.paymentStatus === PaymentStatus.SUCCESS ? "text-green-600" : "text-yellow-600"
              )}>
                {order.paymentStatus}
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-[#c7c4d8]/15 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd]">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Order Type</span>
              </div>
              <p className="text-lg font-bold text-[#111c2d]">
                {order.orderType === OrderType.AI_CUSTOM_DESIGN ? "AI Custom Design" : "Ready Product"}
              </p>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#c7c4d8]/10 flex items-center justify-between">
              <h4 className="font-['Manrope'] font-bold text-xl text-[#111c2d]">Order Items</h4>
              <span className="bg-[#f0f3ff] text-[#3525cd] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                {order.items.length} Items
              </span>
            </div>
            <div className="divide-y divide-[#c7c4d8]/10">
              {order.items.map((item) => (
                <div key={item.id} className="p-8 flex flex-col sm:flex-row gap-6 hover:bg-[#f9f9ff]/50 transition-colors">
                  <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-[#f0f3ff] shadow-sm border border-[#c7c4d8]/10 flex-shrink-0">
                    <img 
                      src={item.renderImageUrl || "https://picsum.photos/seed/product/200/200"} 
                      alt={item.productModelName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h5 className="text-lg font-bold text-[#111c2d]">{item.productModelName}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag className="w-3.5 h-3.5 text-[#777587]" />
                          <span className="text-xs font-bold text-[#777587] uppercase tracking-widest">
                            Leather: {item.leatherName}
                          </span>
                        </div>
                        
                        {/* === DƏRİ ŞƏKLİ — MODERN + CLICKABLE === */}
                      {item.leatherImageUrl && (
  <div 
    className="group flex items-center gap-3 mt-4 bg-[#f0f3ff] p-2.5 pr-5 rounded-xl border border-[#3525cd]/10 w-fit cursor-pointer hover:bg-[#3525cd]/5 hover:border-[#3525cd]/30 hover:shadow-md transition-all active:scale-95"
    onClick={() => {
      if (item.leatherImageUrl) {
        openLeatherModal(item.leatherImageUrl, item.leatherName);
      }
    }}
  >
                            <div className="relative">
                              <img
                                src={item.leatherImageUrl}
                                alt={item.leatherName}
                                className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3525cd] rounded-full flex items-center justify-center text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn className="w-3 h-3" />
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-[#3525cd] uppercase tracking-widest">Selected Leather</p>
                              <p className="text-xs font-bold text-[#111c2d]">{item.leatherName}</p>
                              <p className="text-[9px] font-bold text-[#777587] mt-0.5">Click to preview</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-left sm:text-right">
                        <p className="font-['Manrope'] font-extrabold text-[#3525cd] text-lg">
                          {item.totalPrice.toLocaleString()} {order.currency}
                        </p>
                        <p className="text-xs font-bold text-[#777587] uppercase">
                          {item.quantity} x {item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#f9f9ff] p-8 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-[#777587] uppercase tracking-widest">Subtotal</span>
                <span className="font-bold text-[#111c2d]">{order.subTotal.toLocaleString()} {order.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-[#777587] uppercase tracking-widest">Shipping Fee</span>
                <span className="font-bold text-[#111c2d]">{order.shippingFee.toLocaleString()} {order.currency}</span>
              </div>
              <div className="pt-3 border-t border-[#c7c4d8]/20 flex justify-between">
                <span className="text-lg font-black text-[#111c2d] uppercase tracking-widest">Final Total</span>
                <span className="text-2xl font-['Manrope'] font-black text-[#3525cd]">
                  {order.finalPrice.toLocaleString()} {order.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Status Management */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Management */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-[#3525cd]" />
              <h4 className="text-[10px] uppercase font-black tracking-widest text-[#777587]">
                Manage Status
              </h4>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider">Update Order Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-3 bg-[#f9f9ff] border border-[#c7c4d8]/20 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all"
                >
                  {Object.values(OrderStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider">Admin Notes (Optional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this status change..."
                  className="w-full px-4 py-3 bg-[#f9f3ff] border border-[#c7c4d8]/20 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all h-24 resize-none"
                />
              </div>

              <button 
                onClick={handleUpdateStatus}
                disabled={updating || newStatus === order.status}
                className="w-full bg-[#3525cd] text-white py-4 rounded-2xl font-bold hover:bg-[#2a1da3] transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:scale-100"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </section>

          {/* Customer Info */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#3525cd]" />
              <h4 className="text-[10px] uppercase font-black tracking-widest text-[#777587]">
                Customer Information
              </h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd] shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#777587] uppercase tracking-wider">Full Name</p>
                  <p className="font-bold text-[#111c2d]">{order.customer.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#777587] uppercase tracking-wider">Email Address</p>
                  <p className="font-bold text-[#111c2d]">{order.customer.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#777587] uppercase tracking-wider">Phone Number</p>
                  <p className="font-bold text-[#111c2d]">{order.customer.phone || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#777587] uppercase tracking-wider">Delivery Address</p>
                  <p className="font-bold text-[#111c2d] text-sm leading-relaxed">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Detail */}
          {order.payment && (
            <section className="bg-white p-8 rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#3525cd]" />
                <h4 className="text-[10px] uppercase font-black tracking-widest text-[#777587]">
                  Payment Details
                </h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#777587] uppercase">Provider</span>
                  <span className="font-bold text-[#111c2d]">{order.payment.provider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#777587] uppercase">Amount</span>
                  <span className="font-bold text-[#111c2d]">{order.payment.amount.toLocaleString()} {order.payment.currency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#777587] uppercase">Status</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    order.payment.status === PaymentStatus.SUCCESS ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  )}>
                    {order.payment.status}
                  </span>
                </div>
                {order.payment.confirmedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#777587] uppercase">Confirmed At</span>
                    <span className="text-xs font-bold text-[#111c2d]">{new Date(order.payment.confirmedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Additional Info */}
          <section className="bg-[#111c2d] p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#3525cd]" />
              <h4 className="text-[10px] uppercase font-black tracking-widest text-white/60">
                Order Timeline
              </h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-bold uppercase">Created</span>
                <span className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              {order.paidAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-bold uppercase">Paid</span>
                  <span className="font-bold">{new Date(order.paidAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-bold uppercase">Completed</span>
                  <span className="font-bold">{new Date(order.completedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-bold uppercase">Last Update</span>
                <span className="font-bold">{new Date(order.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}