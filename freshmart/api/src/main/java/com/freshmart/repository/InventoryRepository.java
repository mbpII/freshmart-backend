package com.freshmart.repository;

import com.freshmart.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    Optional<Inventory> findByProductProductIdAndStoreStoreIdAndIsActiveTrue(Long productId, Long storeId);

    Optional<Inventory> findByProductProductIdAndStoreStoreIdAndIsActiveFalse(Long productId, Long storeId);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p WHERE i.store.storeId = :storeId AND i.isActive = true ORDER BY p.productName ASC, i.inventoryId ASC")
    List<Inventory> findActiveInventoryByStoreIdWithProduct(@Param("storeId") Long storeId);

    boolean existsByProductProductIdAndStoreStoreId(Long productId, Long storeId);
}
