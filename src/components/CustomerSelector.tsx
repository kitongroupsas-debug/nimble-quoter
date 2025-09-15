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
import { Customer } from "@/hooks/useSupabaseData";

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer?: Customer;
  onCustomerSelect: (customer: Customer) => void;
  onCreateNew: () => void;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onCustomerSelect,
  onCreateNew,
}) => {
  return (
    <div className="flex gap-2">
      <Select
        value={selectedCustomer?.id || ""}
        onValueChange={(value) => {
          if (value) {
            const customer = customers.find(c => c.id === value);
            if (customer) {
              onCustomerSelect(customer);
            }
          }
        }}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Seleccionar cliente existente" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id!}>
              <div className="flex flex-col">
                <span className="font-medium">{customer.name}</span>
                {customer.company && (
                  <span className="text-sm text-muted-foreground">
                    {customer.company}
                  </span>
                )}
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
        title="Crear nuevo cliente"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};