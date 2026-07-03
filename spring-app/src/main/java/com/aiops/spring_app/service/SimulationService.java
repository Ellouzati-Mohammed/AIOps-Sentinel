package com.aiops.spring_app.service;

import com.aiops.spring_app.model.EventType;
import com.aiops.spring_app.model.Severity;
import com.aiops.spring_app.model.SimulationContext;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Random;

@Service
public class SimulationService {

    private static final String[] BROWSERS = {"Chrome", "Firefox", "Edge", "Safari"};
    private static final String[] CITIES = {"Paris", "Lyon", "Marseille", "Toulouse", "Lille"};
    private static final String[] SERVICES = {"auth-service", "catalog-service", "order-service", "payment-service", "inventory-service", "notification-service"};
    private static final String[] ENVIRONMENTS = {"dev", "test", "staging", "prod"};
    private static final String[] PAYMENT_FAILURES = {"PAY-402", "PAY-408", "PAY-500", "PAY-503"};
    private static final String[] DATABASE_FAILURES = {"DB-500", "DB-502", "DB-504"};
    private static final String[] HTTP_METHODS = {"GET", "POST", "PUT", "DELETE"};

    private final LogService logService;
    private final Random random;

    public SimulationService(LogService logService) {
        this.logService = logService;
        this.random = new Random();
    }

    /**
     * Simule une connexion utilisateur dans un contexte e-commerce.
     */
    public String simulateLogin() {
        SimulationContext context = generateContext(EventType.USER_LOGIN, Severity.LOW, "/simulation/login", "GET", 200, null, null, "authentication", randomBetween(0, 40));
        logService.logInfo(context, "Session ouverte pour utilisateur");

        if (context.attempts() > 1) {
            logService.logWarn(context, "Plusieurs tentatives de connexion detectees avant succes");
        }

        logService.logInfo(context, "Utilisateur connecte avec succes");
        logService.logInfo(context, "Cache utilise pour charger le profil utilisateur");
        logService.logInfo(context, "API appelee", "downstreamEndpoint", "/api/users/me");
        return "Simulation login terminee.";
    }

    /**
     * Simule une deconnexion utilisateur.
     */
    public String simulateLogout() {
        SimulationContext context = generateContext(EventType.USER_LOGOUT, Severity.LOW, "/simulation/logout", "GET", 200, null, null, "session-termination", randomBetween(0, 40));
        logService.logInfo(context, "Utilisateur deconnecte");
        logService.logInfo(context, "Session fermee proprement");
        logService.logInfo(context, "Token de session invalide cote serveur");
        return "Simulation logout terminee.";
    }

    /**
     * Simule la creation d'une commande e-commerce.
     */
    public String simulateOrder() {
        SimulationContext context = generateContext(EventType.ORDER_CREATED, Severity.MEDIUM, "/simulation/order", "POST", 201, null, null, "order-creation", randomBetween(0, 40));
        logService.logInfo(context, "Recherche produit effectuee avant commande");
        logService.logInfo(context, "Commande creee avec succes");
        logService.logInfo(context, "Stock reserve pour le produit");
        logService.logInfo(context, "Facture generee pour la commande");
        logService.logInfo(context, "Email de confirmation envoye au client");
        return "Simulation commande terminee.";
    }

    /**
     * Simule un paiement dans un parcours applicatif.
     */
    public String simulatePayment() {
        boolean accepted = random.nextBoolean();
        SimulationContext context = generateContext(
            accepted ? EventType.PAYMENT_ACCEPTED : EventType.PAYMENT_FAILED,
            accepted ? Severity.MEDIUM : Severity.HIGH,
                "/simulation/payment",
                "POST",
                accepted ? 200 : 402,
                accepted ? null : randomFrom(PAYMENT_FAILURES),
                accepted ? null : "Payment refused by gateway",
                accepted ? null : "payment-rejection",
                randomBetween(0, 40)
        );

        if (accepted) {
            logService.logInfo(context, "Paiement accepte");
            logService.logInfo(context, "Transaction validee par le fournisseur de paiement");
            logService.logInfo(context, "Identifiant de transaction confirme");
        } else {
            logService.logError(context, "Paiement refuse");
            logService.logWarn(context, "Tentative de paiement a rerouter ou a rejouer plus tard");
        }

        return accepted ? "Simulation paiement acceptee." : "Simulation paiement refusee.";
    }

    /**
     * Simule une recherche produit avec cache et latence.
     */
    public String simulateSearch() {
        SimulationContext context = generateContext(EventType.PRODUCT_SEARCH, Severity.LOW, "/simulation/search", "GET", 200, null, null, "catalog-search", randomBetween(0, 40));
        logService.logInfo(context, "Produit recherche avec succes");
        logService.logDebug(context, "Parametre de recherche prepare", "query", "laptop");
        logService.logInfo(context, "Cache utilise pour la recherche produit");
        if (context.responseTimeMs() > 700) {
            logService.logWarn(context, "Temps de reponse superieur au seuil sur la recherche produit");
        }
        logService.logInfo(context, "API appelee", "endpoint", "/api/products/search");
        return "Simulation recherche terminee.";
    }

