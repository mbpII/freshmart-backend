import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FormSection } from '@/components/form/FormSection';
import { InputField } from '@/components/form/InputField';
import { RadioGroupField } from '@/components/form/RadioGroupField';
import { SelectField } from '@/components/form/SelectField';
import { Button } from '@/components/ui/button';
import productFormConfig from '@/data/product-form.json';
import { useProduct } from '@/hooks/useProducts';
import { useProductEditor } from '@/hooks/useProductEditor';
import { buildProductFormDefaults } from '@/lib/productForm';
import { productFormSchema } from '@/lib/validation';
import { useDevModeStore } from '@/stores/dev-mode';
import type {
  ProductFormConfig,
  ProductFormData,
  ProductType,
} from '@/types/product';

const { categories, defaults } = productFormConfig as ProductFormConfig;
const defaultFormValues: ProductFormData = {
  ...defaults,
  isOnSale: false,
  saleMode: 'price',
  saleValue: '',
};

const categoryOptions = categories.map((category) => ({
  label: category,
  value: category,
}));
const productTypeOptions: { label: string; value: ProductType }[] = [
  { label: 'Food', value: 'food' },
  { label: 'Non-Food', value: 'non-food' },
];

const inputClassName =
  'w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring';

type ProductEditorFormProps = {
  isEditMode: boolean;
  productId: number;
  storeId: number;
  defaultValues: ProductFormData;
  isManager: boolean;
};

function ProductEditorForm({
  isEditMode,
  productId,
  storeId,
  defaultValues,
  isManager,
}: ProductEditorFormProps) {
  const navigate = useNavigate();

  const navigateBackWithFallback = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(isEditMode ? `/products/${productId}` : '/');
  };

  const { submit, isPending, error } = useProductEditor({
    productId,
    storeId,
    isEditMode,
    isManager,
    navigate,
    onEditSuccess: navigateBackWithFallback,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const productType = watch('productType');
  const isOnSale = watch('isOnSale');
  const saleMode = watch('saleMode');
  const saleValue = watch('saleValue');

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
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
            maxLength={12}
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
          <div className="rounded-md border border-border bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Expiration Date *"
                type="date"
                registration={register('expirationDate')}
                className={inputClassName}
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
                className={inputClassName}
                error={errors.reorderThreshold?.message}
              />
            </div>
          </div>
        )}
      </FormSection>

      {!isEditMode && (
        <FormSection title="Initial Stock">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Initial Qty *"
              type="number"
              min={0}
              registration={register('quantityOnHand', { valueAsNumber: true })}
              className={inputClassName}
              error={errors.quantityOnHand?.message}
            />

            <InputField
              label="Reorder Quantity"
              type="number"
              min={0}
              registration={register('reorderQuantity', { valueAsNumber: true })}
              className={inputClassName}
              error={errors.reorderQuantity?.message}
            />
          </div>
        </FormSection>
      )}

      {isEditMode && (
        <FormSection title="Inventory Snapshot">
          <InputField
            label="Current Quantity"
            type="number"
            registration={register('quantityOnHand', { valueAsNumber: true })}
            className="w-full rounded-md border border-input bg-muted px-3 py-2"
            error={errors.quantityOnHand?.message}
            disabled
          />
        </FormSection>
      )}

      <FormSection title="Price Setup">
        <InputField
          label="Retail Price *"
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          registration={register('retailPrice', { valueAsNumber: true })}
          className={inputClassName}
          error={errors.retailPrice?.message}
        />

        {isManager ? (
          <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isOnSale}
                onChange={(e) => {
                  setValue('isOnSale', e.target.checked, { shouldValidate: true });
                  if (!e.target.checked) setValue('saleValue', '');
                }}
                className="size-4 accent-primary"
              />
              Mark as on sale
            </label>

            {isOnSale && (
              <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto_1fr] sm:items-end">
                <label className="text-sm font-medium">Sale Price</label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled={saleMode !== 'price'}
                    value={saleMode === 'price' ? saleValue : ''}
                    onChange={(e) => {
                      setValue('saleMode', 'price', { shouldValidate: true });
                      setValue('saleValue', e.target.value, { shouldValidate: true });
                    }}
                    className={`${inputClassName} text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                </div>
                <span className="text-sm text-muted-foreground">or</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="10"
                    disabled={saleMode !== 'percent'}
                    value={saleMode === 'percent' ? saleValue : ''}
                    onChange={(e) => {
                      setValue('saleMode', 'percent', { shouldValidate: true });
                      setValue('saleValue', e.target.value, { shouldValidate: true });
                    }}
                    className={`${inputClassName} text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            )}

            {errors.saleValue?.message && (
              <p className="text-sm text-destructive">{errors.saleValue.message}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Sale controls are manager-only and currently hidden.
          </p>
        )}
      </FormSection>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
          <p className="text-sm">
            Error saving product: {error.message || 'Something went wrong'}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isPending
            ? 'Saving...'
            : isEditMode
              ? 'Save Changes'
              : 'Add to Inventory'}
        </Button>
        <Button type="button" variant="outline" onClick={navigateBackWithFallback}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function ProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const isEditMode = Number.isFinite(productId) && productId > 0;
  const selectedStoreId = useDevModeStore((state) => state.selectedStoreId);
  const { data: product, isLoading: isLoadingProduct } = useProduct(productId, selectedStoreId, {
    enabled: isEditMode,
  });
  const isManager = useDevModeStore((state) => state.isManager);

  if (isEditMode && isLoadingProduct) {
    return <div className="mx-auto max-w-2xl p-4">Loading...</div>;
  }

  if (isEditMode && !product) {
    return <div className="mx-auto max-w-2xl p-4">Product not found</div>;
  }

  const formDefaults = isEditMode && product
    ? buildProductFormDefaults(product)
    : defaultFormValues;

  const formKey = isEditMode
    ? `edit-${productId}-${product?.lastUpdated ?? 'unknown'}`
    : 'create';

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Inventory
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold">
        {isEditMode ? 'Edit Product' : 'Add Product to Inventory'}
      </h1>

      <ProductEditorForm
        key={formKey}
        isEditMode={isEditMode}
        productId={productId}
        storeId={selectedStoreId}
        defaultValues={formDefaults}
        isManager={isManager}
      />
    </div>
  );
}
