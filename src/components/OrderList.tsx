import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  User, 
  Mail, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  DollarSign
} from "lucide-react";
import { 
  AdminOrderListResponse, 
  OrderStatus, 
  PaymentStatus, 
  OrderFilter, 
  PageResponse,
  Currency
} from "../types";
import { orderService } from "../services/orderService";
import { cn } from "../lib/utils";

interface OrderListProps {
  onViewOrder: (id: number) => void;
}

export default function OrderList({ onViewOrder }: OrderListProps) {
  const [orders, setOrders] = useState<AdminOrderListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filter, setFilter] = useState<OrderFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders(filter, page, 10);
      
      if (response && response.content) {
        setOrders(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } else {
        console.warn("Received empty or malformed order response:", response);
        setOrders([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setPage(0); // Reset to first page on filter change
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return "bg-yellow-100 text-yellow-800";
      case OrderStatus.PAID: return "bg-blue-100 text-blue-800";
      case OrderStatus.MANUFACTURING: return "bg-purple-100 text-purple-800";
      case OrderStatus.SHIPPED: return "bg-indigo-100 text-indigo-800";
      case OrderStatus.COMPLETED: return "bg-green-100 text-green-800";
      case OrderStatus.CANCELLED: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS: return "text-green-600";
      case PaymentStatus.WAITING: return "text-yellow-600";
      case PaymentStatus.FAILED: return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-['Manrope'] font-extrabold text-[#111c2d] tracking-tight">
            Order Management
          </h3>
          <p className="text-[#777587] font-medium">
            Monitor and manage customer orders, payments, and fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all",
              showFilters ? "bg-[#3525cd] text-white" : "bg-white border border-[#c7c4d8]/30 text-[#111c2d]"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-3xl border border-[#c7c4d8]/15 shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Order Number</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777587]" />
              <input 
                name="orderNumber"
                value={filter.orderNumber || ""}
                onChange={handleFilterChange}
                placeholder="ORD-..."
                className="w-full pl-10 pr-4 py-2 bg-[#f9f9ff] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3525cd]/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Customer Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777587]" />
              <input 
                name="customerName"
                value={filter.customerName || ""}
                onChange={handleFilterChange}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 bg-[#f9f9ff] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3525cd]/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Order Status</label>
            <select 
              name="status"
              value={filter.status || ""}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#f9f9ff] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3525cd]/20"
            >
              <option value="">All Statuses</option>
              {Object.values(OrderStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Payment Status</label>
            <select 
              name="paymentStatus"
              value={filter.paymentStatus || ""}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#f9f9ff] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3525cd]/20"
            >
              <option value="">All Payments</option>
              {Object.values(PaymentStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777587]" />
              <input 
                type="date"
                name="from"
                value={filter.from || ""}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 bg-[#f9f9ff] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3525cd]/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777587]" />
              <input 
                type="date"
                name="to"
                value={filter.to || ""}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 bg-[#f9f9ff] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3525cd]/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Min Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777587]" />
              <input 
                type="number"
                name="minAmount"
                value={filter.minAmount || ""}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2 bg-[#f9f9ff] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3525cd]/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Max Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777587]" />
              <input 
                type="number"
                name="maxAmount"
                value={filter.maxAmount || ""}
                onChange={handleFilterChange}
                placeholder="10000"
                className="w-full pl-10 pr-4 py-2 bg-[#f9f9ff] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3525cd]/20"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f9f9ff] border-b border-[#c7c4d8]/10">
                <th className="px-6 py-4 text-[10px] font-black text-[#777587] uppercase tracking-widest">Order Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#777587] uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#777587] uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#777587] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#777587] uppercase tracking-widest">Payment</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#777587] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c7c4d8]/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3525cd] mx-auto"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-[#777587] font-medium">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f9f9ff]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-[#111c2d]">{order.orderNumber}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#777587] uppercase">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-[#111c2d] text-sm">{order.customerName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-[#777587]">
                          <Mail className="w-3 h-3" />
                          {order.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-['Manrope'] font-extrabold text-[#3525cd]">
                          {order.finalPrice.toLocaleString()} {order.currency}
                        </p>
                        <p className="text-[10px] font-bold text-[#777587] uppercase">
                          {order.itemCount} items
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        getStatusColor(order.status)
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className={cn("w-4 h-4", getPaymentStatusColor(order.paymentStatus))} />
                        <span className={cn("text-xs font-bold uppercase tracking-widest", getPaymentStatusColor(order.paymentStatus))}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onViewOrder(order.id)}
                        className="p-2 bg-[#f0f3ff] text-[#3525cd] rounded-xl hover:bg-[#3525cd] hover:text-white transition-all shadow-sm"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-[#f9f9ff] border-t border-[#c7c4d8]/10 flex items-center justify-between">
            <p className="text-xs font-bold text-[#777587] uppercase">
              Showing {orders.length} of {totalElements} orders
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-2 bg-white border border-[#c7c4d8]/20 rounded-xl disabled:opacity-50 hover:bg-[#f0f3ff] transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-[#111c2d] px-2">
                {page + 1} / {totalPages}
              </span>
              <button 
                disabled={page + 1 === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 bg-white border border-[#c7c4d8]/20 rounded-xl disabled:opacity-50 hover:bg-[#f0f3ff] transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
