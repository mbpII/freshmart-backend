package com.freshmart.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "inventory")
public class Inventory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long inventoryId;
    
    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @NotNull(message = "Store is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;
    
    @NotNull(message = "Quantity on hand is required")
    @Min(value = 0, message = "Quantity must be non-negative")
    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;
    
    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    @Column(name = "is_active")
    private Boolean isActive = true;

    @NotNull
    @Column(name = "is_on_sale", nullable = false)
    private Boolean isOnSale = false;

    @DecimalMin(value = "0.00", message = "Sale percent off must be non-negative")
    @DecimalMax(value = "100.00", message = "Sale percent off must be at most 100")
    @Column(name = "sales_price_modifier", precision = 5, scale = 2)
    private BigDecimal salesPriceModifier;

    public Long getInventoryId() { return inventoryId; }
    public void setInventoryId(Long inventoryId) { this.inventoryId = inventoryId; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    
    public Store getStore() { return store; }
    public void setStore(Store store) { this.store = store; }
    
    public Integer getQuantityOnHand() { return quantityOnHand; }
    public void setQuantityOnHand(Integer quantityOnHand) { this.quantityOnHand = quantityOnHand; }
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    
    public boolean isActive() { return isActive != null && isActive; }
    public void setActive(boolean isActive) { this.isActive = isActive; }

    public Boolean getIsOnSale() { return isOnSale; }
    public void setIsOnSale(Boolean isOnSale) { this.isOnSale = isOnSale; }

    public BigDecimal getSalesPriceModifier() { return salesPriceModifier; }
    public void setSalesPriceModifier(BigDecimal salesPriceModifier) { this.salesPriceModifier = salesPriceModifier; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Inventory inventory)) return false;
        return inventoryId != null && Objects.equals(inventoryId, inventory.inventoryId);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "Inventory{" +
                "inventoryId=" + inventoryId +
                ", quantityOnHand=" + quantityOnHand +
                ", isOnSale=" + isOnSale +
                ", isActive=" + isActive +
                '}';
    }
}
