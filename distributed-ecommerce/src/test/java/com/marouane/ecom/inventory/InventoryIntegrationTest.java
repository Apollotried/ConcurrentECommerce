package com.marouane.ecom.inventory;

import com.marouane.ecom.auth.AuthenticationRequest;
import com.marouane.ecom.auth.AuthenticationResponse;
import com.marouane.ecom.auth.RegistrationRequest;
import com.marouane.ecom.common.BaseIntegrationTest;
import com.marouane.ecom.product.Product;
import com.marouane.ecom.product.ProductRepository;
import com.marouane.ecom.product.ProductRequest;
import com.marouane.ecom.product.ProductStatus;
import com.marouane.ecom.user.Role;
import com.marouane.ecom.user.RoleRepository;
import com.marouane.ecom.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InventoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private InventoryReservationRepository reservationRepository;



    String jwtToken;
    private Long testProductId;


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

    protected MockMultipartFile createMockCsvFile(String content) throws IOException {
        return new MockMultipartFile(
                "file",
                "test.csv",
                "text/csv",
                content.getBytes()
        );
    }

    @BeforeEach
    void setUp() {

        jdbcTemplate.execute("DELETE FROM inventory_reservations");
        jdbcTemplate.execute("DELETE FROM inventory");
        jdbcTemplate.execute("DELETE FROM product");
        jdbcTemplate.execute("DELETE FROM _user_roles");
        jdbcTemplate.execute("DELETE FROM _user");
        jdbcTemplate.execute("DELETE FROM role");

        // Create test user and get token
        Role userRole = Role.builder().name("USER").build();
        roleRepository.save(userRole);

        restTemplate.postForEntity("/api/auth/register",
                new RegistrationRequest("Test", "User", "test@example.com", "password123"),
                Void.class);

        ResponseEntity<AuthenticationResponse> authResponse = restTemplate.postForEntity(
                "/api/auth/authenticate",
                new AuthenticationRequest("test@example.com", "password123"),
                AuthenticationResponse.class
        );
        jwtToken = Objects.requireNonNull(authResponse.getBody()).getToken();

        // Create test product
        ProductRequest productRequest = new ProductRequest(
                "Test Product",
                "Test Description",
                "TEST_CATEGORY",
                BigDecimal.valueOf(49.99),
                ProductStatus.ACTIVE
        );

        ResponseEntity<Product> productResponse = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/products",
                productRequest,
                Product.class
        );
        testProductId = productResponse.getBody().getId();
    }

    @Test
    void inventoryLifecycle() {
        // Create inventory
        ResponseEntity<Inventory> createResponse = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/inventory/create/" + testProductId + "/100",
                null,
                Inventory.class
        );

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(createResponse.getBody()).isNotNull();
        assertThat(createResponse.getBody().getTotalQuantity()).isEqualTo(100);
        assertThat(createResponse.getBody().getTotalReserved()).isZero();

        // Get inventory
        ResponseEntity<InventoryResponseDto> getResponse = performAuthenticatedRequest(
                HttpMethod.GET,
                "/api/inventory/" + testProductId,
                null,
                InventoryResponseDto.class
        );

        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody()).isNotNull();
        assertThat(getResponse.getBody().getAvailableQuantity()).isEqualTo(100);


        // Check availability
        ResponseEntity<Boolean> availabilityResponse = performAuthenticatedRequest(
                HttpMethod.GET,
                "/api/inventory/" + testProductId + "/available?quantity=50",
                null,
                Boolean.class
        );

        assertThat(availabilityResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(availabilityResponse.getBody()).isTrue();


        // Reserve stock
        ResponseEntity<Void> reserveResponse = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/inventory/" + testProductId + "/reserve?quantity=30",
                null,
                Void.class
        );

        assertThat(reserveResponse.getStatusCode()).isEqualTo(HttpStatus.OK);


        // Verify reservation
        ResponseEntity<InventoryResponseDto> afterReservation = performAuthenticatedRequest(
                HttpMethod.GET,
                "/api/inventory/" + testProductId,
                null,
                InventoryResponseDto.class
        );

        assertThat(afterReservation.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(afterReservation.getBody()).isNotNull();
        assertThat(afterReservation.getBody().getAvailableQuantity()).isEqualTo(70);
        assertThat(afterReservation.getBody().getTotalReserved()).isEqualTo(30);

        // Release stock
        ResponseEntity<Void> releaseResponse = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/inventory/" + testProductId + "/release?quantity=15",
                null,
                Void.class
        );

        assertThat(releaseResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Verify release
        ResponseEntity<InventoryResponseDto> afterRelease = performAuthenticatedRequest(
                HttpMethod.GET,
                "/api/inventory/" + testProductId,
                null,
                InventoryResponseDto.class
        );

        assertThat(afterRelease.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(afterRelease.getBody()).isNotNull();
        assertThat(afterRelease.getBody().getAvailableQuantity()).isEqualTo(85);
        assertThat(afterRelease.getBody().getTotalReserved()).isEqualTo(15);



    }

    @Test
    void inventoryReservationLifecycle() {
        // initial inv
        performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/inventory/create/" + testProductId + "/100",
                null,
                Inventory.class
        );

        // Create reservation
        UUID orderId = UUID.randomUUID();
        inventoryService.reserveForOrder(Map.of(testProductId, 20), orderId);

        // Verify reservation
        Inventory updatedInventory = inventoryRepository.findByProductId(testProductId)
                .orElseThrow();
        assertThat(updatedInventory.getTotalReserved()).isEqualTo(20);
        assertThat(updatedInventory.getAvailableQuantity()).isEqualTo(80);


        // Confirm reservation
        inventoryService.confirmReservation(orderId);

        Inventory finalInventory = inventoryRepository.findByProductId(testProductId)
                .orElseThrow();
        assertThat(finalInventory.getTotalQuantity()).isEqualTo(80);
        assertThat(finalInventory.getTotalReserved()).isZero();
        assertThat(reservationRepository.findByOrderId(orderId)).isEmpty();

    }

    @Test
    void concurrentReserveStock_shouldPreventOverselling() throws InterruptedException {
        // Setup initial inventory
        performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/inventory/create/" + testProductId + "/100",
                null,
                Inventory.class
        );

        int threadCount = 10;
        int quantityPerThread = 15; // Total would be 150 if not constrained
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.execute(() -> {
                try {
                    latch.await();
                    ResponseEntity<Void> response = performAuthenticatedRequest(
                            HttpMethod.POST,
                            "/api/inventory/" + testProductId + "/reserve?quantity=" + quantityPerThread,
                            null,
                            Void.class
                    );
                    if (response.getStatusCode().is2xxSuccessful()) {
                        successCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                }
            });
        }

        latch.countDown();
        executor.shutdown();
        assertTrue(executor.awaitTermination(2, TimeUnit.SECONDS));

        // Verify only allowed reservations succeeded
        Inventory inventory = inventoryRepository.findByProductId(testProductId).orElseThrow();
        assertThat(inventory.getTotalReserved()).isEqualTo(90);
        assertThat(inventory.getAvailableQuantity()).isEqualTo(10);

        assertThat(successCount.get()).isEqualTo(6);
    }

    @Test
    void concurrentReserveAndRelease_shouldMaintainConsistency() throws InterruptedException {
        // Setup initial inventory
        performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/inventory/create/" + testProductId + "/200",
                null,
                Inventory.class
        );

        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger reserveSuccess = new AtomicInteger(0);
        AtomicInteger releaseSuccess = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final boolean isReserve = i % 2 == 0;
            executor.execute(() -> {
                try {
                    latch.await();
                    String endpoint = isReserve ?
                            "/api/inventory/" + testProductId + "/reserve?quantity=10" :
                            "/api/inventory/" + testProductId + "/release?quantity=5";

                    ResponseEntity<Void> response = performAuthenticatedRequest(
                            HttpMethod.POST,
                            endpoint,
                            null,
                            Void.class
                    );
                    if (response.getStatusCode().is2xxSuccessful()) {
                        if (isReserve) reserveSuccess.incrementAndGet();
                        else releaseSuccess.incrementAndGet();
                    }
                } catch (Exception ignored) {}
            });
        }

        latch.countDown();
        executor.shutdown();
        assertTrue(executor.awaitTermination(3, TimeUnit.SECONDS));

        // Verify final inventory state
        Inventory inventory = inventoryRepository.findByProductId(testProductId).orElseThrow();
        int expectedReserved = (reserveSuccess.get() * 10) - (releaseSuccess.get() * 5);
        assertThat(inventory.getTotalReserved()).isEqualTo(expectedReserved).as("totalReserved");
        assertThat(inventory.getAvailableQuantity()).isEqualTo(200 - expectedReserved).as("availableQuantity");
    }

    @Test
    void whenMultipleInstancesRunCleanup_shouldProcessOnce() throws Exception {
        performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/inventory/create/" + testProductId + "/100",
                null,
                Inventory.class
        );

        UUID orderId = UUID.randomUUID();
        inventoryService.reserveForOrder(Map.of(testProductId, 20), orderId);

        // Force expiration
        reservationRepository.findAll().forEach(r ->
                r.setExpiresAt(LocalDateTime.now().minusMinutes(1)));
        reservationRepository.flush();

        // Simulate multiple instances trying to clean up
        int instanceCount = 3;
        AtomicInteger cleanupCount = new AtomicInteger(0);

        for (int i = 0; i < instanceCount; i++) {
            new Thread(() -> {
                try {
                    inventoryService.releaseExpiredReservations();
                    cleanupCount.incrementAndGet();
                } catch (Exception ignored) {}
            }).start();
        }

        // Wait for completion
        Thread.sleep(2000);

        // Verify cleanup happened only once
        assertThat(cleanupCount.get()).isEqualTo(1);
        assertThat(reservationRepository.count()).isZero();
        assertThat(inventoryRepository.findByProductId(testProductId)
                .orElseThrow().getTotalReserved()).isZero();
    }

}