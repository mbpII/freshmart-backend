export type SaleInput =
  | { mode: 'price'; value: string }
  | { mode: 'discount'; value: string }
  | { mode: 'none' };

type Props = {
  retailPrice: number;
  sale: SaleInput;
  onChange: (sale: SaleInput) => void;
  error?: string;
};

export function MarkOnSale({ retailPrice, sale, onChange, error }: Props) {
  const salePrice = sale.mode === 'price' ? sale.value : '';
  const discount = sale.mode === 'discount' ? sale.value : '';

  const parsedDiscount = Number.parseFloat(discount);
  const discountPreview =
    sale.mode === 'discount' && Number.isFinite(parsedDiscount) && retailPrice > 0
      ? (retailPrice * (1 - parsedDiscount / 100)).toFixed(2)
      : null;

  const parsedSalePrice = Number.parseFloat(salePrice);
  const pricePreview =
    sale.mode === 'price' && Number.isFinite(parsedSalePrice) && retailPrice > 0
      ? (((retailPrice - parsedSalePrice) / retailPrice) * 100).toFixed(0)
      : null;

  return (
    <div className="space-y-4 rounded border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Mark as on sale</h4>
          <p className="text-sm text-gray-600">Choose a sale price or enter a discount percentage.</p>
        </div>

        {sale.mode !== 'none' && (
          <button
            type="button"
            onClick={() => onChange({ mode: 'none' })}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sale Price</label>
          <div className="flex items-center rounded border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-gray-400">
            <span className="mr-2 text-sm text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              onChange={(event) =>
                onChange(
                  event.target.value ? { mode: 'price', value: event.target.value } : { mode: 'none' },
                )
              }
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="0.00"
            />
          </div>
          {pricePreview && <p className="mt-1 text-xs text-gray-500">About {pricePreview}% off retail</p>}
        </div>

        <div className="hidden pb-2 text-sm font-medium text-gray-400 sm:block">or</div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Discount</label>
          <div className="flex items-center rounded border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-gray-400">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={discount}
              onChange={(event) =>
                onChange(
                  event.target.value ? { mode: 'discount', value: event.target.value } : { mode: 'none' },
                )
              }
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="10"
            />
            <span className="ml-2 text-sm text-gray-500">%</span>
          </div>
          {discountPreview && <p className="mt-1 text-xs text-gray-500">Estimated sale price: ${discountPreview}</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
