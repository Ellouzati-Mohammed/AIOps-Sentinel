# LOG_SCHEMA - AIOps Sentinel

## 1. Présentation du format de log

AIOps Sentinel produit des logs JSON enrichis destinés à être collectés par Fluent Bit, stockés dans Elasticsearch, visualisés dans Kibana, puis exploités par FastAPI pour le prétraitement et par le modèle Isolation Forest pour la détection d'anomalies.

Chaque événement de log contient :
- des champs métier pour comprendre l'action simulée,
- des champs techniques pour tracer la requête,
- des indicateurs de performance pour détecter les dérives,
- des champs d'erreur pour qualifier les incidents,
- des métadonnées de corrélation pour relier les événements distribués.

Les logs incluent également des métadonnées globales automatiquement ajoutées par `LogService` :
- `applicationVersion`
- `hostName`
- `exception` lorsque le niveau est `ERROR` et qu'une exception est fournie.

Ce document constitue la référence officielle de tous les champs de logs de l'application.

## 2. Structure JSON complète d'un log

Exemple générique d'un log JSON produit par l'application :

```json
{
  "timestamp": "2026-07-02T14:22:31.245Z",
  "level": "INFO",
  "scenario": "payment",
  "eventType": "PAYMENT_ACCEPTED",
  "severity": "MEDIUM",
  "userId": "USR-14582",
  "sessionId": "SID-845112",
  "orderId": "ORD-482911",
  "productId": "PRD-5512",
  "transactionId": "TXN-7823412",
  "invoiceId": "INV-238914",
  "amount": 249.99,
  "endpoint": "/simulation/payment",
  "httpMethod": "POST",
  "statusCode": 200,
  "processingTimeMs": 145,
  "responseTimeMs": 245,
  "attempts": 1,
  "stockLevel": 8,
  "concurrentRequests": 128,
  "queueSize": 47,
  "ipAddress": "10.24.18.42",
  "browser": "Chrome",
  "city": "Paris",
  "serviceName": "payment-service",
  "environment": "prod",
  "correlationId": "CORR-7123498",
  "applicationVersion": "1.0.0",
  "hostName": "spring-app-01",
  "errorCode": null,
  "errorMessage": null,
  "anomalyType": null,
  "exception": null,
  "message": "Paiement accepte"
}
```

## 3. Tableau détaillé de tous les champs

