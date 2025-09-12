import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Building2 } from 'lucide-react';
import { Company } from './QuotationApp';

interface CompanySettingsProps {
  company: Company;
  setCompany: (company: Company) => void;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ company, setCompany }) => {
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompany({ ...company, logo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label htmlFor="logo" className="text-sm font-medium">
          Logo de la Empresa
        </Label>
        <div className="flex items-center gap-4">
          {company.logo ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border-2 border-border">
              <img 
                src={company.logo} 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir Logo
            </Button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="company-name" className="text-sm font-medium">
          Nombre de la Empresa *
        </Label>
        <Input
          id="company-name"
          value={company.name}
          onChange={(e) => setCompany({ ...company, name: e.target.value })}
          placeholder="Ingrese el nombre de su empresa"
          className="w-full"
        />
      </div>

      {/* NIT */}
      <div className="space-y-2">
        <Label htmlFor="nit" className="text-sm font-medium">
          NIT
        </Label>
        <Input
          id="nit"
          value={company.nit}
          onChange={(e) => setCompany({ ...company, nit: e.target.value })}
          placeholder="000.000.000-0"
          className="w-full"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium">
          Dirección
        </Label>
        <Textarea
          id="address"
          value={company.address}
          onChange={(e) => setCompany({ ...company, address: e.target.value })}
          placeholder="Dirección completa de la empresa"
          rows={2}
          className="w-full resize-none"
        />
      </div>

      {/* Address and City */}
      <div className="space-y-2">
        <Label htmlFor="city" className="text-sm font-medium">
          Ciudad
        </Label>
        <Input
          id="city"
          value={company.city}
          onChange={(e) => setCompany({ ...company, city: e.target.value })}
          placeholder="Ciudad"
          className="w-full"
        />
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Teléfono
          </Label>
          <Input
            id="phone"
            value={company.phone}
            onChange={(e) => setCompany({ ...company, phone: e.target.value })}
            placeholder="+57 000 000 0000"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={company.email}
            onChange={(e) => setCompany({ ...company, email: e.target.value })}
            placeholder="contacto@empresa.com"
            className="w-full"
          />
        </div>
      </div>

      {/* Primary Color */}
      <div className="space-y-2">
        <Label htmlFor="primary-color" className="text-sm font-medium">
          Color Principal de la Marca
        </Label>
        <div className="flex items-center gap-4">
          <Input
            id="primary-color"
            type="color"
            value={company.primaryColor}
            onChange={(e) => setCompany({ ...company, primaryColor: e.target.value })}
            className="w-16 h-10 p-1 rounded border cursor-pointer"
          />
          <Input
            value={company.primaryColor}
            onChange={(e) => setCompany({ ...company, primaryColor: e.target.value })}
            placeholder="#2563eb"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;