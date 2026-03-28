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
  unit: Unit;
  isFood: boolean;
  quantityOnHand: number;
  lastUpdated: string;
  retailPrice: number;
  expirationDate?: string;
  reorderThreshold?: number;
  isOnSale: boolean;
  salePrice?: number;
  discount?: number;
  isActive: boolean;
};

export type CreateProductInput = Omit<Product, 'productId' | 'storeId' | 'lastUpdated'>;

export type UpdateProductInput = Partial<CreateProductInput>;

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
