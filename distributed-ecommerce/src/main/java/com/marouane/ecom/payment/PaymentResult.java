package com.marouane.ecom.payment;


public record PaymentResult(
        boolean success,
        String transactionId,
        String message)
{}
