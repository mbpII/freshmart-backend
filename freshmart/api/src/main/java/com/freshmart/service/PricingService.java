package com.freshmart.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PricingService {

    public BigDecimal normalizeSalesPriceModifier(BigDecimal salesPriceModifier) {
        if (salesPriceModifier == null) {
            throw new IllegalArgumentException("Sales price modifier is required");
        }

        if (salesPriceModifier.compareTo(BigDecimal.ZERO) <= 0 || salesPriceModifier.compareTo(new BigDecimal("100")) >= 0) {
            throw new IllegalArgumentException("Sales price modifier must be greater than 0 and less than 100");
        }

        return salesPriceModifier.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateSalePrice(BigDecimal retailPrice, BigDecimal salesPriceModifier, Boolean isOnSale) {
        if (!Boolean.TRUE.equals(isOnSale) || salesPriceModifier == null) {
            return null;
        }

        if (retailPrice == null || retailPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal multiplier = BigDecimal.ONE.subtract(
            salesPriceModifier.divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP)
        );

        BigDecimal computed = retailPrice.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
        if (computed.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return computed;
    }
}
