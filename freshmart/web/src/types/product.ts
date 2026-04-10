export type Unit = 'each' | 'lb' | 'oz' | 'kg' | 'g' | 'l' | 'ml';

export type ProductType = 'food' | 'non-food';

export type SaleInput =
  | { mode: 'price'; value: string }
  | { mode: 'discount'; value: string }
  | { mode: 'none' };

export type Product = {
  productId: number;
  storeId: number;
  productName: string;
  category: string;
  upc: string;
  supplierName?: string;
  unitCost?: number;
  retailPrice: number;
  isOnSale: boolean;
  salePrice?: number;
  quantityOnHand: number;
  lastUpdated: string;
  isFood: boolean;
  isActive: boolean;
  expirationDate?: string;
  reorderThreshold?: number;
  reorderQuantity?: number;
  inventoryId?: number;
};

export type CreateProductInput = {
  productName: string;
  category: string;
  upc: string;
  supplierId?: number;
  unitCost?: number;
  retailPrice: number;
  isFood: boolean;
  reorderThreshold?: number;
  reorderQuantity?: number;
  expirationDate?: string;
  initialQuantity: number;
  storeId: number;
};

export type UpdateProductInput = Partial<{
  productName: string;
  category: string;
  upc: string;
  supplierId: number;
  unitCost: number;
  retailPrice: number;
  isFood: boolean;
  reorderThreshold: number;
  reorderQuantity: number;
  expirationDate: string;
}>;

export type ProductFormData = Pick<
  Product,
  'productName' | 'category' | 'upc' | 'quantityOnHand' | 'retailPrice'
> & {
  productType: ProductType;
  reorderThreshold: number;
  expirationDate: string;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormData | 'sale', string>>;

export type ProductFormConfig = {
  categories: string[];
  defaults: ProductFormData;
};
