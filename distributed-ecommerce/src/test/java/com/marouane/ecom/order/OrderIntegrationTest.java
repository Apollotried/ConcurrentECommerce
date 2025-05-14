package com.marouane.ecom.order;

import com.marouane.ecom.auth.AuthenticationRequest;
import com.marouane.ecom.auth.AuthenticationResponse;
import com.marouane.ecom.auth.RegistrationRequest;
import com.marouane.ecom.cart.Cart;
import com.marouane.ecom.cart.CartRepository;
import com.marouane.ecom.common.BaseIntegrationTest;
import com.marouane.ecom.inventory.Inventory;
import com.marouane.ecom.inventory.InventoryRepository;
import com.marouane.ecom.product.Product;
import com.marouane.ecom.product.ProductRequest;
import com.marouane.ecom.product.ProductStatus;
import com.marouane.ecom.user.Role;
import com.marouane.ecom.user.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;


class OrderIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    String jwtToken;
    Long testProductId;


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
        jdbcTemplate.execute("DELETE FROM _user_roles");
        jdbcTemplate.execute("DELETE FROM _user");
        jdbcTemplate.execute("DELETE FROM role");

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


        // Create test product via API
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

        // Create inventory via API
        ResponseEntity<Inventory> inventory = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/inventory/create/" + testProductId + "/" + 100,
                null,
                Inventory.class
        );


    }

    @Test
    void verifyToken() {
        System.out.println("JWT Token: " + jwtToken);
        assertThat(jwtToken).isNotBlank();

        System.out.println("testProductId: " + testProductId);
        assertThat(testProductId).isNotNull();

    }

    @Test
    void shouldCreateOrderFromCart() {

        // Add item to cart
        ResponseEntity<Void> addToCartResponse = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/cart/add/" + testProductId + "/2",
                null,
                Void.class);
        assertThat(addToCartResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Create order
        ResponseEntity<Order> createOrderResponse = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/orders/create",
                null,
                Order.class);

        assertThat(createOrderResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        Order order = createOrderResponse.getBody();
        assertThat(order).isNotNull();
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(order.getItems()).hasSize(1);
        assertThat(order.getItems().get(0).getProduct().getId()).isEqualTo(testProductId);
        assertThat(order.getItems().get(0).getQuantity()).isEqualTo(2);


        // Verify inventory was reserved
        Inventory inventory = inventoryRepository.findByProductId(testProductId).orElseThrow();
        assertThat(inventory.getTotalReserved()).isEqualTo(2);


    }

    @Test
    void shouldCancelOrder() {
        // Create order
        ResponseEntity<Void> addToCartResponse = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/cart/add/" + testProductId + "/3",
                null,
                Void.class);

        ResponseEntity<Order> createOrderResponse = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/orders/create",
                null,
                Order.class);
        UUID orderId = createOrderResponse.getBody().getId();

        // Cancel order
        ResponseEntity<Void> cancelResponse = performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/orders/" + orderId + "/cancel",
                null,
                Void.class);

        // Verify response
        assertThat(cancelResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Verify order status
        Order cancelledOrder = orderRepository.findById(orderId).orElseThrow();
        assertThat(cancelledOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED);

        // Verify inventory was released
        Inventory inventory = inventoryRepository.findByProductId(testProductId).orElseThrow();
        assertThat(inventory.getTotalReserved()).isZero();

    }




}