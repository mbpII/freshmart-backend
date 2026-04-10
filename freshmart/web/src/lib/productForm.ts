import type { CreateProductInput, ProductFormData } from '../types/product';
import { DEFAULT_STORE_ID } from './constants';

export function buildCreateProductInput(formData: ProductFormData): CreateProductInput {
  return {
    productName: formData.productName.trim(),
    category: formData.category,
    upc: formData.upc.trim(),
    retailPrice: formData.retailPrice,
    isFood: formData.productType === 'food',
    initialQuantity: formData.quantityOnHand,
    storeId: DEFAULT_STORE_ID,
    reorderThreshold: formData.productType === 'food' ? formData.reorderThreshold ?? 0 : 0,
    expirationDate: formData.productType === 'food' ? formData.expirationDate || undefined : undefined,
  };
}
