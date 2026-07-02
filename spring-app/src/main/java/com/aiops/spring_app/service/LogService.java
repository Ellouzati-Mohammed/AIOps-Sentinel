package com.aiops.spring_app.service;

import com.aiops.spring_app.model.SimulationContext;
import net.logstash.logback.marker.Markers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.stereotype.Service;

@Service
public class LogService {

    private static final Logger logger = LoggerFactory.getLogger(LogService.class);

    public void logInfo(SimulationContext context, String message) {
        logger.info(buildMarker(context), message);
    }

    public void logInfo(SimulationContext context, String message, String key, Object value) {
        logger.info(Markers.append(key, value).and(buildMarker(context)), message);
    }

    public void logWarn(SimulationContext context, String message) {
        logger.warn(buildMarker(context), message);
    }

    public void logWarn(SimulationContext context, String message, String key, Object value) {
        logger.warn(Markers.append(key, value).and(buildMarker(context)), message);
    }

    public void logDebug(SimulationContext context, String message) {
        logger.debug(buildMarker(context), message);
    }

    public void logDebug(SimulationContext context, String message, String key, Object value) {
        logger.debug(Markers.append(key, value).and(buildMarker(context)), message);
    }

    public void logError(SimulationContext context, String message) {
        logger.error(buildMarker(context), message);
    }

    public void logError(SimulationContext context, String message, String key, Object value) {
        logger.error(Markers.append(key, value).and(buildMarker(context)), message);
    }

    public void logError(SimulationContext context, String message, Throwable throwable) {
        logger.error(buildMarker(context), message, throwable);
    }

    private Marker buildMarker(SimulationContext context) {
        return Markers.append("userId", context.userId())
                .and(Markers.append("sessionId", context.sessionId()))
                .and(Markers.append("orderId", context.orderId()))
                .and(Markers.append("productId", context.productId()))
                .and(Markers.append("transactionId", context.transactionId()))
                .and(Markers.append("invoiceId", context.invoiceId()))
                .and(Markers.append("amount", context.amount()))
                .and(Markers.append("endpoint", context.endpoint()))
                .and(Markers.append("httpMethod", context.httpMethod()))
                .and(Markers.append("statusCode", context.statusCode()))
                .and(Markers.append("processingTimeMs", context.processingTimeMs()))
                .and(Markers.append("responseTimeMs", context.responseTimeMs()))
                .and(Markers.append("attempts", context.attempts()))
                .and(Markers.append("stockLevel", context.stockLevel()))
                .and(Markers.append("concurrentRequests", context.concurrentRequests()))
                .and(Markers.append("queueSize", context.queueSize()))
                .and(Markers.append("ipAddress", context.ipAddress()))
                .and(Markers.append("browser", context.browser()))
                .and(Markers.append("city", context.city()))
                .and(Markers.append("serviceName", context.serviceName()))
                .and(Markers.append("environment", context.environment()))
                .and(Markers.append("correlationId", context.correlationId()))
                .and(Markers.append("errorCode", context.errorCode()))
                .and(Markers.append("errorMessage", context.errorMessage()))
                .and(Markers.append("anomalyType", context.anomalyType()));
    }
}
