package com.freshmart.mapper;

import com.freshmart.dto.ProductInventoryResponse;
import com.freshmart.model.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductInventoryMapper {

    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.category", target = "category")
    @Mapping(source = "product.upc", target = "upc")
    @Mapping(source = "product.unitCost", target = "unitCost")
    @Mapping(source = "product.retailPrice", target = "retailPrice")
    @Mapping(source = "isOnSale", target = "isOnSale")
    @Mapping(source = "salesPriceModifier", target = "salesPriceModifier")
    @Mapping(target = "salePrice", ignore = true)
    @Mapping(source = "product.isFood", target = "isFood")
    @Mapping(source = "product.isActive", target = "isActive")
    @Mapping(source = "product.expirationDate", target = "expirationDate")
    @Mapping(source = "product.reorderThreshold", target = "reorderThreshold")
    @Mapping(source = "product.reorderQuantity", target = "reorderQuantity")
    @Mapping(source = "product.supplier.supplierName", target = "supplierName")
    @Mapping(source = "store.storeId", target = "storeId")
    @Mapping(source = "quantityOnHand", target = "quantityOnHand")
    @Mapping(source = "lastUpdated", target = "lastUpdated")
    @Mapping(source = "inventoryId", target = "inventoryId")
    ProductInventoryResponse toResponse(Inventory inventory);
}
