package com.marouane.ecom.order;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


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

}
