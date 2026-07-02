package com.aiops.spring_app.service;

import com.aiops.spring_app.model.SimulationContext;
import net.logstash.logback.marker.Markers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;

@Service
public class SimulationService {

    private static final Logger logger = LoggerFactory.getLogger(SimulationService.class);
    private static final String[] BROWSERS = {"Chrome", "Firefox", "Edge", "Safari"};
    private static final String[] CITIES = {"Paris", "Lyon", "Marseille", "Toulouse", "Lille"};
    private static final String[] SERVICES = {"auth-service", "catalog-service", "order-service", "payment-service", "inventory-service", "notification-service"};
    private static final String[] ENVIRONMENTS = {"dev", "test", "staging", "prod"};
    private static final String[] ENDPOINTS = {"/simulation/login", "/simulation/logout", "/simulation/order", "/simulation/payment", "/simulation/search", "/simulation/inventory", "/simulation/database", "/simulation/performance", "/simulation/anomaly"};
    private static final String[] HTTP_METHODS = {"GET", "POST", "PUT", "DELETE"};
    private static final String[] PAYMENT_FAILURES = {"PAY-402", "PAY-408", "PAY-500", "PAY-503"};
    private static final String[] DATABASE_FAILURES = {"DB-500", "DB-502", "DB-504"};
    private final Random random = new Random();

    /**
     * Simule une connexion utilisateur dans un contexte e-commerce.
     */
    public String simulateLogin() {
        SimulationContext context = generateContext("login", "/simulation/login", "GET", 200, "authentication", null, null, randomBetween(0, 40));
        logInfo(marker("login", context), "Session ouverte pour utilisateur");

        if (context.attempts() > 1) {
            logWarn(marker("login", context), "Plusieurs tentatives de connexion detectees avant succes");
        }

        logInfo(marker("login", context), "Utilisateur connecte avec succes");
        logInfo(marker("login", context), "Cache utilise pour charger le profil utilisateur");
        logInfo(marker("login", context), "API appelee: GET /api/users/me");
        return "Simulation login terminee.";
    }

    /**
     * Simule une deconnexion utilisateur.
     */
    public String simulateLogout() {
        SimulationContext context = generateContext("logout", "/simulation/logout", "GET", 200, null, null, null, randomBetween(0, 40));
        logInfo(marker("logout", context), "Utilisateur deconnecte");
        logInfo(marker("logout", context), "Session fermee proprement");
        logInfo(marker("logout", context), "Token de session invalide cote serveur");
        return "Simulation logout terminee.";
    }

    /**
     * Simule la creation d'une commande e-commerce.
     */
    public String simulateOrder() {
        SimulationContext context = generateContext("order", "/simulation/order", "POST", 201, "order-creation", null, null, randomBetween(0, 40));
        logInfo(marker("order", context), "Recherche produit effectuee avant commande");
        logInfo(marker("order", context), "Commande creee avec succes");
        logInfo(marker("order", context), "Stock reserve pour le produit");
        logInfo(marker("order", context), "Facture generee pour la commande");
        logInfo(marker("order", context), "Email de confirmation envoye au client");
        return "Simulation commande terminee.";
    }

    /**
     * Simule un paiement dans un parcours applicatif.
     */
    public String simulatePayment() {
        boolean accepted = random.nextBoolean();
        SimulationContext context = generateContext(
            "payment",
            "/simulation/payment",
            "POST",
            accepted ? 200 : 402,
            accepted ? null : "payment-rejection",
            accepted ? null : randomFrom(PAYMENT_FAILURES),
            accepted ? null : "Payment refused by gateway",
            randomBetween(0, 40)
        );

        if (accepted) {
            logInfo(marker("payment", context), "Paiement accepte");
            logInfo(marker("payment", context), "Transaction validee par le fournisseur de paiement");
            logInfo(marker("payment", context), "Identifiant de transaction confirme");
        } else {
            logError(marker("payment", context), "Paiement refuse", context.errorCode());
            logWarn(marker("payment", context), "Tentative de paiement a rerouter ou a rejouer plus tard");
        }

        return accepted ? "Simulation paiement acceptee." : "Simulation paiement refusee.";
    }

