package com.freshmart.service;

import com.freshmart.dto.ProductRequest;
import com.freshmart.dto.ProductResponse;
import com.freshmart.exception.DuplicateUpcException;
import com.freshmart.exception.ProductNotFoundException;
import com.freshmart.mapper.ProductMapper;
import com.freshmart.model.Product;
import com.freshmart.model.Supplier;
import com.freshmart.repository.ProductRepository;
import com.freshmart.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;
    
    public ProductService(ProductRepository productRepository, 
                          SupplierRepository supplierRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.productMapper = productMapper;
    }
    
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsByUpc(request.upc())) {
            throw new DuplicateUpcException("Product with UPC " + request.upc() + " already exists");
        }
        
        Product product = productMapper.toEntity(request);
        
        if (request.supplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElse(null);
            product.setSupplier(supplier);
        }
        
        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }
    
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        return productMapper.toResponse(product);
    }
    
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findByIsActiveTrue().stream()
            .map(productMapper::toResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        
        if (!product.getUpc().equals(request.upc()) && productRepository.existsByUpc(request.upc())) {
            throw new DuplicateUpcException("Product with UPC " + request.upc() + " already exists");
        }
        
        productMapper.updateEntity(request, product);
        
        if (request.supplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElse(null);
            product.setSupplier(supplier);
        }
        
        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }
    
    Product getProductEntity(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
    }
}
