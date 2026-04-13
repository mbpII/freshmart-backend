import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/products';
import { DEFAULT_STORE_ID } from '../lib/constants';
import type { CreateProductInput, UpdateProductInput } from '../types/product';

type StockMutationInput = {
  productId: number;
  quantityChange: number;
  notes: string;
};

function invalidateProductQueries(qc: ReturnType<typeof useQueryClient>, id: number) {
  qc.invalidateQueries({ queryKey: ['products'] });
  qc.invalidateQueries({ queryKey: ['product', id] });
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll(DEFAULT_STORE_ID),
    staleTime: 30000,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id, DEFAULT_STORE_ID),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductInput }) =>
      productApi.update(id, data),
    onSuccess: (_, { id }) => {
      invalidateProductQueries(qc, id);
    },
  });
}

export function useArchiveProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => productApi.archive(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useMarkOnSale() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, salesPriceModifier }: { productId: number; salesPriceModifier: number }) =>
      productApi.markOnSale(productId, salesPriceModifier),
    onSuccess: (_, { productId }) => invalidateProductQueries(qc, productId),
  });
}

export function useRemoveSale() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => productApi.removeSale(productId),
    onSuccess: (_, productId) => invalidateProductQueries(qc, productId),
  });
}

export function useReceiveStock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantityChange, notes }: StockMutationInput) =>
      productApi.receiveStock(productId, quantityChange, notes),
    onSuccess: (_, { productId }) => invalidateProductQueries(qc, productId),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantityChange, notes }: StockMutationInput) =>
      productApi.adjustStock(productId, quantityChange, notes),
    onSuccess: (_, { productId }) => invalidateProductQueries(qc, productId),
  });
}
