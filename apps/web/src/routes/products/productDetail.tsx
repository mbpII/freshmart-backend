import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useDeleteProduct } from '../../hooks/useProducts';
import { formatCurrency, formatDate } from '../../lib/format';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { data: product, isLoading } = useProduct(productId);
  const deleteProduct = useDeleteProduct();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!product) return <div className="p-4">Product not found</div>;

  const handleDelete = () => {
    if (confirm('Archive this product?')) {
      deleteProduct.mutate(productId, { onSuccess: () => navigate('/') });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-blue-600 hover:underline">&larr; Back</Link>
        <div className="flex gap-2">
          <Link to={`/products/${productId}/edit`} className="btn-secondary">Edit</Link>
          <button onClick={handleDelete} className="btn-danger">Archive</button>
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
      {/* Pricing */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Pricing</h3>
        </div>
        <div className="card-body flex gap-8">
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
      </div>

      {/* Shelf Life */}
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
