package com.freshmart.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;
    
    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Product name must not exceed 200 characters")
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;
    
    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category must not exceed 50 characters")
    @Column(name = "category", nullable = false, length = 50)
    private String category;
    
    @NotBlank(message = "UPC is required")
    @Size(max = 50, message = "UPC must not exceed 50 characters")
    @Column(name = "upc", nullable = false, unique = true, length = 50)
    private String upc;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
    
    @DecimalMin(value = "0.00", message = "Unit cost must be non-negative")
    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;
    
    @NotNull(message = "Retail price is required")
    @DecimalMin(value = "0.01", message = "Retail price must be positive")
    @Column(name = "retail_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal retailPrice;
    
    @Column(name = "is_on_sale")
    private Boolean isOnSale = false;
    
    @DecimalMin(value = "0.00", message = "Sale price must be non-negative")
    @Column(name = "sale_price", precision = 10, scale = 2)
    private BigDecimal salePrice;
    
    @Column(name = "expiration_date")
    private LocalDate expirationDate;
    
    @Min(value = 0, message = "Reorder threshold must be non-negative")
    @Column(name = "reorder_threshold")
    private Integer reorderThreshold = 0;
    
    @Min(value = 0, message = "Reorder quantity must be non-negative")
    @Column(name = "reorder_quantity")
    private Integer reorderQuantity = 0;
    
    @Column(name = "is_food")
    private Boolean isFood = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getUpc() { return upc; }
    public void setUpc(String upc) { this.upc = upc; }
    
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    
    public BigDecimal getRetailPrice() { return retailPrice; }
    public void setRetailPrice(BigDecimal retailPrice) { this.retailPrice = retailPrice; }
    
    public Boolean getIsOnSale() { return isOnSale; }
    public void setIsOnSale(Boolean isOnSale) { this.isOnSale = isOnSale; }
    
    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }
    
    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
    
    public Integer getReorderThreshold() { return reorderThreshold; }
    public void setReorderThreshold(Integer reorderThreshold) { this.reorderThreshold = reorderThreshold; }
    
    public Integer getReorderQuantity() { return reorderQuantity; }
    public void setReorderQuantity(Integer reorderQuantity) { this.reorderQuantity = reorderQuantity; }
    
    public Boolean getIsFood() { return isFood; }
    public void setIsFood(Boolean isFood) { this.isFood = isFood; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Product product)) return false;
        return productId != null && Objects.equals(productId, product.productId);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "Product{" +
                "productId=" + productId +
                ", productName='" + productName + '\'' +
                ", category='" + category + '\'' +
                ", upc='" + upc + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}