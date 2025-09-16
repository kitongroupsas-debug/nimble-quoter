import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Upload, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { ProductSelector } from './ProductSelector';

interface ProductTableProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  productsCatalog: Product[];
  saveProductCatalog: (product: Product) => Promise<Product | null>;
  quotationNumber: string;
  setQuotationNumber: (number: string) => void;
  quotationDate: string;
  observations: string;
  setObservations: (observations: string) => void;
  uploadImage: (file: File, folder?: string) => Promise<string | null>;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  setProducts,
  productsCatalog,
  saveProductCatalog,
  quotationNumber,
  setQuotationNumber,
  quotationDate,
  observations,
  setObservations,
  uploadImage
}) => {
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const addProduct = () => {
    const newProduct: Product = {
      id: uuidv4(),
      item_number: (products.length + 1).toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
      iva_percentage: 19,
      iva_amount: 0,
      total: 0,
      availability: '',
      warranty: ''
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    // Reorder items
    const reorderedProducts = updatedProducts.map((product, index) => ({
      ...product,
      item_number: (index + 1).toString()
    }));
    setProducts(reorderedProducts);
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, [field]: value };
        
        // Recalculate subtotal and totals when quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
          updatedProduct.subtotal = updatedProduct.quantity * updatedProduct.unit_price;
          updatedProduct.iva_amount = updatedProduct.subtotal * (updatedProduct.iva_percentage / 100);
          updatedProduct.total = updatedProduct.subtotal + updatedProduct.iva_amount;
        }
        
        // Recalculate when IVA percentage changes
        if (field === 'iva_percentage') {
          updatedProduct.iva_amount = updatedProduct.subtotal * (updatedProduct.iva_percentage / 100);
          updatedProduct.total = updatedProduct.subtotal + updatedProduct.iva_amount;
        }
        
        return updatedProduct;
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const handleImageUpload = async (productId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadingImages(prev => new Set(prev).add(productId));
      try {
        const imageUrl = await uploadImage(file, 'products');
        if (imageUrl) {
          updateProduct(productId, 'image_url', imageUrl);
          toast({
            title: "Imagen subida",
            description: "La imagen del producto se ha subido correctamente.",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo subir la imagen. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotals = () => {
    const subtotal = products.reduce((sum, product) => sum + product.subtotal, 0);
    const totalIva = products.reduce((sum, product) => sum + product.iva_amount, 0);
    const total = subtotal + totalIva;
    
    return { subtotal, totalIva, total };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Quotation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border">
        <div className="space-y-2">
          <Label htmlFor="quotation-number" className="text-sm font-medium">
            Número de Cotización
          </Label>
          <Input
            id="quotation-number"
            value={quotationNumber}
            onChange={(e) => setQuotationNumber(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fecha de Cotización
          </Label>
          <Input
            value={quotationDate}
            disabled
            className="w-full bg-muted"
          />
        </div>
      </div>

      {/* Product Selector */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <Label className="text-sm font-medium mb-2 block">
          Seleccionar Producto del Catálogo
        </Label>
        {productsCatalog.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No hay productos en el catálogo.</p>
            <p className="text-sm">Crea productos primero para poder seleccionarlos aquí.</p>
          </div>
        ) : (
        <ProductSelector
          products={productsCatalog}
          onProductSelect={(catalogProduct) => {
            const newProduct: Product = {
              id: uuidv4(),
              item_number: (products.length + 1).toString(),
              description: catalogProduct.description,
              quantity: 1,
              unit_price: catalogProduct.unit_price,
              subtotal: catalogProduct.unit_price,
              iva_percentage: catalogProduct.iva_percentage || 19,
              iva_amount: catalogProduct.unit_price * ((catalogProduct.iva_percentage || 19) / 100),
              total: catalogProduct.unit_price * (1 + (catalogProduct.iva_percentage || 19) / 100),
              availability: catalogProduct.availability || '',
              warranty: catalogProduct.warranty || '',
              image_url: catalogProduct.image_url
            };
            setProducts([...products, newProduct]);
          }}
          onCreateNew={async () => {
            // Create a product in the catalog first
            const newCatalogProduct: Product = {
              description: 'Nuevo producto',
              unit_price: 0,
              iva_percentage: 19,
              quantity: 1,
              subtotal: 0,
              iva_amount: 0,
              total: 0,
              availability: '',
              warranty: ''
            };
            await saveProductCatalog(newCatalogProduct);
          }}
        />
        )}
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5">
              <TableHead className="w-16">ITEM</TableHead>
              <TableHead className="min-w-48">DESCRIPCIÓN</TableHead>
              <TableHead className="w-32">DISPONIBILIDAD</TableHead>
              <TableHead className="w-32">GARANTÍA</TableHead>
              <TableHead className="w-20">CANT.</TableHead>
              <TableHead className="w-32">PRECIO UNIT.</TableHead>
              <TableHead className="w-20">IVA %</TableHead>
              <TableHead className="w-32">SUBTOTAL</TableHead>
              <TableHead className="w-32">TOTAL</TableHead>
              <TableHead className="w-20">IMAGEN</TableHead>
              <TableHead className="w-16">ACCIÓN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-b">
                <TableCell className="text-center font-medium">
                  {product.item_number}
                </TableCell>
                <TableCell>
                  <Textarea
                    value={product.description}
                    onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                    placeholder="Descripción del producto/servicio"
                    rows={2}
                    className="min-w-full resize-none"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.availability || ''}
                    onChange={(e) => updateProduct(product.id, 'availability', e.target.value)}
                    placeholder="Disponibilidad"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.warranty || ''}
                    onChange={(e) => updateProduct(product.id, 'warranty', e.target.value)}
                    placeholder="Garantía"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.unit_price}
                    onChange={(e) => updateProduct(product.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={product.iva_percentage}
                    onChange={(e) => updateProduct(product.id, 'iva_percentage', parseFloat(e.target.value) || 0)}
                    className="w-full text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(product.subtotal)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(product.total)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-2">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt="Producto" 
                        className="w-12 h-12 object-cover rounded border"
                      />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`image-${product.id}`)?.click()}
                      disabled={uploadingImages.has(product.id)}
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                    <input
                      id={`image-${product.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(product.id, e)}
                      className="hidden"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProduct(product.id)}
                    disabled={products.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Product Button */}
      <div className="flex justify-start">
        <Button onClick={addProduct} variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar Producto
        </Button>
      </div>

      {/* Observations */}
      <div className="space-y-2">
        <Label htmlFor="observations" className="text-sm font-medium">
          Observaciones
        </Label>
        <Textarea
          id="observations"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Observaciones adicionales de la cotización..."
          rows={3}
          className="w-full"
        />
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80 space-y-2 p-4 bg-gradient-card rounded-lg border shadow-md">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">IVA:</span>
            <span className="font-medium">{formatCurrency(totals.totalIva)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>TOTAL:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;