    /**
     * Simule une recherche produit avec cache et latence.
     */
    public String simulateSearch() {
        SimulationContext context = generateContext("search", "/simulation/search", "GET", 200, "catalog-search", null, null, randomBetween(0, 40));
        logInfo(marker("search", context), "Produit recherche avec succes");
        logInfo(marker("search", context), "Cache utilise pour la recherche produit");
        if (context.responseTimeMs() > 700) {
            logWarn(marker("search", context), "Temps de reponse superieur au seuil sur la recherche produit");
        }
        logInfo(marker("search", context), "API appelee: GET /api/products/search");
        return "Simulation recherche terminee.";
    }

    /**
     * Simule la mise a jour du stock d'un produit.
     */
    public String simulateInventory() {
        int stockLevel = randomBetween(0, 40);
        SimulationContext context = generateContext(
            "inventory",
            "/simulation/inventory",
            "PUT",
            stockLevel == 0 ? 503 : 200,
            stockLevel <= 10 ? "low-stock" : null,
            null,
            stockLevel == 0 ? "Inventory reservation failed" : null,
            stockLevel
        );
        logInfo(marker("inventory", context), "Stock mis a jour pour le produit");
        logInfo(marker("inventory", context), "Quantite reseignee apres validation de commande");
        if (context.stockLevel() <= 10) {
            logWarn(marker("inventory", context), "Stock faible detecte");
        }
        if (context.stockLevel() == 0) {
            logError(marker("inventory", context), "Service Inventory inaccessible pour reservation de stock","");
        }
        return "Simulation inventaire terminee.";
    }

    /**
     * Simule une interaction avec la base de donnees.
     */
    public String simulateDatabase() {
        boolean databaseAvailable = random.nextBoolean();
        SimulationContext context = generateContext(
            "database",
            "/simulation/database",
            "POST",
            databaseAvailable ? 200 : 500,
            databaseAvailable ? null : "database-outage",
            databaseAvailable ? null : randomFrom(DATABASE_FAILURES),
            databaseAvailable ? null : "Database unavailable",
            randomBetween(0, 40)
        );

        if (databaseAvailable) {
            logInfo(marker("database", context), "Connexion a la base de donnees etablie");
            logInfo(marker("database", context), "Requete SQL executee avec succes");
            logInfo(marker("database", context), "Ecriture en base reussie pour la commande");
        } else {
            logError(marker("database", context), "Base de donnees indisponible", randomFrom(DATABASE_FAILURES));
            logError(marker("database", context), "Echec d'ecriture dans la base", context.errorCode());
        }

        return databaseAvailable ? "Simulation base de donnees terminee." : "Simulation base de donnees en erreur.";
    }

    /**
     * Simule des indicateurs de performance applicative.
     */
    public String simulatePerformance() {
        SimulationContext context = generateContext("performance", "/simulation/performance", "GET", 200, "performance-check", null, null, randomBetween(0, 40));
        logInfo(marker("performance", context), "Requete traitee avec succes");
        logInfo(marker("performance", context), "Nombre de requetes simultanees observe", "concurrentRequests", context.concurrentRequests());
        if (context.responseTimeMs() > 800) {
            logWarn(marker("performance", context), "Requete lente detectee", "responseTimeMs", context.responseTimeMs());
        }
        
        if (context.queueSize() > 200) {
            logWarn(marker("performance", context), "File d'attente importante detectee", "queueSize", context.queueSize());
        }
        
        logWarn(marker("performance", context), "Forte consommation memoire applicative", "memoryUsageMb", randomBetween(512, 1536));
        logWarn(marker("performance", context), "Service externe lent", "responseTimeMs", randomBetween(900, 2500));
        return "Simulation performance terminee.";
    }

    /**
     * Simule une anomalie fonctionnelle ou technique.
     */
    public String simulateAnomaly() {
        SimulationContext context = generateContext(
            "anomaly",
            "/simulation/anomaly",
            "GET",
            500,
            randomFrom(new String[]{"spike", "slowdown", "circuit-breaker", "timeout"}),
            randomFrom(PAYMENT_FAILURES),
            "Application anomaly detected",
            randomBetween(0, 40)
        );
        logWarn(marker("anomaly", context), "Nombre eleve de requetes simultanees", "concurrentRequests", context.concurrentRequests());
        logWarn(marker("anomaly", context), "Temps de reponse superieur au seuil", "responseTimeMs", context.responseTimeMs());
        logError(marker("anomaly", context), "Circuit Breaker ouvert", context.errorCode());
        logError(marker("anomaly", context), "Timeout HTTP lors de l'appel au service externe", context.transactionId());
        logError(marker("anomaly", context), "Exception applicative", new IllegalStateException("Business rule violated for order " + context.orderId()));
        return "Simulation anomalie terminee.";
    }

