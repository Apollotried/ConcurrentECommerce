package com.marouane.ecom.product;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerCountDTO {
    private long total;
    private long newThisMonth;
}
