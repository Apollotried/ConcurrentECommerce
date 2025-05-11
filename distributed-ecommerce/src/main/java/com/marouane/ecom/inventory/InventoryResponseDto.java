package com.marouane.ecom.inventory;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InventoryResponseDto {
    UUID id;
    Long productId;
    String productName;
    int totalQuantity;
    int totalReserved;
    int availableQuantity;
}
