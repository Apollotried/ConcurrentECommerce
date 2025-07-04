package com.marouane.ecom.inventory;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID>, JpaSpecificationExecutor<Inventory> {

    boolean existsByProductId(Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "javax.persistence.lock.timeout", value = "2000"))
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId")
    Optional<Inventory> findByProductIdWithLock(@Param("productId") Long productId);



    Optional<Inventory> findByProductId(Long productId);


    @Query("""
    SELECT i FROM Inventory i
    WHERE (i.totalQuantity - i.totalReserved) < :threshold
""")
    List<Inventory> findByAvailableQuantityLessThan(@Param("threshold") int threshold);



    @Query("SELECT COUNT(i) FROM Inventory i WHERE (i.totalQuantity - i.totalReserved) < :threshold")
    long countByAvailableQuantityLessThan(@Param("threshold") int threshold);


    @Query("SELECT COUNT(i) FROM Inventory i WHERE (i.totalQuantity - i.totalReserved) = :quantity")
    long countByAvailableQuantity(int quantity);


    @Query("SELECT COUNT(i) FROM Inventory i WHERE (i.totalQuantity - i.totalReserved) >= :quantity")
    long countByAvailableQuantityGreaterThanEqual(int quantity);

}
