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
import { useDevMode } from '@/lib/dev-mode';

type StockAction = "receive" | "adjust";

function getAlertState(product: {
  quantityOnHand: number;
  reorderThreshold?: number;
  isOnSale: boolean;
}): "low-stock" | "discounted" | "normal" {
  const isLowStock =
    product.reorderThreshold !== undefined &&
    product.quantityOnHand <= product.reorderThreshold;

  if (isLowStock) {
    return "low-stock";
  }
  if (product.isOnSale) {
    return "discounted";
  }
  return "normal";
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const { isManager } = useDevMode();

  const { data: product, isLoading } = useProduct(productId);
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
    archiveProduct.mutate(productId, {
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

  const convertToModifier = (): number | null => {
    if (saleMode === "percent") {
      const pct = parseFloat(salePercentInput);
      if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
        setSaleError("Percent off must be between 0 and 100.");
        return null;
      }
      return pct;
    }
    const sp = parseFloat(salePriceInput);
    if (!Number.isFinite(sp) || sp <= 0) {
      setSaleError("Sale price must be greater than 0.");
      return null;
    }
    if (sp >= product.retailPrice) {
      setSaleError("Sale price must be lower than retail price.");
      return null;
    }
    const mod = ((product.retailPrice - sp) / product.retailPrice) * 100;
    if (!Number.isFinite(mod) || mod <= 0 || mod >= 100) {
      setSaleError("Invalid discount derived from sale price.");
      return null;
    }
    return Number(mod.toFixed(2));
  };

  const handleApplySale = () => {
    setSaleError("");
    const salesPriceModifier = convertToModifier();
    if (salesPriceModifier == null) return;
    markOnSale.mutate(
      { productId, salesPriceModifier },
      {
        onSuccess: () => {
          setSalePriceInput("");
          setSalePercentInput("");
          toast.success("Sale applied");
        },
      },
    );
  };

  const handleRemoveSale = () => {
    setSaleError("");
    removeSale.mutate(productId, {
      onSuccess: () => toast.success("Sale removed"),
    });
  };

  const isLow =
    product.reorderThreshold !== undefined &&
    product.quantityOnHand <= product.reorderThreshold;
  const daysUntilExp = product.expirationDate
    ? getDaysUntilExpiration(product.expirationDate)
    : null;
  const isExpiring = daysUntilExp !== null && daysUntilExp <= 7;
  const alertState = getAlertState(product);
  const alertStatus =
    alertState === "low-stock"
      ? "LOW STOCK"
      : alertState === "discounted"
      ? "DISCOUNTED"
      : "NORMAL";

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
          {alertState === "low-stock" ? (
            <Badge className="rounded-none border-red-300 bg-red-100 text-red-800">LOW STOCK</Badge>
          ) : alertState === "discounted" ? (
            <Badge className="rounded-none border-orange-300 bg-orange-100 text-orange-800">DISCOUNTED</Badge>
          ) : (
            <Badge className="rounded-none border-emerald-300 bg-emerald-100 text-emerald-800">NORMAL</Badge>
          )}
          {isExpiring && (
            <Badge className="rounded-none bg-red-100 text-red-800 border-red-300">EXP</Badge>
          )}
        </div>
      </div>

      <Separator />

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Current Stock
        </h3>
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span>
                In Stock: <strong>{product.quantityOnHand}</strong> units
              </span>
              <span>
                Status:{" "}
                <strong
                  className={alertState === "low-stock" ? "text-destructive" : "text-emerald-700"}
                >
                  {alertState === "low-stock" ? "LOW" : "OK"}
                </strong>
              </span>
            </div>
            <div className="flex items-end gap-3">
              <div className="w-32 shrink-0">
                <Label className="text-xs">Action</Label>
                <Select
                  value={stockAction}
                  onValueChange={(v: string | null) =>
                    setStockAction((v ?? "receive") as StockAction)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receive">Receive</SelectItem>
                    <SelectItem value="adjust">Adjust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28 shrink-0">
                <Label className="text-xs">
                  Quantity {stockAction === "adjust" ? "(+/-)" : ""}
                </Label>
                <Input
                  type="number"
                  step="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  disabled={stockPending}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Notes</Label>
                <Input
                  type="text"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  disabled={stockPending}
                />
              </div>
              <Button
                size="sm"
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
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Pricing
        </h3>
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Regular
                </span>
                <span className="text-lg font-semibold">
                  {formatCurrency(product.retailPrice)}
                </span>
              </div>
              {product.isOnSale && product.salePrice && (
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Sale
                  </span>
                  <span className="text-lg font-semibold text-emerald-700">
                    {formatCurrency(product.salePrice)}
                  </span>
                </div>
              )}
            </div>

            {isManager && !product.isOnSale && (
              <div className="flex items-end gap-3">
                <div className="w-32 shrink-0">
                  <Label className="text-xs">Input Mode</Label>
                  <Select
                    value={saleMode}
                    onValueChange={(v: string | null) =>
                      setSaleMode((v ?? "price") as "price" | "percent")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Sale Price ($)</SelectItem>
                      <SelectItem value="percent">Percent Off (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {saleMode === "price" ? (
                  <div className="w-32 shrink-0">
                    <Label className="text-xs">Sale Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={salePriceInput}
                      onChange={(e) => setSalePriceInput(e.target.value)}
                      disabled={salePending}
                    />
                  </div>
                ) : (
                  <div className="w-32 shrink-0">
                    <Label className="text-xs">Percent Off</Label>
                    <Input
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
                  size="sm"
                  onClick={handleApplySale}
                  disabled={salePending}
                >
                  {markOnSale.isPending ? "Applying..." : "Apply Sale"}
                </Button>
              </div>
            )}

            {isManager && product.isOnSale && (
              <Button
                variant="outline"
                size="sm"
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
          </CardContent>
        </Card>
      </section>

      {product.isFood && product.expirationDate && (
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Shelf Life
          </h3>
          <Card size="sm">
            <CardContent className="text-sm">
              <p>
                Expires: {formatDate(product.expirationDate)}{" "}
                {daysUntilExp !== null && `(${daysUntilExp} days remaining)`}
              </p>
              <p className="mt-1">
                Status:{" "}
                <strong
                  className={
                    isExpiring ? "text-destructive" : "text-emerald-700"
                  }
                >
                  {isExpiring ? "EXPIRING" : "OK"}
                </strong>
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Alerts
        </h3>
        <div className="flex items-center gap-2 text-sm">
          {alertState === "low-stock" ? (
            <Badge className="rounded-none border-red-300 bg-red-100 text-red-800">{alertStatus}</Badge>
          ) : alertState === "discounted" ? (
            <Badge className="rounded-none border-orange-300 bg-orange-100 text-orange-800">{alertStatus}</Badge>
          ) : (
            <Badge className="rounded-none border-emerald-300 bg-emerald-100 text-emerald-800">{alertStatus}</Badge>
          )}
          {isLow && product.reorderThreshold !== undefined && (
            <span className="text-red-700">
              Stock is below threshold ({product.quantityOnHand} &lt; {product.reorderThreshold})
            </span>
          )}
        </div>
      </section>

      <Separator />

      <div className="flex items-center justify-between">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setArchiveOpen(true)}
        >
          <PackageX className="size-4" />
          Archive Product
        </Button>
        <Button size="sm" render={<Link to={`/products/${productId}/edit`} />}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Product</DialogTitle>
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
