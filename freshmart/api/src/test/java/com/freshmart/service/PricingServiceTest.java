package com.freshmart.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class PricingServiceTest {

    private final PricingService pricingService = new PricingService();

    @Test
    void calculateSalePriceUsesModifierAsSaleSignal() {
        BigDecimal salePrice = pricingService.calculateSalePrice(
            new BigDecimal("10.00"),
            new BigDecimal("15.00")
        );

        assertEquals(new BigDecimal("8.50"), salePrice);
    }

    @Test
    void calculateSalePriceReturnsNullWhenModifierIsMissingOrInvalid() {
        assertNull(pricingService.calculateSalePrice(new BigDecimal("10.00"), null));
        assertNull(pricingService.calculateSalePrice(new BigDecimal("10.00"), BigDecimal.ZERO));
        assertNull(pricingService.calculateSalePrice(new BigDecimal("10.00"), new BigDecimal("100.00")));
    }
}
