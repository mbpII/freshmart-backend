package com.freshmart.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProductInventoryResponse(
    Long productId,
    Long storeId,
    String productName,
    String category,
    String upc,
    String supplierName,
    BigDecimal unitCost,
    BigDecimal retailPrice,
    Boolean isOnSale,
    BigDecimal salesPriceModifier,
    BigDecimal salePrice,
    Integer quantityOnHand,
    LocalDateTime lastUpdated,
    Boolean isFood,
    Boolean isActive,
    LocalDate expirationDate,
    Integer reorderThreshold,
    Integer reorderQuantity,
    Long inventoryId
) {}
