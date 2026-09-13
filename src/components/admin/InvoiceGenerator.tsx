import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Loader2, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { AdminOrderDetailResponse } from "../../types";

// === Lüks Brend Rəng Palitrası (Zara / Minimalist Luxury) ===
const BRAND_COLORS = {
  black: [17, 24, 39] as [number, number, number], // #111827 (Deep Onyx)
  charcoal: [55, 65, 81] as [number, number, number], // #374151
  muted: [107, 114, 128] as [number, number, number], // #6b7280
  lightGray: [243, 244, 246] as [number, number, number], // #f3f4f6
  border: [229, 231, 235] as [number, number, number], // #e5e7eb
  white: [255, 255, 255] as [number, number, number],
  goldAccent: [180, 142, 90] as [number, number, number], // #b48e5a (Luxury Gold)
};

interface InvoiceGeneratorProps {
  order: AdminOrderDetailResponse;
  variant?: "primary" | "outline" | "compact";
  className?: string;
}

export default function InvoiceGenerator({
  order,
  variant = "primary",
  className = "",
}: InvoiceGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // ✅ jsPDF üçün Azərbaycan simvollarını təmizləyən köməkçi funksiya (MYmmYdova -> Mammadova problemini həll edir)
  const cleanText = (text: string | undefined | null): string => {
    if (!text) return "";
    const charMap: Record<string, string> = {
      ə: "e", Ə: "E",
      ı: "i", I: "I", İ: "I",
      ğ: "g", Ğ: "G",
      ö: "o", Ö: "O",
      ü: "u", Ü: "U",
      ş: "s", Ş: "S",
      ç: "c", Ç: "C",
    };
    return text.replace(/[əƏıIİğĞöÖüÜşŞçÇ]/g, (match) => charMap[match] || match);
  };

  // Valyuta və Məbləğ formatı
  const formatMoney = (amount: number, currency: string) => {
    return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  // Tarix formatı
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }).toUpperCase();
  };

  // ✅ Loqonu asinxron yükləmə funksiyası
  const loadLogoImage = (url: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const generatePDF = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      const centerX = pageWidth / 2;

      let currentY = 14;

      // === 1. MƏRKƏZLƏŞDİRİLMİŞ LOGO VƏ BREND BAŞLIĞI (ZARA STYLE) ===
      // Vite mühitində public-dən loqonu oxuyur
      const logoImg = await loadLogoImage("/logo.png");
      
      if (logoImg) {
        const logoSize = 18;
        doc.addImage(logoImg, "PNG", centerX - logoSize / 2, currentY, logoSize, logoSize);
        currentY += logoSize + 4;
      } else {
        currentY += 4;
      }

      // Brend Adı (Geniş aralıqlı lüks tipoqrafiya)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...BRAND_COLORS.black);
      doc.text("E 1 0 0 0   L E A T H E R   H A N D M A D E", centerX, currentY, { align: "center" });

      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND_COLORS.muted);
      doc.text("ATELIER & BESPOKE LEATHER GOODS  •  BAKU", centerX, currentY, { align: "center" });

      currentY += 6;
      // Zərif ayırıcı xətt
      doc.setDrawColor(...BRAND_COLORS.border);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, pageWidth - margin, currentY);

      // === 2. TƏRƏFLƏR VƏ İNVOYS METADATASI (2 SÜTUNLU LÜKS DÜZÜLÜŞ) ===
      currentY += 10;
      const col2X = 125;

      // SOL SÜTUN: ALICI (CLIENT / SHIP TO)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND_COLORS.muted);
      doc.text("BILLED & DELIVERED TO", margin, currentY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...BRAND_COLORS.black);
      const customerName = cleanText(order.customer?.name || "Customer");
      doc.text(customerName, margin, currentY + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND_COLORS.charcoal);

      const customerEmail = cleanText(order.customerEmail || order.customer?.email || "");
      const customerPhone = cleanText(order.customerPhone || order.customer?.phone || "");
      let leftY = currentY + 10;

      if (customerEmail) {
        doc.text(customerEmail, margin, leftY);
        leftY += 4.5;
      }
      if (customerPhone) {
        doc.text(customerPhone, margin, leftY);
        leftY += 4.5;
      }

      const addressLine = [
        cleanText(order.deliveryAddress),
        cleanText(order.cityName ? `${order.cityName}${order.postalCode ? ` ${order.postalCode}` : ""}` : order.postalCode),
        cleanText(order.countryName || (order.country ? String(order.country) : "")),
      ].filter(Boolean).join(", ");

      const splitAddress = doc.splitTextToSize(addressLine || "Address on file", 90);
      doc.text(splitAddress, margin, leftY);
      leftY += splitAddress.length * 4.5;

      // SAĞ SÜTUN: INVOICE DETAILS
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND_COLORS.muted);
      doc.text("INVOICE SUMMARY", col2X, currentY);

      const rightMeta = [
        { label: "INVOICE NO:", val: order.orderNumber },
        { label: "DATE:", val: formatDate(order.createdAt) },
        { label: "PAYMENT DATE:", val: formatDate(order.paidAt) },
        { label: "STATUS:", val: cleanText(order.status) },
        { label: "CURRENCY:", val: order.currency },
      ];

      let rightY = currentY + 5.5;
      rightMeta.forEach((item) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...BRAND_COLORS.muted);
        doc.text(item.label, col2X, rightY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...BRAND_COLORS.black);
        doc.text(item.val, pageWidth - margin, rightY, { align: "right" });
        rightY += 4.5;
      });

      currentY = Math.max(leftY, rightY) + 6;

      // === 3. MƏHSUL CƏDVƏLİ (MINIMALIST ZARA THEME) ===
      const tableRows = order.items.map((item, idx) => [
        String(idx + 1).padStart(2, "0"),
        cleanText(item.productModelName),
        cleanText(item.leatherName || "Custom Leather"),
        String(item.quantity),
        formatMoney(item.unitPrice, order.currency),
        formatMoney(item.totalPrice, order.currency),
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["#", "ITEM / DESCRIPTION", "LEATHER & CRAFT", "QTY", "UNIT PRICE", "TOTAL"]],
        body: tableRows,
        margin: { left: margin, right: margin },
        theme: "plain",
        headStyles: {
          fillColor: BRAND_COLORS.black,
          textColor: BRAND_COLORS.white,
          fontSize: 7.5,
          fontStyle: "bold",
          cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
          halign: "left",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: BRAND_COLORS.black,
          cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center", textColor: BRAND_COLORS.muted },
          1: { cellWidth: "auto", fontStyle: "bold" },
          2: { cellWidth: 42, textColor: BRAND_COLORS.charcoal },
          3: { cellWidth: 14, halign: "center", fontStyle: "bold" },
          4: { cellWidth: 28, halign: "right" },
          5: { cellWidth: 32, halign: "right", fontStyle: "bold" },
        },
        didDrawCell: (data) => {
          // Zərif alt xətlər (table row border)
          if (data.section === "body" && data.row.index !== undefined) {
            doc.setDrawColor(...BRAND_COLORS.border);
            doc.setLineWidth(0.2);
            doc.line(
              data.cell.x,
              data.cell.y + data.cell.height,
              data.cell.x + data.cell.width,
              data.cell.y + data.cell.height
            );
          }
        },
      });

      // === 4. TOTALS HİSSƏSİ (MINIMALIST SAĞ BLOK) ===
      const lastTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
      let totalsY = lastTable ? lastTable.finalY + 8 : currentY + 60;

      if (totalsY > pageHeight - 45) {
        doc.addPage();
        totalsY = 20;
      }

      const summaryBoxWidth = 75;
      const summaryLeftX = pageWidth - margin - summaryBoxWidth;

      // Subtotal
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND_COLORS.muted);
      doc.text("SUBTOTAL", summaryLeftX, totalsY);
      doc.setTextColor(...BRAND_COLORS.black);
      doc.text(formatMoney(order.subTotal, order.currency), pageWidth - margin, totalsY, { align: "right" });

      // Shipping Fee
      totalsY += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND_COLORS.muted);
      doc.text("SHIPPING & HANDLING", summaryLeftX, totalsY);
      doc.setTextColor(...BRAND_COLORS.black);
      doc.text(formatMoney(order.shippingFee, order.currency), pageWidth - margin, totalsY, { align: "right" });

      // Qara İncə Xətt
      totalsY += 3.5;
      doc.setDrawColor(...BRAND_COLORS.black);
      doc.setLineWidth(0.5);
      doc.line(summaryLeftX, totalsY, pageWidth - margin, totalsY);

      // Final Total
      totalsY += 5.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND_COLORS.black);
      doc.text("TOTAL DUE", summaryLeftX, totalsY);
      doc.setFontSize(11);
      doc.text(formatMoney(order.finalPrice, order.currency), pageWidth - margin, totalsY, { align: "right" });

      // === 5. DİNAMİK FOOTER (HƏR SƏHİFƏNİN AŞAĞISINDA) ===
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        doc.setDrawColor(...BRAND_COLORS.border);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...BRAND_COLORS.muted);
        doc.text("E1000 LEATHER HANDMADE  •  SUPPORT@ATELIER.AZ", margin, pageHeight - 10);

        doc.text(
          `PAGE ${i} OF ${totalPages}  •  ${order.orderNumber}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        );
      }

      // Faylı yaddaşa yaz
      doc.save(`Invoice_${order.orderNumber}.pdf`);
      toast.success("İnvoys uğurla yükləndi");
    } catch (error) {
      console.error("Failed to generate PDF invoice:", error);
      toast.error("İnvoys yaradılarkən xəta baş verdi");
    } finally {
      setIsGenerating(false);
    }
  };

  // Düymə Stilləri
  const buttonStyles = {
    primary:
      "bg-[#111827] text-white hover:bg-[#000000] shadow-sm hover:shadow active:scale-95",
    outline:
      "bg-white border border-[#111827]/20 text-[#111827] hover:bg-[#f9fafb] active:scale-95",
    compact:
      "bg-[#f3f4f6] text-[#111827] hover:bg-[#e5e7eb] active:scale-95 px-3 py-2 text-xs",
  };

  return (
    <button
      type="button"
      onClick={generatePDF}
      disabled={isGenerating}
      aria-label={`Download Invoice for order ${order.orderNumber}`}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-xs tracking-wider uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles[variant]} ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Hazırlanır...</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          <span>İnvoys Yüklə (PDF)</span>
          <Download className="w-3.5 h-3.5 opacity-70" />
        </>
      )}
    </button>
  );
}