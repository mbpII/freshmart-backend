import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Layout from './components/Layout';
import { DevModeProvider } from './lib/dev-mode';
import ProductsIndex from './routes/products/index';
import ProductPage from './routes/products/productDetail';
import ProductEditorPage from './routes/products/productForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DevModeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
            <Route path="/" element={<ProductsIndex />} />
            <Route path="/products/new" element={<ProductEditorPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/products/:id/edit" element={<ProductEditorPage />} />
          </Route>
          </Routes>
        </BrowserRouter>
      </DevModeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