| Champ | Type | Description | Exemple | Obligatoire | Utilisé par l'IA | Catégorie | Rôle | Pourquoi il est présent | Détection anomalies | Diagnostic humain |
|---|---|---|---|---|---|---|---|---|---|---|
| `scenario` | String | Nom du scénario de simulation | `payment` | Oui | Oui | Métier | Identifie le flux simulé | Permet de regrouper les événements par cas d'usage | Oui | Oui |
| `eventType` | Enum | Type précis de l'événement métier | `PAYMENT_ACCEPTED` | Oui | Oui | Métier | Identifie l'événement de manière normalisée | Facilite la classification et l'analyse comportementale | Oui | Oui |
| `severity` | Enum | Gravité métier de l'événement | `MEDIUM` | Oui | Oui | Sécurité | Donne le niveau de criticité métier | Aide à prioriser les anomalies sans remplacer le niveau de log | Oui | Oui |
| `userId` | String | Identifiant de l'utilisateur | `USR-14582` | Oui | Non | Métier | Identifie l'utilisateur concerné | Permet d'analyser les parcours utilisateur | Faible | Oui |
| `sessionId` | String | Identifiant de session | `SID-845112` | Oui | Non | Sécurité | Trace une session applicative | Permet la corrélation de session | Oui | Oui |
| `orderId` | String | Identifiant de commande | `ORD-482911` | Oui | Oui | Métier | Identifie une commande e-commerce | Permet de suivre le cycle de vie de la commande | Oui | Oui |
| `productId` | String | Identifiant du produit | `PRD-5512` | Oui | Oui | Métier | Identifie le produit manipulé | Permet d'analyser les ventes et les réservations de stock | Oui | Oui |
| `transactionId` | String | Identifiant de transaction | `TXN-7823412` | Oui | Oui | Métier | Trace un paiement ou une action métier | Permet la corrélation financière | Oui | Oui |
| `invoiceId` | String | Identifiant de facture | `INV-238914` | Oui | Oui | Métier | Relie le log à une facture | Permet le suivi de facturation | Faible | Oui |
| `amount` | BigDecimal | Montant de l'opération | `249.99` | Oui | Oui | Métier | Indique la valeur de l'opération | Permet l'analyse métier et financière | Oui | Oui |
| `endpoint` | String | Chemin de l'endpoint appelé | `/simulation/payment` | Oui | Oui | Technique | Identifie la route REST appelée | Permet de relier un log à une action API | Oui | Oui |
| `httpMethod` | String | Méthode HTTP utilisée | `POST` | Oui | Oui | Réseau | Qualifie le type d'appel HTTP | Permet l'analyse de charge et de route | Oui | Oui |
| `statusCode` | Integer | Code HTTP de réponse | `200` | Oui | Oui | Technique | Indique le résultat HTTP | Permet d'identifier les erreurs fonctionnelles | Oui | Oui |
| `processingTimeMs` | Long | Temps de traitement interne | `145` | Oui | Oui | Performance | Mesure le traitement côté application | Sert à détecter les lenteurs applicatives | Oui | Oui |
| `responseTimeMs` | Long | Temps de réponse de la requête | `245` | Oui | Oui | Performance | Mesure la latence perçue | Sert à détecter les dégradations de performance | Oui | Oui |
| `attempts` | Integer | Nombre de tentatives effectuées | `3` | Oui | Oui | Sécurité | Trace les retries et échecs successifs | Sert à repérer les comportements suspects | Oui | Oui |
| `stockLevel` | Integer | Niveau de stock courant | `8` | Oui | Oui | Métier | Donne l'état du stock | Permet de détecter des ruptures ou seuils bas | Oui | Oui |
| `concurrentRequests` | Integer | Nombre de requêtes simultanées | `128` | Oui | Oui | Performance | Mesure la pression sur l'application | Sert à détecter la surcharge | Oui | Oui |
| `queueSize` | Integer | Taille de la file de traitement | `47` | Oui | Oui | Performance | Indique la saturation interne | Sert à détecter les goulots d'étranglement | Oui | Oui |
| `ipAddress` | String | Adresse IP du client | `10.24.18.42` | Oui | Non | Réseau | Trace l'origine réseau | Permet d'identifier une source d'accès | Faible | Oui |
| `browser` | String | Navigateur utilisé par le client | `Chrome` | Non | Non | Technique | Décrit le client web | Aide au diagnostic de compatibilité | Non | Oui |
| `city` | String | Ville de provenance du client | `Paris` | Non | Non | Métier | Donne un contexte géographique | Aide à l'analyse d'usage | Faible | Oui |
| `serviceName` | Enum | Service ayant généré le log | `payment-service` | Oui | Oui | Technique | Identifie le composant source | Permet le routage et la segmentation des logs | Oui | Oui |
| `environment` | Enum | Environnement d'exécution | `prod` | Oui | Oui | Infrastructure | Indique le contexte d'exécution | Permet de séparer dev, test, staging et prod | Oui | Oui |
| `correlationId` | String | Identifiant de corrélation distribué | `CORR-7123498` | Oui | Oui | Traçabilité | Relie les logs d'une même transaction | Permet le tracing distribué | Oui | Oui |
| `applicationVersion` | String | Version courante de l'application | `1.0.0` | Oui | Oui | Infrastructure | Trace la version déployée | Permet d'associer un comportement à une release précise | Oui | Oui |
| `hostName` | String | Nom de la machine d'exécution | `spring-app-01` | Oui | Non | Infrastructure | Identifie l'hôte d'exécution | Permet de diagnostiquer les différences entre instances | Faible | Oui |
| `errorCode` | String | Code d'erreur applicatif ou technique | `PAY-503` | Non | Oui | Erreur | Qualifie l'erreur détectée | Permet la classification des incidents | Oui | Oui |
| `errorMessage` | String | Message détaillé d'erreur | `Payment refused by gateway` | Non | Oui | Erreur | Explique le problème en clair | Permet un diagnostic rapide | Oui | Oui |
| `anomalyType` | String | Type d'anomalie détectée ou simulée | `timeout` | Non | Oui | Sécurité | Catégorise l'anomalie | Permet d'entraîner le modèle IA sur le type d'écart | Oui | Oui |
| `exception` | String | Nom complet du type d'exception | `java.sql.SQLTimeoutException` | Non | Oui | Erreur | Identifie l'exception déclenchée | Permet de distinguer les erreurs applicatives des erreurs techniques | Oui | Oui |

