import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload as UploadIcon, 
  Search, 
  Package,
  FileSpreadsheet
} from 'lucide-react';
import { Product } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import BulkProductUpload from './BulkProductUpload';

interface ProductCatalogManagerProps {
  products: Product[];
  onSaveProduct: (product: Product) => Promise<Product | null>;
  onDeleteProduct?: (productId: string) => Promise<void>;
  uploadImage: (file: File, folder?: string) => Promise<string | null>;
  loading: boolean;
}

const ProductCatalogManager: React.FC<ProductCatalogManagerProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
  uploadImage,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product =>
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.item_number && product.item_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Crear nuevo producto
  const handleNewProduct = () => {
    const newProduct: Product = {
      item_number: '',
      description: '',
      unit_price: 0,
      quantity: 1,
      subtotal: 0,
      iva_percentage: 19,
      iva_amount: 0,
      total: 0,
      availability: 'Consultar',
      warranty: 'Garantía estándar'
    };
    setEditingProduct(newProduct);
    setIsDialogOpen(true);
  };

  // Editar producto existente
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsDialogOpen(true);
  };

  // Guardar producto
  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    if (!editingProduct.description.trim()) {
      toast({
        title: "Error",
        description: "La descripción del producto es obligatoria",
        variant: "destructive",
      });
      return;
    }

    if (editingProduct.unit_price <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser mayor a 0",
        variant: "destructive",
      });
      return;
    }

    try {
      // Recalcular totales
      const unitPrice = editingProduct.unit_price;
      const ivaPercentage = editingProduct.iva_percentage || 19;
      const subtotal = unitPrice;
      const ivaAmount = subtotal * (ivaPercentage / 100);
      const total = subtotal + ivaAmount;

      const productToSave: Product = {
        ...editingProduct,
        subtotal,
        iva_amount: ivaAmount,
        total,
        quantity: 1 // Siempre 1 para productos del catálogo
      };

      const savedProduct = await onSaveProduct(productToSave);
      if (savedProduct) {
        toast({
          title: "Producto guardado",
          description: "El producto se ha guardado correctamente en el catálogo",
        });
        setEditingProduct(null);
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      });
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (productId: string) => {
    if (!onDeleteProduct) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar este producto del catálogo?')) {
      try {
        await onDeleteProduct(productId);
        toast({
          title: "Producto eliminado",
          description: "El producto se ha eliminado del catálogo",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        });
      }
    }
  };

  // Manejar carga masiva
  const handleBulkUpload = async (newProducts: Product[]) => {
    let successCount = 0;
    const errors: string[] = [];

    for (const product of newProducts) {
      try {
        await onSaveProduct(product);
        successCount++;
      } catch (error) {
        errors.push(`Error al guardar "${product.description}": ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.error('Errores en carga masiva:', errors);
    }

    // El toast de éxito se maneja en BulkProductUpload
  };

  // Subir imagen del producto
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editingProduct) {
      try {
        const imageUrl = await uploadImage(file, 'products');
        if (imageUrl) {
          setEditingProduct({
            ...editingProduct,
            image_url: imageUrl
          });
          toast({
            title: "Imagen subida",
            description: "La imagen se ha subido correctamente",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo subir la imagen",
          variant: "destructive",
        });
      }
    }
  };

  if (showBulkUpload) {
    return (
      <BulkProductUpload
        onProductsUploaded={handleBulkUpload}
        onClose={() => setShowBulkUpload(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Catálogo de Productos
          </h2>
          <p className="text-muted-foreground">
            Gestiona tu catálogo de productos para reutilizar en cotizaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowBulkUpload(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Carga Masiva
          </Button>
          <Button onClick={handleNewProduct} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary">
          {filteredProducts.length} de {products.length} productos
        </Badge>
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {products.length === 0 ? 'No hay productos en el catálogo' : 'No se encontraron productos'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {products.length === 0 
                ? 'Agrega productos al catálogo para reutilizarlos en tus cotizaciones'
                : 'Intenta con otros términos de búsqueda'
              }
            </p>
            {products.length === 0 && (
              <div className="flex gap-2">
                <Button onClick={handleNewProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
                <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Carga Masiva
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Imagen</TableHead>
                    <TableHead className="w-24">Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-32">Precio</TableHead>
                    <TableHead className="w-20">IVA %</TableHead>
                    <TableHead className="w-32">Disponibilidad</TableHead>
                    <TableHead className="w-24">Garantía</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt="Producto"
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {product.item_number || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{product.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(product.unit_price)}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.iva_percentage}%
                      </TableCell>
                      <TableCell className="text-sm">
                        {product.availability || 'Consultar'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {product.warranty || 'Estándar'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {onDeleteProduct && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para editar/crear producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.id ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-4">
              {/* Imagen */}
              <div className="space-y-2">
                <Label>Imagen del Producto</Label>
                <div className="flex items-center gap-4">
                  {editingProduct.image_url ? (
                    <img
                      src={editingProduct.image_url}
                      alt="Producto"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('product-image-upload')?.click()}
                    >
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Subir Imagen
                    </Button>
                    <input
                      id="product-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Código del producto */}
              <div className="space-y-2">
                <Label>Código del Producto</Label>
                <Input
                  value={editingProduct.item_number || ''}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    item_number: e.target.value
                  })}
                  placeholder="Ej: PROD-001"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label>Descripción *</Label>
                <Textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    description: e.target.value
                  })}
                  placeholder="Descripción detallada del producto"
                  rows={3}
                />
              </div>

              {/* Precio e IVA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio Unitario *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct.unit_price}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      unit_price: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>IVA (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editingProduct.iva_percentage}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      iva_percentage: parseFloat(e.target.value) || 19
                    })}
                    placeholder="19"
                  />
                </div>
              </div>

              {/* Disponibilidad y Garantía */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Disponibilidad</Label>
                  <Input
                    value={editingProduct.availability || ''}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      availability: e.target.value
                    })}
                    placeholder="Ej: Inmediata, 2-3 días"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Garantía</Label>
                  <Input
                    value={editingProduct.warranty || ''}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      warranty: e.target.value
                    })}
                    placeholder="Ej: 1 año, 6 meses"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduct} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Producto'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalogManager;