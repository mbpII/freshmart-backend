import type { CreateProductInput, Product, ProductFormData, UpdateProductInput } from '../types/product';

export function buildCreateProductInput(formData: ProductFormData, storeId: number): CreateProductInput {
  return {
    productName: formData.productName.trim(),
    category: formData.category,
    upc: formData.upc.trim(),
    retailPrice: formData.retailPrice,
    isFood: formData.productType === 'food',
    initialQuantity: formData.quantityOnHand,
    storeId,
    reorderThreshold: formData.productType === 'food' ? formData.reorderThreshold ?? 0 : 0,
    reorderQuantity: formData.reorderQuantity ?? 0,
    expirationDate: formData.productType === 'food' ? formData.expirationDate || undefined : undefined,
  };
}

export function buildUpdateProductInput(formData: ProductFormData): UpdateProductInput {
  return {
    productName: formData.productName.trim(),
    category: formData.category,
    upc: formData.upc.trim(),
    retailPrice: formData.retailPrice,
    isFood: formData.productType === 'food',
    reorderThreshold: formData.productType === 'food' ? formData.reorderThreshold ?? 0 : 0,
    reorderQuantity: formData.reorderQuantity ?? 0,
    expirationDate: formData.productType === 'food' ? formData.expirationDate || undefined : undefined,
  };
}

export function buildProductFormDefaults(product: Product): ProductFormData {
  return {
    productName: product.productName,
    category: product.category,
    upc: product.upc,
    quantityOnHand: product.quantityOnHand,
    reorderQuantity: product.reorderQuantity ?? 0,
    productType: product.isFood ? 'food' : 'non-food',
    reorderThreshold: product.reorderThreshold ?? 0,
    retailPrice: product.retailPrice,
    expirationDate: product.expirationDate ?? '',
    isOnSale: product.isOnSale,
    saleMode: 'price',
    saleValue: product.isOnSale && product.salePrice
      ? String(product.salePrice)
      : '',
  };
}