    /**
     * Simule la mise a jour du stock d'un produit.
     */
    public String simulateInventory() {
        int stockLevel = randomBetween(0, 40);
        SimulationContext context = generateContext(
            EventType.INVENTORY_UPDATED,
            stockLevel == 0 ? Severity.HIGH : Severity.MEDIUM,
                "/simulation/inventory",
                "PUT",
                stockLevel == 0 ? 503 : 200,
                stockLevel == 0 ? "INV-503" : null,
                stockLevel == 0 ? "Inventory reservation failed" : null,
                stockLevel <= 10 ? "low-stock" : null,
                stockLevel
        );

        logService.logInfo(context, "Stock mis a jour pour le produit");
        logService.logInfo(context, "Quantite reseignee apres validation de commande");
        if (context.stockLevel() <= 10) {
            logService.logWarn(context, "Stock faible detecte");
        }
        if (context.stockLevel() == 0) {
            logService.logError(context, "Service Inventory inaccessible pour reservation de stock");
        }
        return "Simulation inventaire terminee.";
    }

    /**
     * Simule une interaction avec la base de donnees.
     */
    public String simulateDatabase() {
        boolean databaseAvailable = random.nextBoolean();
        SimulationContext context = generateContext(
            databaseAvailable ? EventType.DATABASE_QUERY : EventType.DATABASE_FAILURE,
            databaseAvailable ? Severity.MEDIUM : Severity.CRITICAL,
                "/simulation/database",
                "POST",
                databaseAvailable ? 200 : 500,
                databaseAvailable ? null : randomFrom(DATABASE_FAILURES),
                databaseAvailable ? null : "Database unavailable",
                databaseAvailable ? null : "database-outage",
                randomBetween(0, 40)
        );

        if (databaseAvailable) {
            logService.logInfo(context, "Connexion a la base de donnees etablie");
            logService.logInfo(context, "Requete SQL executee avec succes");
            logService.logInfo(context, "Ecriture en base reussie pour la commande");
        } else {
            logService.logError(context, "Base de donnees indisponible");
            logService.logError(context, "Echec d'ecriture dans la base");
        }

        return databaseAvailable ? "Simulation base de donnees terminee." : "Simulation base de donnees en erreur.";
    }

    /**
     * Simule des indicateurs de performance applicative.
     */
    public String simulatePerformance() {
        SimulationContext context = generateContext(EventType.PERFORMANCE_CHECK, Severity.MEDIUM, "/simulation/performance", "GET", 200, null, null, "performance-check", randomBetween(0, 40));
        logService.logInfo(context, "Requete traitee avec succes");
        logService.logInfo(context, "Nombre de requetes simultanees observe", "observedConcurrentRequests", context.concurrentRequests());
        logService.logDebug(context, "Snapshot de performance collecte", "queueSize", context.queueSize());
        if (context.responseTimeMs() > 800) {
            logService.logWarn(context, "Requete lente detectee", "observedResponseTimeMs", context.responseTimeMs());
        }

        if (context.queueSize() > 200) {
            logService.logWarn(context, "File d'attente importante detectee", "observedQueueSize", context.queueSize());
        }

        logService.logWarn(context, "Forte consommation memoire applicative", "memoryUsageMb", randomBetween(512, 1536));
        logService.logWarn(context, "Service externe lent", "externalResponseTimeMs", randomBetween(900, 2500));
        return "Simulation performance terminee.";
    }

    /**
     * Simule une anomalie fonctionnelle ou technique.
     */
    public String simulateAnomaly() {
        SimulationContext context = generateContext(
                EventType.APPLICATION_ANOMALY,
                Severity.CRITICAL,
                "/simulation/anomaly",
                "GET",
                500,
                randomFrom(PAYMENT_FAILURES),
                "Application anomaly detected",
                randomFrom(new String[]{"spike", "slowdown", "circuit-breaker", "timeout"}),
                randomBetween(0, 40)
        );
        logService.logWarn(context, "Nombre eleve de requetes simultanees", "concurrentRequests", context.concurrentRequests());
        logService.logWarn(context, "Temps de reponse superieur au seuil", "responseTimeMs", context.responseTimeMs());
        logService.logError(context, "Circuit Breaker ouvert");
        logService.logError(context, "Timeout HTTP lors de l'appel au service externe", "failedTransactionId", context.transactionId());
        logService.logError(context, "Exception applicative", new IllegalStateException("Business rule violated for order " + context.orderId()));
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

    private SimulationContext generateContext(EventType eventType, Severity severity, String endpoint, String httpMethod, int statusCode, String errorCode, String errorMessage, String anomalyLabel, int stockLevel) {
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
                eventType,
                severity,
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
                anomalyLabel != null ? anomalyLabel : eventType.name()
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