## 4. Champs utilisés pour l'entraînement du modèle d'IA

Les champs suivants sont prioritaires pour l'entraînement et la détection d'anomalies :
- `scenario`
- `eventType`
- `severity`
- `orderId`
- `productId`
- `transactionId`
- `amount`
- `endpoint`
- `httpMethod`
- `statusCode`
- `processingTimeMs`
- `responseTimeMs`
- `attempts`
- `stockLevel`
- `concurrentRequests`
- `queueSize`
- `serviceName`
- `environment`
- `correlationId`
- `applicationVersion`
- `errorCode`
- `errorMessage`
- `anomalyType`
- `exception`

Ces champs apportent le plus de valeur pour Isolation Forest, car ils permettent d'identifier les ruptures de comportement, les pics de latence, les erreurs de traitement, la saturation et les anomalies fonctionnelles.

## 5. Champs utilisés uniquement pour le diagnostic

Les champs principalement destinés au diagnostic humain sont :
- `userId`
- `sessionId`
- `ipAddress`
- `browser`
- `city`
- `invoiceId`
- `hostName`

Ils servent surtout à l'investigation manuelle, à l'assignation d'un incident et à la compréhension du contexte d'exécution.

## 6. Bonnes pratiques

- Toujours conserver des noms de champs stables et explicites.
- Utiliser des unités cohérentes, ici en millisecondes pour les temps.
- Éviter les doublons sémantiques entre champs.
- Garder `correlationId` présent sur tous les logs.
- Ne pas supprimer les champs de performance, même en absence d'erreur.
- Documenter tout nouveau champ dans ce registre avant son exploitation.
- Conserver des valeurs compatibles JSON et Elasticsearch.
- Préférer des types simples et homogènes pour faciliter le prétraitement FastAPI.

## 7. Convention de nommage des champs

- Utiliser `camelCase` pour tous les champs.
- Utiliser des noms orientés métier ou observabilité.
- Utiliser des suffixes explicites pour les unités : `Ms`, `Id`, `Code`.
- Éviter les abréviations non documentées.
- Garder un nom unique par concept.

Exemples valides :
- `responseTimeMs`
- `correlationId`
- `serviceName`
- `statusCode`

## 8. Exemples de logs INFO

```json
{
  "level": "INFO",
  "scenario": "login",
  "eventType": "USER_LOGIN",
  "severity": "LOW",
  "userId": "USR-14582",
  "sessionId": "SID-845112",
  "endpoint": "/simulation/login",
  "httpMethod": "GET",
  "statusCode": 200,
  "serviceName": "auth-service",
  "environment": "prod",
  "correlationId": "CORR-7123498",
  "applicationVersion": "1.0.0",
  "hostName": "spring-app-01",
  "exception": null,
  "message": "Utilisateur connecte avec succes"
}
```

```json
{
  "level": "INFO",
  "scenario": "order",
  "eventType": "ORDER_CREATED",
  "severity": "MEDIUM",
  "orderId": "ORD-482911",
  "productId": "PRD-5512",
  "amount": 249.99,
  "endpoint": "/simulation/order",
  "httpMethod": "POST",
  "statusCode": 201,
  "serviceName": "order-service",
  "environment": "prod",
  "correlationId": "CORR-8123441",
  "applicationVersion": "1.0.0",
  "hostName": "spring-app-01",
  "exception": null,
  "message": "Commande creee avec succes"
}
```

## 9. Exemples de logs WARN

