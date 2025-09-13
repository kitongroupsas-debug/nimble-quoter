import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Settings } from 'lucide-react';
import CompanySettings from './CompanySettings';
import CustomerForm from './CustomerForm';
import ProductTable from './ProductTable';
import QuotationPreview from './QuotationPreview';
import QuotationFormats from './QuotationFormats';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  name: string;
  logo: string;
  nit: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  primaryColor: string;
}

export interface Customer {
  name: string;
  company: string;
  document: string;
  email: string;
  phone: string;
  address: string;
}

export interface Product {
  id: string;
  item: number;
  description: string;
  quantity: number;
  deliveryTime: string;
  warranty: number;
  unitPrice: number;
  iva: number;
  subtotal: number;
  image?: string;
}

const QuotationApp = () => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [quotationNumber, setQuotationNumber] = useState(uuidv4().slice(0, 8).toUpperCase());
  const [quotationDate] = useState(new Date().toLocaleDateString('es-CO'));
  const [observations, setObservations] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'standard' | 'compact' | 'detailed'>('standard');
  
  const [company, setCompany] = useState<Company>({
    name: 'KITON GROUP SAS',
    logo: '/src/assets/kiton-logo.png',
    nit: '901.275.858-0',
    address: 'CLL 2A 24 33',
    city: 'BOGOTA, COLOMBIA',
    phone: '316 6221750',
    email: 'comercial@kitongroup.com',
    primaryColor: '#ff8000'
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
      item: 1,
      description: '',
      quantity: 1,
      deliveryTime: '',
      warranty: 0,
      unitPrice: 0,
      iva: 19,
      subtotal: 0
    }
  ]);

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
    const totalIva = products.reduce((sum, product) => sum + (product.subtotal * product.iva / 100), 0);
    const total = subtotal + totalIva;
    
    return { subtotal, totalIva, total };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Sistema de Cotizaciones</h1>
          <p className="text-muted-foreground text-lg">Gestiona tus cotizaciones de manera profesional</p>
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
                  <CompanySettings company={company} setCompany={setCompany} />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold text-primary mb-4">Datos del Cliente</h2>
                  <CustomerForm customer={customer} setCustomer={setCustomer} />
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-primary mb-4">Productos y Servicios</h2>
                <ProductTable 
                  products={products} 
                  setProducts={setProducts}
                  quotationNumber={quotationNumber}
                  setQuotationNumber={setQuotationNumber}
                  quotationDate={quotationDate}
                  observations={observations}
                  setObservations={setObservations}
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