import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import { Quotation } from '@/hooks/useSupabaseData';

interface QuotationsListProps {
  quotations: Quotation[];
  onLoadQuotation: (quotation: Quotation) => void;
  loading: boolean;
}

const QuotationsList: React.FC<QuotationsListProps> = ({
  quotations,
  onLoadQuotation,
  loading
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'sent':
        return <Badge variant="default">Enviada</Badge>;
      case 'approved':
        return <Badge className="bg-green-600">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazada</Badge>;
      default:
        return <Badge variant="secondary">Borrador</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando cotizaciones...</p>
        </div>
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay cotizaciones guardadas</h3>
        <p className="text-muted-foreground">
          Crea tu primera cotización usando la pestaña "Crear"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quotation) => (
              <TableRow key={quotation.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {quotation.quotation_number}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {formatDate(quotation.quotation_date)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">
                      {formatCurrency(quotation.total || 0)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(quotation.status || 'draft')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {quotation.format === 'standard' ? 'Estándar' : 
                     quotation.format === 'compact' ? 'Compacto' : 
                     quotation.format === 'detailed' ? 'Detallado' : 'Estándar'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => onLoadQuotation(quotation)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Cargar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuotationsList;