package com.marouane.ecom.cart;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;


    @GetMapping
    public ResponseEntity<Cart> createOrGetCart(Authentication authentication) {
        Cart cart = cartService.CreateOrGetCart(authentication);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add/{productId}/{quantity}")
    public ResponseEntity<Cart> addItem(
            Authentication authentication,
            @PathVariable Long productId,
            @PathVariable int quantity) {
        Cart updatedCart = cartService.addItem(authentication, productId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<Cart> updateItemQuantity(
            Authentication authentication,
            @PathVariable UUID itemId,
            @RequestParam int quantity) {
        Cart updatedCart = cartService.updateQuantity(authentication, itemId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Void> removeItem(
            Authentication authentication,
            @PathVariable UUID itemId) {
        cartService.removeItem(authentication, itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<Cart> validateCart(Authentication authentication) {
        Cart validatedCart = cartService.validateCartForCheckout(authentication);
        return ResponseEntity.ok(validatedCart);
    }
}
