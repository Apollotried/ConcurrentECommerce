package com.marouane.ecom.user;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CustomerDTO {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private LocalDateTime registrationDate;
    private LocalDateTime lastLogin;
    private long totalOrders;
    private BigDecimal totalSpent;
    private boolean active;
    private List<String> roles;
}
