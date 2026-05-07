package com.freshmart.mapper;

import com.freshmart.dto.CreateProductRequest;
import com.freshmart.dto.ProductRequest;
import com.freshmart.dto.ProductResponse;
import com.freshmart.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProductMapper {

    default ProductRequest toProductRequest(CreateProductRequest request) {
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

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "supplier", ignore = true)
    Product toEntity(ProductRequest request);

    @Mapping(source = "supplier.supplierName", target = "supplierName")
    @Mapping(source = "isFood", target = "isFood")
    @Mapping(source = "isActive", target = "isActive")
    ProductResponse toResponse(Product product);

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(ProductRequest request, @MappingTarget Product product);
}
