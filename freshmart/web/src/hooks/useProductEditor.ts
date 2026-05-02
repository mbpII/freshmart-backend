import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import {
  useCreateProduct,
  useMarkOnSale,
  useUpdateProduct,
} from './useProducts';
import {
  buildCreateProductInput,
  buildUpdateProductInput,
} from '../lib/productForm';
import type { ProductFormData } from '../types/product';

type UseProductEditorOptions = {
  productId: number;
  storeId: number;
  isEditMode: boolean;
  isManager: boolean;
  navigate: NavigateFunction;
  onEditSuccess?: () => void;
};

/**
 * Encapsulates create/update/markOnSale orchestration so that ProductEditorForm
 * only needs to handle rendering and form state.
 */
export function useProductEditor({
  productId,
  storeId,
  isEditMode,
  isManager,
  navigate,
  onEditSuccess,
}: UseProductEditorOptions) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const markOnSale = useMarkOnSale();
  const [saleError, setSaleError] = useState<Error | null>(null);

  const isPending =
    createProduct.isPending || updateProduct.isPending || markOnSale.isPending;
  const mutationError = (isEditMode ? updateProduct.error : createProduct.error) as
    | Error
    | null;
  const error = mutationError ?? saleError;

  const applyMarkOnSale = async (id: number, values: ProductFormData) => {
    if (!isManager || !values.isOnSale || !values.saleValue) return;
    const raw = parseFloat(values.saleValue);
    if (!Number.isFinite(raw) || raw <= 0) return;
    const mode = values.saleMode === 'price' ? 'flat' : 'percent';
    await markOnSale.mutateAsync({ productId: id, storeId, mode, value: raw });
  };

  const submit = (values: ProductFormData): void => {
    setSaleError(null);

    if (isEditMode) {
      updateProduct.mutate(
        { id: productId, storeId, data: buildUpdateProductInput(values) },
        {
          onSuccess: async () => {
            try {
              await applyMarkOnSale(productId, values);
            } catch (err) {
              setSaleError(err as Error);
              return;
            }
            if (onEditSuccess) {
              onEditSuccess();
              return;
            }
            navigate(`/products/${productId}`);
          },
        },
      );
      return;
    }

    createProduct.mutate(buildCreateProductInput(values, storeId), {
      onSuccess: async (created) => {
        try {
          await applyMarkOnSale(created.productId, values);
        } catch (err) {
          setSaleError(err as Error);
          return;
        }
        navigate('/');
      },
    });
  };

  return { submit, isPending, error };
}
