package com.marouane.ecom.product;

import com.marouane.ecom.common.PageResponse;
import com.marouane.ecom.exception.ProductCreationException;
import com.marouane.ecom.exception.ProductDeletionException;
import com.marouane.ecom.exception.ProductNotFoundException;
import com.marouane.ecom.inventory.InventoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final InventoryService inventoryService;

    @Transactional
    public Product createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getProductName())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(request.getStatus())
                .versions(new ArrayList<>())
                .build();

        Product savedProduct = productRepository.save(product);

        ProductVersion productVersion = ProductVersion.builder()
                .product(savedProduct)
                .price(request.getPrice())
                .isCurrent(true)
                .build();
        savedProduct.addVersion(productVersion);

        return productRepository.save(savedProduct);
    }

    @Transactional
    public Product updateProduct(Long productId, ProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setStatus(request.getStatus());


        if (request.getPrice().compareTo(product.getPrice()) != 0) {

            product.getVersions().forEach(v -> v.setCurrent(false));


            ProductVersion newVersion = ProductVersion.builder()
                    .product(product)
                    .price(request.getPrice())
                    .isCurrent(true)
                    .build();

            product.addVersion(newVersion);
        }

        return productRepository.save(product);
    }

    @Transactional
    public void softDeleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        if (inventoryService.hasActiveReservations(productId)){
            throw new ProductDeletionException(
                    "Cannot discontinue product with active reservations");
        }

        product.setStatus(ProductStatus.DISCONTINUED);
        productRepository.save(product);
    }


    public PageResponse<ProductResponse> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> products = productRepository.findAllByStatus(ProductStatus.ACTIVE, pageable);

        List<ProductResponse> productResponses = products.stream()
                .map(productMapper::toProductResponse)
                .toList();

        return new PageResponse<>(
                productResponses,
                products.getNumber(),
                products.getSize(),
                (int) products.getTotalElements(),
                products.getTotalPages(),
                products.isFirst(),
                products.isLast()
        );
    }

    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + productId));


        return productMapper.toProductResponse(product);
    }







}
