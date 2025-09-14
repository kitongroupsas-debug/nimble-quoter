import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Customer } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface CustomerFormProps {
  customer: Customer;
  setCustomer: (customer: Customer) => void;
  onSave: (customer: Customer) => Promise<Customer | null>;
  loading: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, setCustomer, onSave, loading }) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveCustomer = async () => {
    if (!customer.name || !customer.email) {
      toast({
        title: "Error",
        description: "El nombre y email del cliente son requeridos.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const savedCustomer = await onSave(customer);
      if (savedCustomer) {
        setCustomer(savedCustomer);
        toast({
          title: "Cliente guardado",
          description: "Los datos del cliente se han guardado correctamente.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Customer Name */}
      <div className="space-y-2">
        <Label htmlFor="customer-name" className="text-sm font-medium">
          Nombre del Cliente *
        </Label>
        <Input
          id="customer-name"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          placeholder="Nombre completo del cliente"
          className="w-full"
        />
      </div>

      {/* Customer Company */}
      <div className="space-y-2">
        <Label htmlFor="customer-company" className="text-sm font-medium">
          Empresa del Cliente
        </Label>
        <Input
          id="customer-company"
          value={customer.company}
          onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
          placeholder="Nombre de la empresa del cliente"
          className="w-full"
        />
      </div>

      {/* Document */}
      <div className="space-y-2">
        <Label htmlFor="document" className="text-sm font-medium">
          NIT / Cédula *
        </Label>
        <Input
          id="document"
          value={customer.document}
          onChange={(e) => setCustomer({ ...customer, document: e.target.value })}
          placeholder="Número de identificación"
          className="w-full"
        />
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer-email" className="text-sm font-medium">
            Correo Electrónico *
          </Label>
          <Input
            id="customer-email"
            type="email"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            placeholder="cliente@email.com"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-phone" className="text-sm font-medium">
            Teléfono *
          </Label>
          <Input
            id="customer-phone"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            placeholder="+57 000 000 0000"
            className="w-full"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="customer-address" className="text-sm font-medium">
          Dirección
        </Label>
        <Textarea
          id="customer-address"
          value={customer.address}
          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
          placeholder="Dirección completa del cliente"
          rows={2}
          className="w-full resize-none"
        />
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t">
        <Button 
          onClick={handleSaveCustomer}
          disabled={saving || loading || !customer.name || !customer.email}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Cliente"}
        </Button>
      </div>
    </div>
  );
};

export default CustomerForm;