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

import java.math.BigDecimal;
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
    private final PricingService pricingService;
    private final ApplicationEventPublisher eventPublisher;
    
    public InventoryService(InventoryRepository inventoryRepository,
                   StoreRepository storeRepository,
                   ProductService productService,
                    CurrentUserService currentUserService,
                    InventoryMapper inventoryMapper,
                    ProductInventoryMapper productInventoryMapper,
                    PricingService pricingService,
                    ApplicationEventPublisher eventPublisher) {
        this.inventoryRepository = inventoryRepository;
        this.storeRepository = storeRepository;
        this.productService = productService;
        this.currentUserService = currentUserService;
        this.inventoryMapper = inventoryMapper;
        this.productInventoryMapper = productInventoryMapper;
        this.pricingService = pricingService;
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
        inventory.setIsOnSale(false);
        inventory.setSalesPriceModifier(null);
        
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
            .map(this::toProductInventoryResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ProductInventoryResponse getProductInventory(Long productId, Long storeId) {
        Inventory inventory = inventoryRepository.findByProductProductIdAndStoreStoreIdAndIsActiveTrue(productId, storeId)
            .orElseThrow(() -> new InventoryNotFoundException(
                "Product " + productId + " not found in store " + storeId + " inventory"));
        
        return toProductInventoryResponse(inventory);
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
        return adjustQuantity(productId, storeId, quantityChange, notes,
            quantityChange > 0 ? TransactionType.RECEIVE : TransactionType.ADJUSTMENT);
    }

    @Transactional
    public ProductInventoryResponse receiveStock(Long productId, Long storeId, Integer quantity, String notes) {
        return adjustQuantity(productId, storeId, Math.abs(quantity), notes, TransactionType.RECEIVE);
    }

    @Transactional
    public ProductInventoryResponse sellStock(Long productId, Long storeId, Integer quantity, String notes) {
        return adjustQuantity(productId, storeId, -Math.abs(quantity), notes, TransactionType.SALE);
    }

    private ProductInventoryResponse adjustQuantity(Long productId,
                                                   Long storeId,
                                                   Integer quantityChange,
                                                   String notes,
                                                   TransactionType transactionType) {
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

        InventoryAdjustedEvent event = new InventoryAdjustedEvent(
            productId,
            storeId,
            currentUserService.getCurrentUserId(),
            transactionType,
            quantityChange,
            notes
        );
        eventPublisher.publishEvent(event);
        
        return toProductInventoryResponse(saved);
    }

    @Transactional
    public ProductInventoryResponse markProductOnSale(Long productId,
                                                      Long storeId,
                                                      BigDecimal salesPriceModifier) {
        Inventory inventory = inventoryRepository.findByProductProductIdAndStoreStoreIdAndIsActiveTrue(productId, storeId)
            .orElseThrow(() -> new InventoryNotFoundException(
                "Product " + productId + " not found in store " + storeId + " inventory"));

        BigDecimal percentOff = pricingService.normalizeSalesPriceModifier(salesPriceModifier);
        inventory.setIsOnSale(true);
        inventory.setSalesPriceModifier(percentOff);

        Inventory saved = inventoryRepository.save(inventory);
        return toProductInventoryResponse(saved);
    }

    @Transactional
    public ProductInventoryResponse removeSale(Long productId, Long storeId) {
        Inventory inventory = inventoryRepository.findByProductProductIdAndStoreStoreIdAndIsActiveTrue(productId, storeId)
            .orElseThrow(() -> new InventoryNotFoundException(
                "Product " + productId + " not found in store " + storeId + " inventory"));

        inventory.setIsOnSale(false);
        inventory.setSalesPriceModifier(null);

        Inventory saved = inventoryRepository.save(inventory);
        return toProductInventoryResponse(saved);
    }

    private ProductInventoryResponse toProductInventoryResponse(Inventory inventory) {
        ProductInventoryResponse base = productInventoryMapper.toResponse(inventory);
        BigDecimal salePrice = pricingService.calculateSalePrice(
            base.retailPrice(),
            base.salesPriceModifier(),
            base.isOnSale()
        );

        return new ProductInventoryResponse(
            base.productId(),
            base.storeId(),
            base.productName(),
            base.category(),
            base.upc(),
            base.supplierName(),
            base.unitCost(),
            base.retailPrice(),
            base.isOnSale(),
            base.salesPriceModifier(),
            salePrice,
            base.quantityOnHand(),
            base.lastUpdated(),
            base.isFood(),
            base.isActive(),
            base.expirationDate(),
            base.reorderThreshold(),
            base.reorderQuantity(),
            base.inventoryId()
        );
    }
}
