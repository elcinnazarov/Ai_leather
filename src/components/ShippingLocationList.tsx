import React, { useState, useEffect } from "react";
import { 
  Truck, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Power
} from "lucide-react";
import { AdminShippingLocationResponse, PageResponse } from "../types";
import { shippingService } from "../services/shippingService";
import { cn } from "../lib/utils";
import { toast } from "react-hot-toast";

interface ShippingLocationListProps {
  onCreate: () => void;
  onEdit: (location: AdminShippingLocationResponse) => void;
}

export default function ShippingLocationList({ onCreate, onEdit }: ShippingLocationListProps) {
  const [data, setData] = useState<PageResponse<AdminShippingLocationResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLocations();
  }, [page]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await shippingService.getAllLocations(page, 20);
      setData(response);
    } catch (error) {
      console.error("Failed to fetch shipping locations:", error);
      toast.error("Failed to load shipping locations");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await shippingService.toggleLocationStatus(id);
      toast.success("Status updated");
      fetchLocations();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this shipping location?")) return;
    try {
      await shippingService.deleteLocation(id);
      toast.success("Location deleted");
      fetchLocations();
    } catch (error) {
      toast.error("Failed to delete location");
    }
  };

  const filteredContent = data?.content.filter(loc => 
    loc.country.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loc.cityName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#f0f3ff] rounded-2xl flex items-center justify-center text-[#3525cd] shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-['Manrope'] font-extrabold text-[#111c2d] tracking-tight">
              Shipping Hub
            </h3>
          </div>
          <p className="text-[#777587] font-medium max-w-lg">
            Manage global shipping destinations, delivery estimates, and logistics costs.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="bg-[#3525cd] text-white px-8 py-4 rounded-2xl font-['Manrope'] font-bold hover:bg-[#2a1da3] transition-all active:scale-95 shadow-[0_20px_40px_-12px_rgba(53,37,205,0.3)] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Destination
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-8 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#777587] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by country or city..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-[#c7c4d8]/20 rounded-3xl focus:ring-4 focus:ring-[#3525cd]/5 font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="lg:col-span-4 flex items-center justify-end gap-4">
          <div className="bg-white px-6 py-4 rounded-3xl border border-[#c7c4d8]/20 shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#1a8e3d] animate-pulse" />
            <span className="text-xs font-bold text-[#111c2d] uppercase tracking-widest">
              {data?.totalElements || 0} Routes Defined
            </span>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white h-64 rounded-[2.5rem] border border-[#c7c4d8]/10 animate-pulse" />
          ))
        ) : filteredContent.map((location) => (
          <div 
            key={location.id}
            className={cn(
              "group bg-white rounded-[2.5rem] p-8 border border-[#c7c4d8]/15 shadow-sm hover:shadow-xl hover:border-[#3525cd]/20 transition-all duration-500 relative overflow-hidden",
              !location.isActive && "opacity-75 grayscale-[0.5]"
            )}
          >
            {/* Status Indicator */}
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 transition-transform group-hover:scale-110",
              location.isActive ? "bg-[#1a8e3d]" : "bg-[#ba1a1a]"
            )} />

            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#3525cd]">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{location.country}</span>
                </div>
                <h4 className="text-2xl font-['Manrope'] font-extrabold text-[#111c2d]">{location.cityName || "All Cities"}</h4>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => onEdit(location)}
                  className="p-2 text-[#777587] hover:text-[#3525cd] hover:bg-[#f0f3ff] rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleToggleStatus(location.id)}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    location.isActive ? "text-[#1a8e3d] hover:bg-[#e2f9e9]" : "text-[#ba1a1a] hover:bg-[#fff0f0]"
                  )}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(location.id)}
                  className="p-2 text-[#777587] hover:text-[#ba1a1a] hover:bg-[#fff0f0] rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#f9f9ff] p-4 rounded-2xl border border-transparent group-hover:border-[#3525cd]/10 transition-all">
                <div className="flex items-center gap-1.5 text-[#777587] mb-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Shipping Fee</span>
                </div>
                <p className="text-lg font-['Manrope'] font-extrabold text-[#3525cd]">
                  {location.fee.toLocaleString()} {location.currency}
                </p>
              </div>
              <div className="bg-[#f9f9ff] p-4 rounded-2xl border border-transparent group-hover:border-[#3525cd]/10 transition-all">
                <div className="flex items-center gap-1.5 text-[#777587] mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Free Threshold</span>
                </div>
                <p className="text-lg font-['Manrope'] font-extrabold text-[#111c2d]">
                  {location.freeThreshold ? `${location.freeThreshold.toLocaleString()} ${location.currency}` : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#c7c4d8]/10">
              <span className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                location.isActive ? "bg-[#e2f9e9] text-[#1a8e3d]" : "bg-[#fff0f0] text-[#ba1a1a]"
              )}>
                {location.isActive ? "Operational" : "Suspended"}
              </span>
              <span className="text-[9px] font-bold text-[#777587] uppercase tracking-tighter">
                ID: LOC-{location.id.toString().padStart(3, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-6 py-3 bg-white border border-[#c7c4d8]/20 rounded-2xl text-sm font-bold text-[#777587] hover:text-[#3525cd] disabled:opacity-50 transition-all"
          >
            Previous
          </button>
          <div className="flex gap-2">
            {Array.from({ length: data.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                  page === i ? "bg-[#3525cd] text-white" : "bg-white text-[#777587] hover:bg-[#f0f3ff]"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={page + 1 === data.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-3 bg-white border border-[#c7c4d8]/20 rounded-2xl text-sm font-bold text-[#777587] hover:text-[#3525cd] disabled:opacity-50 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {filteredContent.length === 0 && !loading && (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-[#c7c4d8]/15 shadow-sm">
          <div className="w-20 h-20 bg-[#f0f3ff] rounded-full flex items-center justify-center text-[#3525cd] mx-auto mb-6">
            <Truck className="w-10 h-10" />
          </div>
          <h4 className="text-2xl font-['Manrope'] font-bold text-[#111c2d] mb-2">No destinations found</h4>
          <p className="text-[#777587] mb-8">Start by adding your first shipping location.</p>
          <button
            onClick={onCreate}
            className="bg-[#3525cd] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2a1da3] transition-all"
          >
            Add Destination
          </button>
        </div>
      )}
    </div>
  );
}
