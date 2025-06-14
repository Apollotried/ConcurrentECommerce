package com.marouane.ecom.payment;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    public PaymentResult process(BigDecimal amount, String cardNumber){
        boolean isSuccess = isCardValid(cardNumber);

        return new PaymentResult(
                isSuccess,
                isSuccess ? "mock_pay_" + UUID.randomUUID() : null,
                isSuccess ? "Payment processed" : "Card declined"
        );
    }

    public boolean isCardValid(String cardNumber){
        if (cardNumber == null || cardNumber.isEmpty()) {
            return false;
        }

        char lastChar = cardNumber.charAt(cardNumber.length()-1);
        return Character.isDigit(lastChar) && (lastChar % 2 == 0);
    }
}
