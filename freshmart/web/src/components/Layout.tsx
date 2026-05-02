import { Link, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevModeStore } from '@/stores/dev-mode';
import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Layout() {
  const isManager = useDevModeStore((state) => state.isManager);
  const setIsManager = useDevModeStore((state) => state.setIsManager);
  const selectedStoreId = useDevModeStore((state) => state.selectedStoreId);
  const setSelectedStoreId = useDevModeStore((state) => state.setSelectedStoreId);
  const stores = useDevModeStore((state) => state.stores);
  const storesLoading = useDevModeStore((state) => state.storesLoading);
  const loadStores = useDevModeStore((state) => state.loadStores);

  useEffect(() => {
    void loadStores();
  }, [loadStores]);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-12 items-center justify-between border-b bg-muted/60 px-4">
        <Link to="/" className="text-lg font-bold tracking-wide">
          INVENTORY MANAGEMENT
        </Link>
        <div className="flex items-center gap-2">
          {isManager && (
            <Select
              value={String(selectedStoreId)}
              onValueChange={(value: string | null) => {
                const nextStoreId = Number(value);
                if (Number.isFinite(nextStoreId)) setSelectedStoreId(nextStoreId);
              }}
              disabled={storesLoading}
            >
              <SelectTrigger className="h-8 w-[220px] rounded-md text-xs">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.storeId} value={String(store.storeId)}>
                    {store.storeId} {store.storeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <button
            type="button"
            onClick={() => setIsManager(!isManager)}
            className="border px-2 py-1 text-xs font-medium"
          >
            Dev: {isManager ? 'Manager On' : 'Manager Off'}
          </button>
          <Button size="sm" render={<Link to="/products/new" />}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
