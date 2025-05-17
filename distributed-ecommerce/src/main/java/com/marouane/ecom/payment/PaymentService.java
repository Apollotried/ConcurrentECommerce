package com.marouane.ecom.payment;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    public PaymentResult process(BigDecimal amount, String cardToken){
        boolean isSuccess = isCardValid(cardToken);

        return new PaymentResult(
                isSuccess,
                isSuccess ? "mock_pay_" + UUID.randomUUID() : null,
                isSuccess ? "Payment processed" : "Card declined"
        );
    }

    public boolean isCardValid(String cardToken){
        char lastChar = cardToken.charAt(cardToken.length()-1);
        return Character.isDigit(lastChar) && (lastChar % 2 == 0);
    }
}
