import React, { useState, useEffect } from "react";
import { Upload, MapPin, Save, X, AlertCircle } from "lucide-react";
import {
  LeatherResponse,
  CreateLeatherRequest,
  UpdateLeatherRequest,
  GradeType,
} from "../types";
import { cn } from "../lib/utils";

interface LeatherFormProps {
  leather?: LeatherResponse;
  onSubmit: (data: any, image?: File) => void;
  onCancel: () => void;
}

export default function LeatherForm({ leather, onSubmit, onCancel }: LeatherFormProps) {
  const [formData, setFormData] = useState<any>({
    leatherName: leather?.leatherName || "",
    origin: leather?.origin || "",
    description: leather?.description || "",
    gradeId: leather?.gradeId || 1,
    color: leather?.color || "#4b2c20",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(leather?.textureImageUrl || "");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, image || undefined);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header Section */}
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#111c2d] mb-2 font-['Manrope']">
          {leather ? "Edit Leather Material" : "Create New Leather"}
        </h2>
        <p className="text-[#464555] font-['Inter']">
          {leather
            ? "Refine the specifications for premium inventory batches."
            : "Define the characteristics of a new material batch."}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl p-8 shadow-[0_48px_48px_rgba(17,28,45,0.04)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basics */}
            <div className="space-y-6">
              {/* Leather Name */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                  Leather Name
                </label>
                <input
                  className="w-full bg-[#f0f3ff] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all placeholder:text-[#c7c4d8]"
                  placeholder="Enter material name..."
                  type="text"
                  value={formData.leatherName}
                  onChange={(e) => setFormData({ ...formData, leatherName: e.target.value })}
                  required
                />
              </div>

              {/* Origin */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                  Origin / Tannery
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#f0f3ff] border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all"
                    type="text"
                    placeholder="e.g. Santa Croce, Italy"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    required
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] w-4 h-4" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                  Description
                </label>
                <textarea
                  className="w-full bg-[#f0f3ff] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all"
                  rows={4}
                  placeholder="Describe the material characteristics..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Right Column: Technicals & Image */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Grade ID */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                    Grade
                  </label>
                  <select
                    className="w-full bg-[#f0f3ff] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all appearance-none"
                    value={formData.gradeId}
                    onChange={(e) => setFormData({ ...formData, gradeId: Number(e.target.value) })}
                  >
                    <option value={1}>Grade A+</option>
                    <option value={2}>Grade A</option>
                    <option value={3}>Grade B</option>
                    <option value={4}>Exotic</option>
                  </select>
                </div>

                {/* Color Picker / Text */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                    Color Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-12 h-12 rounded-xl bg-transparent border-2 border-[#dee8ff] cursor-pointer p-0"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                    <input
                      className="w-full bg-[#f0f3ff] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3525cd] focus:bg-white transition-all text-sm"
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777587] font-['Inter']">
                  Material Texture Scan
                </label>
                <div className="relative group cursor-pointer">
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-[#f0f3ff] relative">
                    {preview ? (
                      <img
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                        src={preview}
                        alt="Preview"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#777587]">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">Upload Texture Scan</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required={!leather}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-[#c7c4d8] rounded-xl m-2 group-hover:border-[#3525cd] transition-colors pointer-events-none">
                      <Upload className="text-[#777587] group-hover:text-[#3525cd] mb-2 w-6 h-6" />
                      <span className="text-xs font-medium text-[#777587]">
                        {preview ? "Replace Image" : "Select Image"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Example */}
              <div className="flex items-center gap-2 p-3 bg-[#ffdad6]/30 rounded-xl">
                <AlertCircle className="text-[#ba1a1a] w-4 h-4" />
                <p className="text-[10px] font-bold text-[#93000a] uppercase tracking-tight">
                  Ensure all technical specifications are verified before submission.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-[#c7c4d8]/10">
            <button
              className="flex-1 bg-gradient-to-br from-[#3525cd] to-[#4f46e5] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-[#3525cd]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              type="submit"
            >
              <Save className="w-5 h-5" />
              {leather ? "Save Leather" : "Create Leather"}
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
