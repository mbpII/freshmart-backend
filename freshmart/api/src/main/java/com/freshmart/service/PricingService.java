package com.freshmart.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PricingService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final int PERCENTAGE_SCALE = 6;
    private static final int CURRENCY_SCALE = 2;

    /**
     * Computes the stored percent-off modifier using the provided strategy.
     */
    public BigDecimal computeModifier(SalePricingStrategy strategy, BigDecimal retailPrice, BigDecimal inputValue) {
        return strategy.computeModifier(retailPrice, inputValue);
    }

    public BigDecimal calculateSalePrice(BigDecimal retailPrice, BigDecimal salesPriceModifier) {
        if (!hasActiveModifier(salesPriceModifier)) {
            return null;
        }

        if (retailPrice == null || retailPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal multiplier = BigDecimal.ONE.subtract(
            salesPriceModifier.divide(HUNDRED, PERCENTAGE_SCALE, RoundingMode.HALF_UP)
        );

        BigDecimal computed = retailPrice.multiply(multiplier).setScale(CURRENCY_SCALE, RoundingMode.HALF_UP);
        if (computed.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO.setScale(CURRENCY_SCALE, RoundingMode.HALF_UP);
        }

        return computed;
    }

    private boolean hasActiveModifier(BigDecimal salesPriceModifier) {
        return salesPriceModifier != null
            && salesPriceModifier.compareTo(BigDecimal.ZERO) > 0
            && salesPriceModifier.compareTo(HUNDRED) < 0;
    }
}
