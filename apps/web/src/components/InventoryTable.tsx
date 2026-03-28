import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { INVENTORY_PAGE_SIZE } from '../lib/constants';
import { formatCurrency } from '../lib/format';
import { getPaginationItems } from '../lib/pagination';
import type { Product } from '../types/product';

type Props = {
  products: Product[];
  itemsPerPage?: number;
};

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'productName',
    header: 'Name',
    cell: ({ row }) => (
      <Link to={`/products/${row.original.productId}`} className="text-blue-600 hover:underline">
        {row.original.productName}
      </Link>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'quantityOnHand',
    header: 'Qty',
    cell: ({ row }) => {
      const item = row.original;
      const isLow = item.reorderThreshold !== undefined && item.quantityOnHand <= item.reorderThreshold;

      return <span className={isLow ? 'font-semibold text-red-600' : ''}>{item.quantityOnHand}</span>;
    },
  },
  {
    accessorKey: 'retailPrice',
    header: 'Price',
    cell: ({ row }) => {
      const item = row.original;
      const displayPrice = item.isOnSale && item.salePrice ? item.salePrice : item.retailPrice;

      if (item.isOnSale && item.salePrice) {
        return (
          <div>
            <span className="text-sm text-gray-400 line-through">{formatCurrency(item.retailPrice)}</span>
            <span className="ml-2 font-semibold text-green-600">{formatCurrency(item.salePrice)}</span>
          </div>
        );
      }

      return <span>{formatCurrency(displayPrice)}</span>;
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const item = row.original;
      const isLow = item.reorderThreshold !== undefined && item.quantityOnHand <= item.reorderThreshold;

      return (
        <>
          {isLow && <span className="badge-low">LOW</span>}
          {item.isOnSale && <span className="badge-sale ml-1">[S]</span>}
        </>
      );
    },
  },
];

export function InventoryTable({ products, itemsPerPage = INVENTORY_PAGE_SIZE }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!products.length) {
    return <div className="py-8 text-center text-gray-500">No inventory items found</div>;
  }

  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));
  const page = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
  const showingLabel = `${startIndex + 1}-${endIndex}`;
  const paginationItems = getPaginationItems(page, totalPages);

  const paginatedProducts = useMemo(
    () => products.slice(startIndex, endIndex),
    [products, startIndex, endIndex],
  );

  const table = useReactTable({
    data: paginatedProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const goToPage = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-200 px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{showingLabel}</span> of{' '}
          <span className="font-medium">{totalProducts}</span> products
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
