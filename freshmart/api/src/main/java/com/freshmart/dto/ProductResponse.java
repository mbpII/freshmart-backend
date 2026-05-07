package com.freshmart.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductResponse(
    Long productId,
    String productName,
    String category,
    String upc,
    String supplierName,
    BigDecimal unitCost,
    BigDecimal retailPrice,
    Boolean isFood,
    Integer reorderThreshold,
    Integer reorderQuantity,
    LocalDate expirationDate,
    Boolean isActive
) {}
