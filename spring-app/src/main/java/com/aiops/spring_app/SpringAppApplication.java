package com.aiops.spring_app;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringAppApplication {

    private static final Logger logger =
            LoggerFactory.getLogger(SpringAppApplication.class);

    public static void main(String[] args) {

        SpringApplication.run(SpringAppApplication.class, args);

        logger.info("Application démarrée");
        logger.warn("Mémoire élevée");
        logger.error("Connexion à la base de données impossible");
    }
}