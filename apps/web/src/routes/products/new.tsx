import { useState, type FormEventHandler } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MarkOnSale } from "../../components/MarkOnSale";
import productFormConfig from "../../data/product-form.json";
import { useCreateProduct } from "../../hooks/useProducts";
import {
  buildCreateProductInput,
  validateProductForm,
} from "../../lib/productForm";
import type {
  ProductFormConfig,
  ProductFormData,
  ProductFormErrors,
  ProductType,
  SaleInput,
} from "../../types/product";

const { categories, units, defaults } = productFormConfig as ProductFormConfig;

function isManager() {
  //TODO: add user roles and implement this
  return false;
}

export default function NewProduct() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const canManageSales = isManager();

  const [formData, setFormData] = useState<ProductFormData>(() => ({
    ...defaults,
  }));
  const [sale, setSale] = useState<SaleInput>({ mode: "none" });
  const [errors, setErrors] = useState<ProductFormErrors>({});

  const clearError = (field: keyof ProductFormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateField = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleSaleChange = (nextSale: SaleInput) => {
    setSale(nextSale);
    clearError("sale");
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const nextErrors = validateProductForm(formData, sale, canManageSales);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    createProduct.mutate(
      buildCreateProductInput(formData, sale, canManageSales),
      {
        onSuccess: () => navigate("/"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Inventory
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Add Product to Inventory</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Catalog Details</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(event) =>
                  updateField("productName", event.target.value)
                }
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Enter product name"
              />
              {errors.productName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.productName}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  UPC <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.upc}
                  onChange={(event) => updateField("upc", event.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Enter UPC code"
                />
                {errors.upc && (
                  <p className="mt-1 text-sm text-red-500">{errors.upc}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <fieldset>
                <legend className="mb-1 block text-sm font-medium text-gray-700">
                  Product Type
                </legend>
                <div className="flex h-[42px] items-center gap-4 rounded border border-gray-300 px-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="productType"
                      checked={formData.productType === "food"}
                      onChange={() =>
                        updateField("productType", "food" as ProductType)
                      }
                      className="h-4 w-4 border-gray-300 text-gray-800 focus:ring-gray-400"
                    />
                    Food
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="productType"
                      checked={formData.productType === "non-food"}
                      onChange={() =>
                        updateField("productType", "non-food" as ProductType)
                      }
                      className="h-4 w-4 border-gray-300 text-gray-800 focus:ring-gray-400"
                    />
                    Non-Food
                  </label>
                </div>
              </fieldset>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(event) =>
                    updateField(
                      "unit",
                      event.target.value as ProductFormData["unit"],
                    )
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.productType === "food" && (
              <div className="rounded border border-gray-200 bg-gray-50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Expiration Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(event) =>
                        updateField("expirationDate", event.target.value)
                      }
                      className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    {errors.expirationDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.expirationDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reorderThreshold}
                      onChange={(event) =>
                        updateField(
                          "reorderThreshold",
                          Number.parseInt(event.target.value, 10) || 0,
                        )
                      }
                      className="w-full rounded border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder="Alert when stock falls below this number"
                    />
                    {errors.reorderThreshold && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.reorderThreshold}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Initial Stock</h3>
          </div>
          <div className="card-body">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Initial Qty <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantityOnHand}
                onChange={(event) =>
                  updateField(
                    "quantityOnHand",
                    Number.parseInt(event.target.value, 10) || 0,
                  )
                }
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 sm:w-1/2"
              />
              {errors.quantityOnHand && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.quantityOnHand}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Price Setup</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Retail Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.retailPrice}
                onChange={(event) => {
                  updateField(
                    "retailPrice",
                    Number.parseFloat(event.target.value) || 0,
                  );
                  clearError("sale");
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 sm:w-1/2"
                placeholder="0.00"
              />
              {errors.retailPrice && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.retailPrice}
                </p>
              )}
            </div>

            {canManageSales && (
              <MarkOnSale
                retailPrice={formData.retailPrice}
                sale={sale}
                onChange={handleSaleChange}
                error={errors.sale}
              />
            )}
          </div>
        </div>

        {createProduct.isError && (
          <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            <p className="text-sm">
              Error creating product:{" "}
              {(createProduct.error as Error)?.message ||
                "Something went wrong"}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={createProduct.isPending}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createProduct.isPending ? "Creating..." : "Add to Inventory"}
          </button>
          <Link to="/" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
