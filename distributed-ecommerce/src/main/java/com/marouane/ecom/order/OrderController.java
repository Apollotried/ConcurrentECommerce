package com.marouane.ecom.order;


import com.marouane.ecom.exception.OrderNotFoundException;
import com.marouane.ecom.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;



    @PostMapping("/create")
    public ResponseEntity<Order> createOrderFromCart(Authentication authentication) {
        Order order = orderService.createOrderFromCart(authentication);
        return ResponseEntity.ok(order);
    }


    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable UUID orderId,
            Authentication authentication) {
        orderService.cancelOrder(orderId, authentication);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/checkout")
    public ResponseEntity<Order> completeOrder(
            @RequestBody CheckoutRequest request,
            Authentication authentication
    ) {
        Order order = orderService.completeOrder(authentication, request.getCardNumber());
        return ResponseEntity.ok(order);
    }


    @GetMapping
    public ResponseEntity<List<OrderDto>> getUserOrders(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<OrderDto> orders = orderService.findOrdersByUser(user);
        return ResponseEntity.ok(orders);
    }


    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrderDetails(
            @PathVariable UUID orderId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        OrderDto order = orderService.findOrdersByUser(user).stream()
                .filter(o -> o.getId().equals(orderId))
                .findFirst()
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        return ResponseEntity.ok(order);
    }

    

}
