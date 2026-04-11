package com.freshmart.controller;

import com.freshmart.dto.InventoryRequest;
import com.freshmart.dto.InventoryResponse;
import com.freshmart.dto.ProductInventoryResponse;
import com.freshmart.dto.QuantityAdjustmentRequest;
import com.freshmart.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stores/{storeId}/inventory")
@Tag(name = "Inventory", description = "Store inventory management")
public class InventoryController {
    
    private final InventoryService inventoryService;
    
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }
    
    @PostMapping
    @Operation(summary = "Add a product to store inventory")
    public ResponseEntity<InventoryResponse> addToInventory(
            @PathVariable Long storeId,
            @Valid @RequestBody InventoryRequest request) {
        InventoryResponse response = inventoryService.addToInventory(storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    @Operation(summary = "Get all inventory items for a store")
    public ResponseEntity<java.util.List<ProductInventoryResponse>> getStoreInventory(@PathVariable Long storeId) {
        java.util.List<ProductInventoryResponse> response = inventoryService.getInventoryByStore(storeId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{productId}")
    @Operation(summary = "Get a specific product's inventory in a store")
    public ResponseEntity<ProductInventoryResponse> getProductInventory(
            @PathVariable Long storeId,
            @PathVariable Long productId) {
        ProductInventoryResponse response = inventoryService.getProductInventory(productId, storeId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{productId}")
    @Operation(summary = "Archive (soft delete) product from store inventory")
    public ResponseEntity<Void> archiveFromInventory(
            @PathVariable Long storeId,
            @PathVariable Long productId) {
        inventoryService.archiveFromStore(productId, storeId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{productId}/receive")
    @Operation(summary = "Receive stock (increase quantity)")
    public ResponseEntity<ProductInventoryResponse> receiveStock(
            @PathVariable Long storeId,
            @PathVariable Long productId,
            @Valid @RequestBody QuantityAdjustmentRequest request) {
        ProductInventoryResponse response = inventoryService.receiveStock(
            productId, storeId, request.quantityChange(), request.notes());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{productId}/sell")
    @Operation(summary = "Sell stock (decrease quantity)")
    public ResponseEntity<ProductInventoryResponse> sellStock(
            @PathVariable Long storeId,
            @PathVariable Long productId,
            @Valid @RequestBody QuantityAdjustmentRequest request) {
        ProductInventoryResponse response = inventoryService.sellStock(
            productId, storeId, request.quantityChange(), request.notes());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{productId}/adjust")
    @Operation(summary = "Adjust inventory (increase or decrease)")
    public ResponseEntity<ProductInventoryResponse> adjustInventory(
            @PathVariable Long storeId,
            @PathVariable Long productId,
            @Valid @RequestBody QuantityAdjustmentRequest request) {
        ProductInventoryResponse response = inventoryService.adjustQuantity(
            productId, storeId, request.quantityChange(), request.notes());
        return ResponseEntity.ok(response);
    }
}
