import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { useProducts } from '@/hooks/useProducts';
import { INVENTORY_PAGE_SIZE } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';
import { getPaginationItems } from '@/lib/pagination';
import type { Product } from '@/types/product';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import productFormConfig from '@/data/product-form.json';
import type { ProductFormConfig } from '@/types/product';

const categories = (productFormConfig as ProductFormConfig).categories;

function getAlertState(product: Product): 'low-stock' | 'discounted' | 'normal' {
  const isLowStock =
    product.reorderThreshold !== undefined &&
    product.quantityOnHand <= product.reorderThreshold;

  if (isLowStock) {
    return 'low-stock';
  }
  if (product.isOnSale) {
    return 'discounted';
  }
  return 'normal';
}

function getStatusBadge(product: Product) {
  const state = getAlertState(product);

  if (state === 'low-stock') {
    return <Badge className="rounded-none border-red-300 bg-red-100 text-red-800">LOW STOCK</Badge>;
  }

  if (state === 'discounted') {
    return <Badge className="rounded-none border-orange-300 bg-orange-100 text-orange-800">DISCOUNTED</Badge>;
  }

  return <Badge className="rounded-none border-emerald-300 bg-emerald-100 text-emerald-800">NORMAL</Badge>;
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'productName',
    header: 'Name',
    cell: ({ row }) => (
      <Link to={`/products/${row.original.productId}`} className="text-primary hover:underline">
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
      const isLow = getAlertState(item) === 'low-stock';
      return <span className={isLow ? 'font-semibold text-destructive' : ''}>{item.quantityOnHand}</span>;
    },
  },
  {
    accessorKey: 'retailPrice',
    header: 'Price',
    cell: ({ row }) => {
      const item = row.original;
      if (item.isOnSale && item.salePrice) {
        return (
          <span>
            <span className="text-muted-foreground line-through">{formatCurrency(item.retailPrice)}</span>
            {' '}
            <span className="font-semibold text-emerald-700">{formatCurrency(item.salePrice)}</span>
          </span>
        );
      }
      return <span>{formatCurrency(item.retailPrice)}</span>;
    },
  },
  {
    id: 'alert',
    header: 'Alert',
    cell: ({ row }) => getStatusBadge(row.original),
  },
];

export default function ProductsIndex() {
  const { data: products, isLoading, error } = useProducts();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const list = products ?? [];
    return list.filter((p) => {
      const matchesSearch = !search || p.productName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / INVENTORY_PAGE_SIZE));
  const page = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (page - 1) * INVENTORY_PAGE_SIZE;
  const endIndex = Math.min(startIndex + INVENTORY_PAGE_SIZE, filtered.length);
  const paginated = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex],
  );
  const paginationItems = getPaginationItems(page, totalPages);

  const table = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) return <div className="p-4 text-destructive">Error: {error.message}</div>;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-[240px]"
        />
        <Select
          value={categoryFilter}
          onValueChange={(v: string | null) => {
            setCategoryFilter(v ?? 'all');
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No inventory items found</p>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
          <span>
            Showing {startIndex + 1}–{endIndex} of {filtered.length} products
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setCurrentPage(page - 1)}
            >
              &lt; Prev
            </Button>
            <div className="hidden items-center gap-1 sm:flex">
              {paginationItems.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-1">...</span>
                ) : (
                  <Button
                    key={item}
                    variant={page === item ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(item)}
                    className="min-w-8"
                  >
                    {item}
                  </Button>
                ),
              )}
            </div>
            <span className="text-sm sm:hidden">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setCurrentPage(page + 1)}
            >
              Next &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
