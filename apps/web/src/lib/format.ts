export const formatCurrency = (amount: number): string =>
  `$${amount.toFixed(2)}`;

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const getDaysUntilExpiration = (expirationDate: string): number => {
  const exp = new Date(expirationDate);
  const today = new Date();
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const calculateSalePrice = (
  retailPrice: number,
  discount?: number,
  isPercentage: boolean = true
): number => {
  if (!discount) return retailPrice;

  if (isPercentage) {
    return retailPrice - (retailPrice * (discount / 100));
  }

  return retailPrice - discount;
};
