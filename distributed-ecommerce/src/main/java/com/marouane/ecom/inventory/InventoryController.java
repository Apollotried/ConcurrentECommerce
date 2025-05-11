package com.marouane.ecom.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/create")
    public ResponseEntity<Inventory> createInventory(
            @RequestParam Long productId,
            @RequestParam int quantity) {
        Inventory inventory = inventoryService.createInventory(productId, quantity);
        return ResponseEntity.ok(inventory);
    }


    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponseDto> getInventory(@PathVariable Long productId) {
        InventoryResponseDto inventory = inventoryService.getInventory(productId);
        return ResponseEntity.ok(inventory);
    }


    @GetMapping("/{productId}/available")
    public ResponseEntity<Boolean> isAvailable(
            @PathVariable Long productId,
            @RequestParam int quantity) {
        boolean available = inventoryService.isAvailable(productId, quantity);
        return ResponseEntity.ok(available);
    }


    @PostMapping("/{productId}/reserve")
    public ResponseEntity<Void> reserveStock(
            @PathVariable Long productId,
            @RequestParam int quantity) {
        inventoryService.reserveStock(productId, quantity);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/{productId}/release")
    public ResponseEntity<Void> releaseStock(
            @PathVariable Long productId,
            @RequestParam int quantity) {
        inventoryService.releaseReservation(productId, quantity);
        return ResponseEntity.ok().build();
    }
}