    /**
     * Simule un scenario aleatoire parmi les flux principaux.
     */
    public String simulateRandom() {
        return switch (random.nextInt(8)) {
            case 0 -> simulateLogin();
            case 1 -> simulateLogout();
            case 2 -> simulateOrder();
            case 3 -> simulatePayment();
            case 4 -> simulateSearch();
            case 5 -> simulateInventory();
            case 6 -> simulateDatabase();
            default -> simulateAnomaly();
        };
    }

    private SimulationContext generateContext() {
        return generateContext(
            "generic",
            randomFrom(ENDPOINTS),
            randomFrom(HTTP_METHODS),
            200,
            null,
            null,
                null,
                randomBetween(0, 40)
        );
        }

    private SimulationContext generateContext(String anomalyType, String endpoint, String httpMethod, int statusCode, String anomalyLabel, String errorCode, String errorMessage, int stockLevel) {
        String serviceName = randomFrom(SERVICES);
        String environment = randomFrom(ENVIRONMENTS);
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
                randomBetween(120, 4200),
                randomBetween(40, 3200),
                randomBetween(1, 5),
            stockLevel,
                randomBetween(20, 900),
            randomBetween(0, 450),
            randomIpAddress(),
            randomFrom(BROWSERS),
            randomFrom(CITIES),
            serviceName,
            environment,
            randomCorrelationId(),
            errorCode,
            errorMessage,
            anomalyLabel != null ? anomalyLabel : anomalyType
        );
    }

    private Marker marker(String scenario, SimulationContext context) {
        return Markers.append("scenario", scenario)
                .and(Markers.append("userId", context.userId()))
                .and(Markers.append("sessionId", context.sessionId()))
                .and(Markers.append("orderId", context.orderId()))
                .and(Markers.append("productId", context.productId()))
                .and(Markers.append("transactionId", context.transactionId()))
                .and(Markers.append("invoiceId", context.invoiceId()))
                .and(Markers.append("endpoint", context.endpoint()))
                .and(Markers.append("httpMethod", context.httpMethod()))
                .and(Markers.append("statusCode", context.statusCode()))
                .and(Markers.append("ipAddress", context.ipAddress()))
                .and(Markers.append("browser", context.browser()))
                .and(Markers.append("city", context.city()))
                .and(Markers.append("serviceName", context.serviceName()))
                .and(Markers.append("environment", context.environment()))
                .and(Markers.append("correlationId", context.correlationId()))
                .and(Markers.append("amount", context.amount()))
                .and(Markers.append("processingTimeMs", context.processingTimeMs()))
                .and(Markers.append("responseTimeMs", context.responseTimeMs()))
                .and(Markers.append("attempts", context.attempts()))
                .and(Markers.append("stockLevel", context.stockLevel()))
                .and(Markers.append("concurrentRequests", context.concurrentRequests()))
                .and(Markers.append("queueSize", context.queueSize()))
                .and(Markers.append("errorCode", context.errorCode()))
                .and(Markers.append("errorMessage", context.errorMessage()))
                .and(Markers.append("anomalyType", context.anomalyType()));
    }

    private void logInfo(Marker marker, String message) {
        logger.info(marker, message);
    }

    private void logInfo(Marker marker, String message, String key, Object value) {
        logger.info(Markers.append(key, value).and(marker), message);
    }

    private void logWarn(Marker marker, String message) {
        logger.warn(marker, message);
    }

    private void logWarn(Marker marker, String message, String key, Object value) {
        logger.warn(Markers.append(key, value).and(marker), message);
    }

    private void logError(Marker marker, String message, String code) {
        logger.error(Markers.append("errorCode", code).and(marker), message);
    }

    private void logError(Marker marker, String message, Throwable throwable) {
        logger.error(marker, message, throwable);
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