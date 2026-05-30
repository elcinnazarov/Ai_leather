import React, { useState, useEffect } from "react";
import { X, Save, Globe, TrendingUp, DollarSign, Power, CheckCircle2 } from "lucide-react";
import { PricingRuleResponse, CreatePricingRuleRequest, Currency } from "../types";
import { cn } from "../lib/utils";

interface PricingRuleFormProps {
  rule?: PricingRuleResponse;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function PricingRuleForm({ rule, onSubmit, onCancel }: PricingRuleFormProps) {
  const [formData, setFormData] = useState<any>({
    targetCurrency: Currency.USD,
    multiplier: 1.0,
    fixedAmount: 0,
    roundTo99: true,
    isActive: true,
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        targetCurrency: rule.targetCurrency,
        multiplier: rule.multiplier,
        fixedAmount: rule.fixedAmount,
        roundTo99: rule.roundTo99,
        isActive: rule.isActive,
      });
    }
  }, [rule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h3 className="text-3xl font-['Manrope'] font-extrabold text-[#111c2d] tracking-tight">
            {rule ? "Edit Pricing Rule" : "Create Pricing Rule"}
          </h3>
          <p className="text-[#777587] font-medium">
            Define currency conversion multiplier and fixed adjustments.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-3 bg-white border border-[#c7c4d8]/30 rounded-2xl text-[#777587] hover:text-[#ba1a1a] hover:border-[#ba1a1a]/30 transition-all shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-[#777587] uppercase tracking-widest">
                <Globe className="w-4 h-4" />
                Target Currency
              </label>
              <select
                disabled={!!rule}
                value={formData.targetCurrency}
                onChange={(e) => setFormData({ ...formData, targetCurrency: e.target.value as Currency })}
                className="w-full bg-[#f9f9ff] border border-[#c7c4d8]/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all font-bold text-[#111c2d] disabled:opacity-50"
              >
                {Object.values(Currency).map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-[#777587] uppercase tracking-widest">
                <TrendingUp className="w-4 h-4" />
                Multiplier
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.multiplier}
                onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })}
                className="w-full bg-[#f9f9ff] border border-[#c7c4d8]/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all font-bold text-[#111c2d]"
                placeholder="e.g. 1.7000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-[#777587] uppercase tracking-widest">
                <DollarSign className="w-4 h-4" />
                Fixed Amount
              </label>
              <input
                type="number"
                required
                value={formData.fixedAmount}
                onChange={(e) => setFormData({ ...formData, fixedAmount: parseFloat(e.target.value) })}
                className="w-full bg-[#f9f9ff] border border-[#c7c4d8]/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all font-bold text-[#111c2d]"
                placeholder="e.g. 15"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-[#777587] uppercase tracking-widest">
                <Power className="w-4 h-4" />
                Rule Status
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all font-bold",
                  formData.isActive
                    ? "bg-[#e2f9e9] border-[#1a8e3d]/20 text-[#1a8e3d]"
                    : "bg-[#fff0f0] border-[#ba1a1a]/20 text-[#ba1a1a]"
                )}
              >
                {formData.isActive ? "Active" : "Inactive"}
                <div className={cn(
                  "w-10 h-6 rounded-full relative transition-all",
                  formData.isActive ? "bg-[#1a8e3d]" : "bg-[#ba1a1a]"
                )}>
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                    formData.isActive ? "right-1" : "left-1"
                  )} />
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 p-6 bg-[#f0f3ff]/50 rounded-3xl border border-[#3525cd]/10">
            <input
              type="checkbox"
              id="roundTo99"
              checked={formData.roundTo99}
              onChange={(e) => setFormData({ ...formData, roundTo99: e.target.checked })}
              className="w-6 h-6 rounded-lg border-[#c7c4d8] text-[#3525cd] focus:ring-[#3525cd]/20 cursor-pointer"
            />
            <div className="flex-1">
              <label htmlFor="roundTo99" className="text-sm font-bold text-[#111c2d] cursor-pointer flex items-center gap-2">
                Round to .99
                <CheckCircle2 className="w-4 h-4 text-[#3525cd]" />
              </label>
              <p className="text-[10px] font-medium text-[#777587] mt-0.5">
                Automatically adjust final prices to end with .99 for marketing consistency.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-[#3525cd] text-white py-5 rounded-2xl font-['Manrope'] font-bold hover:bg-[#2a1da3] transition-all active:scale-[0.98] shadow-[0_20px_40px_-12px_rgba(53,37,205,0.3)] flex items-center justify-center gap-3"
          >
            <Save className="w-6 h-6" />
            {rule ? "Update Pricing Rule" : "Create Pricing Rule"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-10 bg-white border border-[#c7c4d8]/30 rounded-2xl font-['Manrope'] font-bold text-[#111c2d] hover:bg-[#f9f9ff] transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
