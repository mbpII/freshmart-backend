import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MarkOnSale, type SaleInput } from "../../components/MarkOnSale";
import productFormConfig from "../../data/product-form.json";
import { useCreateProduct } from "../../hooks/useProducts";
import type { Product, Unit } from "../../types/product";

type ProductType = "food" | "non-food";

type ProductFormData = Pick<
  Product,
  "productName" | "category" | "upc" | "unit" | "quantityOnHand" | "retailPrice"
> & {
  productType: ProductType;
  reorderThreshold: number;
  expirationDate: string;
};

type ProductFormConfig = {
  categories: string[];
  units: Unit[];
  defaults: ProductFormData;
};

const { categories, units, defaults } = productFormConfig as ProductFormConfig;

function isManager() {
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const clearSaleError = () => {
    if (!errors.sale) {
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.sale;
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      nextErrors.productName = "Product name is required";
    }

    if (!formData.category) {
      nextErrors.category = "Category is required";
    }

    if (!formData.upc.trim()) {
      nextErrors.upc = "UPC is required";
    }

    if (formData.quantityOnHand < 0) {
      nextErrors.quantityOnHand = "Initial quantity must be 0 or greater";
    }

    if (formData.reorderThreshold < 0) {
      nextErrors.reorderThreshold = "Low stock threshold must be 0 or greater";
    }

    if (formData.retailPrice <= 0) {
      nextErrors.retailPrice = "Retail price must be greater than 0";
    }

    if (canManageSales && sale.mode === "price") {
      const salePrice = Number.parseFloat(sale.value);

      if (
        !Number.isFinite(salePrice) ||
        salePrice <= 0 ||
        salePrice >= formData.retailPrice
      ) {
        nextErrors.sale =
          "Sale price must be greater than 0 and lower than retail price";
      }
    }

    if (canManageSales && sale.mode === "discount") {
      const discount = Number.parseFloat(sale.value);

      if (!Number.isFinite(discount) || discount <= 0 || discount >= 100) {
        nextErrors.sale = "Discount must be greater than 0 and less than 100";
      }
    }

    if (formData.productType === "food" && !formData.expirationDate) {
      nextErrors.expirationDate =
        "Expiration date is required for food products";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const discount =
      canManageSales && sale.mode === "discount"
        ? Number.parseFloat(sale.value) / 100
        : undefined;
    const salePrice =
      canManageSales && sale.mode === "price"
        ? Number.parseFloat(sale.value)
        : canManageSales && sale.mode === "discount" && discount !== undefined
          ? Number((formData.retailPrice * (1 - discount)).toFixed(2))
          : undefined;

    const productData: Partial<Product> = {
      productName: formData.productName.trim(),
      category: formData.category,
      upc: formData.upc.trim(),
      unit: formData.unit,
      isFood: formData.productType === "food",
      quantityOnHand: formData.quantityOnHand,
      retailPrice: formData.retailPrice,
      reorderThreshold: formData.reorderThreshold,
      isOnSale: canManageSales && sale.mode !== "none",
      salePrice,
      discount,
      expirationDate:
        formData.productType === "food" ? formData.expirationDate : undefined,
      isActive: true,
    };

    createProduct.mutate(productData, {
      onSuccess: () => navigate("/"),
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header"></div>
          <div className="card-body space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(event) =>
                  handleChange("productName", event.target.value)
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
                    handleChange("category", event.target.value)
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
                  onChange={(event) => handleChange("upc", event.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Enter UPC code"
                />
                {errors.upc && (
                  <p className="mt-1 text-sm text-red-500">{errors.upc}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <legend className="mb-1 block text-sm font-medium text-gray-700">
                Product Type
              </legend>
              <div className="flex h-[42px] items-center gap-4 rounded border border-gray-300 px-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="productType"
                    value="food"
                    checked={formData.productType === "food"}
                    onChange={() => handleChange("productType", "food")}
                    className="h-4 w-4 border-gray-300 text-gray-800 focus:ring-gray-400"
                  />
                  Food
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="productType"
                    value="non-food"
                    checked={formData.productType === "non-food"}
                    onChange={() => handleChange("productType", "non-food")}
                    className="h-4 w-4 border-gray-300 text-gray-800 focus:ring-gray-400"
                  />
                  Non-Food
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(event) =>
                    handleChange("unit", event.target.value as Unit)
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
                        handleChange("expirationDate", event.target.value)
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
                        handleChange(
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
          <div className="card-header"></div>
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
                  handleChange(
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
          <div className="card-header"></div>
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
                  handleChange(
                    "retailPrice",
                    Number.parseFloat(event.target.value) || 0,
                  );
                  clearSaleError();
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
                onChange={(nextSale) => {
                  setSale(nextSale);
                  clearSaleError();
                }}
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
