import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import QuotationPreview from "./QuotationPreview";
import { Company, Customer, Product } from "@/hooks/useSupabaseData";

interface QuotationAppProps {
  company: Company;
  customer: Customer;
  products: Product[];
  quotationNumber: string;
  quotationDate: string;
  observations: string;
  totals: {
    subtotal: number;
    totalIva: number;
    total: number;
  };
  format?: "standard" | "compact" | "detailed";
}

const QuotationApp: React.FC<QuotationAppProps> = ({
  company,
  customer,
  products,
  quotationNumber,
  quotationDate,
  observations,
  totals,
  format = "standard",
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrint, setIsPrint] = useState(false);

  // --- Desktop print ---
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Cotización-${quotationNumber}`,
    removeAfterPrint: true,
    onBeforeGetContent: () => setIsPrint(true),
    onAfterPrint: () => setIsPrint(false),
  });

  // --- Mobile print ---
  const handleMobilePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cotización-${quotationNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            img { max-width: 100%; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 4px; font-size: 12px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = async () => {
      // Esperar imágenes
      const imgs = printWindow.document.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            img.complete
              ? Promise.resolve(true)
              : new Promise((res) => {
                  img.onload = () => res(true);
                  img.onerror = () => res(true);
                })
        )
      );

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  // --- Download PDF ---
  const handleDownloadPDF = () => {
    if (!printRef.current) return;

    const opt: any = {
      margin: [10, 10, 10, 10],
      filename: `Cotizacion-${quotationNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(printRef.current).save();
  };

  return (
    <div className="space-y-4">
      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (/Mobi|Android/i.test(navigator.userAgent)) {
              handleMobilePrint();
            } else {
              handlePrint();
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Imprimir
        </button>

        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Descargar PDF
        </button>
      </div>

      {/* Vista previa */}
      <div ref={printRef}>
        <QuotationPreview
          company={company}
          customer={customer}
          products={products}
          quotationNumber={quotationNumber}
          quotationDate={quotationDate}
          observations={observations}
          totals={totals}
          isPrint={isPrint}
          format={format}
        />
      </div>
    </div>
  );
};

export default QuotationApp;
