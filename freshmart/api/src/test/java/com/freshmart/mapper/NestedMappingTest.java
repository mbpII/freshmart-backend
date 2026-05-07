package com.freshmart.mapper;

import com.freshmart.dto.ProductInventoryResponse;
import com.freshmart.dto.ProductResponse;
import com.freshmart.model.Inventory;
import com.freshmart.model.Product;
import com.freshmart.model.Store;
import com.freshmart.model.Supplier;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class NestedMappingTest {

    private final ProductMapper productMapper = new ProductMapperImpl();
    private final ProductInventoryMapper productInventoryMapper = new ProductInventoryMapperImpl();

    @Test
    void productMapperToResponseMapsSupplierNameFromNestedSupplier() {
        Supplier supplier = new Supplier();
        supplier.setSupplierName("Acme Farms");

        Product product = new Product();
        product.setProductId(11L);
        product.setProductName("Gala Apples");
        product.setCategory("Produce");
        product.setUpc("12345");
        product.setSupplier(supplier);
        product.setUnitCost(new BigDecimal("1.25"));
        product.setRetailPrice(new BigDecimal("2.49"));
        product.setIsFood(true);
        product.setReorderThreshold(5);
        product.setReorderQuantity(20);
        product.setExpirationDate(LocalDate.of(2026, 5, 1));
        product.setIsActive(true);

        ProductResponse response = productMapper.toResponse(product);

        assertNotNull(response);
        assertEquals("Acme Farms", response.supplierName());
        assertEquals("Gala Apples", response.productName());
        assertEquals("Produce", response.category());
    }

    @Test
    void productInventoryMapperToResponseMapsNestedStoreAndSupplierFields() {
        Supplier supplier = new Supplier();
        supplier.setSupplierName("North Supply");

        Product product = new Product();
        product.setProductId(25L);
        product.setProductName("Pasta");
        product.setCategory("Pantry");
        product.setUpc("77777");
        product.setSupplier(supplier);
        product.setUnitCost(new BigDecimal("2.00"));
        product.setRetailPrice(new BigDecimal("3.99"));
        product.setIsFood(true);
        product.setIsActive(true);
        product.setReorderThreshold(8);
        product.setReorderQuantity(30);

        Store store = new Store();
        store.setStoreId(101L);

        Inventory inventory = new Inventory();
        inventory.setInventoryId(99L);
        inventory.setProduct(product);
        inventory.setStore(store);
        inventory.setQuantityOnHand(42);
        inventory.setLastUpdated(LocalDateTime.of(2026, 4, 14, 9, 30));
        inventory.setIsOnSale(true);
        inventory.setSalesPriceModifier(new BigDecimal("10.00"));

        ProductInventoryResponse response = productInventoryMapper.toResponse(inventory);

        assertNotNull(response);
        assertEquals(25L, response.productId());
        assertEquals(101L, response.storeId());
        assertEquals("North Supply", response.supplierName());
        assertEquals(new BigDecimal("3.99"), response.retailPrice());
        assertEquals(42, response.quantityOnHand());
    }
}
