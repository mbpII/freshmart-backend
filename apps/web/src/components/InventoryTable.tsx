import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';

type Props = {
  products: Product[];
  itemsPerPage?: number;
};

type PaginationItem = number | 'ellipsis';

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items: PaginationItem[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push('ellipsis');
    }

    items.push(page);
  });

  return items;
}

export function InventoryTable({ products, itemsPerPage = 5 }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!products.length) {
    return <div className="py-8 text-center text-gray-500">No inventory items found</div>;
  }

  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));
  const page = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
  const paginatedProducts = products.slice(startIndex, endIndex);
  const paginationItems = getPaginationItems(page, totalPages);

  const goToPage = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((item) => {
              const isLow = item.reorderThreshold !== undefined && item.quantityOnHand <= item.reorderThreshold;
              const displayPrice = item.isOnSale && item.salePrice ? item.salePrice : item.retailPrice;

              return (
                <tr key={item.productId}>
                  <td>
                    <Link to={`/products/${item.productId}`} className="text-blue-600 hover:underline">
                      {item.productName}
                    </Link>
                  </td>
                  <td>{item.category}</td>
                  <td className={isLow ? 'font-semibold text-red-600' : ''}>{item.quantityOnHand}</td>
                  <td>
                    {item.isOnSale && item.salePrice ? (
                      <div>
                        <span className="text-sm text-gray-400 line-through">${item.retailPrice.toFixed(2)}</span>
                        <span className="ml-2 font-semibold text-green-600">${item.salePrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span>${displayPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td>
                    {isLow && <span className="badge-low">LOW</span>}
                    {item.isOnSale && <span className="badge-sale ml-1">[S]</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-200 px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{startIndex + 1}-{endIndex}</span> of <span className="font-medium">{totalProducts}</span> products
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <div className="hidden items-center gap-1 sm:flex">
            {paginationItems.map((item, index) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item)}
                  aria-current={page === item ? 'page' : undefined}
                  className={`min-w-9 rounded border px-3 py-1.5 text-sm font-medium ${
                    page === item
                      ? 'border-gray-800 bg-gray-800 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <div className="text-sm font-medium text-gray-600 sm:hidden">
            Page {page} of {totalPages}
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
