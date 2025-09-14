import React from 'react';
import { Building2, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { Company, Customer, Product } from '@/hooks/useSupabaseData';

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
  format: 'standard' | 'compact' | 'detailed';
}

const QuotationFormats: React.FC<QuotationFormatProps> = ({
  company,
  customer,
  products,
  quotationNumber,
  quotationDate,
  observations,
  totals,
  isPrint = false,
  format = 'standard'
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

  const primaryColor = company.primary_color || '#2563eb';

  // Standard Format (existing format)
  if (format === 'standard') {
    return (
      <div className={containerClass} style={{ 
        '--primary-color': primaryColor,
        '--primary-color-rgb': primaryColor.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ') || '37, 99, 235'
      } as React.CSSProperties}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
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
            <p><span className="font-semibold">NIT/CC:</span> {customer.document || 'N/A'}</p>
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
                  <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">PRECIO UNIT.</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">IVA %</th>
                  <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 text-center text-sm">{product.item_number}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      <div className="max-w-[250px]">
                        <div className="break-words">{product.description || 'Sin descripción'}</div>
                        {product.image_url && (
                          <div className="mt-2">
                            <img 
                              src={product.image_url} 
                              alt="Producto" 
                              className="w-20 h-20 object-contain rounded border bg-white"
                              style={{ maxWidth: '80px', maxHeight: '80px' }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center text-sm">{product.quantity}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right text-sm">{formatCurrency(product.unit_price)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center text-sm">{product.iva_percentage}%</td>
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
  }

  // Compact Format
  if (format === 'compact') {
    return (
      <div className={containerClass} style={{ 
        '--primary-color': primaryColor,
        '--primary-color-rgb': primaryColor.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ') || '37, 99, 235'
      } as React.CSSProperties}>
        {/* Compact Header */}
        <div className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: primaryColor }}>
          <div className="flex justify-center items-center gap-4 mb-4">
            {company.logo_url && (
              <img 
                src={company.logo_url} 
                alt="Logo" 
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>{company.name}</h1>
              {company.nit && <p className="text-sm text-gray-600">NIT: {company.nit}</p>}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800">COTIZACIÓN #{quotationNumber}</h2>
          <p className="text-sm text-gray-600">Fecha: {quotationDate}</p>
        </div>

        {/* Compact Customer & Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Cliente:</h3>
            <div className="text-sm space-y-1">
              <p>{customer.name}</p>
              {customer.company && <p>{customer.company}</p>}
              <p>{customer.document}</p>
              <p>{customer.email}</p>
              <p>{customer.phone}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Resumen:</h3>
            <div className="text-sm space-y-1">
              <p>Items: {products.length}</p>
              <p>Subtotal: {formatCurrency(totals.subtotal)}</p>
              <p>IVA: {formatCurrency(totals.totalIva)}</p>
              <p className="font-bold text-lg" style={{ color: primaryColor }}>
                Total: {formatCurrency(totals.total)}
              </p>
            </div>
          </div>
        </div>

        {/* Compact Products List */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Productos:</h3>
          {products.map((product) => (
            <div key={product.id} className="border-b border-gray-200 py-3 grid grid-cols-1 md:grid-cols-7 gap-4 items-start">
              <div className="md:col-span-3">
                <p className="font-medium text-sm">{product.item_number}. {product.description}</p>
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt="Producto" 
                    className="w-16 h-16 object-contain rounded border bg-white mt-2"
                  />
                )}
              </div>
              <div className="text-sm">Cant: {product.quantity}</div>
              <div className="text-sm"></div>
              <div className="text-sm"></div>
              <div className="text-sm font-medium text-right">
                {formatCurrency(product.subtotal)}
              </div>
            </div>
          ))}
        </div>

        {/* Compact Footer */}
        <div className="text-center text-xs text-gray-600 border-t pt-4">
          <div className="flex justify-center gap-4 mb-2">
            {company.phone && <span>{company.phone}</span>}
            {company.email && <span>{company.email}</span>}
          </div>
          {company.address && <p>{company.address}, {company.city}</p>}
          <p className="mt-2">Cotización válida por 30 días</p>
        </div>
      </div>
    );
  }

  // Detailed Format
  if (format === 'detailed') {
    return (
      <div className={containerClass} style={{ 
        '--primary-color': primaryColor,
        '--primary-color-rgb': primaryColor.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ') || '37, 99, 235'
      } as React.CSSProperties}>
        {/* Detailed Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-4">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt="Logo" 
                  className="w-24 h-24 object-contain"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold text-gray-800">{company.name}</h1>
                {company.nit && (
                  <p className="text-gray-600 mt-1">
                    <span className="font-semibold">NIT:</span> {company.nit}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right bg-gray-50 p-4 rounded-lg">
              <h2 className="text-3xl font-bold mb-3" style={{ color: primaryColor }}>COTIZACIÓN DETALLADA</h2>
              <div className="space-y-2">
                <p><span className="font-semibold">Número:</span> {quotationNumber}</p>
                <p className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">Fecha:</span> {quotationDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Customer Info */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4" style={{ color: primaryColor }}>
            Información del Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><span className="font-semibold">Nombre:</span> {customer.name || 'N/A'}</p>
              {customer.company && <p><span className="font-semibold">Empresa:</span> {customer.company}</p>}
              <p><span className="font-semibold">NIT/CC:</span> {customer.document || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Email:</span> {customer.email || 'N/A'}</p>
              <p><span className="font-semibold">Teléfono:</span> {customer.phone || 'N/A'}</p>
              {customer.address && <p><span className="font-semibold">Dirección:</span> {customer.address}</p>}
            </div>
          </div>
        </div>

        {/* Detailed Products Table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4" style={{ color: primaryColor }}>
            Detalle de Productos y Servicios
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr style={{ backgroundColor: `${primaryColor}20` }}>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">ITEM</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">DESCRIPCIÓN DETALLADA</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">CANTIDAD</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">DISPONIBILIDAD</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">GARANTÍA</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">PRECIO UNITARIO</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">IVA %</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-3 text-center font-medium">{product.item_number}</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="max-w-[300px]">
                        <div className="break-words text-sm leading-relaxed">
                          {product.description || 'Sin descripción'}
                        </div>
                        {product.image_url && (
                          <div className="mt-3">
                            <img 
                              src={product.image_url} 
                              alt="Producto" 
                              className="w-24 h-24 object-contain rounded border bg-white shadow-sm"
                              style={{ maxWidth: '96px', maxHeight: '96px' }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center font-medium">{product.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">{formatCurrency(product.unit_price)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{product.iva_percentage}%</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-bold text-lg">{formatCurrency(product.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Observations */}
        {observations && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-600" />
              Observaciones Especiales
            </h3>
            <div className="bg-white p-4 rounded border">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{observations}</p>
            </div>
          </div>
        )}

        {/* Detailed Totals */}
        <div className="mb-8">
          <div className="flex justify-end">
            <div className="w-96">
              <table className="w-full border-collapse border border-gray-300 shadow-lg">
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-6 py-3 font-semibold text-lg">Subtotal:</td>
                    <td className="border border-gray-300 px-6 py-3 text-right text-lg">{formatCurrency(totals.subtotal)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-6 py-3 font-semibold text-lg">IVA Total:</td>
                    <td className="border border-gray-300 px-6 py-3 text-right text-lg">{formatCurrency(totals.totalIva)}</td>
                  </tr>
                  <tr style={{ backgroundColor: `${primaryColor}25` }}>
                    <td className="border border-gray-300 px-6 py-4 font-bold text-2xl">TOTAL GENERAL:</td>
                    <td className="border border-gray-300 px-6 py-4 text-right font-bold text-2xl" style={{ color: primaryColor }}>
                      {formatCurrency(totals.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detailed Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Información de Contacto:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                    <span>{company.address}</span>
                  </div>
                )}
                {company.city && (
                  <div className="mt-2">
                    <span className="font-semibold">{company.city}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Términos y Condiciones:</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• Esta cotización es válida por 30 días calendario.</p>
                <p>• Los precios incluyen IVA cuando aplique.</p>
                <p>• Sujeto a disponibilidad de inventario.</p>
                <p>• Para más información, no dude en contactarnos.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600 border-t pt-4">
            <p className="font-medium">Gracias por su confianza en nuestros productos y servicios.</p>
            <p className="mt-1" style={{ color: primaryColor }}>
              {company.name} - Comprometidos con la excelencia
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuotationFormats;