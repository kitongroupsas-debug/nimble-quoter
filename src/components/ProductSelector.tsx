import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Product } from "@/hooks/useSupabaseData";

interface ProductSelectorProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onCreateNew: () => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  onProductSelect,
  onCreateNew,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <Select
        onValueChange={(value) => {
          if (value) {
            const product = products.find(p => p.id === value);
            if (product) {
              onProductSelect(product);
            }
          }
        }}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Seleccionar producto del catálogo" />
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id!}>
              <div className="flex flex-col">
                <span className="font-medium">{product.description}</span>
                <div className="text-sm text-muted-foreground">
                  {product.item_number && (
                    <span>#{product.item_number} - </span>
                  )}
                  <span>${product.unit_price.toFixed(2)}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onCreateNew}
        title="Crear nuevo producto"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};