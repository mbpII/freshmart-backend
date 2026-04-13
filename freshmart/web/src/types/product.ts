export type Unit = 'each' | 'lb' | 'oz' | 'kg' | 'g' | 'l' | 'ml';

export type ProductType = 'food' | 'non-food';

export type SaleInput =
  | { mode: 'price'; value: string }
  | { mode: 'discount'; value: string }
  | { mode: 'none' };

export type ProductCatalog = {
  productId: number;
  productName: string;
  category: string;
  upc: string;
  supplierName?: string;
  unitCost?: number;
  retailPrice: number;
  isOnSale: boolean;
  salesPriceModifier?: number;
  salePrice?: number;
  isFood: boolean;
  isActive: boolean;
  expirationDate?: string;
  reorderThreshold?: number;
  reorderQuantity?: number;
};

export type Product = ProductCatalog & {
  storeId: number;
  quantityOnHand: number;
  lastUpdated: string;
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
  reorderQuantity: number;
  productType: ProductType;
  reorderThreshold: number;
  expirationDate: string;
  isOnSale: boolean;
  saleMode: 'price' | 'percent';
  saleValue: string;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormData | 'sale', string>>;

export type ProductFormConfig = {
  categories: string[];
  defaults: Omit<ProductFormData, 'isOnSale' | 'saleMode' | 'saleValue'> & {
    isOnSale?: boolean;
    saleMode?: 'price' | 'percent';
    saleValue?: string;
  };
};