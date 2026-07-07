package com.aiops.spring_app.service;

import com.aiops.spring_app.model.EventType;
import com.aiops.spring_app.model.FaultScenario;
import com.aiops.spring_app.model.Severity;
import com.aiops.spring_app.model.SimulationContext;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.util.concurrent.RejectedExecutionException;
import java.net.SocketTimeoutException;
import java.util.Random;

@Service
public class FaultInjectionService {

    private final LogService logService;
    private final Random random;
    private static final int BURST_SIZE = 20;

    public FaultInjectionService(LogService logService) {
        this.logService = logService;
        this.random = new Random();
    }

    /**
     * Simule une RuntimeException.
     */
    public String simulateRuntimeException() {
        SimulationContext context = createFaultContext(EventType.APPLICATION_ANOMALY, Severity.CRITICAL, "/api/inject-fault/runtime", "POST", 500, "RUNTIME-500", "Unexpected application exception", "runtime-exception");

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
        SimulationContext context = createFaultContext(EventType.DATABASE_FAILURE, Severity.CRITICAL, "/api/inject-fault/sql", "POST", 503, "SQL-503", "Unable to connect to PostgreSQL database.", "database-error");

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
        return simulateRepeatedErrors("POST");
    }

    /**
     * Simule une rafale d'erreurs.
     */
    public String simulateRepeatedErrors(String httpMethod) {
        FaultScenario scenario = randomScenario();
        SimulationContext context = createFaultContext(
                scenario.eventType(),
                scenario.severity(),
                "/api/inject-fault/repeated",
                httpMethod,
                scenario.statusCode(),
                scenario.errorCode(),
                scenario.errorMessage(),
                scenario.anomalyType()
        );

        for (int errorSequence = 1; errorSequence <= BURST_SIZE; errorSequence++) {
            SimulationContext sequenceContext = new SimulationContext(
                    context.userId(),
                    context.sessionId(),
                    context.orderId(),
                    context.productId(),
                    context.transactionId(),
                    context.invoiceId(),
                    context.amount(),
                    context.eventType(),
                    context.severity(),
                    context.endpoint(),
                    context.httpMethod(),
                    context.statusCode(),
                    context.processingTimeMs(),
                    context.responseTimeMs(),
                    context.attempts(),
                    context.stockLevel(),
                    context.concurrentRequests(),
                    context.queueSize(),
                    context.ipAddress(),
                    context.browser(),
                    context.city(),
                    context.serviceName(),
                    context.environment(),
                    context.correlationId(),
                    context.errorCode(),
                    context.errorMessage(),
                    context.anomalyType(),
                    errorSequence
            );

            logService.logError(sequenceContext, scenario.errorMessage(), throwableFor(scenario));
        }

        logService.logWarn(context, "Repeated failures detected for selected fault scenario", "errorCount", BURST_SIZE);
        return BURST_SIZE + " erreurs consécutives générées pour le scénario " + scenario.name() + ".";
    }

    private SimulationContext createFaultContext(EventType eventType, Severity severity, String endpoint, String httpMethod, int statusCode, String errorCode, String errorMessage, String anomalyType) {
        return new SimulationContext(
                randomUserId(),
                randomSessionId(),
                randomOrderId(),
                randomProductId(),
                randomTransactionId(),
                randomInvoiceId(),
                randomMoney(20, 500),
                eventType,
                severity,
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
                anomalyType,
                null
        );
    }

    private FaultScenario randomScenario() {
        FaultScenario[] scenarios = FaultScenario.values();
        return scenarios[random.nextInt(scenarios.length)];
    }

    private Throwable throwableFor(FaultScenario scenario) {
        return switch (scenario) {
            case PAYMENT_FAILED -> new IllegalStateException(scenario.errorMessage());
            case DATABASE_FAILURE -> new SQLException(scenario.errorMessage());
            case NETWORK_TIMEOUT -> new SocketTimeoutException(scenario.errorMessage());
            case APPLICATION_ANOMALY -> new RuntimeException(scenario.errorMessage());
            case SERVICE_UNAVAILABLE -> new IllegalStateException(scenario.errorMessage());
            case MEMORY_PRESSURE -> new OutOfMemoryError(scenario.errorMessage());
            case CPU_OVERLOAD -> new IllegalStateException(scenario.errorMessage());
            case QUEUE_OVERFLOW -> new RejectedExecutionException(scenario.errorMessage());
        };
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
