package com.aiops.spring_app.model;

import java.math.BigDecimal;

public record SimulationContext(
        String userId,
        String sessionId,
        String orderId,
        String productId,
        String transactionId,
        String invoiceId,
        BigDecimal amount,
        String endpoint,
        String httpMethod,
        int statusCode,
        long processingTimeMs,
        long responseTimeMs,
        int attempts,
        int stockLevel,
        int concurrentRequests,
        int queueSize,
        String ipAddress,
        String browser,
        String city,
        String serviceName,
        String environment,
        String correlationId,
        String errorCode,
        String errorMessage,
        String anomalyType) {
}