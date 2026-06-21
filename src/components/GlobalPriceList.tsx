import React, { useState, useEffect } from "react";
import { Search, Filter, ArrowUpDown, DollarSign, Package, Tag, Clock } from "lucide-react";
import { ProductPriceResponse, PageResponse } from "../types";
import { productPriceService } from "../services/productPriceService";
import { cn } from "../lib/utils";

export default function GlobalPriceList() {
  const [data, setData] = useState<PageResponse<ProductPriceResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await productPriceService.getPrices({}, page, 10);
      setData(response);
    } catch (error) {
      console.error("Failed to fetch global prices:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32">
      <div className="mb-12 space-y-2">
        <h3 className="text-4xl font-['Manrope'] font-extrabold text-[#111c2d] tracking-tight">
          Price Master List
        </h3>
        <p className="text-[#777587] font-medium">
          Global overview of all product prices across all material grades.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-[#c7c4d8]/15 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by product or grade..."
            className="w-full pl-12 pr-4 py-3 bg-[#f9f9ff] border-none rounded-2xl focus:ring-2 focus:ring-[#3525cd]/20 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#f0f3ff] text-[#3525cd] rounded-2xl font-bold text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#f0f3ff] text-[#3525cd] rounded-2xl font-bold text-sm">
            <ArrowUpDown className="w-4 h-4" />
            Sort: Price
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-[2.5rem] border border-[#c7c4d8]/15 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f9f9ff] border-b border-[#c7c4d8]/10">
              <th className="px-8 py-6 text-[10px] font-black text-[#777587] uppercase tracking-widest">Product & Grade</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#777587] uppercase tracking-widest">Base Price</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#777587] uppercase tracking-widest">Currency</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#777587] uppercase tracking-widest">Last Sync</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#777587] uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c7c4d8]/10">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3525cd] mx-auto"></div>
                </td>
              </tr>
            ) : data?.content.map((price) => (
              <tr key={`${price.productModelId}-${price.gradeId}`} className="hover:bg-[#f9f9ff]/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#f0f3ff] rounded-xl flex items-center justify-center text-[#3525cd]">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#111c2d]">{price.productModelName}</p>
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-[#777587]" />
                        <span className="text-xs font-bold text-[#777587] uppercase">{price.gradeType}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-lg font-['Manrope'] font-extrabold text-[#3525cd]">
                    {price.priceAzn.toLocaleString()}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#1a8e3d]" />
                    <span className="font-bold text-[#111c2d]">AZN</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#777587]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(price.updatedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-xs font-bold text-[#3525cd] uppercase tracking-widest hover:underline">
                    View Product
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {data && (
          <div className="px-8 py-6 bg-[#f9f9ff] border-t border-[#c7c4d8]/10 flex items-center justify-between">
            <p className="text-xs font-bold text-[#777587] uppercase">
              Page {data.pageNumber + 1} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={data.pageNumber === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-[#c7c4d8]/20 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={data.pageNumber + 1 === data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-[#c7c4d8]/20 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
