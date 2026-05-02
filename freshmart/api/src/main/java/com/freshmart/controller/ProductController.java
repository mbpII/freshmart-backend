package com.freshmart.controller;

import com.freshmart.dto.CreateProductRequest;
import com.freshmart.dto.ProductInventoryResponse;
import com.freshmart.dto.ProductRequest;
import com.freshmart.dto.ProductResponse;
import com.freshmart.service.InventoryService;
import com.freshmart.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Product catalog management")
@Validated
public class ProductController {

    private final ProductService productService;
    private final InventoryService inventoryService;
    
    public ProductController(ProductService productService, InventoryService inventoryService) {
        this.productService = productService;
        this.inventoryService = inventoryService;
    }
    
    @PostMapping
    @Operation(summary = "Create a new product with initial inventory")
    public ResponseEntity<ProductInventoryResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        var storeId = requireStoreId(request.storeId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(productService.createProductWithInitialInventory(request, storeId));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
    
    @GetMapping
    @Operation(summary = "Get all products for a store")
    public ResponseEntity<List<ProductInventoryResponse>> getProductsByStore(
            @Parameter(description = "Store ID") @RequestParam(required = false) Long storeId) {
        return ResponseEntity.ok(inventoryService.getInventoryByStore(requireStoreId(storeId)));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update product details")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable @Positive Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }
    
    // User-facing delete action is implemented as a soft archive in inventory for Epic 1.
    // This does not remove the product record globally.
    @DeleteMapping("/{id}")
    @Operation(summary = "Archive product (soft delete)")
    public ResponseEntity<Void> archiveProduct(
            @PathVariable @Positive Long id,
            @Parameter(description = "Store ID") @RequestParam(required = false) Long storeId) {
        inventoryService.archiveFromStore(id, requireStoreId(storeId));
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/sale/percent")
    @Operation(summary = "Mark product on sale by percent off (e.g. value=10 means 10% off)")
    public ResponseEntity<ProductInventoryResponse> markOnSaleByPercent(
            @PathVariable @Positive Long id,
            @RequestParam(name = "storeId", required = false) Long storeId,
            @RequestParam(name = "value")
            @DecimalMin(value = "0.01", message = "Percent off must be greater than 0")
            @DecimalMax(value = "100", inclusive = false, message = "Percent off must be less than 100")
            BigDecimal value) {
        return ResponseEntity.ok(inventoryService.markProductOnSaleByPercent(id, requireStoreId(storeId), value));
    }

    @PostMapping("/{id}/sale/flat")
    @Operation(summary = "Mark product on sale by flat sale price (e.g. value=5.99 sets sale price to $5.99)")
    public ResponseEntity<ProductInventoryResponse> markOnSaleByFlat(
            @PathVariable @Positive Long id,
            @RequestParam(name = "storeId", required = false) Long storeId,
            @RequestParam(name = "value")
            @DecimalMin(value = "0.01", message = "Sale price must be greater than 0")
            BigDecimal value) {
        return ResponseEntity.ok(inventoryService.markProductOnSaleByFlat(id, requireStoreId(storeId), value));
    }
    
    @DeleteMapping("/{id}/sale")
    @Operation(summary = "Remove sale from product")
    public ResponseEntity<ProductInventoryResponse> removeSale(
            @PathVariable @Positive Long id,
            @RequestParam(name = "storeId", required = false) Long storeId) {
        return ResponseEntity.ok(inventoryService.removeSale(id, requireStoreId(storeId)));
    }

    private Long requireStoreId(Long storeId) {
        return inventoryService.validateStoreContext(storeId).getStoreId();
    }
}
