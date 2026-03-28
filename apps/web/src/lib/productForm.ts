import type {
  CreateProductInput,
  ProductFormData,
  ProductFormErrors,
  SaleInput,
} from '../types/product';

type SaleValues = Pick<CreateProductInput, 'discount' | 'isOnSale' | 'salePrice'>;

function getSaleValues(
  retailPrice: number,
  sale: SaleInput,
  canManageSales: boolean,
): SaleValues {
  if (!canManageSales || sale.mode === 'none') {
    return {
      isOnSale: false,
      salePrice: undefined,
      discount: undefined,
    };
  }

  if (sale.mode === 'price') {
    return {
      isOnSale: true,
      salePrice: Number.parseFloat(sale.value),
      discount: undefined,
    };
  }

  const discount = Number.parseFloat(sale.value) / 100;

  return {
    isOnSale: true,
    discount,
    salePrice: Number((retailPrice * (1 - discount)).toFixed(2)),
  };
}

function getSaleError(
  retailPrice: number,
  sale: SaleInput,
  canManageSales: boolean,
): string | undefined {
  if (!canManageSales || sale.mode === 'none') {
    return undefined;
  }

  if (sale.mode === 'price') {
    const salePrice = Number.parseFloat(sale.value);

    if (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= retailPrice) {
      return 'Sale price must be greater than 0 and lower than retail price';
    }
  }

  if (sale.mode === 'discount') {
    const discount = Number.parseFloat(sale.value);

    if (!Number.isFinite(discount) || discount <= 0 || discount >= 100) {
      return 'Discount must be greater than 0 and less than 100';
    }
  }

  return undefined;
}

export function validateProductForm(
  formData: ProductFormData,
  sale: SaleInput,
  canManageSales: boolean,
): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!formData.productName.trim()) {
    errors.productName = 'Product name is required';
  }

  if (!formData.category) {
    errors.category = 'Category is required';
  }

  if (!formData.upc.trim()) {
    errors.upc = 'UPC is required';
  }

  if (formData.quantityOnHand < 0) {
    errors.quantityOnHand = 'Initial quantity must be 0 or greater';
  }

  if (formData.retailPrice <= 0) {
    errors.retailPrice = 'Retail price must be greater than 0';
  }

  if (formData.productType === 'food') {
    if (formData.reorderThreshold < 0) {
      errors.reorderThreshold = 'Low stock threshold must be 0 or greater';
    }

    if (!formData.expirationDate) {
      errors.expirationDate = 'Expiration date is required for food products';
    }
  }

  const saleError = getSaleError(formData.retailPrice, sale, canManageSales);

  if (saleError) {
    errors.sale = saleError;
  }

  return errors;
}

export function buildCreateProductInput(
  formData: ProductFormData,
  sale: SaleInput,
  canManageSales: boolean,
): CreateProductInput {
  const saleValues = getSaleValues(formData.retailPrice, sale, canManageSales);

  return {
    productName: formData.productName.trim(),
    category: formData.category,
    upc: formData.upc.trim(),
    unit: formData.unit,
    isFood: formData.productType === 'food',
    quantityOnHand: formData.quantityOnHand,
    retailPrice: formData.retailPrice,
    reorderThreshold: formData.productType === 'food' ? formData.reorderThreshold : 0,
    expirationDate: formData.productType === 'food' ? formData.expirationDate : undefined,
    isActive: true,
    ...saleValues,
  };
}
