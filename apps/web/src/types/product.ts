export type Unit = 'each' | 'lb' | 'oz' | 'kg' | 'g' | 'l' | 'ml';

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
