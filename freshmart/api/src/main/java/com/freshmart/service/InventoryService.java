package com.freshmart.service;

import com.freshmart.dto.InventoryRequest;
import com.freshmart.dto.InventoryResponse;
import com.freshmart.dto.ProductInventoryResponse;
import com.freshmart.event.InventoryAdjustedEvent;
import com.freshmart.exception.InventoryNotFoundException;
import com.freshmart.exception.ProductNotFoundException;
import com.freshmart.exception.StoreContextException;
import com.freshmart.mapper.InventoryMapper;
import com.freshmart.mapper.ProductInventoryMapper;
import com.freshmart.model.Inventory;
import com.freshmart.model.Product;
import com.freshmart.model.Store;
import com.freshmart.model.Transaction.TransactionType;
import com.freshmart.repository.InventoryRepository;
import com.freshmart.repository.ProductRepository;
import com.freshmart.repository.StoreRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InventoryService {

    private static final String PRODUCT_ALREADY_IN_STORE = "Product already exists in this store's inventory";
    private static final String POSITIVE_QTY_REQUIRED = "Quantity must be greater than zero";
    private static final String NON_ZERO_ADJUSTMENT_REQUIRED = "Quantity change must not be zero";
    private static final String QTY_REQUIRED = "Quantity is required";
    private static final String QTY_CHANGE_REQUIRED = "Quantity change is required";
    
    private final InventoryRepository inventoryRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;
    private final InventoryMapper inventoryMapper;
    private final ProductInventoryMapper productInventoryMapper;
    private final PricingService pricingService;
    private final PercentOffStrategy percentOffStrategy;
    private final FlatPriceStrategy flatPriceStrategy;
    private final ApplicationEventPublisher eventPublisher;

    public InventoryService(InventoryRepository inventoryRepository,
                            StoreRepository storeRepository,
                            ProductRepository productRepository,
                            CurrentUserService currentUserService,
                            InventoryMapper inventoryMapper,
                            ProductInventoryMapper productInventoryMapper,
                            PricingService pricingService,
                            PercentOffStrategy percentOffStrategy,
                            FlatPriceStrategy flatPriceStrategy,
                            ApplicationEventPublisher eventPublisher) {
        this.inventoryRepository = inventoryRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.currentUserService = currentUserService;
        this.inventoryMapper = inventoryMapper;
        this.productInventoryMapper = productInventoryMapper;
        this.pricingService = pricingService;
        this.percentOffStrategy = percentOffStrategy;
        this.flatPriceStrategy = flatPriceStrategy;
        this.eventPublisher = eventPublisher;
    }
    
    @Transactional
    public InventoryResponse addToInventory(Long storeId, InventoryRequest request) {
        Store store = validateStoreContext(storeId);
        
        Product product = findProductByIdOrThrow(request.productId());
        
        if (inventoryRepository.existsByProductProductIdAndStoreStoreId(request.productId(), storeId)) {
            throw new IllegalArgumentException(PRODUCT_ALREADY_IN_STORE);
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
        validateStoreContext(storeId);
        return inventoryRepository.findActiveInventoryByStoreIdWithProduct(storeId).stream()
            .map(this::toProductInventoryResponse)
            .toList();
    }
    
    @Transactional(readOnly = true)
    public ProductInventoryResponse getProductInventory(Long productId, Long storeId) {
        validateStoreContext(storeId);
        return toProductInventoryResponse(findActiveInventoryOrThrow(productId, storeId));
    }
    
    @Transactional
    // Soft archive only: marks the store inventory record inactive without deleting the product globally.
    public void archiveFromStore(Long productId, Long storeId) {
        validateStoreContext(storeId);
        Inventory inventory = findActiveInventoryOrThrow(productId, storeId);
        inventory.setActive(false);
        inventoryRepository.save(inventory);
    }
    
    @Transactional
    public ProductInventoryResponse adjustQuantity(Long productId, Long storeId, Integer quantityChange, String notes) {
        validateNonZeroQuantityChange(quantityChange);
        return adjustQuantity(productId, storeId, quantityChange, notes, TransactionType.ADJUSTMENT);
    }

    @Transactional
    public ProductInventoryResponse receiveStock(Long productId, Long storeId, Integer quantity, String notes) {
        validatePositiveQuantity(quantity);
        return adjustQuantity(productId, storeId, quantity, notes, TransactionType.RECEIVE);
    }

    @Transactional
    public ProductInventoryResponse sellStock(Long productId, Long storeId, Integer quantity, String notes) {
        validatePositiveQuantity(quantity);
        return adjustQuantity(productId, storeId, -quantity, notes, TransactionType.SALE);
    }

    private ProductInventoryResponse adjustQuantity(Long productId,
                                                   Long storeId,
                                                   Integer quantityChange,
                                                   String notes,
                                                   TransactionType transactionType) {
        validateStoreContext(storeId);
        Inventory inventory = findActiveInventoryOrThrow(productId, storeId);
        
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
    public ProductInventoryResponse markProductOnSaleByPercent(Long productId,
                                                               Long storeId,
                                                               BigDecimal percentOff) {
        return applyModifier(productId, storeId, percentOff, percentOffStrategy);
    }

    @Transactional
    public ProductInventoryResponse markProductOnSaleByFlat(Long productId,
                                                            Long storeId,
                                                            BigDecimal flatPrice) {
        return applyModifier(productId, storeId, flatPrice, flatPriceStrategy);
    }

    private ProductInventoryResponse applyModifier(Long productId, Long storeId,
                                                    BigDecimal inputValue,
                                                    SalePricingStrategy strategy) {
        validateStoreContext(storeId);
        Inventory inventory = findActiveInventoryOrThrow(productId, storeId);
        BigDecimal modifier = pricingService.computeModifier(strategy, inventory.getProduct().getRetailPrice(), inputValue);
        inventory.setIsOnSale(true);
        inventory.setSalesPriceModifier(modifier);
        return toProductInventoryResponse(inventoryRepository.save(inventory));
    }

    @Transactional
    public ProductInventoryResponse removeSale(Long productId, Long storeId) {
        validateStoreContext(storeId);
        Inventory inventory = findActiveInventoryOrThrow(productId, storeId);

        inventory.setIsOnSale(false);
        inventory.setSalesPriceModifier(null);

        Inventory saved = inventoryRepository.save(inventory);
        return toProductInventoryResponse(saved);
    }

    @Transactional(readOnly = true)
    public Store validateStoreContext(Long storeId) {
        if (storeId == null) {
            throw StoreContextException.missing();
        }
        if (storeId <= 0) {
            throw StoreContextException.invalid();
        }
        return storeRepository.findById(storeId)
            .filter(Store::isActive)
            .orElseThrow(StoreContextException::invalid);
    }

    private Inventory findActiveInventoryOrThrow(Long productId, Long storeId) {
        return inventoryRepository.findByProductProductIdAndStoreStoreIdAndIsActiveTrue(productId, storeId)
            .orElseThrow(() -> new InventoryNotFoundException(
                "Product " + productId + " not found in store " + storeId + " inventory"));
    }

    private Product findProductByIdOrThrow(Long productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
    }

    private void validatePositiveQuantity(Integer quantity) {
        requireNonNull(quantity, QTY_REQUIRED);
        if (quantity <= 0) {
            throw new IllegalArgumentException(POSITIVE_QTY_REQUIRED);
        }
    }

    private void validateNonZeroQuantityChange(Integer quantityChange) {
        requireNonNull(quantityChange, QTY_CHANGE_REQUIRED);
        if (quantityChange == 0) {
            throw new IllegalArgumentException(NON_ZERO_ADJUSTMENT_REQUIRED);
        }
    }

    private void requireNonNull(Integer value, String message) {
        if (value == null) {
            throw new IllegalArgumentException(message);
        }
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
