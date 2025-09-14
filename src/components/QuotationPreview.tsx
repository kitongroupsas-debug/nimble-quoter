import React from 'react';
import { Building2, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { Company, Customer, Product } from '@/hooks/useSupabaseData';

interface QuotationPreviewProps {
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
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  company,
  customer,
  products,
  quotationNumber,
  quotationDate,
  observations,
  totals,
  isPrint = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const containerClass = isPrint 
    ? "bg-white p-8 font-sans text-black min-h-screen print-container" 
    : "bg-white p-8 rounded-lg shadow-lg";

  const primaryColor = company.primaryColor || '#2563eb';

  return (
    <div className={containerClass} style={{ 
      '--primary-color': primaryColor,
      '--primary-color-rgb': primaryColor.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ') || '37, 99, 235'
    } as React.CSSProperties}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
        <div className="flex items-center gap-4">
          {company.logo ? (
            <img 
              src={company.logo} 
              alt="Logo" 
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
          <h2 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>COTIZACIÓN</h2>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">No:</span> {quotationNumber}</p>
            <p className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold">Fecha:</span> {quotationDate}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Datos del Cliente</h3>
        <div className="space-y-1 text-sm">
          <p><span className="font-semibold">Cliente:</span> {customer.name || 'N/A'}</p>
          {customer.company && <p><span className="font-semibold">Empresa:</span> {customer.company}</p>}
          <p><span className="font-semibold">Documento:</span> {customer.document || 'N/A'}</p>
          <p><span className="font-semibold">Email:</span> {customer.email || 'N/A'}</p>
          <p><span className="font-semibold">Teléfono:</span> {customer.phone || 'N/A'}</p>
          {customer.address && <p><span className="font-semibold">Dirección:</span> {customer.address}</p>}
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos y Servicios</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr style={{ backgroundColor: `${primaryColor}15` }}>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">ITEM</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">DESCRIPCIÓN</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">CANT.</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">DISPONIBILIDAD</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">GARANTÍA</th>
                  <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">PRECIO UNIT.</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">IVA %</th>
                  <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">SUBTOTAL</th>
                </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{product.item}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    <div className="max-w-[250px]">
                      <div className="break-words">{product.description || 'Sin descripción'}</div>
                      {product.image && (
                        <div className="mt-2">
                          <img 
                            src={product.image} 
                            alt="Producto" 
                            className="w-20 h-20 object-contain rounded border bg-white"
                            style={{ maxWidth: '80px', maxHeight: '80px' }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{product.quantity}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{product.deliveryTime || '-'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{product.warranty ? `${product.warranty} meses` : '-'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(product.unitPrice)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{product.iva}%</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">{formatCurrency(product.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observations */}
      {observations && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Observaciones
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{observations}</p>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80">
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Subtotal:</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(totals.subtotal)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">IVA:</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(totals.totalIva)}</td>
              </tr>
              <tr style={{ backgroundColor: `${primaryColor}15` }}>
                <td className="border border-gray-300 px-4 py-3 font-bold text-lg">TOTAL:</td>
                <td className="border border-gray-300 px-4 py-3 text-right font-bold text-lg" style={{ color: primaryColor }}>
                  {formatCurrency(totals.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with Company Contact */}
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
          <p>Esta cotización es válida por 30 días a partir de la fecha de emisión.</p>
          <p className="mt-2">Gracias por su confianza en nuestros servicios.</p>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreview;