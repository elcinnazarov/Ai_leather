import React, { useState } from "react";
import { Plus, Edit2, Trash2, Globe, TrendingUp, DollarSign, Clock, CheckCircle2, XCircle, Calculator } from "lucide-react";
import { PricingRuleResponse, Currency } from "../types";
import { cn } from "../lib/utils";

interface PricingRuleListProps {
  rules: PricingRuleResponse[];
  onEdit: (rule: PricingRuleResponse) => void;
  onDelete: (currency: Currency) => void;
  onCreate: () => void;
}

export default function PricingRuleList({
  rules,
  onEdit,
  onDelete,
  onCreate,
}: PricingRuleListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRules = rules.filter((rule) =>
    rule.targetCurrency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="space-y-2">
          <h3 className="text-4xl font-['Manrope'] font-extrabold text-[#111c2d] tracking-tight">
            Pricing Rules
          </h3>
          <p className="text-[#777587] font-medium">
            Manage global exchange rates and markup strategies for international markets.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="bg-[#3525cd] text-white px-8 py-4 rounded-2xl font-['Manrope'] font-bold hover:bg-[#2a1da3] transition-all active:scale-95 flex items-center gap-3 shadow-[0_20px_40px_-12px_rgba(53,37,205,0.3)] group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          Add New Rule
        </button>
      </div>

      <div className="mb-8 relative max-w-md">
        <input
          type="text"
          placeholder="Search currency..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-[#c7c4d8]/30 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all shadow-sm font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-[2.5rem] p-8 border border-[#c7c4d8]/15 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_24px_48px_rgba(17,28,45,0.06)] transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              {rule.isActive ? (
                <CheckCircle2 className="w-6 h-6 text-[#1a8e3d]" />
              ) : (
                <XCircle className="w-6 h-6 text-[#ba1a1a]" />
              )}
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#f0f3ff] rounded-2xl flex items-center justify-center text-[#3525cd]">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-['Manrope'] font-extrabold text-[#111c2d]">
                  {rule.targetCurrency}
                </h4>
                <span className="text-xs font-bold text-[#777587] uppercase tracking-widest">
                  Target Market
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-[#f9f9ff] rounded-2xl">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#3525cd]" />
                  <span className="text-sm font-bold text-[#777587]">Multiplier</span>
                </div>
                <span className="text-lg font-['Manrope'] font-bold text-[#111c2d]">
                  x{rule.multiplier.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#f9f9ff] rounded-2xl">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-[#3525cd]" />
                  <span className="text-sm font-bold text-[#777587]">Fixed Adj.</span>
                </div>
                <span className="text-lg font-['Manrope'] font-bold text-[#111c2d]">
                  +{rule.fixedAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-4 bg-[#f0f3ff]/50 rounded-2xl border border-[#3525cd]/5">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="w-3.5 h-3.5 text-[#3525cd]" />
                  <span className="text-[10px] font-black text-[#777587] uppercase tracking-widest">Formula</span>
                </div>
                <p className="text-xs font-bold text-[#3525cd] font-mono">
                  {rule.formulaDisplay}
                  {rule.roundTo99 && <span className="ml-1 text-[#1a8e3d]">(Rounded)</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[#c7c4d8]/10">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#777587] uppercase tracking-tighter">
                <Clock className="w-3 h-3" />
                Updated {new Date(rule.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(rule)}
                  className="p-2.5 bg-[#f0f3ff] text-[#3525cd] rounded-xl hover:bg-[#3525cd] hover:text-white transition-all duration-300"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(rule.targetCurrency)}
                  className="p-2.5 bg-[#fff0f0] text-[#ba1a1a] rounded-xl hover:bg-[#ba1a1a] hover:text-white transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-[#c7c4d8]/30">
          <Globe className="w-16 h-16 text-[#c7c4d8] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[#111c2d] mb-2">No pricing rules found</h3>
          <p className="text-[#777587]">Try adjusting your search or add a new rule.</p>
        </div>
      )}
    </div>
  );
}
