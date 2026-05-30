import React from "react";
import { Search, SlidersHorizontal, Filter, MoreVertical, Package, Plus, Clock } from "lucide-react";
import { ProductModelResponse, AvailabilityStatus } from "../types";
import { cn } from "../lib/utils";

interface ProductListProps {
  products: ProductModelResponse[];
  onEdit: (product: ProductModelResponse) => void;
  onDelete: (id: number) => void;
  onView: (product: ProductModelResponse) => void;
  onStatusChange: (id: number, status: AvailabilityStatus) => void;
  onCreate: () => void;
}

export default function ProductList({
  products,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  onCreate,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<AvailabilityStatus | "ALL">("ALL");

  const filteredProducts = (products || []).filter((p) => {
    const matchesSearch = p.modelname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.modelType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.availabilityStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10">
      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-[#f0f3ff] rounded-2xl p-2 flex items-center gap-4 focus-within:bg-white transition-all shadow-sm">
          <div className="pl-4 text-[#777587]">
            <Search className="w-5 h-5" />
          </div>
          <input
            className="bg-transparent border-none focus:ring-0 w-full py-3 font-['Inter'] text-[#111c2d] placeholder:text-[#777587]/60"
            placeholder="Məhsul adı, kateqoriya və ya nömrəyə görə axtar..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 bg-[#dee8ff] text-[#111c2d] py-3 px-4 rounded-xl font-medium text-sm border-none focus:ring-2 focus:ring-[#3525cd]/20 transition-all"
          >
            <option value="ALL">Bütün Statuslar</option>
            {Object.values(AvailabilityStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Header Stats */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="font-['Manrope'] text-3xl font-extrabold text-[#111c2d] tracking-tight">
            Məhsul Modelləri
          </h3>
          <p className="font-['Inter'] text-xs uppercase tracking-[0.15em] text-[#777587] mt-1">
            {filteredProducts.length} Model Kataloqa Əlavə Edilib
          </p>
        </div>
      </div>

      {/* Product Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-24">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white p-6 rounded-[1.5rem] shadow-[0_4px_24px_rgba(17,28,45,0.04)] border border-[#c7c4d8]/10 hover:border-[#3525cd]/20 transition-all cursor-pointer"
            onClick={() => onView(product)}
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden bg-[#e7eeff]">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={product.primaryImageUrl || "https://picsum.photos/seed/product/400/400"}
                  alt={product.modelname}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-['Manrope'] text-xl font-bold text-[#111c2d]">
                      {product.modelname}
                    </h4>
                    <select
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider appearance-none cursor-pointer text-center",
                        product.availabilityStatus === AvailabilityStatus.ARCHIVED
                          ? "bg-[#ffdbcc] text-[#7e3000]"
                          : product.availabilityStatus === AvailabilityStatus.OUT_OF_STOCK
                          ? "bg-[#ffdad6] text-[#93000a]"
                          : "bg-[#e2dfff] text-[#3323cc]"
                      )}
                      value={product.availabilityStatus}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(product.id, e.target.value as AvailabilityStatus);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Object.values(AvailabilityStatus).map(status => (
                        <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-[#777587]" />
                      <span className="text-sm font-medium text-[#464555]">
                        {product.modelType}
                      </span>
                    </div>
                    <p className="text-xs text-[#777587] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(product.createdAt).toLocaleDateString()} tarixində əlavə edilib
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#c7c4d8]/10 flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#777587]">
                    {product.images?.length || 0} Şəkil Əlavə Edilib
                  </div>
                  <button
                    className="text-[#3525cd] hover:bg-[#3525cd]/5 p-2 rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(product);
                    }}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB: Create Product */}
      <button
        onClick={onCreate}
        className="fixed bottom-28 md:bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#3525cd] to-[#4f46e5] text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group z-50"
      >
        <Plus className="w-8 h-8" />
        <div className="absolute right-20 bg-[#263143] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
          Məhsul Modeli Yarat
        </div>
      </button>
    </div>
  );
}
