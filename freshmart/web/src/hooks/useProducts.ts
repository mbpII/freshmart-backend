import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/products';
import type { CreateProductInput, UpdateProductInput } from '../types/product';

type StockMutationInput = {
  productId: number;
  storeId: number;
  quantityChange: number;
  notes: string;
};

type UseProductOptions = {
  enabled?: boolean;
};

function invalidateProductQueries(qc: ReturnType<typeof useQueryClient>, id: number, storeId: number) {
  qc.invalidateQueries({ queryKey: ['products', storeId] });
  qc.invalidateQueries({ queryKey: ['product', storeId, id] });
}

export function useProducts(storeId: number) {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: () => productApi.getAll(storeId),
    staleTime: 30000,
  });
}

export function useProduct(id: number, storeId: number, options?: UseProductOptions) {
  const enabled = !!id && (options?.enabled ?? true);

  return useQuery({
    queryKey: ['product', storeId, id],
    queryFn: () => productApi.getById(id, storeId),
    enabled,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productApi.create(data),
    onSuccess: (_, data) => qc.invalidateQueries({ queryKey: ['products', data.storeId] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; storeId: number; data: UpdateProductInput }) =>
      productApi.update(id, data),
    onSuccess: (_, { id, storeId }) => {
      invalidateProductQueries(qc, id, storeId);
    },
  });
}

export function useArchiveProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, storeId }: { productId: number; storeId: number }) =>
      productApi.archive(productId, storeId),
    onSuccess: (_, { storeId }) => qc.invalidateQueries({ queryKey: ['products', storeId] }),
  });
}

type MarkOnSaleInput = {
  productId: number;
  storeId: number;
  mode: 'percent' | 'flat';
  value: number;
};

export function useMarkOnSale() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, storeId, mode, value }: MarkOnSaleInput) =>
      mode === 'percent'
        ? productApi.markOnSaleByPercent(productId, value, storeId)
        : productApi.markOnSaleByFlat(productId, value, storeId),
    onSuccess: (_, { productId, storeId }) => invalidateProductQueries(qc, productId, storeId),
  });
}

export function useRemoveSale() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, storeId }: { productId: number; storeId: number }) =>
      productApi.removeSale(productId, storeId),
    onSuccess: (_, { productId, storeId }) => invalidateProductQueries(qc, productId, storeId),
  });
}

export function useReceiveStock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, storeId, quantityChange, notes }: StockMutationInput) =>
      productApi.receiveStock(productId, quantityChange, notes, storeId),
    onSuccess: (_, { productId, storeId }) => invalidateProductQueries(qc, productId, storeId),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, storeId, quantityChange, notes }: StockMutationInput) =>
      productApi.adjustStock(productId, quantityChange, notes, storeId),
    onSuccess: (_, { productId, storeId }) => invalidateProductQueries(qc, productId, storeId),
  });
}
