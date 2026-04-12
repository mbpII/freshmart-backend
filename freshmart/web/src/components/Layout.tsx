import { Link, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-12 items-center justify-between border-b bg-muted/60 px-4">
        <Link to="/" className="text-lg font-bold tracking-wide">
          INVENTORY MANAGEMENT
        </Link>
        <Button size="sm" render={<Link to="/products/new" />}>
          <Plus className="size-4" />
          Add
        </Button>
      </header>
      <main>
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}