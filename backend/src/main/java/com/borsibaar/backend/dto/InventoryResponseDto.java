package com.borsibaar.backend.dto;

import java.math.BigDecimal;

public record InventoryResponseDto(
        Long id,
        Long organizationId,
        Long productId,
        String productName,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal basePrice,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String updatedAt
) {}
