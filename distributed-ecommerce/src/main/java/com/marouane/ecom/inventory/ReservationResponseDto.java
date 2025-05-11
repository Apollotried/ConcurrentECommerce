package com.marouane.ecom.inventory;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReservationResponseDto {

    private Long productId;
    private int quantity;
    private LocalDateTime reservedAt;

    public ReservationResponseDto(Long productId, int quantity) {
        this.productId = productId;
        this.quantity = quantity;
        this.reservedAt = LocalDateTime.now();
    }
}
