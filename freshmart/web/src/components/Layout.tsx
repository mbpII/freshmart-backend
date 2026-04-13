import { Link, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevMode } from '@/lib/dev-mode';

export default function Layout() {
  const { isManager, setIsManager } = useDevMode();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-12 items-center justify-between border-b bg-muted/60 px-4">
        <Link to="/" className="text-lg font-bold tracking-wide">
          INVENTORY MANAGEMENT
        </Link>
        <div className="flex items-center gap-2">
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
