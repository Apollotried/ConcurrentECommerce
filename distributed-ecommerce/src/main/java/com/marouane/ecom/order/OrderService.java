package com.marouane.ecom.order;

import com.marouane.ecom.cart.Cart;
import com.marouane.ecom.cart.CartItem;
import com.marouane.ecom.cart.CartRepository;
import com.marouane.ecom.exception.CartNotFoundException;
import com.marouane.ecom.exception.EmptyCartException;
import com.marouane.ecom.inventory.InventoryService;
import com.marouane.ecom.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {


    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    @Transactional
    public Order createOrderFromCart(Authentication connectedUser){
        User user = (User) connectedUser.getPrincipal();

        Cart cart = cartRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new CartNotFoundException("Cart not found"));

        if (cart.isEmpty()){
            throw new EmptyCartException("Cart is empty");
        }

        Map<Long, Integer> productQuantities = cart.getItems().stream()
                .collect(Collectors.toMap(
                        item -> item.getProduct().getId(),
                        CartItem::getQuantity
                ));

        Order order = Order.builder()
                .user(user)
                .items(new ArrayList<>())
                .status(OrderStatus.PENDING)
                .build();

        order = orderRepository.save(order);

        inventoryService.reserveForOrder(productQuantities, order.getId());

        for (CartItem item : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(item.getProduct())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getProduct().getPrice())
                    .build();
            order.getItems().add(orderItem);
        }

        order = orderRepository.save(order);

        cart.clear();
        cartRepository.save(cart);

        return order;
    }


    @Transactional
    public void cancelOrder(UUID orderId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));


        if (!order.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only pending orders can be cancelled");
        }


        for (OrderItem item : order.getItems()) {
            inventoryService.releaseReservation(item.getProduct().getId(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

}
