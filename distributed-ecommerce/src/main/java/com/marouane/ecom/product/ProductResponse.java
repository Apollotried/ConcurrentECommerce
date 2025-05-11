package com.marouane.ecom.product;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String category;

    private BigDecimal price;
    private LocalDateTime priceSince;

    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
