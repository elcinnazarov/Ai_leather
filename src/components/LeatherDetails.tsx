import React from "react";
import { Edit, Trash2, Upload, RefreshCw, ChevronLeft } from "lucide-react";
import { LeatherResponse, AvailabilityStatus } from "../types";
import { cn } from "../lib/utils";

interface LeatherDetailsProps {
  leather: LeatherResponse;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onUpdateImage: (file: File) => void;
}

export default function LeatherDetails({
  leather,
  onEdit,
  onDelete,
  onBack,
  onUpdateImage,
}: LeatherDetailsProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateImage(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#777587] hover:text-[#3525cd] transition-colors text-xs font-bold uppercase tracking-widest mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Material Catalog / Details
          </button>
          <h3 className="text-4xl font-['Manrope'] font-extrabold text-[#111c2d] tracking-tight">
            {leather.leatherName}
          </h3>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="bg-[#dee8ff] text-[#111c2d] px-6 py-3 rounded-xl font-bold hover:bg-[#d8e3fb] transition-all active:scale-95 duration-150 flex items-center gap-2 shadow-sm"
          >
            <Edit className="w-5 h-5" />
            Edit Details
          </button>
          <button
            onClick={onDelete}
            className="bg-[#ffdad6] text-[#93000a] px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 duration-150 flex items-center gap-2 shadow-sm"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>

      {/* Asymmetric Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Large Hero Image */}
        <div className="lg:col-span-8 group relative rounded-3xl overflow-hidden bg-[#f0f3ff] shadow-[0_48px_48px_-24px_rgba(17,28,45,0.04)]">
          <img
            className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
            src={leather.textureImageUrl || "https://picsum.photos/seed/leather/800/600"}
            alt={leather.leatherName}
          />
          {/* Action Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#263143]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8 gap-4">
            <div className="relative">
              <button className="bg-white text-[#111c2d] px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm shadow-xl hover:bg-[#3525cd] hover:text-white transition-colors">
                <Upload className="w-4 h-4" />
                Update Image
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <button
              onClick={onDelete}
              className="bg-[#ba1a1a] text-white h-10 w-10 rounded-full flex items-center justify-center shadow-xl hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: Detailed Specs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Spec Card 1: Core Info */}
          <section className="bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgba(17,28,45,0.04)] border border-[#c7c4d8]/15">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#777587] mb-6">
              Specifications
            </h4>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-1">
                  Leather Name
                </label>
                <p className="text-xl font-['Manrope'] font-bold text-[#111c2d]">
                  {leather.leatherName}
                </p>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-[#c7c4d8]/30"
                      style={{ backgroundColor: leather.color }}
                    ></div>
                    <span className="font-medium">{leather.color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-1 text-right">
                    Origin
                  </label>
                  <span className="font-medium text-right block">{leather.origin}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-1">
                  Grade Type
                </label>
                <p className="font-medium">{leather.gradeType.replace(/_/g, " ")}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-2">
                  Availability Status
                </label>
                <span
                  className={cn(
                    "inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-tight",
                    leather.availabilityStatus === AvailabilityStatus.ARCHIVED
                      ? "bg-[#ffdbcc] text-[#7e3000]"
                      : leather.availabilityStatus === AvailabilityStatus.OUT_OF_STOCK
                      ? "bg-[#ffdad6] text-[#93000a]"
                      : "bg-[#e2dfff] text-[#3323cc]"
                  )}
                >
                  {leather.availabilityStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </section>

          {/* Update CTA Section */}
          <section className="bg-[#3525cd] bg-gradient-to-br from-[#3525cd] to-[#4f46e5] p-8 rounded-3xl shadow-xl text-white">
            <h4 className="font-['Manrope'] font-bold text-xl mb-2">Inventory Sync</h4>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Update material records across all ateliers. This action will broadcast the current
              specs to production.
            </p>
            <button className="w-full bg-white text-[#3525cd] py-4 rounded-xl font-['Manrope'] font-bold tracking-tight hover:bg-[#f9f9ff] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Execute Global Update
            </button>
          </section>

          {/* Quick Actions / Meta */}
          <div className="flex items-center justify-between px-4 py-2 opacity-60">
            <span className="text-[10px] uppercase font-bold tracking-tighter">
              SKU: LTHR-{leather.id.toString().padStart(4, "0")}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-tighter">
              UPDATED: OCT 24, 2023
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
