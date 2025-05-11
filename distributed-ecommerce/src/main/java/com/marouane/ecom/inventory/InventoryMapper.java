package com.marouane.ecom.inventory;

import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {


    public InventoryResponseDto toDto(Inventory inventory) {
        return new InventoryResponseDto(
                inventory.getId(),
                inventory.getProduct().getId(),
                inventory.getProduct().getName(),
                inventory.getTotalQuantity(),
                inventory.getTotalReserved(),
                inventory.getAvailableQuantity()
        );
    }
}
