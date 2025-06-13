package com.marouane.ecom.order;

import com.marouane.ecom.cart.Cart;
import com.marouane.ecom.cart.CartItem;
import com.marouane.ecom.cart.CartRepository;
import com.marouane.ecom.exception.CartNotFoundException;
import com.marouane.ecom.exception.EmptyCartException;
import com.marouane.ecom.exception.PaymentFailedException;
import com.marouane.ecom.inventory.InventoryService;
import com.marouane.ecom.payment.PaymentResult;
import com.marouane.ecom.payment.PaymentService;
import com.marouane.ecom.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {


    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;

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

        validateOrderCancellation(user, order);
        inventoryService.releaseAllReservationsForOrder(order.getId());

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private void validateOrderCancellation(User user, Order order) {
        if(!order.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized to cancel this order");
        }

        if(order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only pending orders can be cancelled");
        }
    }

    @Transactional
    public Order completeOrder(Authentication connectedUser, String paymentToken) {
        Order order = createOrderFromCart(connectedUser);

        PaymentResult result = paymentService.process(
                order.getTotalAmount(),
                paymentToken
        );

        if(!result.success()){
            inventoryService.releaseAllReservationsForOrder(order.getId());
            throw new PaymentFailedException(result.message());
        }

        order.setStatus(OrderStatus.PAID);
        return orderRepository.save(order);

    }

    public long countByUser(User user) {
        return orderRepository.countByUser(user);
    }



    public List<OrderDto> findOrdersByUser(User user) {
        List<Order> orders = orderRepository.findByUser(user);
        return orders.stream()
                .map(OrderDto::fromEntity)
                .toList();
    }


    public BigDecimal getTotalSpentByUser(User user) {
        return orderRepository.findByUser(user).stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }




}
