package com.marouane.ecom.user;

import com.marouane.ecom.order.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CustomerMapper {

    private final OrderService orderService;
    private final PasswordEncoder passwordEncoder;

    public CustomerDTO mapToCustomerDTO(User user) {
        return CustomerDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .registrationDate(user.getCreatedAt())
                .totalOrders(orderService.countByUser(user))
                .totalSpent(orderService.getTotalSpentByUser(user))
                .active(user.isEnabled())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toList()))
                .build();
    }

    public User mapToUser(CustomerDTO customerDTO) {
        return User.builder()
                .id(customerDTO.getId())
                .firstName(customerDTO.getFirstName())
                .lastName(customerDTO.getLastName())
                .email(customerDTO.getEmail())
                .password(passwordEncoder.encode(customerDTO.getPassword())) // Encode password
                .build();
    }


    public User mapToUser(CustomerRequest customerDTO) {
        return User.builder()
                .firstName(customerDTO.getFirstName())
                .lastName(customerDTO.getLastName())
                .email(customerDTO.getEmail())
                .phone(customerDTO.getPhone())
                .build();
    }




}
