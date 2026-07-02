package com.aiops.spring_app.service;

import com.aiops.spring_app.model.SimulationContext;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.util.Random;

@Service
public class FaultInjectionService {

    private final LogService logService;
    private final Random random;

    public FaultInjectionService(LogService logService) {
        this.logService = logService;
        this.random = new Random();
    }

    /**
     * Simule une RuntimeException.
     */
    public String simulateRuntimeException() {
        SimulationContext context = createFaultContext("runtime-exception", "/api/inject-fault/runtime", "POST", 500, "RUNTIME-500", "Unexpected application exception");

        try {
            throw new RuntimeException("Unexpected application exception");
        } catch (RuntimeException exception) {
            logService.logError(context, "Application runtime failure detected.", exception);
        }

        return "RuntimeException simulée.";
    }

    /**
     * Simule une SQLException.
     */
    public String simulateSQLException() {
        SimulationContext context = createFaultContext("sql-exception", "/api/inject-fault/sql", "POST", 503, "SQL-503", "Unable to connect to PostgreSQL database.");

        try {
            throw new SQLException("Unable to connect to PostgreSQL database.");
        } catch (SQLException exception) {
            logService.logError(context, "Database connection failure.", exception);
        }

        return "SQLException simulée.";
    }

    /**
     * Simule une rafale d'erreurs.
     */
    public String simulateRepeatedErrors() {
        SimulationContext context = createFaultContext("repeated-errors", "/api/inject-fault/repeated", "GET", 503, "PAY-503", "Payment service unavailable.");

        for (int i = 1; i <= 20; i++) {
            logService.logError(context, "Repeated error", "attempt", i);
        }

        logService.logWarn(context, "Repeated failures detected on payment flow", "errorCount", 20);
        return "20 erreurs consécutives générées.";
    }

    private SimulationContext createFaultContext(String anomalyType, String endpoint, String httpMethod, int statusCode, String errorCode, String errorMessage) {
        return new SimulationContext(
                randomUserId(),
                randomSessionId(),
                randomOrderId(),
                randomProductId(),
                randomTransactionId(),
                randomInvoiceId(),
                randomMoney(20, 500),
                endpoint,
                httpMethod,
                statusCode,
                randomBetween(50, 1200),
                randomBetween(80, 3500),
                randomBetween(1, 4),
                randomBetween(0, 15),
                randomBetween(10, 400),
                randomBetween(0, 120),
                randomIpAddress(),
                randomFrom(new String[]{"Chrome", "Firefox", "Edge", "Safari"}),
                randomFrom(new String[]{"Paris", "Lyon", "Marseille", "Toulouse", "Lille"}),
                "fault-injection-service",
                randomFrom(new String[]{"dev", "test", "staging", "prod"}),
                randomCorrelationId(),
                errorCode,
                errorMessage,
                anomalyType
        );
    }

    private int randomBetween(int minInclusive, int maxInclusive) {
        return minInclusive + random.nextInt(maxInclusive - minInclusive + 1);
    }

    private BigDecimal randomMoney(int minInclusive, int maxInclusive) {
        return BigDecimal.valueOf(minInclusive + random.nextDouble() * (maxInclusive - minInclusive))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String randomUserId() {
        return "USR-" + randomBetween(10000, 99999);
    }

    private String randomSessionId() {
        return "SID-" + randomBetween(100000, 999999);
    }

    private String randomOrderId() {
        return "ORD-" + randomBetween(100000, 999999);
    }

    private String randomProductId() {
        return "PRD-" + randomBetween(1000, 9999);
    }

    private String randomTransactionId() {
        return "TXN-" + randomBetween(1000000, 9999999);
    }

    private String randomInvoiceId() {
        return "INV-" + randomBetween(100000, 999999);
    }

    private String randomCorrelationId() {
        return "CORR-" + randomBetween(1000000, 9999999);
    }

    private String randomIpAddress() {
        return randomBetween(10, 250) + "." + randomBetween(0, 255) + "." + randomBetween(0, 255) + "." + randomBetween(1, 254);
    }

    private String randomFrom(String[] values) {
        return values[random.nextInt(values.length)];
    }
}
