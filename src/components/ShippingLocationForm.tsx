import React, { useState } from "react";
import { 
  ChevronLeft, 
  MapPin, 
  Globe, 
  DollarSign, 
  ShieldCheck,
  Save,
  X,
  Info
} from "lucide-react";
import { 
  AdminShippingLocationResponse, 
  CreateShippingLocationRequest, 
  UpdateShippingLocationRequest,
  Currency,
  Country
} from "../types";
import { cn } from "../lib/utils";
import { getCurrencyForCountry } from "../lib/currencyMapper";

interface ShippingLocationFormProps {
  location?: AdminShippingLocationResponse;
  onSubmit: (data: CreateShippingLocationRequest | UpdateShippingLocationRequest) => void;
  onCancel: () => void;
}

export default function ShippingLocationForm({ location, onSubmit, onCancel }: ShippingLocationFormProps) {
  const [formData, setFormData] = useState<any>({
    country: location?.country || Country.AZERBAIJAN,
    cityName: location?.cityName || "",
    fee: location?.fee || 0,
    currency: location?.currency || Currency.AZN,
    freeThreshold: location?.freeThreshold || 0,
    requiresPostalCode: location?.requiresPostalCode ?? false,
    isActive: location?.isActive ?? true,
  });

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value as Country;
    setFormData((prev: any) => ({
      ...prev,
      country: selectedCountry,
      currency: getCurrencyForCountry(selectedCountry)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <div className="mb-12">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-[#777587] hover:text-[#3525cd] transition-colors text-xs font-bold uppercase tracking-widest mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Hub
        </button>
        <h3 className="text-4xl font-['Manrope'] font-extrabold text-[#111c2d] tracking-tight">
          {location ? "Edit Destination" : "New Shipping Route"}
        </h3>
        <p className="text-[#777587] font-medium mt-2">
          Configure logistics parameters for {formData.cityName || formData.country}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Geographic Info */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd]">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[#111c2d]">Geography</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Country</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c7c4d8]" />
                  <select
                    required
                    value={formData.country}
                    onChange={handleCountryChange}
                    className="w-full pl-12 pr-4 py-3 bg-[#f9f9ff] border-none rounded-2xl focus:ring-2 focus:ring-[#3525cd]/20 font-bold text-[#111c2d] appearance-none"
                  >
                    {Object.values(Country).map(c => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">City Name (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c7c4d8]" />
                  <input
                    type="text"
                    value={formData.cityName}
                    onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-[#f9f9ff] border-none rounded-2xl focus:ring-2 focus:ring-[#3525cd]/20 font-bold text-[#111c2d]"
                    placeholder="e.g. Baku (Leave empty for all cities)"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#f0f3ff]/50 rounded-2xl border border-[#3525cd]/5">
                <input
                  type="checkbox"
                  id="requiresPostalCode"
                  checked={formData.requiresPostalCode}
                  onChange={(e) => setFormData({ ...formData, requiresPostalCode: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-[#c7c4d8] text-[#3525cd] focus:ring-[#3525cd]/20"
                />
                <label htmlFor="requiresPostalCode" className="text-sm font-bold text-[#111c2d] cursor-pointer">
                  Requires Postal Code
                </label>
              </div>
            </div>
          </section>

          {/* Logistics Info */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#e2f9e9] rounded-xl flex items-center justify-center text-[#1a8e3d]">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[#111c2d]">Pricing</h4>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Shipping Fee</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#f9f9ff] border-none rounded-2xl focus:ring-2 focus:ring-[#3525cd]/20 font-bold text-[#111c2d]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                    className="w-full px-4 py-3 bg-[#f9f9ff] border-none rounded-2xl focus:ring-2 focus:ring-[#3525cd]/20 font-bold text-[#111c2d]"
                  >
                    {Object.values(Currency).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Free Shipping Threshold</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c7c4d8]" />
                  <input
                    type="number"
                    min="0"
                    value={formData.freeThreshold}
                    onChange={(e) => setFormData({ ...formData, freeThreshold: parseFloat(e.target.value) })}
                    className="w-full pl-12 pr-4 py-3 bg-[#f9f9ff] border-none rounded-2xl focus:ring-2 focus:ring-[#3525cd]/20 font-bold text-[#111c2d]"
                    placeholder="0.00 (0 = No free shipping)"
                  />
                </div>
                <p className="text-[10px] font-medium text-[#777587] flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Orders above this amount will have free shipping.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Status & Actions */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              formData.isActive ? "bg-[#e2f9e9] text-[#1a8e3d]" : "bg-[#fff0f0] text-[#ba1a1a]"
            )}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-[#111c2d]">Route Status</p>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={cn(
                  "text-xs font-black uppercase tracking-widest transition-colors",
                  formData.isActive ? "text-[#1a8e3d]" : "text-[#ba1a1a]"
                )}
              >
                {formData.isActive ? "Active & Operational" : "Inactive / Suspended"}
              </button>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 md:flex-none px-8 py-4 bg-[#f0f3ff] text-[#3525cd] rounded-2xl font-bold hover:bg-[#e2e8ff] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 md:flex-none px-12 py-4 bg-[#3525cd] text-white rounded-2xl font-bold hover:bg-[#2a1da3] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {location ? "Update Route" : "Create Route"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
