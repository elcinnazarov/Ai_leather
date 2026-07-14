import React, { useState, useEffect } from "react";
import { shippingService } from "../../../services/shippingService";
import { Search, Globe, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminShippingCountries() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await shippingService.getAllCountriesForAdmin();
      console.log("Backendden gelen data:", data); // F12 Console-da datanı görmək üçün
      setCountries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ölkələri gətirərkən xəta:", error);
      toast.error("Ölkə məlumatlarını yükləmək mümkün olmadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (countryCode: string, currentStatus: boolean) => {
    if (!countryCode) return;
    const newStatus = !currentStatus;
    
    // UI-ı optimistik olaraq dərhal yeniləyirik
    setCountries(countries.map(c => 
      c.countryCode === countryCode ? { ...c, isActive: newStatus } : c
    ));

    try {
      await shippingService.toggleCountryStatus(countryCode, newStatus);
      toast.success("Status uğurla yeniləndi");
    } catch (error) {
      console.error("Status dəyişərkən xəta:", error);
      toast.error("Statusu dəyişmək mümkün olmadı!");
      // Xəta olarsa, UI-ı əvvəlki vəziyyətinə qaytarırıq
      setCountries(countries.map(c => 
        c.countryCode === countryCode ? { ...c, isActive: currentStatus } : c
      ));
    }
  };

  // Axtarış filteri - Tamamilə backend-dən gələn countryCode və countryName-ə uyğunlaşdırıldı
  const filteredCountries = countries.filter(item => {
    if (!item) return false;
    
    const codeMatch = (item.countryCode || "").toLowerCase().includes(searchTerm.toLowerCase());
    const nameMatch = (item.countryName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return codeMatch || nameMatch;
  });

  return (
    <div className="p-8 md:p-12 font-sans pb-32">
      {/* Üst Başlıq */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111] tracking-wide flex items-center gap-3">
            <Globe className="w-8 h-8 text-indigo-600" />
            Çatdırılma Ölkələri
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">
            Qlobal çatdırılma istiqamətlərini aktivləşdirin və ya dayandırın
          </p>
        </div>
      </div>

      {/* Axtarış Paneli */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ölkə adı və ya kodu ilə axtarın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-800"
          />
        </div>
      </div>

      {/* Ölkələr Siyahısı */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Ölkə Kodu</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Ölkə Adı</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Status idarəsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCountries.map((item) => (
                <tr key={item.id || item.countryCode} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md font-bold">
                      {item.countryCode}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-semibold text-slate-800">
                      {item.countryName}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <label className="relative inline-flex items-center cursor-pointer justify-end">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={item.isActive === true}
                        onChange={() => handleToggle(item.countryCode, item.isActive)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-sm"></div>
                    </label>
                  </td>
                </tr>
              ))}
              
              {filteredCountries.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-400 text-sm">
                    Axtarışa uyğun ölkə tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}