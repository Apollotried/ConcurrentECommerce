package com.marouane.ecom.product;

import com.marouane.ecom.common.PageResponse;
import com.marouane.ecom.exception.ProductDeletionException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;


    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        Product createdProduct = productService.createProduct(productRequest);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest productRequest) {
        Product updatedProduct = productService.updateProduct(id, productRequest);
        return ResponseEntity.ok(updatedProduct);
    }


    @DeleteMapping("/{id}/soft")
    public ResponseEntity<Void> softDeleteProduct(@PathVariable Long id) {
        try {
            productService.softDeleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (PessimisticLockingFailureException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (ProductDeletionException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteProduct(@PathVariable Long id) {
        productService.hardDeleteProduct(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ProductStatus status) {
        PageResponse<ProductResponse> productPageResponse = productService.getAllProducts(page, size, sortBy, sortDir, search, category, status);
        return ResponseEntity.ok(productPageResponse);
    }


    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse productResponse = productService.getProductById(id);
        return ResponseEntity.ok(productResponse);
    }

    @GetMapping("/activeCount")
    public long countActiveProducts() {
        return productService.countActiveProducts();
    }

    @GetMapping("/count")
    public long countAllProducts() {
        return productService.countAllProducts();
    }


    @GetMapping("/no-inventory")
    public ResponseEntity<PageResponse<ProductResponse>> getProductsWithoutInventory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(productService.getProductsWithoutInventory(page, size));
    }


}
