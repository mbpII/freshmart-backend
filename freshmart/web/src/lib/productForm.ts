import type { CreateProductInput, Product, ProductFormData, UpdateProductInput } from '../types/product';
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

export function computeSaleModifier(formData: ProductFormData): number | null {
  if (!formData.isOnSale || !formData.saleValue) return null;
  const val = parseFloat(formData.saleValue);
  if (!Number.isFinite(val) || val <= 0) return null;

  if (formData.saleMode === 'percent') {
    if (val >= 100) return null;
    return val;
  }

  if (val >= formData.retailPrice) return null;
  const mod = ((formData.retailPrice - val) / formData.retailPrice) * 100;
  if (!Number.isFinite(mod) || mod <= 0 || mod >= 100) return null;
  return Number(mod.toFixed(2));
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