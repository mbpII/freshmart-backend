import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useAdjustStock,
  useArchiveProduct,
  useMarkOnSale,
  useProduct,
  useReceiveStock,
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

type StockAction = "receive" | "adjust";
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
  const receiveStock = useReceiveStock();
  const adjustStock = useAdjustStock();

  const [stockAction, setStockAction] = useState<StockAction>("receive");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockNotes, setStockNotes] = useState("");
  const [stockError, setStockError] = useState("");

  const [saleMode, setSaleMode] = useState<"price" | "percent">("price");
  const [salePriceInput, setSalePriceInput] = useState("");
  const [salePercentInput, setSalePercentInput] = useState("");
  const [saleError, setSaleError] = useState("");

  const [archiveOpen, setArchiveOpen] = useState(false);

  if (!isValidProductId) return <div className="p-4">Invalid product ID</div>;

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!product) return <div className="p-4">Product not found</div>;

  const stockPending = receiveStock.isPending || adjustStock.isPending;
  const salePending = markOnSale.isPending || removeSale.isPending;

  const stockMutationError =
    (receiveStock.error as Error | null)?.message ||
    (adjustStock.error as Error | null)?.message ||
    "";

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
    if (stockAction === "receive" && qty <= 0) {
      setStockError("Quantity must be greater than 0.");
      return;
    }
    if (stockAction === "adjust" && qty === 0) {
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

    switch (stockAction) {
      case "receive":
        receiveStock.mutate(payload, { onSuccess });
        break;
      case "adjust":
        adjustStock.mutate(payload, { onSuccess });
        break;
    }
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

  return (
    <div className="p-4 space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Inventory
      </Link>

      <div>
        <h1 className="text-xl font-bold">{product.productName}</h1>
        <p className="text-sm text-muted-foreground">
          UPC: {product.upc} &nbsp; Category: {product.category} &nbsp; Type:{" "}
          {product.isFood ? "Food" : "Non-Food"}
        </p>
        <div className="mt-1 flex gap-1">
          <Badge className={getProductAlertBadgeClass(alertState)}>{alertStatus}</Badge>
          {isExpiring && (
            <Badge className="rounded-md bg-red-100 text-red-800 border-red-300">
              EXP
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.84fr]">
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-base font-bold uppercase tracking-wide">
              Current Stock
            </h3>
            <Card
              className="rounded-md bg-background ring-1 ring-foreground/30"
              size="sm"
            >
              <CardContent className="space-y-3 py-2">
                <p className="text-base">
                  In Stock: <strong>{product.quantityOnHand}</strong> units
                  Status:{" "}
                  <strong
                    className={
                      alertState === "low-stock"
                        ? "text-destructive"
                        : "text-emerald-700"
                    }
                  >
                    {alertState === "low-stock" ? "LOW" : "OK"}
                  </strong>
                </p>
                <div className="grid gap-3 lg:grid-cols-[150px_140px_1fr_auto] lg:items-end">
                  <div>
                    <Label className="text-xs">Action</Label>
                    <Select
                      value={stockAction}
                      onValueChange={(v: string | null) =>
                        setStockAction((v ?? "receive") as StockAction)
                      }
                    >
                      <SelectTrigger className="rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receive">+ Receive</SelectItem>
                        <SelectItem value="adjust">Adjust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">
                      Qty {stockAction === "adjust" ? "(+/-)" : ""}
                    </Label>
                    <Input
                      className="rounded-md"
                      type="number"
                      step="1"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      disabled={stockPending}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Notes</Label>
                    <Input
                      className="rounded-md"
                      type="text"
                      value={stockNotes}
                      onChange={(e) => setStockNotes(e.target.value)}
                      disabled={stockPending}
                    />
                  </div>
                  <Button
                    className="rounded-md"
                    size="default"
                    onClick={handleStockSubmit}
                    disabled={stockPending}
                  >
                    {stockPending ? "Saving..." : "Record"}
                  </Button>
                </div>
                {(stockError || stockMutationError) && (
                  <p className="text-sm text-destructive">
                    {stockError || stockMutationError}
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="mb-2 text-base font-bold uppercase tracking-wide">
              Pricing
            </h3>
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
                <div className="grid gap-3 md:grid-cols-[170px_150px_150px_auto] md:items-end">
                  <div>
                    <Label className="text-xs">Input Mode</Label>
                    <Select
                      value={saleMode}
                      onValueChange={(v: string | null) =>
                        setSaleMode((v ?? "price") as "price" | "percent")
                      }
                    >
                      <SelectTrigger className="rounded-md">
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
                      <Label className="text-xs">Sale Price</Label>
                      <Input
                        className="rounded-md"
                        type="number"
                        min="0"
                        step="0.01"
                        value={salePriceInput}
                        onChange={(e) => setSalePriceInput(e.target.value)}
                        disabled={salePending}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs">Percent Off</Label>
                      <Input
                        className="rounded-md"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={salePercentInput}
                        onChange={(e) => setSalePercentInput(e.target.value)}
                        disabled={salePending}
                      />
                    </div>
                  )}
                  <Button
                    className="rounded-md"
                    variant="outline"
                    size="default"
                    onClick={handleApplySale}
                    disabled={salePending}
                  >
                    {markOnSale.isPending ? "Applying..." : "Apply Sale"}
                  </Button>
                </div>
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
                <p className="text-sm text-destructive">
                  {saleError || saleMutationError}
                </p>
              )}
            </div>
          </section>

          {product.isFood && product.expirationDate && (
            <section>
              <h3 className="mb-2 text-base font-bold uppercase tracking-wide">
                Shelf Life
              </h3>
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
                  </strong>
                </p>
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-2 text-base font-bold uppercase tracking-wide">
              Alerts
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-md border border-foreground/40 bg-amber-100/10 px-4 py-3 text-base">
                {alertState === "low-stock"
                  ? `[!] Stock is below threshold (${product.quantityOnHand} < ${product.reorderThreshold ?? 0})`
                  : `Status: ${alertStatus}`}
              </div>
              {isManager && (
                <>
                  <Button
                    className="rounded-md"
                    variant="outline"
                    size="default"
                    disabled
                  >
                    Dismiss
                  </Button>
                  <Button
                    className="rounded-md"
                    variant="outline"
                    size="default"
                    disabled
                  >
                    Update Threshold
                  </Button>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {SHOW_EPIC01_PLACEHOLDER_PANELS ? (
            <>
              <section>
                <h3 className="mb-2 text-base font-bold uppercase tracking-wide">
                  Sales Velocity (Last 4 Weeks)
                </h3>
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
                <h3 className="mb-2 text-base font-bold uppercase tracking-wide">
                  History
                </h3>
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
          ) : (
            <section>
              <h3 className="mb-2 text-base font-bold uppercase tracking-wide">
                Upcoming
              </h3>
              <Card
                className="rounded-md bg-background ring-1 ring-foreground/30"
                size="sm"
              >
                <CardContent className="py-6 text-sm text-muted-foreground">
                  Sales Velocity and History panels ship in a future epic.
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setArchiveOpen(true)}
        >
          <PackageX className="size-4" />
          Remove Product
        </Button>
        <Button size="sm" render={<Link to={`/products/${productId}/edit`} />}>
          <Pencil className="size-4" />
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
    </div>
  );
}
