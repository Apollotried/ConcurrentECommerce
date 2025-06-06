package com.marouane.ecom.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

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
}
