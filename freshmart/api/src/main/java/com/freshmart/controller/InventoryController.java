package com.freshmart.controller;

import com.freshmart.dto.InventoryRequest;
import com.freshmart.dto.InventoryResponse;
import com.freshmart.dto.ProductInventoryResponse;
import com.freshmart.dto.QuantityAdjustmentRequest;
import com.freshmart.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.function.Supplier;

@RestController
@RequestMapping("/api/stores/{storeId}/inventory")
@Tag(name = "Inventory", description = "Store inventory management")
@Validated
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
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.addToInventory(storeId, request));
    }
    
    @GetMapping
    @Operation(summary = "Get all inventory items for a store")
    public ResponseEntity<List<ProductInventoryResponse>> getStoreInventory(@PathVariable Long storeId) {
        return ResponseEntity.ok(inventoryService.getInventoryByStore(storeId));
    }
    
    @GetMapping("/{productId}")
    @Operation(summary = "Get a specific product's inventory in a store")
    public ResponseEntity<ProductInventoryResponse> getProductInventory(
            @PathVariable Long storeId,
            @PathVariable @Positive Long productId) {
        return ResponseEntity.ok(inventoryService.getProductInventory(productId, storeId));
    }
    
    @DeleteMapping("/{productId}")
    @Operation(summary = "Archive (soft delete) product from store inventory")
    public ResponseEntity<Void> archiveFromInventory(
            @PathVariable Long storeId,
            @PathVariable @Positive Long productId) {
        inventoryService.archiveFromStore(productId, storeId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{productId}/receive")
    @Operation(summary = "Receive stock (increase quantity)")
    public ResponseEntity<ProductInventoryResponse> receiveStock(
            @PathVariable Long storeId,
            @PathVariable @Positive Long productId,
            @Valid @RequestBody QuantityAdjustmentRequest request) {
        return quantityResponse(() -> inventoryService.receiveStock(
            productId, storeId, request.quantityChange(), request.notes()));
    }
    
    @PostMapping("/{productId}/sell")
    @Operation(summary = "Sell stock (decrease quantity)")
    public ResponseEntity<ProductInventoryResponse> sellStock(
            @PathVariable Long storeId,
            @PathVariable @Positive Long productId,
            @Valid @RequestBody QuantityAdjustmentRequest request) {
        return quantityResponse(() -> inventoryService.sellStock(
            productId, storeId, request.quantityChange(), request.notes()));
    }
    
    @PostMapping("/{productId}/adjust")
    @Operation(summary = "Adjust inventory (increase or decrease)")
    public ResponseEntity<ProductInventoryResponse> adjustInventory(
            @PathVariable Long storeId,
            @PathVariable @Positive Long productId,
            @Valid @RequestBody QuantityAdjustmentRequest request) {
        return quantityResponse(() -> inventoryService.adjustQuantity(
            productId, storeId, request.quantityChange(), request.notes()));
    }

    private ResponseEntity<ProductInventoryResponse> quantityResponse(
            Supplier<ProductInventoryResponse> operation) {
        return ResponseEntity.ok(operation.get());
    }
}
