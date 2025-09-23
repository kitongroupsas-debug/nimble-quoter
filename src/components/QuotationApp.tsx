import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Settings, Save, FolderOpen, Plus, Download } from 'lucide-react';
import CompanySettings from './CompanySettings';
import CustomerForm from './CustomerForm';
import ProductTable from './ProductTable';
import QuotationPreview from './QuotationPreview';
import QuotationFormats from './QuotationFormats';
import QuotationsList from './QuotationsList';
import ProductCatalogManager from './ProductCatalogManager';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, Company, Customer, Product, Quotation } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import html2pdf from 'html2pdf.js';

// Interfaces are now imported from useSupabaseData hook

const QuotationApp = () => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { 
    loading, 
    companies,
    customers,
    productsCatalog,
    quotations,
    defaultCompany, 
    saveCompany, 
    saveCustomer,
    saveProductCatalog,
    saveQuotation, 
    loadQuotationProducts,
    uploadImage 
  } = useSupabaseData();
  
  const [quotationNumber, setQuotationNumber] = useState(uuidv4().slice(0, 8).toUpperCase());
  const [quotationDate] = useState(new Date().toLocaleDateString('es-CO'));
  const [observations, setObservations] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'standard' | 'compact' | 'detailed'>('standard');
  const [saving, setSaving] = useState(false);
  
  const [company, setCompany] = useState<Company>({
    name: '',
    logo_url: '',
    nit: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    primary_color: '#3B82F6'
  });
  
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    company: '',
    document: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [products, setProducts] = useState<Product[]>([
    {
      id: uuidv4(),
      item_number: '1',
      description: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
      iva_percentage: 19,
      iva_amount: 0,
      total: 0,
      availability: '',
      warranty: ''
    }
  ]);

  // Load default company data when available
  useEffect(() => {
    if (defaultCompany) {
      setCompany(defaultCompany);
    }
  }, [defaultCompany]);

  // Detectar si es dispositivo móvil
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  };

  // Función para generar HTML completo de la cotización
  const generateQuotationHTML = () => {
    const totals = calculateTotals();
    const primaryColor = company.primary_color || '#2563eb';
    
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cotización ${quotationNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            color: #000;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
          }
          .logo-placeholder {
            width: 60px;
            height: 60px;
            background: #f3f4f6;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .company-info h1 {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .company-info p {
            color: #6b7280;
            font-size: 12px;
          }
          .quotation-info {
            text-align: right;
          }
          .quotation-info h2 {
            font-size: 20px;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 10px;
          }
          .quotation-info div {
            font-size: 12px;
            margin-bottom: 3px;
          }
          .customer-section {
            margin-bottom: 30px;
          }
          .customer-section h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .customer-info {
            font-size: 12px;
            line-height: 1.6;
          }
          .products-section {
            margin-bottom: 30px;
          }
          .products-section h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
          }
          .products-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d1d5db;
          }
          .products-table th,
          .products-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            font-size: 11px;
          }
          .products-table th {
            background-color: ${primaryColor}15;
            font-weight: 600;
            text-align: center;
          }
          .products-table td {
            text-align: center;
          }
          .products-table .desc-col {
            text-align: left;
            max-width: 200px;
          }
          .products-table .price-col {
            text-align: right;
          }
          .observations {
            margin-bottom: 30px;
          }
          .observations h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .observations-content {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            font-size: 12px;
            line-height: 1.6;
          }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
          }
          .totals-table {
            width: 300px;
            border-collapse: collapse;
            border: 1px solid #d1d5db;
          }
          .totals-table td {
            border: 1px solid #d1d5db;
            padding: 10px;
            font-size: 12px;
          }
          .totals-table .label {
            background: #f9fafb;
            font-weight: 600;
          }
          .totals-table .value {
            text-align: right;
          }
          .totals-table .total-row {
            background: ${primaryColor}15;
          }
          .totals-table .total-row td {
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
          }
          .contact-info {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
            font-size: 11px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .container { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-section">
              ${company.logo_url ? 
                `<img src="${company.logo_url}" alt="Logo" class="logo" />` :
                '<div class="logo-placeholder">🏢</div>'
              }
              <div class="company-info">
                <h1>${company.name || 'Empresa'}</h1>
                ${company.nit ? `<p><strong>NIT:</strong> ${company.nit}</p>` : ''}
              </div>
            </div>
            <div class="quotation-info">
              <h2>COTIZACIÓN</h2>
              <div><strong>No:</strong> ${quotationNumber}</div>
              <div><strong>Fecha:</strong> ${quotationDate}</div>
            </div>
          </div>

          <div class="customer-section">
            <h3>Datos del Cliente</h3>
            <div class="customer-info">
              <div><strong>Cliente:</strong> ${customer.name || 'N/A'}</div>
              ${customer.company ? `<div><strong>Empresa:</strong> ${customer.company}</div>` : ''}
              <div><strong>Documento:</strong> ${customer.document || 'N/A'}</div>
              <div><strong>Email:</strong> ${customer.email || 'N/A'}</div>
              <div><strong>Teléfono:</strong> ${customer.phone || 'N/A'}</div>
              ${customer.address ? `<div><strong>Dirección:</strong> ${customer.address}</div>` : ''}
            </div>
          </div>

          <div class="products-section">
            <h3>Productos y Servicios</h3>
            <table class="products-table">
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>DESCRIPCIÓN</th>
                  <th>DISPONIBILIDAD</th>
                  <th>GARANTÍA</th>
                  <th>CANT.</th>
                  <th>PRECIO UNIT.</th>
                  <th>IVA %</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(product => `
                  <tr>
                    <td>${product.item_number}</td>
                    <td class="desc-col">${product.description || 'Sin descripción'}</td>
                    <td>${product.availability || 'N/A'}</td>
                    <td>${product.warranty || 'N/A'}</td>
                    <td>${product.quantity}</td>
                    <td class="price-col">$${product.unit_price.toLocaleString('es-CO')}</td>
                    <td>${product.iva_percentage}%</td>
                    <td class="price-col"><strong>$${product.total.toLocaleString('es-CO')}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          ${observations ? `
            <div class="observations">
              <h3>Observaciones</h3>
              <div class="observations-content">
                ${observations.replace(/\n/g, '<br>')}
              </div>
            </div>
          ` : ''}

          <div class="totals-section">
            <table class="totals-table">
              <tbody>
                <tr>
                  <td class="label">Subtotal:</td>
                  <td class="value">$${totals.subtotal.toLocaleString('es-CO')}</td>
                </tr>
                <tr>
                  <td class="label">IVA:</td>
                  <td class="value">$${totals.totalIva.toLocaleString('es-CO')}</td>
                </tr>
                <tr class="total-row">
                  <td class="label">TOTAL:</td>
                  <td class="value" style="color: ${primaryColor};">$${totals.total.toLocaleString('es-CO')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div class="contact-info">
              ${company.phone ? `<div>📞 ${company.phone}</div>` : ''}
              ${company.email ? `<div>✉️ ${company.email}</div>` : ''}
              ${company.address ? `<div>📍 ${company.address}</div>` : ''}
              ${company.city ? `<div>${company.city}</div>` : ''}
            </div>
            <div>
              <p>Esta cotización es válida por 30 días a partir de la fecha de emisión.</p>
              <p>Gracias por su confianza en nuestros servicios.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Función mejorada para impresión que funciona en móviles
  const handlePrint = () => {
    if (isMobile()) {
      // En móviles: evitar el diálogo de impresión de Android y generar descarga directa
      handleDownloadPDF();
      return;
    }
    // En desktop usar react-to-print
    reactToPrintHandler();
  };

  const reactToPrintHandler = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Cotización-${quotationNumber}`,
    pageStyle: `
      @page {
        size: 11in 17in;
        margin: 0.5in;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .print-container { 
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 20px !important;
        }
      }
    `,
    onAfterPrint: () => {
      toast({
        title: "Cotización descargada",
        description: "La cotización se ha descargado correctamente en formato PDF.",
      });
    }
  });

  const handleDownloadPDF = async () => {
    try {
      if (!printRef.current) return;
      const element = printRef.current;

      // Esperar a que las imágenes carguen para evitar lienzos "manchados"
      const imgs = element.querySelectorAll('img');
      await Promise.all(
        Array.from(imgs).map((img) =>
          img.complete
            ? Promise.resolve(true)
            : new Promise((res) => {
                img.onload = () => res(true);
                img.onerror = () => res(true);
              })
        )
      );

      const opt: any = {
        margin: [10, 10, 10, 10],
        filename: `Cotizacion-${quotationNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: window.devicePixelRatio > 1 ? 2 : 1.5, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 },
        pagebreak: { mode: ['css', 'legacy'] },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      // @ts-ignore - html2pdf no tiene tipos
      await (html2pdf() as any).set(opt).from(element).save();

      toast({ title: 'PDF generado', description: 'La cotización se descargó correctamente.' });
    } catch (e) {
      console.error('PDF generation error', e);
      // @ts-ignore - variantes del toast
      toast({ title: 'Error al generar PDF', description: 'Intenta nuevamente.', variant: 'destructive' });
    }
  };

  const calculateTotals = () => {
    const subtotal = products.reduce((sum, product) => sum + product.subtotal, 0);
    const totalIva = products.reduce((sum, product) => sum + product.iva_amount, 0);
    const total = subtotal + totalIva;
    
    return { subtotal, totalIva, total };
  };

  const handleSaveQuotation = async () => {
    setSaving(true);
    try {
      // Save company if it has changes
      let companyId = company.id;
      if (!companyId || company.name) {
        const savedCompany = await saveCompany(company);
        if (savedCompany) {
          companyId = savedCompany.id;
          setCompany(savedCompany);
        }
      }

      // Save customer if it has data
      let customerId;
      if (customer.name || customer.email) {
        const savedCustomer = await saveCustomer(customer);
        if (savedCustomer) {
          customerId = savedCustomer.id;
          setCustomer(savedCustomer);
        }
      }

      // Prepare quotation data
      const totals = calculateTotals();
      const quotationData: Quotation = {
        quotation_number: quotationNumber,
        company_id: companyId,
        customer_id: customerId,
        quotation_date: new Date().toISOString().split('T')[0],
        observations,
        format: selectedFormat,
        subtotal: totals.subtotal,
        total_iva: totals.totalIva,
        total: totals.total,
        status: 'draft'
      };

      // Save quotation with products
      await saveQuotation(quotationData, products);
      
      toast({
        title: "Cotización guardada",
        description: "La cotización se ha guardado correctamente en la base de datos.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la cotización. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadQuotation = async (quotation: Quotation) => {
    try {
      // Load quotation data
      setQuotationNumber(quotation.quotation_number);
      setObservations(quotation.observations || '');
      setSelectedFormat(quotation.format as 'standard' | 'compact' | 'detailed' || 'standard');
      
      // Load quotation products
      const quotationProducts = await loadQuotationProducts(quotation.id!);
      setProducts(quotationProducts);
      
      // Load company and customer if available
      if (quotation.company_id && companies.length > 0) {
        const quotationCompany = companies.find(c => c.id === quotation.company_id);
        if (quotationCompany) {
          setCompany(quotationCompany);
        }
      }
      
      if (quotation.customer_id && customers.length > 0) {
        const quotationCustomer = customers.find(c => c.id === quotation.customer_id);
        if (quotationCustomer) {
          setCustomer(quotationCustomer);
        }
      }
      
      toast({
        title: "Cotización cargada",
        description: "La cotización se ha cargado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la cotización.",
        variant: "destructive",
      });
    }
  };

  const handleNewQuotation = () => {
    setQuotationNumber(uuidv4().slice(0, 8).toUpperCase());
    setObservations('');
    setSelectedFormat('standard');
    setProducts([
      {
        id: uuidv4(),
        item_number: '1',
        description: '',
        quantity: 1,
        unit_price: 0,
        subtotal: 0,
        iva_percentage: 19,
        iva_amount: 0,
        total: 0,
        availability: '',
        warranty: ''
      }
    ]);
    setCustomer({
      name: '',
      company: '',
      document: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Sistema de Cotizaciones</h1>
          <p className="text-muted-foreground text-lg">Gestiona tus cotizaciones de manera profesional</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex gap-4">
            <Button 
              onClick={handleNewQuotation}
              variant="outline"
              size="lg"
              className="shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Cotización
            </Button>
            <Button 
              onClick={handleSaveQuotation}
              disabled={saving || loading}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Guardando..." : "Guardar Cotización"}
            </Button>
            <Button 
              onClick={async () => {
                console.log('=== DEBUG INFO ===');
                console.log('User:', user?.id);
                console.log('Products Catalog:', productsCatalog);
                console.log('Companies:', companies);
                console.log('Customers:', customers);
                console.log('Quotations:', quotations);
                
                // Check database directly
                const { data: allProducts, error } = await supabase
                  .from('products')
                  .select('*')
                  .eq('user_id', user?.id || '');
                
                console.log('All products in DB:', allProducts);
                console.log('DB Error:', error);
                
                toast({
                  title: "Debug Info",
                  description: `Catálogo: ${productsCatalog.length} productos. Ver consola para detalles.`,
                });
              }}
              variant="outline"
              size="sm"
              className="bg-yellow-100 hover:bg-yellow-200"
            >
              🐛 Debug
            </Button>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
            <TabsTrigger value="quotations" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Cotizaciones
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Catálogo
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Crear
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vista Previa
            </TabsTrigger>
            <TabsTrigger value="print" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Imprimir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotations">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-primary mb-4">Cotizaciones Guardadas</h2>
                <QuotationsList
                  quotations={quotations}
                  onLoadQuotation={handleLoadQuotation}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catalog">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <ProductCatalogManager
                  products={productsCatalog}
                  onSaveProduct={saveProductCatalog}
                  uploadImage={uploadImage}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold text-primary mb-4">Configuración de Empresa</h2>
                    <CompanySettings 
                      company={company} 
                      setCompany={setCompany} 
                      onSave={saveCompany}
                      uploadImage={uploadImage}
                      loading={loading}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold text-primary mb-4">Datos del Cliente</h2>
          <CustomerForm
            customer={customer}
            setCustomer={setCustomer}
            onSave={saveCustomer}
            customers={customers}
            loading={loading}
          />
                  </CardContent>
                </Card>
            </div>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-primary mb-4">Productos y Servicios</h2>
            <ProductTable 
              products={products} 
              setProducts={setProducts}
              productsCatalog={productsCatalog}
              saveProductCatalog={saveProductCatalog}
              quotationNumber={quotationNumber} 
              setQuotationNumber={setQuotationNumber}
              quotationDate={quotationDate}
              observations={observations}
              setObservations={setObservations}
              uploadImage={uploadImage}
            />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="mb-6">
                  <Label htmlFor="format-select" className="text-sm font-medium">
                    Formato de Cotización
                  </Label>
                  <Select value={selectedFormat} onValueChange={(value: 'standard' | 'compact' | 'detailed') => setSelectedFormat(value)}>
                    <SelectTrigger className="w-full max-w-xs mt-2">
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Formato Estándar</SelectItem>
                      <SelectItem value="compact">Formato Compacto</SelectItem>
                      <SelectItem value="detailed">Formato Detallado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <QuotationFormats
                  company={company}
                  customer={customer}
                  products={products}
                  quotationNumber={quotationNumber}
                  quotationDate={quotationDate}
                  observations={observations}
                  totals={calculateTotals()}
                  format={selectedFormat}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="print" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="max-w-xs mx-auto">
                <Label htmlFor="print-format-select" className="text-sm font-medium">
                  Formato para Imprimir
                </Label>
                <Select value={selectedFormat} onValueChange={(value: 'standard' | 'compact' | 'detailed') => setSelectedFormat(value)}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Seleccionar formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Formato Estándar</SelectItem>
                    <SelectItem value="compact">Formato Compacto</SelectItem>
                    <SelectItem value="detailed">Formato Detallado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handlePrint}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 shadow-lg"
              >
                <Printer className="w-5 h-5 mr-2" />
                Descargar PDF ({selectedFormat === 'standard' ? 'Estándar' : selectedFormat === 'compact' ? 'Compacto' : 'Detallado'})
              </Button>
              <Button
                onClick={handleDownloadPDF}
                size="lg"
                variant="outline"
                className="mt-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Descargar PDF (Directo)
              </Button>
            </div>
            
            <div style={{ position: 'absolute', left: '-10000px', top: 0, opacity: 0, pointerEvents: 'none' }}>
              <div ref={printRef}>
                <QuotationFormats
                  company={company}
                  customer={customer}
                  products={products}
                  quotationNumber={quotationNumber}
                  quotationDate={quotationDate}
                  observations={observations}
                  totals={calculateTotals()}
                  format={selectedFormat}
                  isPrint={true}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuotationApp;