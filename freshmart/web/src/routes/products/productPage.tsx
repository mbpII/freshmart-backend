import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useAdjustStock,
  useArchiveProduct,
  useMarkOnSale,
  useProduct,
  useRemoveSale,
} from "@/hooks/useProducts";
import {
  formatCurrency,
  formatDate,
  getDaysUntilExpiration,
} from "@/lib/format";
import {
  getProductAlertBadgeClass,
  getProductAlertLabel,
  getProductAlertState,
} from "@/lib/product-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, PackageX, Pencil } from "lucide-react";
import { useDevModeStore } from "@/stores/dev-mode";

const SHOW_EPIC01_PLACEHOLDER_PANELS = false;

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const isValidProductId = Number.isFinite(productId) && productId > 0;
  const isManager = useDevModeStore((state) => state.isManager);
  const selectedStoreId = useDevModeStore((state) => state.selectedStoreId);

  const { data: product, isLoading } = useProduct(productId, selectedStoreId, {
    enabled: isValidProductId,
  });
  const archiveProduct = useArchiveProduct();
  const markOnSale = useMarkOnSale();
  const removeSale = useRemoveSale();
  const adjustStock = useAdjustStock();

  const [stockQuantity, setStockQuantity] = useState("");
  const [stockNotes, setStockNotes] = useState("");
  const [stockError, setStockError] = useState("");

  const [saleMode, setSaleMode] = useState<"price" | "percent">("price");
  const [salePriceInput, setSalePriceInput] = useState("");
  const [salePercentInput, setSalePercentInput] = useState("");
  const [saleError, setSaleError] = useState("");

  const [archiveOpen, setArchiveOpen] = useState(false);

  if (!isValidProductId) return <main className="p-4">Invalid product ID</main>;

  if (isLoading) return <main className="p-4" aria-busy="true" aria-live="polite">Loading...</main>;
  if (!product) return <main className="p-4" aria-live="polite">Product not found</main>;

  const stockPending = adjustStock.isPending;
  const salePending = markOnSale.isPending || removeSale.isPending;

  const stockMutationError = (adjustStock.error as Error | null)?.message || "";

  const saleMutationError =
    (markOnSale.error as Error | null)?.message ||
    (removeSale.error as Error | null)?.message ||
    "";

  const handleArchive = () => {
    archiveProduct.mutate({ productId, storeId: selectedStoreId }, {
      onSuccess: () => {
        toast.success("Product archived");
        navigate("/");
      },
    });
  };

  const handleStockSubmit = () => {
    setStockError("");
    const qty = Number(stockQuantity);
    if (!Number.isFinite(qty) || !Number.isInteger(qty)) {
      setStockError("Enter a valid quantity.");
      return;
    }
    if (!stockNotes.trim()) {
      setStockError("Notes are required.");
      return;
    }
    if (qty === 0) {
      setStockError("Adjustment cannot be 0.");
      return;
    }

    const payload = {
      productId,
      storeId: selectedStoreId,
      quantityChange: qty,
      notes: stockNotes.trim(),
    };
    const onSuccess = () => {
      setStockQuantity("");
      setStockNotes("");
      toast.success("Stock updated");
    };

    adjustStock.mutate(payload, { onSuccess });
  };

  const handleApplySale = () => {
    setSaleError("");

    if (saleMode === "percent") {
      const pct = parseFloat(salePercentInput);
      if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
        setSaleError("Percent off must be between 0 and 100.");
        return;
      }
      markOnSale.mutate(
        { productId, storeId: selectedStoreId, mode: "percent", value: pct },
        {
          onSuccess: () => {
            setSalePercentInput("");
            toast.success("Sale applied");
          },
        },
      );
    } else {
      const sp = parseFloat(salePriceInput);
      if (!Number.isFinite(sp) || sp <= 0) {
        setSaleError("Sale price must be greater than 0.");
        return;
      }
      if (sp >= product.retailPrice) {
        setSaleError("Sale price must be lower than retail price.");
        return;
      }
      markOnSale.mutate(
        { productId, storeId: selectedStoreId, mode: "flat", value: sp },
        {
          onSuccess: () => {
            setSalePriceInput("");
            toast.success("Sale applied");
          },
        },
      );
    }
  };

  const handleRemoveSale = () => {
    setSaleError("");
    removeSale.mutate({ productId, storeId: selectedStoreId }, {
      onSuccess: () => toast.success("Sale removed"),
    });
  };

  const daysUntilExp = product.expirationDate
    ? getDaysUntilExpiration(product.expirationDate)
    : null;
  const isExpiring = daysUntilExp !== null && daysUntilExp <= 7;
  const alertState = getProductAlertState(product);
  const alertStatus = getProductAlertLabel(alertState);

  const stockErrorId = "stock-error";
  const saleErrorId = "sale-error";

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to Inventory
      </Link>

      <div>
        <h1 className="text-xl font-bold">{product.productName}</h1>
        <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
          <span>UPC: {product.upc}</span>
          <span>Category: {product.category}</span>
          <span>Type: {product.isFood ? "Food" : "Non-Food"}</span>
        </p>
        <div className="mt-1 flex gap-1" role="status">
          <Badge className={getProductAlertBadgeClass(alertState)}>{alertStatus}</Badge>
          {isExpiring && (
            <Badge className="rounded-md bg-red-100 text-red-800 border-red-300">
              <span aria-hidden="true">EXP</span>
              <span className="sr-only">Expiring soon</span>
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.84fr]">
        <div className="space-y-5">
          <section>
            <h2 className="mb-2 text-base font-bold uppercase tracking-wide">
              Current Stock
            </h2>
            <Card
              className="rounded-md bg-background ring-1 ring-foreground/30"
              size="sm"
            >
              <CardContent className="space-y-3 py-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-base">
                  <p>
                    In Stock: <strong>{product.quantityOnHand}</strong> units
                  </p>
                  <p>
                    Status:{" "}
                    <strong
                      className={
                        alertState === "low-stock"
                          ? "text-destructive"
                          : "text-emerald-700"
                      }
                    >
                      {alertState === "low-stock" ? "LOW" : "OK"}
                      <span className="sr-only">
                        {alertState === "low-stock" ? ", low stock" : ", in stock"}
                      </span>
                    </strong>
                  </p>
                </div>
                <form
                  onSubmit={(e) => { e.preventDefault(); handleStockSubmit(); }}
                  className="grid gap-3 sm:grid-cols-[150px_140px] sm:items-end lg:grid-cols-[150px_140px_1fr_auto]"
                >
                  <div>
                    <Label className="text-xs">Action</Label>
                    <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-foreground">
                      Adjustment
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="stock-qty" className="text-xs">Qty (+/-)</Label>
                    <Input
                      id="stock-qty"
                      className="rounded-md"
                      type="number"
                      step="1"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      disabled={stockPending}
                      aria-invalid={!!(stockError || stockMutationError)}
                      aria-describedby={(stockError || stockMutationError) ? stockErrorId : undefined}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="stock-notes" className="text-xs">Notes</Label>
                    <Input
                      id="stock-notes"
                      className="rounded-md"
                      type="text"
                      value={stockNotes}
                      onChange={(e) => setStockNotes(e.target.value)}
                      disabled={stockPending}
                      aria-invalid={!!(stockError || stockMutationError)}
                      aria-describedby={(stockError || stockMutationError) ? stockErrorId : undefined}
                    />
                  </div>
                  <Button
                    className="rounded-md w-full sm:w-auto lg:w-auto"
                    size="default"
                    type="submit"
                    disabled={stockPending}
                  >
                    {stockPending ? "Saving..." : "Record"}
                  </Button>
                </form>
                {(stockError || stockMutationError) && (
                  <p id={stockErrorId} className="text-sm text-destructive" role="alert">
                    {stockError || stockMutationError}
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold uppercase tracking-wide">
              Pricing
            </h2>
            <div className="space-y-3">
              <p className="text-lg font-semibold">
                Regular: {formatCurrency(product.retailPrice)}
                {product.isOnSale && product.salePrice && (
                  <>
                    {" "}
                    Sale: {formatCurrency(product.salePrice)}
                    {product.salesPriceModifier &&
                      ` (${product.salesPriceModifier}% off)`}
                  </>
                )}
              </p>

              {isManager && !product.isOnSale && (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleApplySale(); }}
                  className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-end md:grid-cols-[160px_140px_140px_auto]"
                >
                  <div>
                    <Label htmlFor="sale-mode" className="text-xs">Input Mode</Label>
                    <Select
                      value={saleMode}
                      onValueChange={(v: string | null) =>
                        setSaleMode((v ?? "price") as "price" | "percent")
                      }
                    >
                      <SelectTrigger id="sale-mode" className="w-full rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Sale Price ($)</SelectItem>
                        <SelectItem value="percent">Percent Off (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {saleMode === "price" ? (
                    <div>
                      <Label htmlFor="sale-price" className="text-xs">Sale Price</Label>
                      <Input
                        id="sale-price"
                        className="rounded-md"
                        type="number"
                        min="0"
                        step="0.01"
                        value={salePriceInput}
                        onChange={(e) => setSalePriceInput(e.target.value)}
                        disabled={salePending}
                        aria-invalid={!!(saleError || saleMutationError)}
                        aria-describedby={(saleError || saleMutationError) ? saleErrorId : undefined}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="sale-percent" className="text-xs">Percent Off</Label>
                      <Input
                        id="sale-percent"
                        className="rounded-md"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={salePercentInput}
                        onChange={(e) => setSalePercentInput(e.target.value)}
                        disabled={salePending}
                        aria-invalid={!!(saleError || saleMutationError)}
                        aria-describedby={(saleError || saleMutationError) ? saleErrorId : undefined}
                      />
                    </div>
                  )}
                  <Button
                    className="rounded-md w-full sm:w-auto md:w-auto"
                    variant="outline"
                    size="default"
                    type="submit"
                    disabled={salePending}
                  >
                    {markOnSale.isPending ? "Applying..." : "Apply Sale"}
                  </Button>
                </form>
              )}

              {isManager && product.isOnSale && (
                <Button
                  className="rounded-md"
                  variant="outline"
                  size="default"
                  onClick={handleRemoveSale}
                  disabled={salePending}
                >
                  {removeSale.isPending ? "Removing..." : "Remove Sale"}
                </Button>
              )}

              {(saleError || saleMutationError) && (
                <p id={saleErrorId} className="text-sm text-destructive" role="alert">
                  {saleError || saleMutationError}
                </p>
              )}
            </div>
          </section>

          {product.isFood && product.expirationDate && (
            <section>
              <h2 className="mb-2 text-base font-bold uppercase tracking-wide">
                Shelf Life
              </h2>
              <div className="space-y-2 text-base">
                <p>
                  Expires: {formatDate(product.expirationDate)}{" "}
                  {daysUntilExp !== null && `(${daysUntilExp} days remaining)`}
                </p>
                <p>
                  Status:{" "}
                  <strong
                    className={
                      isExpiring ? "text-destructive" : "text-emerald-700"
                    }
                  >
                    {isExpiring ? "EXPIRING" : "OK"}
                    <span className="sr-only">
                      {isExpiring ? ", product is expiring soon" : ", product is within shelf life"}
                    </span>
                  </strong>
                </p>
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-base font-bold uppercase tracking-wide">
              Alerts
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-md border border-foreground/40 bg-amber-100/10 px-4 py-3 text-base" role="alert">
                {alertState === "low-stock"
                  ? <> <span aria-hidden="true">[!]</span> Stock is below threshold ({product.quantityOnHand} {'<'} {product.reorderThreshold ?? 0})</>
                  : `Status: ${alertStatus}`}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {SHOW_EPIC01_PLACEHOLDER_PANELS ? (
            <>
              <section>
                <h2 className="mb-2 text-base font-bold uppercase tracking-wide">
                  Sales Velocity (Last 4 Weeks)
                </h2>
                <Card
                  className="rounded-md bg-background ring-1 ring-foreground/30"
                  size="sm"
                >
                  <CardContent className="py-10 text-center">
                    <p className="text-base font-semibold">
                      Trend: +37% ↑ vs previous week
                    </p>
                    <p className="mt-3 text-base font-semibold">W1 W2 W3 W4</p>
                    <p className="mt-2 text-base font-semibold">
                      12 18 15 22 units/week
                    </p>
                    <p className="mt-5 text-sm text-muted-foreground">
                      Placeholder while analytics endpoint is pending.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fallback: Sales velocity data unavailable.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section>
                <h2 className="mb-2 text-base font-bold uppercase tracking-wide">
                  History
                </h2>
                <Card
                  className="rounded-md bg-background ring-1 ring-foreground/30"
                  size="sm"
                >
                  <CardContent className="space-y-2 py-5 text-base">
                    <p>2026-02-20 Restocked +50 units</p>
                    <p>2026-02-18 Price updated $3.49 → $3.99</p>
                    <p>2026-02-15 Sale activated (25% off)</p>
                    <p>...</p>
                    <p className="pt-4 text-sm text-muted-foreground">
                      Placeholder while history API is pending.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fallback: Product history unavailable.
                    </p>
                  </CardContent>
                </Card>
              </section>
            </>
          ) : null}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setArchiveOpen(true)}
        >
          <PackageX className="size-4" aria-hidden="true" />
          Remove Product
        </Button>
        <Button size="sm" render={<Link to={`/products/${productId}/edit`} />}>
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </Button>
      </div>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Product</DialogTitle>
            <DialogDescription>
              Remove "{product.productName}" from inventory? This hides it from
              the store but preserves the record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchive}
              disabled={archiveProduct.isPending}
            >
              {archiveProduct.isPending ? "Archiving..." : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
