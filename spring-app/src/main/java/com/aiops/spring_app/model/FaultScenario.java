package com.aiops.spring_app.model;

public enum FaultScenario {
    PAYMENT_FAILED(EventType.PAYMENT_FAILED, "PAY-503", "Payment service unavailable.", 503, Severity.HIGH, "payment-timeout"),
    DATABASE_FAILURE(EventType.DATABASE_FAILURE, "DB-500", "Database connection failed.", 500, Severity.CRITICAL, "database-outage"),
    NETWORK_TIMEOUT(EventType.NETWORK_TIMEOUT, "NET-504", "Network timeout detected.", 504, Severity.HIGH, "network-timeout"),
    APPLICATION_ANOMALY(EventType.APPLICATION_ANOMALY, "RUNTIME-500", "Application exception detected.", 500, Severity.CRITICAL, "application-anomaly"),
    SERVICE_UNAVAILABLE(EventType.SERVICE_UNAVAILABLE, "SRV-503", "Service unavailable.", 503, Severity.HIGH, "service-unavailable"),
    MEMORY_PRESSURE(EventType.MEMORY_PRESSURE, "MEM-001", "Memory pressure detected.", 503, Severity.HIGH, "memory-pressure"),
    CPU_OVERLOAD(EventType.CPU_OVERLOAD, "CPU-001", "CPU overload detected.", 503, Severity.HIGH, "cpu-overload"),
    QUEUE_OVERFLOW(EventType.QUEUE_OVERFLOW, "QUEUE-429", "Queue overflow detected.", 429, Severity.MEDIUM, "queue-overflow");

    private final EventType eventType;
    private final String errorCode;
    private final String errorMessage;
    private final int statusCode;
    private final Severity severity;
    private final String anomalyType;

    FaultScenario(EventType eventType, String errorCode, String errorMessage, int statusCode, Severity severity, String anomalyType) {
        this.eventType = eventType;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.statusCode = statusCode;
        this.severity = severity;
        this.anomalyType = anomalyType;
    }

    public EventType eventType() {
        return eventType;
    }

    public String errorCode() {
        return errorCode;
    }

    public String errorMessage() {
        return errorMessage;
    }

    public int statusCode() {
        return statusCode;
    }

    public Severity severity() {
        return severity;
    }

    public String anomalyType() {
        return anomalyType;
    }
}