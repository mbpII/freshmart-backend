package com.freshmart.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateProductRequest(
    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Product name must not exceed 200 characters")
    String productName,
    
    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category must not exceed 50 characters")
    String category,
    
    @NotBlank(message = "UPC is required")
    @Size(max = 50, message = "UPC must not exceed 50 characters")
    String upc,
    
    Long supplierId,
    
    @DecimalMin(value = "0.00", message = "Unit cost must be non-negative")
    BigDecimal unitCost,
    
    @NotNull(message = "Retail price is required")
    @DecimalMin(value = "0.01", message = "Retail price must be positive")
    BigDecimal retailPrice,
    
    Boolean isFood,
    
    Integer reorderThreshold,
    
    Integer reorderQuantity,
    
    LocalDate expirationDate,
    
    @Min(value = 0, message = "Initial quantity must be non-negative")
    Integer initialQuantity,
    
    Long storeId
) {}