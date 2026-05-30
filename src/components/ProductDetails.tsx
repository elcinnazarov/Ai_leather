import React, { useState } from "react";
import { Edit, Trash2, Upload, RefreshCw, ChevronLeft, Package, Maximize, Clock, Star, Info, DollarSign } from "lucide-react";
import { ProductModelResponse, AvailabilityStatus } from "../types";
import { cn } from "../lib/utils";
import ProductPriceManager from "./ProductPriceManager";

interface ProductDetailsProps {
  product: ProductModelResponse;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onAddImages: (files: File[]) => void;
  onDeleteImage: (imageId: number) => void;
  onSetPrimaryImage: (imageId: number) => void;
}

export default function ProductDetails({
  product,
  onEdit,
  onDelete,
  onBack,
  onAddImages,
  onDeleteImage,
  onSetPrimaryImage,
}: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "pricing">("details");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      onAddImages(files);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#777587] hover:text-[#3525cd] transition-colors text-xs font-bold uppercase tracking-widest mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Product Catalog / Details
          </button>
          <h3 className="text-4xl font-['Manrope'] font-extrabold text-[#111c2d] tracking-tight">
            {product.modelname}
          </h3>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="bg-[#dee8ff] text-[#111c2d] px-6 py-3 rounded-xl font-bold hover:bg-[#d8e3fb] transition-all active:scale-95 duration-150 flex items-center gap-2 shadow-sm"
          >
            <Edit className="w-5 h-5" />
            Edit Model
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

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-[#f0f3ff] p-1.5 rounded-2xl w-fit mb-8 shadow-sm border border-[#c7c4d8]/10">
        <button
          onClick={() => setActiveTab("details")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
            activeTab === "details" 
              ? "bg-white text-[#3525cd] shadow-sm" 
              : "text-[#777587] hover:text-[#111c2d]"
          )}
        >
          <Info className="w-4 h-4" />
          General Details
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
            activeTab === "pricing" 
              ? "bg-white text-[#3525cd] shadow-sm" 
              : "text-[#777587] hover:text-[#111c2d]"
          )}
        >
          <DollarSign className="w-4 h-4" />
          Pricing Strategy
        </button>
      </div>

      {activeTab === "details" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
          <div className="lg:col-span-8 space-y-8">
            {/* Primary Image */}
            <div className="group relative rounded-3xl overflow-hidden bg-[#f0f3ff] shadow-[0_48px_48px_-24px_rgba(17,28,45,0.04)]">
              <img
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                src={product.primaryImageUrl || "https://picsum.photos/seed/product/800/600"}
                alt={product.modelname}
              />
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {product.images?.map((img) => (
                <div key={img.id} className={cn(
                  "relative group rounded-2xl overflow-hidden aspect-square bg-[#f0f3ff] shadow-sm border-2 transition-all",
                  img.isPrimary ? "border-[#3525cd]" : "border-transparent"
                )}>
                  <img src={img.imageUrl} alt="Gallery" className="w-full h-full object-cover" />
                  
                  {/* Primary Badge */}
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2 bg-[#3525cd] text-white px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg z-10">
                      Primary
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && (
                      <button
                        onClick={() => onSetPrimaryImage(img.id)}
                        className="bg-white text-[#3525cd] p-2 rounded-full hover:bg-[#3525cd] hover:text-white transition-colors shadow-lg"
                        title="Set as Primary"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteImage(img.id)}
                      className="bg-white text-[#ba1a1a] p-2 rounded-full hover:bg-[#ba1a1a] hover:text-white transition-colors shadow-lg"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#c7c4d8] rounded-2xl aspect-square hover:border-[#3525cd] transition-colors cursor-pointer group">
                <Upload className="text-[#777587] group-hover:text-[#3525cd] mb-2 w-6 h-6" />
                <span className="text-[10px] font-bold text-[#777587] uppercase">Add Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgba(17,28,45,0.04)] border border-[#c7c4d8]/15">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#777587] mb-6">
                Product Specifications
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-1">
                    Model Name
                  </label>
                  <p className="text-xl font-['Manrope'] font-bold text-[#111c2d]">
                    {product.modelname}
                  </p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#3525cd]" />
                      <span className="font-medium">{product.modelType}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-1 text-right">
                      Dimensions
                    </label>
                    <div className="flex items-center gap-2 justify-end">
                      <Maximize className="w-4 h-4 text-[#3525cd]" />
                      <span className="font-medium text-right block">{product.dimensions}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <p className="text-sm text-[#464555] leading-relaxed">{product.description}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#777587] uppercase tracking-wider mb-2">
                    Availability Status
                  </label>
                  <span
                    className={cn(
                      "inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-tight",
                      product.availabilityStatus === AvailabilityStatus.ARCHIVED
                        ? "bg-[#ffdbcc] text-[#7e3000]"
                        : product.availabilityStatus === AvailabilityStatus.OUT_OF_STOCK
                        ? "bg-[#ffdad6] text-[#93000a]"
                        : "bg-[#e2dfff] text-[#3323cc]"
                    )}
                  >
                    {product.availabilityStatus.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-[#3525cd] bg-gradient-to-br from-[#3525cd] to-[#4f46e5] p-8 rounded-3xl shadow-xl text-white">
              <h4 className="font-['Manrope'] font-bold text-xl mb-2">Catalog Sync</h4>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Synchronize this product model with the global catalog and e-commerce platforms.
              </p>
              <button className="w-full bg-white text-[#3525cd] py-4 rounded-xl font-['Manrope'] font-bold tracking-tight hover:bg-[#f9f9ff] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Push to Production
              </button>
            </section>

            <div className="flex items-center justify-between px-4 py-2 opacity-60">
              <span className="text-[10px] uppercase font-bold tracking-tighter">
                ID: PRD-{product.id.toString().padStart(4, "0")}
              </span>
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-tighter">
                <Clock className="w-3 h-3" />
                CREATED: {new Date(product.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ProductPriceManager product={product} />
        </div>
      )}
    </div>
  );
}
