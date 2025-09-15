import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Settings, Save } from 'lucide-react';
import CompanySettings from './CompanySettings';
import CustomerForm from './CustomerForm';
import ProductTable from './ProductTable';
import QuotationPreview from './QuotationPreview';
import QuotationFormats from './QuotationFormats';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, Company, Customer, Product, Quotation } from '@/hooks/useSupabaseData';

// Interfaces are now imported from useSupabaseData hook

const QuotationApp = () => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const { 
    loading, 
    customers,
    productsCatalog,
    defaultCompany, 
    saveCompany, 
    saveCustomer,
    saveProductCatalog,
    saveQuotation, 
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
      total: 0
    }
  ]);

  // Load default company data when available
  useEffect(() => {
    if (defaultCompany) {
      setCompany(defaultCompany);
    }
  }, [defaultCompany]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Cotización-${quotationNumber}`,
    onAfterPrint: () => {
      toast({
        title: "Cotización descargada",
        description: "La cotización se ha descargado correctamente en formato PDF.",
      });
    }
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Sistema de Cotizaciones</h1>
          <p className="text-muted-foreground text-lg">Gestiona tus cotizaciones de manera profesional</p>
        </div>

        <div className="flex justify-center mb-6">
          <Button 
            onClick={handleSaveQuotation}
            disabled={saving || loading}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? "Guardando..." : "Guardar Cotización"}
          </Button>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
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
            </div>
            
            <div style={{ display: 'none' }}>
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