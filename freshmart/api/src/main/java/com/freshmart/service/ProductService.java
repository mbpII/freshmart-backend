package com.freshmart.service;

import com.freshmart.dto.CreateProductRequest;
import com.freshmart.dto.InventoryRequest;
import com.freshmart.dto.ProductInventoryResponse;
import com.freshmart.dto.ProductRequest;
import com.freshmart.dto.ProductResponse;
import com.freshmart.exception.DuplicateUpcException;
import com.freshmart.exception.ProductNotFoundException;
import com.freshmart.exception.SupplierNotFoundException;
import com.freshmart.mapper.ProductMapper;
import com.freshmart.model.Product;
import com.freshmart.model.Supplier;
import com.freshmart.repository.ProductRepository;
import com.freshmart.repository.SupplierRepository;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;
    private final InventoryService inventoryService;

    public ProductService(ProductRepository productRepository,
                          SupplierRepository supplierRepository,
                          ProductMapper productMapper,
                          InventoryService inventoryService) {
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.productMapper = productMapper;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public ProductInventoryResponse createProductWithInitialInventory(CreateProductRequest request, Long storeId) {
        inventoryService.validateStoreContext(storeId);
        var productResponse = createProduct(productMapper.toProductRequest(request));
        var initialQty = request.initialQuantity() != null ? request.initialQuantity() : 0;

        inventoryService.addToInventory(storeId, new InventoryRequest(productResponse.productId(), initialQty));
        return inventoryService.getProductInventory(productResponse.productId(), storeId);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (!isUniqueUpc(request.upc())) {
            throw new DuplicateUpcException("Product with UPC " + request.upc() + " already exists");
        }

        var product = productMapper.toEntity(request);
        product.setSupplier(resolveSupplier(request.supplierId()));

        var saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        var product = findProductByIdOrThrow(id);
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(@NotNull Long id, @NotNull ProductRequest request) {
        var product = findProductByIdOrThrow(id);

        if (!product.getUpc().equals(request.upc()) && !isUniqueUpc(request.upc())) {
            throw new DuplicateUpcException("Product with UPC " + request.upc() + " already exists");
        }

        productMapper.updateEntity(request, product);
        product.setSupplier(resolveSupplier(request.supplierId()));

        var saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    private boolean isUniqueUpc(String upc) {
        return !productRepository.existsByUpc(upc);
    }

    private Product findProductByIdOrThrow(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
    }

    private Supplier resolveSupplier(Long supplierId) {
        if (supplierId == null) {
            return null;
        }
        return supplierRepository.findById(supplierId)
            .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with id: " + supplierId));
    }
}
