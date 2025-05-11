package com.marouane.ecom.cart;

import com.marouane.ecom.exception.CartItemNotFoundException;
import com.marouane.ecom.exception.EmptyCartException;
import com.marouane.ecom.exception.InsufficientStockException;
import com.marouane.ecom.inventory.InventoryService;
import com.marouane.ecom.product.Product;
import com.marouane.ecom.product.ProductRepository;

import com.marouane.ecom.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;


    public Cart CreateOrGetCart(Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());

        return cartRepository.findByUser_Id(user.getId())
                .orElseGet(() -> createNewCart(user));
    }

    private Cart createNewCart(User user) {
        Cart cart = Cart.builder().user(user).build();
        return cartRepository.save(cart);
    }


    @Transactional
    public Cart addItem(Authentication connectedUser, Long productId, int quantity) {
        Cart cart = CreateOrGetCart(connectedUser);
        Product product = productRepository.getProductById(productId);
        validateStock(product.getId(), quantity);

        cart.addItem(CartItem.builder()
                .product(product)
                .quantity(quantity)
                .unitPrice(product.getPrice())
                .build());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateQuantity(Authentication connectedUser, UUID itemId, int newQuantity) {
        Cart cart = CreateOrGetCart(connectedUser);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));

        validateStock(item.getProduct().getId(), newQuantity - item.getQuantity());
        item.setQuantity(newQuantity);

        return cartRepository.save(cart);
    }


    @Transactional
    public void removeItem(Authentication connectedUser, UUID itemId) {
        Cart cart = CreateOrGetCart(connectedUser);
        cart.removeItem(itemId);
        cartRepository.save(cart);
    }


    @Transactional
    public Cart validateCartForCheckout(Authentication connectedUser) {
        Cart cart = CreateOrGetCart(connectedUser);

        if (cart.isEmpty()) {
            throw new EmptyCartException("Cart is empty");
        }

        cart.getItems().forEach(item -> {
            validateStock(item.getProduct().getId(), item.getQuantity());
        });

        return cart;
    }


    //Helper
    private void validateStock(Long productId, int quantity) {
        if (!inventoryService.isAvailable(productId, quantity)) {
            throw new InsufficientStockException(
                    "Product " + productId + " doesn't have enough stock"
            );
        }

    }
}
