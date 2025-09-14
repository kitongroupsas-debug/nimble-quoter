import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Building2, Save } from 'lucide-react';
import { Company } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface CompanySettingsProps {
  company: Company;
  setCompany: (company: Company) => void;
  onSave: (company: Company) => Promise<Company | null>;
  uploadImage: (file: File, folder?: string) => Promise<string | null>;
  loading: boolean;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ 
  company, 
  setCompany, 
  onSave, 
  uploadImage, 
  loading 
}) => {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const logoUrl = await uploadImage(file, 'logos');
        if (logoUrl) {
          setCompany({ ...company, logo_url: logoUrl });
          toast({
            title: "Logo subido",
            description: "El logo se ha subido correctamente.",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo subir el logo. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSaveCompany = async () => {
    if (!company.name) {
      toast({
        title: "Error",
        description: "El nombre de la empresa es requerido.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const savedCompany = await onSave(company);
      if (savedCompany) {
        setCompany(savedCompany);
        toast({
          title: "Empresa guardada",
          description: "Los datos de la empresa se han guardado correctamente.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la empresa. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
          {company.logo_url ? (
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border-2 border-border">
              <img 
                src={company.logo_url} 
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
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Subiendo..." : "Subir Logo"}
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
            value={company.primary_color || '#3B82F6'}
            onChange={(e) => setCompany({ ...company, primary_color: e.target.value })}
            className="w-16 h-10 p-1 rounded border cursor-pointer"
          />
          <Input
            value={company.primary_color || '#3B82F6'}
            onChange={(e) => setCompany({ ...company, primary_color: e.target.value })}
            placeholder="#3B82F6"
            className="flex-1"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t">
        <Button 
          onClick={handleSaveCompany}
          disabled={saving || loading || !company.name}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Empresa"}
        </Button>
      </div>
    </div>
  );
};

export default CompanySettings;