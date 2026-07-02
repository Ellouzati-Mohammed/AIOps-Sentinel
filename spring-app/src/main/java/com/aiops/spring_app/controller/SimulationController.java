package com.aiops.spring_app.controller;

import com.aiops.spring_app.service.SimulationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Expose les scenarios de simulation de logs metier pour AIOps Sentinel.
 */
@RestController
@RequestMapping({"/simulation", "/simulate"})
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/login")
    public String simulateLogin() {
        return simulationService.simulateLogin();
    }

    @GetMapping("/logout")
    public String simulateLogout() {
        return simulationService.simulateLogout();
    }

    @GetMapping("/order")
    public String simulateOrder() {
        return simulationService.simulateOrder();
    }

    @GetMapping("/payment")
    public String simulatePayment() {
        return simulationService.simulatePayment();
    }

    @GetMapping("/search")
    public String simulateSearch() {
        return simulationService.simulateSearch();
    }

    @GetMapping("/inventory")
    public String simulateInventory() {
        return simulationService.simulateInventory();
    }

    @GetMapping("/database")
    public String simulateDatabase() {
        return simulationService.simulateDatabase();
    }

    @GetMapping("/performance")
    public String simulatePerformance() {
        return simulationService.simulatePerformance();
    }

    @GetMapping("/anomaly")
    public String simulateAnomaly() {
        return simulationService.simulateAnomaly();
    }

    @GetMapping("/random")
    public String simulateRandom() {
        return simulationService.simulateRandom();
    }
}