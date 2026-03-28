import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FormSection } from '../../components/form/FormSection';
import { InputField } from '../../components/form/InputField';
import { RadioGroupField } from '../../components/form/RadioGroupField';
import { SelectField } from '../../components/form/SelectField';
import productFormConfig from '../../data/product-form.json';
import { useCreateProduct } from '../../hooks/useProducts';
import { buildCreateProductInput } from '../../lib/productForm';
import { productFormSchema } from '../../lib/validation';
import type { ProductFormConfig, ProductFormData, ProductType } from '../../types/product';

const { categories, defaults } = productFormConfig as ProductFormConfig;

function isManager() {
  return false;
}

const categoryOptions = categories.map((category) => ({ label: category, value: category }));
const productTypeOptions: { label: string; value: ProductType }[] = [
  { label: 'Food', value: 'food' },
  { label: 'Non-Food', value: 'non-food' },
];

export default function ProductForm() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const canManageSales = isManager();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaults,
  });

  const productType = watch('productType');

  const onSubmit = (values: ProductFormData) => {
    createProduct.mutate(buildCreateProductInput(values), {
      onSuccess: () => navigate('/'),
    });
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Inventory
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Add Product to Inventory</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Catalog Details">
          <InputField
            label="Product Name *"
            placeholder="Enter product name"
            registration={register('productName')}
            error={errors.productName?.message}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Category *"
              placeholder="Select a category"
              options={categoryOptions}
              registration={register('category')}
              error={errors.category?.message}
            />

            <InputField
              label="UPC *"
              placeholder="Enter UPC code"
              registration={register('upc')}
              error={errors.upc?.message}
            />
          </div>

          <RadioGroupField
            legend="Product Type"
            value={productType}
            options={productTypeOptions}
            onChange={(value) => {
              setValue('productType', value, { shouldValidate: true });
            }}
          />

          {productType === 'food' && (
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Expiration Date *"
                  type="date"
                  registration={register('expirationDate')}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  error={errors.expirationDate?.message}
                />

                <InputField
                  label="Low Stock Threshold"
                  type="number"
                  min={0}
                  placeholder="Alert when stock falls below this number"
                  registration={register('reorderThreshold', {
                    valueAsNumber: true,
                  })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  error={errors.reorderThreshold?.message}
                />
              </div>
            </div>
          )}
        </FormSection>

        <FormSection title="Initial Stock">
          <InputField
            label="Initial Qty *"
            type="number"
            min={0}
            registration={register('quantityOnHand', { valueAsNumber: true })}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 sm:w-1/2"
            error={errors.quantityOnHand?.message}
          />
        </FormSection>

        <FormSection title="Price Setup">
          <InputField
            label="Retail Price *"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            registration={register('retailPrice', { valueAsNumber: true })}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 sm:w-1/2"
            error={errors.retailPrice?.message}
          />

          {!canManageSales && (
            <p className="text-xs text-gray-500">Sale controls are manager-only and currently hidden.</p>
          )}
        </FormSection>

        {createProduct.isError && (
          <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            <p className="text-sm">
              Error creating product: {(createProduct.error as Error)?.message || 'Something went wrong'}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || createProduct.isPending}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createProduct.isPending ? 'Creating...' : 'Add to Inventory'}
          </button>
          <Link to="/" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
