import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useAdjustStock,
  useArchiveProduct,
  useMarkOnSale,
  useProduct,
  useReceiveStock,
  useRemoveSale,
  useSellStock,
} from '../../hooks/useProducts';
import { formatCurrency, formatDate } from '../../lib/format';

type StockAction = 'receive' | 'sell' | 'adjust';
type SaleInputMode = 'price' | 'percent';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { data: product, isLoading } = useProduct(productId);
  const archiveProduct = useArchiveProduct();
  const markOnSale = useMarkOnSale();
  const removeSale = useRemoveSale();
  const receiveStock = useReceiveStock();
  const sellStock = useSellStock();
  const adjustStock = useAdjustStock();

  const [stockAction, setStockAction] = useState<StockAction>('receive');
  const [stockQuantityInput, setStockQuantityInput] = useState('');
  const [stockNotes, setStockNotes] = useState('');
  const [stockError, setStockError] = useState('');

  const [saleMode, setSaleMode] = useState<SaleInputMode>('price');
  const [salePriceInput, setSalePriceInput] = useState('');
  const [salePercentInput, setSalePercentInput] = useState('');
  const [saleError, setSaleError] = useState('');

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!product) return <div className="p-4">Product not found</div>;

  const stockPending = receiveStock.isPending || sellStock.isPending || adjustStock.isPending;
  const salePending = markOnSale.isPending || removeSale.isPending;

  const stockMutationError =
    (receiveStock.error as Error | null)?.message ||
    (sellStock.error as Error | null)?.message ||
    (adjustStock.error as Error | null)?.message ||
    '';

  const saleMutationError =
    (markOnSale.error as Error | null)?.message || (removeSale.error as Error | null)?.message || '';

  const handleArchive = () => {
    if (confirm('Remove this product from inventory?')) {
      archiveProduct.mutate(productId, { onSuccess: () => navigate('/') });
    }
  };

  const handleStockSubmit = () => {
    setStockError('');

    const parsedQuantity = Number(stockQuantityInput);
    if (!Number.isFinite(parsedQuantity) || !Number.isInteger(parsedQuantity)) {
      setStockError('Enter a valid quantity.');
      return;
    }

    const quantity = parsedQuantity;

    if (!stockNotes.trim()) {
      setStockError('Notes are required.');
      return;
    }

    switch (stockAction) {
      case 'receive':
      case 'sell':
        if (quantity <= 0) {
          setStockError('Quantity must be greater than 0.');
          return;
        }
        break;
      case 'adjust':
        if (quantity === 0) {
          setStockError('Adjustment quantity cannot be 0.');
          return;
        }
        break;
    }

    const payload = {
      productId,
      quantityChange: quantity,
      notes: stockNotes.trim(),
    };

    const onSuccess = () => {
      setStockQuantityInput('');
      setStockNotes('');
    };

    switch (stockAction) {
      case 'receive':
        receiveStock.mutate(payload, { onSuccess });
        break;
      case 'sell':
        sellStock.mutate(payload, { onSuccess });
        break;
      case 'adjust':
        adjustStock.mutate(payload, { onSuccess });
        break;
    }
  };

  const convertToModifier = (): number | null => {
    if (saleMode === 'percent') {
      const parsed = Number.parseFloat(salePercentInput);
      if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 100) {
        setSaleError('Percent off must be greater than 0 and less than 100.');
        return null;
      }
      return parsed;
    }

    const salePrice = Number.parseFloat(salePriceInput);
    if (!Number.isFinite(salePrice) || salePrice <= 0) {
      setSaleError('Sale price must be greater than 0.');
      return null;
    }
    if (salePrice >= product.retailPrice) {
      setSaleError('Sale price must be lower than retail price.');
      return null;
    }

    const modifier = ((product.retailPrice - salePrice) / product.retailPrice) * 100;
    if (!Number.isFinite(modifier) || modifier <= 0 || modifier >= 100) {
      setSaleError('Unable to derive a valid sales price modifier from sale price.');
      return null;
    }

    return Number(modifier.toFixed(2));
  };

  const handleApplySale = () => {
    setSaleError('');
    const salesPriceModifier = convertToModifier();
    if (salesPriceModifier == null) {
      return;
    }

    markOnSale.mutate(
      { productId, salesPriceModifier },
      {
        onSuccess: () => {
          setSalePriceInput('');
          setSalePercentInput('');
        },
      },
    );
  };

  const handleRemoveSale = () => {
    setSaleError('');
    removeSale.mutate(productId);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-blue-600 hover:underline">
          &larr; Back
        </Link>
        <div className="flex gap-2">
          <Link to={`/products/${productId}/edit`} className="btn-secondary">
            Edit
          </Link>
          <button onClick={handleArchive} className="btn-danger">
            Remove from Inventory
          </button>
        </div>
      </div>

      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{product.productName}</h1>
        <div className="flex gap-4 text-sm text-gray-600 mt-1">
          <span>UPC: {product.upc}</span>
          <span>Category: {product.category}</span>
          <span>Type: {product.isFood ? 'Food' : 'Non-Food'}</span>
        </div>
        <div className="flex gap-2 mt-2">
          {product.isOnSale && <span className="badge-sale">[S]</span>}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Stock Movement</h3>
        </div>
        <div className="card-body space-y-3">
          <div>
            <label className="text-sm block mb-1">Action</label>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={stockAction}
              onChange={(event) => setStockAction(event.target.value as StockAction)}
              disabled={stockPending}
            >
              <option value="receive">Receive</option>
              <option value="sell">Sell</option>
              <option value="adjust">Adjust</option>
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">
              Quantity {stockAction === 'adjust' ? '(use - for decreases)' : ''}
            </label>
            <input
              type="number"
              step="1"
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={stockQuantityInput}
              onChange={(event) => setStockQuantityInput(event.target.value)}
              disabled={stockPending}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Notes</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={stockNotes}
              onChange={(event) => setStockNotes(event.target.value)}
              disabled={stockPending}
            />
          </div>

          <button onClick={handleStockSubmit} className="btn-secondary" disabled={stockPending}>
            {stockPending ? 'Saving...' : 'Record Movement'}
          </button>

          {(stockError || stockMutationError) && (
            <p className="text-sm text-red-600">{stockError || stockMutationError}</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Pricing</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="flex gap-8">
            <div>
              <span className="text-xs font-semibold text-gray-500 block">Regular</span>
              <span className="text-lg font-semibold">{formatCurrency(product.retailPrice)}</span>
            </div>
            {product.isOnSale && product.salePrice && (
              <div>
                <span className="text-xs font-semibold text-gray-500 block">Sale</span>
                <span className="text-lg font-semibold text-green-600">{formatCurrency(product.salePrice)}</span>
              </div>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label className="text-sm block mb-1">Input Mode</label>
              <select
                className="w-full rounded border border-gray-300 px-3 py-2"
                value={saleMode}
                onChange={(event) => setSaleMode(event.target.value as SaleInputMode)}
                disabled={salePending}
              >
                <option value="price">Sale Price ($)</option>
                <option value="percent">Percent Off (%)</option>
              </select>
            </div>

            {saleMode === 'price' ? (
              <div>
                <label className="text-sm block mb-1">Sale Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={salePriceInput}
                  onChange={(event) => setSalePriceInput(event.target.value)}
                  disabled={salePending}
                />
              </div>
            ) : (
              <div>
                <label className="text-sm block mb-1">Percent Off</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={salePercentInput}
                  onChange={(event) => setSalePercentInput(event.target.value)}
                  disabled={salePending}
                />
              </div>
            )}

            <button onClick={handleApplySale} className="btn-secondary" disabled={salePending}>
              {markOnSale.isPending ? 'Applying...' : 'Apply Sale'}
            </button>
          </div>

          {product.isOnSale && (
            <button onClick={handleRemoveSale} className="btn-secondary" disabled={salePending}>
              {removeSale.isPending ? 'Removing...' : 'Remove Sale'}
            </button>
          )}

          {(saleError || saleMutationError) && <p className="text-sm text-red-600">{saleError || saleMutationError}</p>}
        </div>
      </div>

      {product.isFood && product.expirationDate && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Shelf Life</h3>
          </div>
          <div className="card-body">
            <div>Expires: {formatDate(product.expirationDate)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
