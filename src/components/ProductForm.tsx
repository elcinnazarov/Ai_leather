import React, { useState } from "react";
import { Upload, Package, Save, X, AlertCircle, Maximize } from "lucide-react";
import {
  ProductModelResponse,
  CreateProductModelRequest,
  UpdateProductModelRequest,
  ProductCategory,
} from "../types";
import { cn } from "../lib/utils";

interface ProductFormProps {
  product?: ProductModelResponse;
  onSubmit: (data: any, images?: File[]) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<any>({
    modelName: product?.modelname || "",
    modelType: product?.modelType || ProductCategory.BAG,
    description: product?.description || "",
    dimensions: product?.dimensions || "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(
    product?.images?.map((img) => img.imageUrl) || []
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setPreviews((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    // Note: This logic for removing existing vs new images might need more refinement
    // depending on how the backend handles image updates.
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, images.length > 0 ? images : undefined);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#111c2d] mb-2 font-['Manrope']">
          {product ? "Edit Product Model" : "Create New Product"}
        </h2>
        <p className="text-[#464555] font-['Inter']">
          {product
            ? "Refine the specifications for this product model."
            : "Define the characteristics of a new product design."}
        </p>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-[0_48px_48px_rgba(17,28,45,0.04)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                  Model Name
                </label>
                <input
                  className="w-full bg-[#f0f3ff] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all placeholder:text-[#c7c4d8]"
                  placeholder="Enter model name..."
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                  Category
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-[#f0f3ff] border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all appearance-none"
                    value={formData.modelType}
                    onChange={(e) =>
                      setFormData({ ...formData, modelType: e.target.value as ProductCategory })
                    }
                  >
                    {Object.values(ProductCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                  Dimensions
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#f0f3ff] border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all"
                    type="text"
                    placeholder="e.g. 30x20x10 cm"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  />
                  <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                  Description
                </label>
                <textarea
                  className="w-full bg-[#f0f3ff] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all"
                  rows={4}
                  placeholder="Describe the product design and features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                  Product Assets (Images)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden h-32 bg-[#f0f3ff]">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#c7c4d8] rounded-xl h-32 hover:border-[#3525cd] transition-colors cursor-pointer group">
                    <Upload className="text-[#777587] group-hover:text-[#3525cd] mb-2 w-6 h-6" />
                    <span className="text-[10px] font-bold text-[#777587] uppercase">Add Image</span>
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

              <div className="flex items-center gap-2 p-3 bg-[#ffdad6]/30 rounded-xl">
                <AlertCircle className="text-[#ba1a1a] w-4 h-4" />
                <p className="text-[10px] font-bold text-[#93000a] uppercase tracking-tight">
                  The first image uploaded will be set as the primary asset.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-[#c7c4d8]/10">
            <button
              className="flex-1 bg-gradient-to-br from-[#3525cd] to-[#4f46e5] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-[#3525cd]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              type="submit"
            >
              <Save className="w-5 h-5" />
              {product ? "Save Product" : "Create Product"}
            </button>
            <button
              onClick={onCancel}
              className="px-8 py-4 bg-[#dee8ff] text-[#111c2d] font-semibold rounded-xl hover:bg-[#d8e3fb] transition-colors active:scale-95"
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
