import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Save,
  X,
  RefreshCw
} from "lucide-react";
import { 
  ProductModelResponse, 
  ManualPriceResponse,
  Currency
} from "../types";
import { manualPriceService } from "../services/manualPriceService";
import { toast } from "react-hot-toast";

interface ManualPriceManagerProps {
  product: ProductModelResponse;
}

export default function ManualPriceManager({ product }: ManualPriceManagerProps) {
  const [manualPrices, setManualPrices] = useState<ManualPriceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newManualPrice, setNewManualPrice] = useState({ 
    gradeId: 1, 
    currency: Currency.USD, 
    manualPrice: 0 
  });

  const [editingPrice, setEditingPrice] = useState<ManualPriceResponse | null>(null);

  useEffect(() => {
    fetchManualPrices();
  }, [product.id]);

  const fetchManualPrices = async () => {
    try {
      setLoading(true);
      const data = await manualPriceService.getManualPrices(product.id);
      setManualPrices(data.manualPrices || []);
    } catch (error) {
      console.error("Failed to fetch manual prices:", error);
      toast.error("Xarici valyuta qiymətləri yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualPrice = async () => {
    try {
      await manualPriceService.createManualPrices(product.id, {
        manualPrices: [
          {
            gradeId: newManualPrice.gradeId,
            currency: newManualPrice.currency,
            manualPrice: newManualPrice.manualPrice
          }
        ]
      } as any);

      toast.success("Xarici valyuta qiyməti uğurla yaradıldı");
      setIsAdding(false);
      setNewManualPrice({ gradeId: 1, currency: Currency.USD, manualPrice: 0 });
      fetchManualPrices();
    } catch (error) {
      toast.error("Qiymət yaradılarkən xəta baş verdi");
    }
  };

  const handleUpdateManualPrice = async () => {
    if (!editingPrice) return;
    
    try {
      await manualPriceService.updateManualPrices(product.id, {
        manualPrices: [
          {
            gradeId: editingPrice.gradeId,
            currency: editingPrice.currency,
            manualPrice: editingPrice.manualPrice
          }
        ]
      } as any);

      toast.success("Qiymət uğurla yeniləndi");
      setEditingPrice(null);
      fetchManualPrices();
    } catch (error) {
      toast.error("Qiymət yenilənərkən xəta baş verdi");
    }
  };

  const handleDeleteManualPrice = async (gradeId: number, currency: Currency) => {
    if (!window.confirm(`Grade ID: ${gradeId} üçün ${currency} qiymətini silmək istədiyinizə əminsiniz?`)) return;
    
    try {
      await manualPriceService.deleteManualPrices(product.id, {
        manualPrices: [{ gradeId, currency }]
      } as any);

      toast.success("Qiymət silindi");
      fetchManualPrices();
    } catch (error) {
      toast.error("Silinmə zamanı xəta baş verdi");
    }
  };

  if (loading) return null;

  return (
    <section className="bg-white rounded-[2rem] p-8 border border-[#c7c4d8]/15 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#fff0f0] rounded-xl flex items-center justify-center text-[#ba1a1a]">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-['Manrope'] font-bold text-[#111c2d]">Xarici Valyuta (Manual Qiymətlər)</h4>
            <p className="text-xs font-medium text-[#777587]">Xarici bazar üçün valyuta qiymətlərini (USD, EUR) əllə təyin edin.</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-sm font-bold text-[#ba1a1a] hover:text-[#93000a] transition-colors bg-[#fff0f0] px-4 py-2 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Yeni Valyuta Əlavə Et
        </button>
      </div>

      <div className="space-y-4">
        {manualPrices.map((price) => (
          <div 
            key={`${price.gradeId}-${price.currency}`}
            className="flex items-center justify-between p-6 bg-[#fff9f9] rounded-2xl border border-[#ba1a1a]/5 hover:border-[#ba1a1a]/20 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#ba1a1a]/10">
                <span className="text-xs font-black text-[#ba1a1a]">{price.currency}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#111c2d]">Grade ID: {price.gradeId}</p>
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">{price.gradeType || 'Manual Grade'}</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {editingPrice?.gradeId === price.gradeId && editingPrice?.currency === price.currency ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editingPrice.manualPrice}
                    onChange={(e) => setEditingPrice({ ...editingPrice, manualPrice: parseFloat(e.target.value) })}
                    className="w-24 bg-white border border-[#c7c4d8]/30 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]/20"
                    placeholder="0.00"
                  />
                  <button onClick={handleUpdateManualPrice} className="p-2 text-[#1a8e3d] hover:bg-[#e2f9e9] rounded-lg transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingPrice(null)} className="p-2 text-[#ba1a1a] hover:bg-[#fff0f0] rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-lg font-['Manrope'] font-extrabold text-[#ba1a1a]">
                    {price.manualPrice.toLocaleString()} {price.currency}
                  </p>
                  <p className="text-[10px] font-bold text-[#777587] uppercase tracking-tighter">
                    Təyin edilmiş qiymət
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingPrice(price)}
                  className="p-2 text-[#777587] hover:text-[#ba1a1a] hover:bg-white rounded-lg transition-all"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteManualPrice(price.gradeId, price.currency)}
                  className="p-2 text-[#777587] hover:text-[#ba1a1a] hover:bg-white rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {isAdding && (
          <div className="p-6 bg-[#fff9f9] rounded-2xl border-2 border-dashed border-[#ba1a1a]/30 animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">Grade ID</label>
                <input
                  type="number"
                  value={newManualPrice.gradeId}
                  onChange={(e) => setNewManualPrice({ ...newManualPrice, gradeId: parseInt(e.target.value) })}
                  className="w-full bg-white border border-[#c7c4d8]/30 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">Valyuta</label>
                <select
                  value={newManualPrice.currency}
                  onChange={(e) => setNewManualPrice({ ...newManualPrice, currency: e.target.value as Currency })}
                  className="w-full bg-white border border-[#c7c4d8]/30 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                >
                  {Object.values(Currency).filter(c => c !== Currency.AZN).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">Məbləğ</label>
                <input
                  type="number"
                  value={newManualPrice.manualPrice}
                  onChange={(e) => setNewManualPrice({ ...newManualPrice, manualPrice: parseFloat(e.target.value) })}
                  className="w-full bg-white border border-[#c7c4d8]/30 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex items-end gap-2">
                <button
                  onClick={handleCreateManualPrice}
                  className="flex-1 bg-[#ba1a1a] text-white py-2 rounded-xl font-bold text-sm hover:bg-[#93000a] transition-all"
                >
                  Yarat
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-white border border-[#c7c4d8]/30 rounded-xl font-bold text-sm text-[#777587] hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {manualPrices.length === 0 && !isAdding && (
          <div className="text-center py-12 border-2 border-dashed border-[#c7c4d8]/10 rounded-2xl">
            <RefreshCw className="w-8 h-8 text-[#c7c4d8] mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium text-[#777587]">Hələ heç bir xarici valyuta təyin edilməyib.</p>
          </div>
        )}
      </div>
    </section>
  );
}