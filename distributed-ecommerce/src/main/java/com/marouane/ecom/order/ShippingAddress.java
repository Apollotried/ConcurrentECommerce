package com.marouane.ecom.order;

import lombok.Data;

@Data
public class ShippingAddress {
    private String firstName;
    private String lastName;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String phone;
}
