import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Company {
  id?: string;
  name: string;
  logo_url?: string;
  nit?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  primary_color?: string;
}

export interface Customer {
  id?: string;
  name: string;
  company?: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Product {
  id?: string;
  user_id?: string;
  quotation_id?: string;
  item_number?: string;
  description: string;
  image_url?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  iva_percentage: number;
  iva_amount: number;
  total: number;
  availability?: string;
  warranty?: string;
}

export interface Quotation {
  id?: string;
  quotation_number: string;
  company_id?: string;
  customer_id?: string;
  quotation_date: string;
  observations?: string;
  format?: string;
  subtotal: number;
  total_iva: number;
  total: number;
  status?: string;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Companies
  const [companies, setCompanies] = useState<Company[]>([]);
  const [defaultCompany, setDefaultCompany] = useState<Company | null>(null);

  // Customers
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Products Catalog (unified with quotation products)
  const [productsCatalog, setProductsCatalog] = useState<Product[]>([]);

  // Quotations
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Load user data
  useEffect(() => {
    if (user) {
      loadCompanies();
      loadCustomers();
      loadProductsCatalog();
      loadQuotations();
    }
  }, [user]);

  // Companies functions
  const loadCompanies = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Error al cargar las empresas",
        variant: "destructive",
      });
    } else {
      setCompanies(data || []);
      if (data && data.length > 0) {
        setDefaultCompany(data[0]);
      }
    }
    setLoading(false);
  };

  const saveCompany = async (company: Company) => {
    if (!user) return null;
    
    const companyData = {
      ...company,
      user_id: user.id,
    };

    if (company.id) {
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', company.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Error al actualizar la empresa",
          variant: "destructive",
        });
        return null;
      }

      loadCompanies();
      return data;
    } else {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Error al crear la empresa",
          variant: "destructive",
        });
        return null;
      }

      loadCompanies();
      setDefaultCompany(data);
      return data;
    }
  };

  // Customers functions
  const loadCustomers = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Error al cargar los clientes",
        variant: "destructive",
      });
    } else {
      setCustomers(data || []);
    }
  };

  const saveCustomer = async (customer: Customer) => {
    if (!user) return null;
    
    const customerData = {
      ...customer,
      user_id: user.id,
    };

    if (customer.id) {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', customer.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Error al actualizar el cliente",
          variant: "destructive",
        });
        return null;
      }

      loadCustomers();
      return data;
    } else {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Error al crear el cliente",
          variant: "destructive",
        });
        return null;
      }

      loadCustomers();
      return data;
    }
  };

  // Products functions (unified catalog and quotation products)
  const loadProductsCatalog = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .is('quotation_id', null) // Only catalog products (not linked to quotations)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products catalog:', error);
      toast({
        title: "Error",
        description: "Error al cargar el catálogo de productos",
        variant: "destructive",
      });
    } else {
      console.log('Products catalog loaded:', data);
      setProductsCatalog(data || []);
    }
  };

  const saveProductCatalog = async (product: Product) => {
    if (!user) return null;
    
    const productData = {
      ...product,
      user_id: user.id,
      quotation_id: null, // Catalog products don't have quotation_id
      iva_percentage: product.iva_percentage || 19, // Default 19%
    };

    if (product.id) {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Error al actualizar el producto",
          variant: "destructive",
        });
        return null;
      }

      loadProductsCatalog();
      return data;
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Error al crear el producto",
          variant: "destructive",
        });
        return null;
      }

      loadProductsCatalog();
      return data;
    }
  };

  // Quotations functions
  const loadQuotations = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Error al cargar las cotizaciones",
        variant: "destructive",
      });
    } else {
      setQuotations(data || []);
    }
  };

  const saveQuotation = async (quotation: Quotation, products: Product[]) => {
    if (!user) return null;
    
    const quotationData = {
      ...quotation,
      user_id: user.id,
    };

    let quotationResult;

    if (quotation.id) {
      const { data, error } = await supabase
        .from('quotations')
        .update(quotationData)
        .eq('id', quotation.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Error al actualizar la cotización",
          variant: "destructive",
        });
        return null;
      }
      quotationResult = data;
    } else {
      const { data, error } = await supabase
        .from('quotations')
        .insert([quotationData])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Error al crear la cotización",
          variant: "destructive",
        });
        return null;
      }
      quotationResult = data;
    }

    // Save products
    if (quotationResult?.id && products.length > 0) {
      // Delete existing products for this quotation
      await supabase
        .from('products')
        .delete()
        .eq('quotation_id', quotationResult.id);

      // Insert new products
      const productsData = products.map(product => ({
        ...product,
        quotation_id: quotationResult.id,
        user_id: user.id,
        iva_percentage: product.iva_percentage || 19, // Default 19%
      }));

      const { error: productsError } = await supabase
        .from('products')
        .insert(productsData);

      if (productsError) {
        toast({
          title: "Error",
          description: "Error al guardar los productos",
          variant: "destructive",
        });
      }
    }

    loadQuotations();
    return quotationResult;
  };

  const loadQuotationProducts = async (quotationId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('quotation_id', quotationId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Error al cargar los productos",
        variant: "destructive",
      });
      return [];
    }

    return data || [];
  };

  // Image upload
  const uploadImage = async (file: File, folder: string = 'logos') => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('quotation-images')
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive",
      });
      return null;
    }

    const { data } = supabase.storage
      .from('quotation-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  return {
    loading,
    companies,
    defaultCompany,
    customers,
    productsCatalog,
    quotations,
    saveCompany,
    saveCustomer,
    saveProductCatalog,
    saveQuotation,
    loadQuotationProducts,
    uploadImage,
    loadCompanies,
    loadCustomers,
    loadProductsCatalog,
    loadQuotations,
  };
};