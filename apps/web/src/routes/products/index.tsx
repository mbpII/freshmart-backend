import { Link } from 'react-router-dom';
import { useProductsQuery } from '../../hooks/useProducts';
import { InventoryTable } from '../../components/InventoryTable';

export default function ProductsIndex() {
  const { data: products, isLoading, error } = useProductsQuery();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link to="/products/new" className="btn-primary">
          + Add to Inventory
        </Link>
      </div>

      <InventoryTable products={products || []} />
    </div>
  );
}
