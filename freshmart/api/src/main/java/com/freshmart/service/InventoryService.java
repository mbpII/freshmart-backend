package com.freshmart.service;

import com.freshmart.dto.InventoryRequest;
import com.freshmart.dto.InventoryResponse;
import com.freshmart.dto.ProductInventoryResponse;
import com.freshmart.event.InventoryAdjustedEvent;
import com.freshmart.exception.InventoryNotFoundException;
import com.freshmart.mapper.InventoryMapper;
import com.freshmart.mapper.ProductInventoryMapper;
import com.freshmart.model.Inventory;
import com.freshmart.model.Product;
import com.freshmart.model.Store;
import com.freshmart.model.Transaction.TransactionType;
import com.freshmart.repository.InventoryRepository;
import com.freshmart.repository.StoreRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {
    
    private final InventoryRepository inventoryRepository;
    private final StoreRepository storeRepository;
    private final ProductService productService;
    private final CurrentUserService currentUserService;
    private final InventoryMapper inventoryMapper;
    private final ProductInventoryMapper productInventoryMapper;
    private final ApplicationEventPublisher eventPublisher;
    
    public InventoryService(InventoryRepository inventoryRepository,
                   StoreRepository storeRepository,
                   ProductService productService,
                   CurrentUserService currentUserService,
                   InventoryMapper inventoryMapper,
                   ProductInventoryMapper productInventoryMapper,
                   ApplicationEventPublisher eventPublisher) {
        this.inventoryRepository = inventoryRepository;
        this.storeRepository = storeRepository;
        this.productService = productService;
        this.currentUserService = currentUserService;
        this.inventoryMapper = inventoryMapper;
        this.productInventoryMapper = productInventoryMapper;
        this.eventPublisher = eventPublisher;
    }
    
    @Transactional
    public InventoryResponse addToInventory(Long storeId, InventoryRequest request) {
        Store store = storeRepository.findById(storeId)
            .orElseThrow(() -> new IllegalArgumentException("Store not found with id: " + storeId));
        
        Product product = productService.getProductEntity(request.productId());
        
        if (inventoryRepository.existsByProductProductIdAndStoreStoreId(request.productId(), storeId)) {
            throw new IllegalArgumentException("Product already exists in this store's inventory");
        }
        
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setStore(store);
        inventory.setQuantityOnHand(request.initialQuantity());
        inventory.setActive(true);
        
        Inventory saved = inventoryRepository.save(inventory);
        
        if (request.initialQuantity() > 0) {
            InventoryAdjustedEvent event = InventoryAdjustedEvent.received(
                product.getProductId(),
                storeId,
                currentUserService.getCurrentUserId(),
                request.initialQuantity(),
                "Initial inventory setup"
            );
            eventPublisher.publishEvent(event);
        }
        
        return inventoryMapper.toResponse(saved);
    }
    
    @Transactional(readOnly = true)
    public List<ProductInventoryResponse> getInventoryByStore(Long storeId) {
        return inventoryRepository.findActiveInventoryByStoreIdWithProduct(storeId).stream()
            .map(productInventoryMapper::toResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ProductInventoryResponse getProductInventory(Long productId, Long storeId) {
        Inventory inventory = inventoryRepository.findByProductProductIdAndStoreStoreIdAndIsActiveTrue(productId, storeId)
            .orElseThrow(() -> new InventoryNotFoundException(
                "Product " + productId + " not found in store " + storeId + " inventory"));
        
        return productInventoryMapper.toResponse(inventory);
    }
    
    @Transactional
    // Soft archive only: marks the store inventory record inactive without deleting the product globally.
    public void archiveFromStore(Long productId, Long storeId) {
        Inventory inventory = inventoryRepository.findByProductProductIdAndStoreStoreIdAndIsActiveTrue(productId, storeId)
            .orElseThrow(() -> new InventoryNotFoundException(
                "Product " + productId + " not found in store " + storeId + " inventory"));
        
        inventory.setActive(false);
        inventoryRepository.save(inventory);
    }
    
    @Transactional
    public ProductInventoryResponse adjustQuantity(Long productId, Long storeId, Integer quantityChange, String notes) {
        Inventory inventory = inventoryRepository.findByProductProductIdAndStoreStoreIdAndIsActiveTrue(productId, storeId)
            .orElseThrow(() -> new InventoryNotFoundException(
                "Product " + productId + " not found in store " + storeId + " inventory"));
        
        int newQuantity = inventory.getQuantityOnHand() + quantityChange;
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Insufficient inventory. Current: " + inventory.getQuantityOnHand() +
                ", attempted change: " + quantityChange);
        }
        
        inventory.setQuantityOnHand(newQuantity);
        Inventory saved = inventoryRepository.save(inventory);
        
        TransactionType transactionType = quantityChange > 0 ? TransactionType.RECEIVE : TransactionType.ADJUSTMENT;
        InventoryAdjustedEvent event = new InventoryAdjustedEvent(
            productId,
            storeId,
            currentUserService.getCurrentUserId(),
            transactionType,
            quantityChange,
            notes
        );
        eventPublisher.publishEvent(event);
        
        return productInventoryMapper.toResponse(saved);
    }
    
    @Transactional
    public ProductInventoryResponse receiveStock(Long productId, Long storeId, Integer quantity, String notes) {
        return adjustQuantity(productId, storeId, Math.abs(quantity), notes);
    }
    
    @Transactional
    public ProductInventoryResponse sellStock(Long productId, Long storeId, Integer quantity, String notes) {
        return adjustQuantity(productId, storeId, -Math.abs(quantity), notes);
    }
}
