import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/products';
import type { Product } from '../types/product';

const STORE_ID = 101; // MVP: hardcoded

// Queries
export const useProductsQuery = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll(STORE_ID),
    staleTime: 30000,
  });

export const useProductQuery = (id: number) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id, STORE_ID),
    enabled: !!id,
  });

// Mutations
export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => 
      productApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};
