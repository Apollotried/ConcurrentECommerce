package com.marouane.ecom.product;


import com.marouane.ecom.auth.AuthenticationRequest;
import com.marouane.ecom.auth.AuthenticationResponse;
import com.marouane.ecom.auth.RegistrationRequest;
import com.marouane.ecom.common.BaseIntegrationTest;
import com.marouane.ecom.user.Role;
import com.marouane.ecom.user.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ProductRepository productRepository;



    String jwtToken;
    protected HttpHeaders getAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    protected <T> ResponseEntity<T> performAuthenticatedRequest(
            HttpMethod method,
            String url,
            Object body,
            Class<T> responseType) {
        return restTemplate.exchange(
                url,
                method,
                new HttpEntity<>(body, getAuthHeaders()),
                responseType
        );
    }


    @BeforeEach
    void setUp() {
        productRepository.deleteAll();


        Role userRole = Role.builder()
                .name("USER")
                .build();
        roleRepository.save(userRole);

        RegistrationRequest request = new RegistrationRequest(
                "first",
                "last",
                "user@gmail.com",
                "password5555"
        );
        restTemplate.postForEntity("/api/auth/register", request, Void.class);

        AuthenticationRequest authenticationRequest = new AuthenticationRequest(
                "user@gmail.com",
                "password5555"
        );

        ResponseEntity<AuthenticationResponse> response = restTemplate.postForEntity(
                "/api/auth/authenticate",
                authenticationRequest,
                AuthenticationResponse.class
        );
        jwtToken = Objects.requireNonNull(response.getBody()).getToken();

    }

    @Test
    void testJwt(){
        assertThat(jwtToken).isNotEmpty();
        assertThat(jwtToken).isNotBlank();
    }
    @Test
    void productLifecycle(){
        ProductRequest request = ProductRequest.builder()
                .productName("Wireless Earbuds")
                .description("Noise cancelling")
                .price(BigDecimal.valueOf(129.99))
                .category("ELECTRONICS")
                .status(ProductStatus.ACTIVE)
                .build();

        // create
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        HttpEntity<ProductRequest> entity = new HttpEntity<>(request, headers);


        ResponseEntity<Product> createResponse = restTemplate.postForEntity(
                "/api/products",
                entity,
                Product.class
        );

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Product createdProduct = createResponse.getBody();
        assertThat(createdProduct).isNotNull();

        // get
        ResponseEntity<ProductResponse> getResponse = performAuthenticatedRequest(
                HttpMethod.GET,
                "/api/products/" + createdProduct.getId(),
                null,
                ProductResponse.class
        );

        assertThat(getResponse.getBody())
                .extracting(ProductResponse::getName, ProductResponse::getPrice)
                .containsExactly("Wireless Earbuds", BigDecimal.valueOf(129.99));


        // update
        ProductRequest updateRequest = new ProductRequest(
                "Wireless Earbuds Pro",
                "Improved noise cancellation",
                "ELECTRONICS",
                BigDecimal.valueOf(149.99),
                ProductStatus.ACTIVE

        );

        ResponseEntity<Product> updateResponse = performAuthenticatedRequest(
                HttpMethod.PUT,
                "/api/products/" + createdProduct.getId(),
                updateRequest,
                Product.class
        );
        assertThat(updateResponse.getBody())
                .extracting(Product::getName, Product::getPrice)
                .containsExactly("Wireless Earbuds Pro", BigDecimal.valueOf(149.99));


        // Soft Delete
        ResponseEntity<Void> deleteResponse = performAuthenticatedRequest(
                HttpMethod.DELETE,
                "/api/products/" + createdProduct.getId() + "/soft",
                null,
                Void.class
        );
        assertThat(deleteResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        //validate Soft deletion
        ResponseEntity<ProductResponse> deletedGetResponse = performAuthenticatedRequest(
                HttpMethod.GET,
                "/api/products/" + createdProduct.getId(),
                null,
                ProductResponse.class
        );

        assertThat(deletedGetResponse.getBody().getStatus())
                .isEqualTo(ProductStatus.DISCONTINUED);

    }


    @Test
    void concurrentHardDeleteShouldPreventRaceConditions() throws InterruptedException {
        // Create test product
        Product product = productRepository.save(Product.builder()
                .name("Test Product")
                .status(ProductStatus.ACTIVE)
                .build());

        int threadCount = 5;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger notFoundCount = new AtomicInteger(0); // For 404s
        AtomicInteger conflictCount = new AtomicInteger(0); // For 409s
        AtomicInteger otherErrorCount = new AtomicInteger(0);

        // Simulate concurrent hard deletion attempts
        for (int i = 0; i < threadCount; i++) {
            executorService.execute(() -> {
                try {
                    latch.await();
                    ResponseEntity<Void> response = performAuthenticatedRequest(
                            HttpMethod.DELETE,
                            "/api/products/" + product.getId() + "/hard",
                            null,
                            Void.class
                    );

                    // More precise status code checking
                    if (response.getStatusCode() == HttpStatus.NO_CONTENT) {
                        successCount.incrementAndGet();
                    } else if (response.getStatusCode() == HttpStatus.NOT_FOUND) {
                        notFoundCount.incrementAndGet();
                    } else if (response.getStatusCode() == HttpStatus.CONFLICT) {
                        conflictCount.incrementAndGet();
                    }
                } catch (HttpClientErrorException e) {
                    if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                        notFoundCount.incrementAndGet();
                    } else if (e.getStatusCode() == HttpStatus.CONFLICT) {
                        conflictCount.incrementAndGet();
                    } else {
                        otherErrorCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    otherErrorCount.incrementAndGet();
                }
            });
        }

        // Trigger all threads at once
        latch.countDown();
        executorService.shutdown();
        assertTrue(executorService.awaitTermination(3, TimeUnit.SECONDS));

        // Verify results
        assertThat(successCount.get()).isEqualTo(1);

        // Verify product is deleted
        assertThat(productRepository.findById(product.getId())).isEmpty();
    }




}