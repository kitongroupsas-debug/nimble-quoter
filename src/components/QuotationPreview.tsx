import React from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import { Company, Customer, Product } from "@/hooks/useSupabaseData";

interface QuotationFormatProps {
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
  isPrint?: boolean;
  format: "standard" | "compact" | "detailed";
}

const QuotationPreview: React.FC<QuotationFormatProps> = ({
  company,
  customer,
  products,
  quotationNumber,
  quotationDate,
  observations,
  totals,
  isPrint = false,
  format = "standard",
}) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  const containerClass = isPrint
    ? "bg-white p-8 font-sans text-black w-full print-container"
    : "bg-white p-8 rounded-lg shadow-lg";

  const primaryColor = company.primary_color || "#2563eb";
  const rgbPrimary =
    primaryColor.replace("#", "").match(/.{2}/g)?.map((h) => parseInt(h, 16))
      .join(", ") || "37,99,235";

  // --- 🔹 Header (usado en todos los formatos)
  const Header = () => (
    <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
      <div className="flex items-center gap-4">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt="Logo"
            crossOrigin="anonymous"
            className="w-20 h-20 object-contain"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{company.name}</h1>
          {company.nit && (
            <p className="text-gray-600 mt-1 text-sm">
              <span className="font-semibold">NIT:</span> {company.nit}
            </p>
          )}
        </div>
      </div>

      <div className="text-right">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: primaryColor }}
        >
          COTIZACIÓN
        </h2>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-semibold">No:</span> {quotationNumber}
          </p>
          <p className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">Fecha:</span> {quotationDate}
          </p>
        </div>
      </div>
    </div>
  );

  // --- 🔹 Footer (usado en todos los formatos)
  const Footer = () => (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-700 mb-4">
        {company.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{company.phone}</span>
          </div>
        )}
        {company.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="break-all">{company.email}</span>
          </div>
        )}
        {company.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{company.address}</span>
          </div>
        )}
        {company.city && (
          <div className="text-center md:text-right">
            <span className="font-semibold">{company.city}</span>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-gray-600 border-t pt-4">
        <p>Esta cotización es válida por 30 días a partir de la fecha.</p>
        <p className="mt-2">Gracias por su confianza en nuestros servicios.</p>
      </div>
    </div>
  );

  // --- FORMATO STANDARD ---
  if (format === "standard") {
    return (
      <div
        className={containerClass}
        style={
          {
            "--primary-color": primaryColor,
            "--primary-color-rgb": rgbPrimary,
          } as React.CSSProperties
        }
      >
        <Header />
        {/* aquí va el mismo contenido que ya tenías (tabla completa) */}
        {/* ... */}
        <Footer />
      </div>
    );
  }

  // --- FORMATO COMPACT ---
  if (format === "compact") {
    return (
      <div className={containerClass}>
        <Header />
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Cliente: {customer.name}
          </h3>
          <p className="text-sm text-gray-600">
            {customer.document} - {customer.phone}
          </p>
        </div>
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr style={{ backgroundColor: `${primaryColor}15` }}>
              <th className="border p-1">ITEM</th>
              <th className="border p-1">DESCRIPCIÓN</th>
              <th className="border p-1">CANT.</th>
              <th className="border p-1">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="border p-1 text-center">{p.item_number}</td>
                <td className="border p-1">{p.description}</td>
                <td className="border p-1 text-center">{p.quantity}</td>
                <td className="border p-1 text-right">
                  {formatCurrency(p.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-right font-bold">
          TOTAL: {formatCurrency(totals.total)}
        </div>
        <Footer />
      </div>
    );
  }

  // --- FORMATO DETAILED ---
  if (format === "detailed") {
    return (
      <div className={containerClass}>
        <Header />
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Información Detallada
          </h3>
          {products.map((p) => (
            <div
              key={p.id}
              className="mb-4 border rounded-lg p-3 bg-gray-50 text-sm"
            >
              <p>
                <span className="font-semibold">Item:</span> {p.item_number}
              </p>
              <p>
                <span className="font-semibold">Descripción:</span>{" "}
                {p.description}
              </p>
              <p>
                <span className="font-semibold">Cantidad:</span> {p.quantity}
              </p>
              <p>
                <span className="font-semibold">Precio:</span>{" "}
                {formatCurrency(p.unit_price)}
              </p>
              <p>
                <span className="font-semibold">IVA:</span> {p.iva_percentage}%
              </p>
              <p>
                <span className="font-semibold">Total:</span>{" "}
                {formatCurrency(p.total)}
              </p>
            </div>
          ))}
        </div>
        <div className="text-right font-bold text-lg">
          GRAN TOTAL: {formatCurrency(totals.total)}
        </div>
        <Footer />
      </div>
    );
  }

  return null;
};

export default QuotationPreview;
