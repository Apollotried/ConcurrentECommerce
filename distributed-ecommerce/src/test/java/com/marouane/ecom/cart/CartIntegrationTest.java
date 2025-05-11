package com.marouane.ecom.cart;

import com.marouane.ecom.auth.AuthenticationRequest;
import com.marouane.ecom.auth.AuthenticationResponse;
import com.marouane.ecom.auth.RegistrationRequest;
import com.marouane.ecom.common.BaseIntegrationTest;
import com.marouane.ecom.inventory.Inventory;
import com.marouane.ecom.inventory.InventoryRepository;
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

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;




class CartIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    String jwtToken;
    private Long testProductId;
    private UUID cartItemId;


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
        cartRepository.deleteAll();
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
        performAuthenticatedRequest(
                HttpMethod.POST,
                "/api/inventory/create?productId=" + testProductId + "&quantity=100",
                null,
                Inventory.class
        );
    }

    @Test
    void verifyToken() {
        System.out.println("JWT Token: " + jwtToken);
        assertThat(jwtToken).isNotBlank();
    }

    @Test
    void cartLifecycle(){


        // get an empty one
        ResponseEntity<Cart> initialCart = performAuthenticatedRequest(
                HttpMethod.GET,
                "/api/cart",
                null,
                Cart.class
        );
        assertThat(initialCart.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(initialCart.getBody()).isNotNull();
        assertThat(initialCart.getBody().getItems()).isEmpty();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);


//        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
//
//        // Make the call
//        ResponseEntity<Cart> afterAdd = performAuthenticatedRequest(
//                HttpMethod.POST,
//                "/api/cart/add/" + testProductId + "/2",
//                null,
//                Cart.class
//        );
//
//        // Assertions
//        assertThat(afterAdd.getStatusCode()).isEqualTo(HttpStatus.OK);
//        assertThat(afterAdd.getBody()).isNotNull();
//        assertThat(afterAdd.getBody().getItems())
//                .hasSize(1)
//                .first()
//                .extracting(CartItem::getQuantity, CartItem::getUnitPrice)
//                .containsExactly(2, BigDecimal.valueOf(49.99));
//
//        cartItemId = afterAdd.getBody().getItems().get(0).getId();

//        // update quantity
//        ResponseEntity<Cart> afterUpdate = performAuthenticatedRequest(
//                HttpMethod.PUT,
//                "/api/cart/update/" + cartItemId + "?quantity=5",
//                null,
//                Cart.class
//        );
//
//        assertThat(afterUpdate.getStatusCode()).isEqualTo(HttpStatus.OK);
//        assertThat(afterUpdate.getBody()).isNotNull();
//        assertThat(afterUpdate.getBody().getItems())
//                .hasSize(1)
//                .first()
//                .extracting(CartItem::getQuantity, CartItem::getUnitPrice)
//                .containsExactly(5, BigDecimal.valueOf(49.99));
//
//        // remove the item
//        ResponseEntity<Void> removeResponse = performAuthenticatedRequest(
//                HttpMethod.DELETE,
//                "/api/cart/remove/" + cartItemId,
//                null,
//                Void.class
//        );

//        assertThat(removeResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

    }




}