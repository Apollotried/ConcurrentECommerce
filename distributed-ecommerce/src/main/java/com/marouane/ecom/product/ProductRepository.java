package com.marouane.ecom.product;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Page<Product> findAllByStatus(ProductStatus status, Pageable pageable);

    Product getProductById(Long productId);

    long countByStatus(ProductStatus status);

    @Query("""
    SELECT p FROM Product p 
    WHERE p.id NOT IN (
        SELECT i.product.id FROM Inventory i WHERE i.product IS NOT NULL
    )
""")
    Page<Product> findProductsWithoutInventory(Pageable pageable);


    Optional<Product> findByName(String productName);


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "javax.persistence.lock.timeout", value = "2000"))
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);
}
