import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/hooks/useSupabaseData';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface BulkProductUploadProps {
  onProductsUploaded: (products: Product[]) => Promise<void>;
  onClose: () => void;
}

interface ProductRow {
  descripcion: string;
  precio_unitario: number;
  iva_porcentaje: number;
  disponibilidad: string;
  garantia: string;
  numero_item?: string;
  url_imagen?: string;
}

const BulkProductUpload: React.FC<BulkProductUploadProps> = ({
  onProductsUploaded,
  onClose
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);
  const { toast } = useToast();

  // Generar archivo de ejemplo
  const generateExampleFile = (format: 'excel' | 'csv') => {
    const exampleData = [
      {
        numero_item: '001',
        descripcion: 'Laptop Dell Inspiron 15 3000 - Intel Core i5, 8GB RAM, 256GB SSD, Windows 11',
        precio_unitario: 2500000,
        iva_porcentaje: 19,
        disponibilidad: 'Inmediata',
        garantia: '1 año',
        url_imagen: 'https://example.com/laptop.jpg'
      },
      {
        numero_item: '002',
        descripcion: 'Mouse Inalámbrico Logitech MX Master 3 - Ergonómico, Bluetooth, Recargable',
        precio_unitario: 350000,
        iva_porcentaje: 19,
        disponibilidad: '2-3 días',
        garantia: '2 años',
        url_imagen: 'https://example.com/mouse.jpg'
      },
      {
        numero_item: '003',
        descripcion: 'Monitor Samsung 24" Full HD - IPS, 75Hz, HDMI, VGA',
        precio_unitario: 800000,
        iva_porcentaje: 19,
        disponibilidad: '1 semana',
        garantia: '3 años',
        url_imagen: 'https://example.com/monitor.jpg'
      },
      {
        numero_item: '004',
        descripcion: 'Teclado Mecánico Corsair K70 RGB - Cherry MX Red, Retroiluminado',
        precio_unitario: 450000,
        iva_porcentaje: 19,
        disponibilidad: 'Inmediata',
        garantia: '2 años',
        url_imagen: ''
      },
      {
        numero_item: '005',
        descripcion: 'Impresora HP LaserJet Pro M404n - Monocromática, Red, 38ppm',
        precio_unitario: 1200000,
        iva_porcentaje: 19,
        disponibilidad: '3-5 días',
        garantia: '1 año',
        url_imagen: 'https://example.com/printer.jpg'
      }
    ];

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(exampleData);
      const wb = XLSX.utils.book_new();
      
      // Configurar anchos de columna
      ws['!cols'] = [
        { wch: 12 }, // numero_item
        { wch: 60 }, // descripcion
        { wch: 15 }, // precio_unitario
        { wch: 12 }, // iva_porcentaje
        { wch: 15 }, // disponibilidad
        { wch: 10 }, // garantia
        { wch: 30 }  // url_imagen
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');
      XLSX.writeFile(wb, 'plantilla_productos.xlsx');
    } else {
      const csv = Papa.unparse(exampleData, {
        header: true,
        delimiter: ';' // Usar punto y coma para mejor compatibilidad con Excel en español
      });
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'plantilla_productos.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Archivo descargado",
      description: `Plantilla de productos descargada en formato ${format.toUpperCase()}`,
    });
  };

  // Validar datos del producto
  const validateProductRow = (row: any, index: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!row.descripcion || typeof row.descripcion !== 'string' || row.descripcion.trim().length === 0) {
      errors.push(`Fila ${index + 2}: La descripción es obligatoria`);
    }

    if (!row.precio_unitario || isNaN(Number(row.precio_unitario)) || Number(row.precio_unitario) <= 0) {
      errors.push(`Fila ${index + 2}: El precio unitario debe ser un número mayor a 0`);
    }

    if (row.iva_porcentaje !== undefined && (isNaN(Number(row.iva_porcentaje)) || Number(row.iva_porcentaje) < 0 || Number(row.iva_porcentaje) > 100)) {
      errors.push(`Fila ${index + 2}: El IVA debe ser un número entre 0 y 100`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Procesar archivo
  const processFile = async (file: File) => {
    return new Promise<ProductRow[]>((resolve, reject) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          delimiter: ';', // Detectar automáticamente el delimitador
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error(`Error al leer CSV: ${results.errors[0].message}`));
              return;
            }
            resolve(results.data as ProductRow[]);
          },
          error: (error) => {
            reject(new Error(`Error al procesar CSV: ${error.message}`));
          }
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as ProductRow[];
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Error al procesar Excel: ${error.message}`));
          }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Formato de archivo no soportado. Use CSV o Excel (.xlsx, .xls)'));
      }
    });
  };

  // Manejar subida de archivo
  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setResults(null);

    try {
      // Procesar archivo
      setProgress(20);
      const rows = await processFile(file);
      
      if (rows.length === 0) {
        throw new Error('El archivo está vacío o no contiene datos válidos');
      }

      setProgress(40);

      // Validar datos
      const validationErrors: string[] = [];
      const validProducts: Product[] = [];

      rows.forEach((row, index) => {
        const validation = validateProductRow(row, index);
        if (!validation.isValid) {
          validationErrors.push(...validation.errors);
        } else {
          // Convertir a formato Product
          const unitPrice = Number(row.precio_unitario);
          const ivaPercentage = Number(row.iva_porcentaje) || 19;
          const subtotal = unitPrice;
          const ivaAmount = subtotal * (ivaPercentage / 100);
          const total = subtotal + ivaAmount;

          const product: Product = {
            item_number: row.numero_item || '',
            description: row.descripcion.trim(),
            unit_price: unitPrice,
            quantity: 1, // Default para catálogo
            subtotal: subtotal,
            iva_percentage: ivaPercentage,
            iva_amount: ivaAmount,
            total: total,
            availability: row.disponibilidad || 'Consultar',
            warranty: row.garantia || 'Garantía estándar',
            image_url: row.url_imagen || undefined
          };

          validProducts.push(product);
        }
      });

      setProgress(60);

      if (validationErrors.length > 0 && validProducts.length === 0) {
        throw new Error(`Errores de validación:\n${validationErrors.join('\n')}`);
      }

      // Subir productos válidos
      setProgress(80);
      await onProductsUploaded(validProducts);
      setProgress(100);

      // Mostrar resultados
      setResults({
        success: validProducts.length,
        errors: validationErrors,
        total: rows.length
      });

      if (validProducts.length > 0) {
        toast({
          title: "Productos cargados",
          description: `${validProducts.length} productos agregados al catálogo exitosamente`,
        });
      }

    } catch (error) {
      console.error('Error al procesar archivo:', error);
      toast({
        title: "Error",
        description: error.message || "Error al procesar el archivo",
        variant: "destructive",
      });
      setResults({
        success: 0,
        errors: [error.message || "Error desconocido"],
        total: 0
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Carga Masiva de Productos
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Sube múltiples productos al catálogo usando archivos Excel o CSV
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Descargar plantillas */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">1. Descargar Plantilla</Label>
          <p className="text-sm text-muted-foreground">
            Descarga una plantilla con ejemplos para guiarte en el formato correcto
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => generateExampleFile('excel')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar Excel (.xlsx)
            </Button>
            <Button
              variant="outline"
              onClick={() => generateExampleFile('csv')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar CSV
            </Button>
          </div>
        </div>

        {/* Información de campos */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Campos Requeridos</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-red-600">*</span>
                <span className="font-medium">descripcion:</span>
                <span className="text-muted-foreground">Descripción del producto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-red-600">*</span>
                <span className="font-medium">precio_unitario:</span>
                <span className="text-muted-foreground">Precio sin IVA (número)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">iva_porcentaje:</span>
                <span className="text-muted-foreground">% de IVA (por defecto 19)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">numero_item:</span>
                <span className="text-muted-foreground">Código del producto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">disponibilidad:</span>
                <span className="text-muted-foreground">Tiempo de entrega</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">garantia:</span>
                <span className="text-muted-foreground">Período de garantía</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">url_imagen:</span>
                <span className="text-muted-foreground">URL de imagen (opcional)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subir archivo */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">2. Subir Archivo</Label>
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
              className="flex-1"
            />
            <Button
              onClick={handleFileUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Procesando...' : 'Subir'}
            </Button>
          </div>
        </div>

        {/* Progreso */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Procesando archivo...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Resultados */}
        {results && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Resultados</Label>
            
            {results.success > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{results.success}</strong> productos agregados exitosamente al catálogo
                </AlertDescription>
              </Alert>
            )}

            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <strong>Errores encontrados:</strong>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {results.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {results.errors.length > 10 && (
                        <li>... y {results.errors.length - 10} errores más</li>
                      )}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">
              Total de filas procesadas: {results.total}
            </div>
          </div>
        )}

        {/* Notas importantes */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <strong>Notas importantes:</strong>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Los archivos CSV deben usar punto y coma (;) como separador</li>
                <li>Los precios deben ser números sin formato (ej: 1500000, no $1.500.000)</li>
                <li>Las URLs de imágenes deben ser válidas y accesibles públicamente</li>
                <li>Los productos se agregarán al catálogo, no a una cotización específica</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BulkProductUpload;