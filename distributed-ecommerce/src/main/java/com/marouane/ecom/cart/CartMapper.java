package com.marouane.ecom.cart;

import org.springframework.stereotype.Component;

@Component
public class CartMapper {

    public CartItemDto mapToCartItemDto(CartItem item) {
        return CartItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }
}
