package com.aiops.spring_app.controller;

import com.aiops.spring_app.service.SimulationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/simulate/info")
    public String simulateInfo() {
        return simulationService.simulateInfo();
    }

    @GetMapping("/simulate/warn")
    public String simulateWarn() {
        return simulationService.simulateWarn();
    }
}