```json
{
  "level": "WARN",
  "scenario": "performance",
  "eventType": "PERFORMANCE_CHECK",
  "severity": "MEDIUM",
  "responseTimeMs": 1480,
  "processingTimeMs": 920,
  "concurrentRequests": 320,
  "queueSize": 210,
  "serviceName": "catalog-service",
  "environment": "prod",
  "correlationId": "CORR-9234411",
  "applicationVersion": "1.0.0",
  "hostName": "spring-app-01",
  "exception": null,
  "message": "Requete lente detectee"
}
```

```json
{
  "level": "WARN",
  "scenario": "inventory",
  "eventType": "INVENTORY_UPDATED",
  "severity": "MEDIUM",
  "stockLevel": 4,
  "serviceName": "inventory-service",
  "environment": "prod",
  "correlationId": "CORR-5544221",
  "applicationVersion": "1.0.0",
  "hostName": "spring-app-01",
  "exception": null,
  "message": "Stock faible detecte"
}
```

## 10. Exemples de logs ERROR

```json
{
  "level": "ERROR",
  "scenario": "payment",
  "eventType": "PAYMENT_FAILED",
  "severity": "HIGH",
  "transactionId": "TXN-7823412",
  "errorCode": "PAY-503",
  "errorMessage": "Payment refused by gateway",
  "endpoint": "/simulation/payment",
  "httpMethod": "POST",
  "statusCode": 402,
  "serviceName": "payment-service",
  "environment": "prod",
  "correlationId": "CORR-7123498",
  "applicationVersion": "1.0.0",
  "hostName": "spring-app-01",
  "exception": "java.lang.IllegalStateException",
  "message": "Paiement refuse"
}
```

```json
{
  "level": "ERROR",
  "scenario": "database",
  "eventType": "DATABASE_FAILURE",
  "severity": "CRITICAL",
  "errorCode": "DB-500",
  "errorMessage": "Database unavailable",
  "serviceName": "order-service",
  "environment": "prod",
  "correlationId": "CORR-1455892",
  "applicationVersion": "1.0.0",
  "hostName": "spring-app-01",
  "exception": "java.sql.SQLTimeoutException",
  "message": "Base de donnees indisponible"
}
```

## 11. Exemples de scénarios métier

### Connexion
Flux orienté authentification, avec `eventType`, `severity`, `userId`, `sessionId`, `endpoint`, `httpMethod`, `statusCode`, `correlationId`.

### Commande
Flux orienté e-commerce, avec `eventType`, `severity`, `orderId`, `productId`, `amount`, `stockLevel`, `serviceName`.

### Paiement
Flux financier, avec `eventType`, `severity`, `transactionId`, `amount`, `statusCode`, `errorCode`, `errorMessage` et `exception` en cas d'échec.

### Panne base de données
Flux d'incident technique, avec `eventType`, `severity`, `serviceName`, `environment`, `errorCode`, `errorMessage`, `responseTimeMs`, `exception`.

### Timeout
Flux de lenteur ou de saturation, avec `eventType`, `severity`, `responseTimeMs`, `processingTimeMs`, `queueSize`, `concurrentRequests`.

### Anomalie
Flux destiné à l'entraînement IA, avec `eventType`, `severity`, `anomalyType`, `errorCode`, `responseTimeMs`, `statusCode` et `correlationId`.

### Stock faible
Flux métier pour la surveillance d'inventaire, avec `eventType`, `severity`, `stockLevel`, `productId`, `serviceName`.

### Requête lente
Flux performance, avec `eventType`, `severity`, `endpoint`, `httpMethod`, `responseTimeMs`, `queueSize`.

### Exception technique
Flux d'incident système, avec `eventType`, `severity`, `errorCode`, `errorMessage`, `exception`, `serviceName`, `hostName`.

---

## Synthèse

Le schéma de log d'AIOps Sentinel doit rester stable, documenté et extensible. Tout nouveau champ doit être ajouté dans :
- le registre de code,
- ce document,
- et le contrat de prétraitement FastAPI.

Ce fichier est la référence fonctionnelle officielle des logs JSON de la plateforme.
