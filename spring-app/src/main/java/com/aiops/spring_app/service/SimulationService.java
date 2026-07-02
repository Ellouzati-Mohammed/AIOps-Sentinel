package com.aiops.spring_app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SimulationService {

    private static final Logger logger = LoggerFactory.getLogger(SimulationService.class);

    public String simulateInfo() {
        logger.info("Utilisateur connecté avec succès");
        return "Traitement normal exécuté.";
    }

    public String simulateWarn() {
        logger.warn("Utilisation CPU élevée (85%)");
        return "Avertissement généré.";
    }
}