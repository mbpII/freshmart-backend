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
    
    private final ProductService productService;
    private final InventoryService inventoryService;
    
    public ProductController(ProductService productService, InventoryService inventoryService) {
        this.productService = productService;
        this.inventoryService = inventoryService;
    }
    
    @PostMapping
    @Operation(summary = "Create a new product with initial inventory")
    public ResponseEntity<ProductInventoryResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductRequest productRequest = new ProductRequest(
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
        
        ProductResponse productResponse = productService.createProduct(productRequest);
        
        Long storeId = request.storeId() != null ? request.storeId() : 101L;
        Integer initialQty = request.initialQuantity() != null ? request.initialQuantity() : 0;
        
        InventoryRequest inventoryRequest = new InventoryRequest(
            productResponse.productId(),
            initialQty
        );
        inventoryService.addToInventory(storeId, inventoryRequest);
        
        ProductInventoryResponse response = inventoryService.getProductInventory(
            productResponse.productId(), storeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
        if (storeId == null) {
            storeId = 101L;
        }
        List<ProductInventoryResponse> response = inventoryService.getInventoryByStore(storeId);
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
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Archive product (soft delete)")
    public ResponseEntity<Void> archiveProduct(
            @PathVariable Long id,
            @Parameter(description = "Store ID") @RequestParam(required = false) Long storeId) {
        if (storeId == null) {
            storeId = 101L;
        }
        inventoryService.archiveFromStore(id, storeId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/sale")
    @Operation(summary = "Mark product as on sale")
    public ResponseEntity<ProductInventoryResponse> markOnSale(
            @PathVariable Long id,
            @RequestParam Long storeId,
            @RequestParam java.math.BigDecimal salePrice) {
        productService.markProductOnSale(id, salePrice);
        ProductInventoryResponse response = inventoryService.getProductInventory(id, storeId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}/sale")
    @Operation(summary = "Remove sale from product")
    public ResponseEntity<ProductInventoryResponse> removeSale(
            @PathVariable Long id,
            @RequestParam Long storeId) {
        productService.removeSale(id);
        ProductInventoryResponse response = inventoryService.getProductInventory(id, storeId);
        return ResponseEntity.ok(response);
    }
}