package com.freshmart.controller;

import com.freshmart.dto.CreateProductRequest;
import com.freshmart.dto.InventoryRequest;
import com.freshmart.dto.ProductInventoryResponse;
import com.freshmart.dto.ProductRequest;
import com.freshmart.dto.ProductResponse;
import com.freshmart.service.InventoryService;
import com.freshmart.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Product catalog management")
public class ProductController {
    
    private static final Long DEFAULT_STORE_ID = 101L;

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

        var productRequest = toProductRequest(request);
        var productResponse = productService.createProduct(productRequest);

        // TODO: replace with CurrentUserService when auth is implemented
        var storeId = request.storeId() != null ? request.storeId() : DEFAULT_STORE_ID;
        var initialQty = request.initialQuantity() != null ? request.initialQuantity() : 0;

        var inventoryRequest = new InventoryRequest(productResponse.productId(), initialQty);
        inventoryService.addToInventory(storeId, inventoryRequest);

        var inventoryResponse =
                inventoryService.getProductInventory(productResponse.productId(), storeId);

        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryResponse);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "Get all products for a store")
    public ResponseEntity<List<ProductInventoryResponse>> getProductsByStore(
            @Parameter(description = "Store ID") @RequestParam(required = false) Long storeId) {
        var storeIdToUse = storeId != null ? storeId : DEFAULT_STORE_ID;
        List<ProductInventoryResponse> response = inventoryService.getInventoryByStore(storeIdToUse);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update product details")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }
    
    // User-facing delete action is implemented as a soft archive in inventory for Epic 1.
    // This does not remove the product record globally.
    @DeleteMapping("/{id}")
    @Operation(summary = "Archive product (soft delete)")
    public ResponseEntity<Void> archiveProduct(
            @PathVariable Long id,
            @Parameter(description = "Store ID") @RequestParam(required = false) Long storeId) {
        // TODO: replace with CurrentUserService when auth is implemented
        var storeIdToUse = storeId != null ? storeId : DEFAULT_STORE_ID;
        inventoryService.archiveFromStore(id, storeIdToUse);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/sale")
    @Operation(summary = "Mark product as on sale for a store")
    public ResponseEntity<ProductInventoryResponse> markOnSale(
            @PathVariable Long id,
            @RequestParam Long storeId,
            @RequestParam java.math.BigDecimal salesPriceModifier) {
        ProductInventoryResponse response = inventoryService.markProductOnSale(id, storeId, salesPriceModifier);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}/sale")
    @Operation(summary = "Remove sale from product")
    public ResponseEntity<ProductInventoryResponse> removeSale(
            @PathVariable Long id,
            @RequestParam Long storeId) {
        ProductInventoryResponse response = inventoryService.removeSale(id, storeId);
        return ResponseEntity.ok(response);
    }

    private ProductRequest toProductRequest(CreateProductRequest request) {
        return new ProductRequest(
            request.productName(),
            request.category(),
            request.upc(),
            request.supplierId(),
            request.unitCost(),
            request.retailPrice(),
            request.isFood(),
            request.reorderThreshold(),
            request.reorderQuantity(),
            request.expirationDate()
        );
    }
}
