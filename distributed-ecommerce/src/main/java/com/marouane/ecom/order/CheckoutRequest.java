package com.marouane.ecom.order;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank
    private String cardNumber;

    private ShippingAddress shippingAddress;
}
