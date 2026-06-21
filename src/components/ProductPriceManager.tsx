import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  DollarSign, 
  AlertCircle,
  Save,
  X
} from "lucide-react";
import { 
  ProductModelResponse, 
  ProductPriceResponse 
} from "../types";
import { productPriceService } from "../services/productPriceService";
import ManualPriceManager from "./ManualPriceManager";
import { toast } from "react-hot-toast";

interface ProductPriceManagerProps {
  product: ProductModelResponse;
}

export default function ProductPriceManager({ product }: ProductPriceManagerProps) {
  const [prices, setPrices] = useState<ProductPriceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState({ gradeId: 1, price: 0 });
  const [editPrice, setEditPrice] = useState(0);

  useEffect(() => {
    fetchPrices();
  }, [product.id]);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const pricesData = await productPriceService.getProductPrices(product.id);
      setPrices(pricesData.prices || []);
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      toast.error("Qiymətlər yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrice = async () => {
    try {
      await productPriceService.createProductPrices(product.id, {
        prices: [{ gradeId: newPrice.gradeId, price: newPrice.price }]
      });
      toast.success("AZN Qiyməti əlavə edildi");
      setIsAdding(false);
      fetchPrices();
    } catch (error) {
      toast.error("Qiymət əlavə edilə bilmədi");
    }
  };

  const handleUpdatePrice = async (gradeId: number) => {
    try {
      await productPriceService.updateProductPrice(product.id, gradeId, {
        price: editPrice
      });
      toast.success("AZN Qiyməti yeniləndi");
      setEditingGradeId(null);
      fetchPrices();
    } catch (error) {
      toast.error("Qiymət yenilənə bilmədi");
    }
  };

  const handleDeletePrice = async (gradeId: number) => {
    if (!window.confirm("Bu AZN qiymətini silmək istədiyinizə əminsiniz?")) return;
    try {
      await productPriceService.deleteProductPrice(product.id, gradeId);
      toast.success("Qiymət silindi");
      fetchPrices();
    } catch (error) {
      toast.error("Qiymət silinə bilmədi");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3525cd]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. BAZA QİYMƏTİ BÖLMƏSİ (YALNIZ AZN) */}
      <section className="bg-white rounded-[2rem] p-8 border border-[#c7c4d8]/15 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd]">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-xl font-['Manrope'] font-bold text-[#111c2d]">Baza Qiyməti (AZN)</h4>
               <p className="text-xs font-medium text-[#777587]">Məhsulun daxili bazar üçün əsas qiymətini təyin edin.</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm font-bold text-[#3525cd] hover:text-[#2a1da3] transition-colors bg-[#f0f3ff] px-4 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            AZN Qiyməti Əlavə Et
          </button>
        </div>

        <div className="space-y-4">
          {prices.map((price) => (
            <div 
              key={price.gradeId}
              className="flex items-center justify-between p-6 bg-[#f9f9ff] rounded-2xl border border-transparent hover:border-[#3525cd]/10 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#c7c4d8]/10">
                  <span className="text-xs font-black text-[#3525cd]">AZN</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111c2d]">Grade ID: {price.gradeId}</p>
                  <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">{price.gradeType}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {editingGradeId === price.gradeId ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                      className="w-24 bg-white border border-[#c7c4d8]/30 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20"
                    />
                    <button onClick={() => handleUpdatePrice(price.gradeId)} className="p-2 text-[#1a8e3d] hover:bg-[#e2f9e9] rounded-lg transition-colors">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingGradeId(null)} className="p-2 text-[#ba1a1a] hover:bg-[#fff0f0] rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-lg font-['Manrope'] font-extrabold text-[#3525cd]">
                      {price.priceAzn.toLocaleString()} AZN
                    </p>
                    <p className="text-[10px] font-bold text-[#777587] uppercase tracking-tighter">
                      Son yenilənmə: {new Date(price.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingGradeId(price.gradeId);
                      setEditPrice(price.priceAzn);
                    }}
                    className="p-2 text-[#777587] hover:text-[#3525cd] hover:bg-[#f0f3ff] rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePrice(price.gradeId)}
                    className="p-2 text-[#777587] hover:text-[#ba1a1a] hover:bg-[#fff0f0] rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {isAdding && (
            <div className="p-6 bg-[#f0f3ff] rounded-2xl border-2 border-dashed border-[#3525cd]/30 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">Grade ID</label>
                  <input
                    type="number"
                    value={newPrice.gradeId}
                    onChange={(e) => setNewPrice({ ...newPrice, gradeId: parseInt(e.target.value) })}
                    className="w-full bg-white border border-[#c7c4d8]/30 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">AZN Məbləği</label>
                  <input
                    type="number"
                    value={newPrice.price}
                    onChange={(e) => setNewPrice({ ...newPrice, price: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-[#c7c4d8]/30 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleAddPrice}
                    className="flex-1 bg-[#3525cd] text-white py-2 rounded-xl font-bold text-sm hover:bg-[#2a1da3] transition-all"
                  >
                    Yadda Saxla
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 bg-white border border-[#c7c4d8]/30 rounded-xl font-bold text-sm text-[#777587] hover:bg-gray-50"
                  >
                    Ləğv et
                  </button>
                </div>
              </div>
            </div>
          )}

          {prices.length === 0 && !isAdding && (
            <div className="text-center py-12 border-2 border-dashed border-[#c7c4d8]/20 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-[#c7c4d8] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#777587]">Bu məhsul üçün hələ AZN baza qiyməti təyin edilməyib.</p>
            </div>
          )}
        </div>
      </section>

      {/* 2. XARİCİ VALYUTA BÖLMƏSİ (MANUAL PRICE MANAGER) */}
      <ManualPriceManager product={product} />
      
    </div>
  );
}