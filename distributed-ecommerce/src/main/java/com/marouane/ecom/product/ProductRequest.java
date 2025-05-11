package com.marouane.ecom.product;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductRequest {

    @NotEmpty(message="producat name should not be empty")
    private String productName;
    private String description;
    private String category;
    private BigDecimal price;
    private ProductStatus status;
}
