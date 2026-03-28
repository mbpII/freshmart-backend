import type { CreateProductInput, ProductFormData } from '../types/product';

export function buildCreateProductInput(formData: ProductFormData): CreateProductInput {
  return {
    productName: formData.productName.trim(),
    category: formData.category,
    upc: formData.upc.trim(),
    unit: 'each',
    isFood: formData.productType === 'food',
    quantityOnHand: formData.quantityOnHand,
    retailPrice: formData.retailPrice,
    reorderThreshold: formData.productType === 'food' ? formData.reorderThreshold : 0,
    expirationDate: formData.productType === 'food' ? formData.expirationDate : undefined,
    isOnSale: false,
    salePrice: undefined,
    discount: undefined,
    isActive: true,
  };
}
