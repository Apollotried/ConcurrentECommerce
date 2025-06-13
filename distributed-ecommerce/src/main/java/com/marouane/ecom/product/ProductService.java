package com.marouane.ecom.product;

import com.marouane.ecom.common.PageResponse;
import com.marouane.ecom.exception.ProductCreationException;
import com.marouane.ecom.exception.ProductDeletionException;
import com.marouane.ecom.exception.ProductNotFoundException;
import com.marouane.ecom.inventory.InventoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final InventoryService inventoryService;

    @Transactional
    public Product createProduct(ProductRequest request) {
        return productRepository.save(
                Product.builder()
                        .name(request.getProductName())
                        .description(request.getDescription())
                        .category(request.getCategory())
                        .status(request.getStatus())
                        .price(request.getPrice())
                        .build()
        );



    }

    @Transactional
    public Product updateProduct(Long productId, ProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setStatus(request.getStatus());
        product.setPrice(request.getPrice());

        return productRepository.save(product);
    }

    @Transactional
    public void softDeleteProduct(Long productId) {
        try {
            Product product = productRepository.findByIdWithLock(productId)
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));

            if (inventoryService.hasActiveReservations(productId)) {
                throw new ProductDeletionException(
                        "Cannot discontinue product with active reservations");
            }

            product.setStatus(ProductStatus.DISCONTINUED);
            productRepository.save(product);
        } catch (PessimisticLockingFailureException e) {
            throw new ConcurrentModificationException(
                    "Product is currently being modified by another transaction. Please try again.");
        }
    }



    @Transactional
    public void hardDeleteProduct(Long productId) {
        try {
            Product product = productRepository.findByIdWithLock(productId)
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));

            if (inventoryService.hasActiveReservations(productId)) {
                throw new ProductDeletionException(
                        "Cannot delete product with active reservations");
            }

            inventoryService.deleteByProductId(productId);
            productRepository.delete(product);
        } catch (PessimisticLockingFailureException e) {
            throw new ConcurrentModificationException(
                    "Product is currently being modified by another transaction. Please try again.");
        }
    }



    public PageResponse<ProductResponse> getAllProducts(
            int page, int size,
            String sortBy, String sortDir,
            String search, String category,
            ProductStatus status) {

        // Create Sort object
        Sort sort = Sort.by("createdAt").descending(); // default
        if (sortBy != null && sortDir != null) {
            sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        // Build specification for filtering
        Specification<Product> spec = Specification.where(null);

        if (search != null && !search.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
                            cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%")
                    )
            );
        }

        if (category != null && !category.equals("All")) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category"), category)
            );
        }

        if (status != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("status"), status)
            );
        }

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductResponse> responses = productPage.getContent().stream()
                .map(productMapper::toProductResponse)
                .toList();

        return new PageResponse<>(
                responses,
                productPage.getNumber(),
                productPage.getSize(),
                (int) productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isFirst(),
                productPage.isLast()
        );
    }

    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));


        return productMapper.toProductResponse(product);
    }

    public long countAllProducts() {
        return productRepository.count();
    }

    public long countActiveProducts() {
        return productRepository.countByStatus(ProductStatus.ACTIVE);
    }



    public PageResponse<ProductResponse> getProductsWithoutInventory(int page, int size) {

        Sort sort = Sort.by("createdAt").descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productPage = productRepository.findProductsWithoutInventory(pageable);

        List<ProductResponse> content = productPage
                .getContent()
                .stream()
                .map(productMapper::toProductResponse)
                .toList();

        return new PageResponse<>(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                (int) productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isFirst(),
                productPage.isLast()
        );
    }


    public PageResponse<ProductResponse> getAvailableProducts(
            int page,
            int size,
            String sortBy,
            String sortDir,
            String search,
            String category) {

        // Create Sort object
        Sort sort = Sort.by("createdAt").descending(); // default
        if (sortBy != null && sortDir != null) {
            sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        // Build specification for filtering
        Specification<Product> spec = Specification.where(
                (root, query, cb) -> cb.equal(root.get("status"), ProductStatus.ACTIVE)
        );

        if (search != null && !search.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
                            cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%")
                    )
            );
        }

        if (category != null && !category.equals("All")) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category"), category)
            );
        }

        // First get all active products that match filters
        Page<Product> activeProducts = productRepository.findAll(spec, pageable);

        // Then filter out products with no inventory
        List<Product> availableProducts = activeProducts.getContent().stream()
                .filter(product -> inventoryService.isInStock(product.getId()))
                .toList();

        // Convert to response DTOs
        List<ProductResponse> responses = availableProducts.stream()
                .map(productMapper::toProductResponse)
                .toList();

        // Create custom page response since we did post-filtering
        return new PageResponse<>(
                responses,
                activeProducts.getNumber(),
                activeProducts.getSize(),
                availableProducts.size(),
                (int) Math.ceil((double) availableProducts.size() / size),
                activeProducts.isFirst(),
                activeProducts.getNumber() >= (int) Math.ceil((double) availableProducts.size() / size) - 1
        );
    }











}
