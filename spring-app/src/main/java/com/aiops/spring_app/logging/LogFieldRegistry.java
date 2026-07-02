package com.aiops.spring_app.logging;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Registre central des champs disponibles dans les logs JSON de l'application.
 *
 * Ce registre constitue la source de vérité pour les champs exploités par Fluent Bit,
 * Elasticsearch, FastAPI et les futurs traitements IA.
 */
public final class LogFieldRegistry {

    private static final Map<String, LogField> FIELDS_BY_NAME;
    private static final List<LogField> FIELDS;

    static {
        Map<String, LogField> fields = new LinkedHashMap<>();

        register(fields, new LogField("userId", "String", "Identifiant de l'utilisateur", "USR-14582", true, false, "Métier"));
        register(fields, new LogField("sessionId", "String", "Identifiant de session", "SID-845112", true, false, "Sécurité"));
        register(fields, new LogField("orderId", "String", "Identifiant de commande", "ORD-482911", true, true, "Métier"));
        register(fields, new LogField("productId", "String", "Identifiant du produit", "PRD-5512", true, true, "Métier"));
        register(fields, new LogField("transactionId", "String", "Identifiant de transaction", "TXN-7823412", true, true, "Métier"));
        register(fields, new LogField("invoiceId", "String", "Identifiant de facture", "INV-238914", true, true, "Métier"));
        register(fields, new LogField("amount", "BigDecimal", "Montant de l'opération", "249.99", true, true, "Métier"));
        register(fields, new LogField("endpoint", "String", "Chemin de l'endpoint appelé", "/simulation/payment", true, true, "Technique"));
        register(fields, new LogField("httpMethod", "String", "Méthode HTTP utilisée", "POST", true, true, "Réseau"));
        register(fields, new LogField("statusCode", "Integer", "Code HTTP de réponse", "200", true, true, "Technique"));
        register(fields, new LogField("processingTimeMs", "Long", "Temps de traitement interne", "145", true, true, "Performance"));
        register(fields, new LogField("responseTimeMs", "Long", "Temps de réponse de la requête", "245", true, true, "Performance"));
        register(fields, new LogField("attempts", "Integer", "Nombre de tentatives effectuées", "3", true, false, "Sécurité"));
        register(fields, new LogField("stockLevel", "Integer", "Niveau de stock courant", "8", true, true, "Métier"));
        register(fields, new LogField("concurrentRequests", "Integer", "Nombre de requêtes simultanées", "128", true, true, "Performance"));
        register(fields, new LogField("queueSize", "Integer", "Taille de la file de traitement", "47", true, true, "Performance"));
        register(fields, new LogField("ipAddress", "String", "Adresse IP du client", "10.24.18.42", true, false, "Réseau"));
        register(fields, new LogField("browser", "String", "Navigateur utilisé par le client", "Chrome", false, false, "Technique"));
        register(fields, new LogField("city", "String", "Ville de provenance du client", "Paris", false, false, "Métier"));
        register(fields, new LogField("serviceName", "Enum", "Service ayant généré le log", "payment-service", true, true, "Technique"));
        register(fields, new LogField("environment", "Enum", "Environnement d'exécution", "prod", true, true, "Technique"));
        register(fields, new LogField("correlationId", "String", "Identifiant de corrélation distribué", "CORR-7123498", true, true, "Technique"));
        register(fields, new LogField("errorCode", "String", "Code d'erreur applicatif ou technique", "PAY-503", false, true, "Technique"));
        register(fields, new LogField("errorMessage", "String", "Message détaillé d'erreur", "Payment refused by gateway", false, true, "Technique"));
        register(fields, new LogField("anomalyType", "String", "Type d'anomalie détectée ou simulée", "timeout", false, true, "Sécurité"));
        register(fields, new LogField("scenario", "String", "Nom du scénario de simulation", "payment", true, true, "Métier"));

        FIELDS_BY_NAME = Collections.unmodifiableMap(fields);
        FIELDS = List.copyOf(fields.values());
    }

    private LogFieldRegistry() {
    }

    public static List<LogField> getAllFields() {
        return FIELDS;
    }

    public static Optional<LogField> findByName(String name) {
        return Optional.ofNullable(FIELDS_BY_NAME.get(name));
    }

    public static boolean contains(String name) {
        return FIELDS_BY_NAME.containsKey(name);
    }

    private static void register(Map<String, LogField> fields, LogField field) {
        fields.put(field.name(), field);
    }
}
