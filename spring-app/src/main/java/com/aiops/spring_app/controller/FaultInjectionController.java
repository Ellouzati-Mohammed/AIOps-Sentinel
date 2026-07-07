package com.aiops.spring_app.controller;

import com.aiops.spring_app.service.FaultInjectionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/inject-fault", "/inject-fault"})
public class FaultInjectionController {

    private final FaultInjectionService faultInjectionService;

    public FaultInjectionController(FaultInjectionService faultInjectionService) {
        this.faultInjectionService = faultInjectionService;
    }

    @GetMapping("/runtime")
    public String runtimeException() {
        return faultInjectionService.simulateRuntimeException();
    }

    @GetMapping("/sql")
    public String sqlException() {
        return faultInjectionService.simulateSQLException();
    }

    @RequestMapping(value = "/repeated", method = {RequestMethod.GET, RequestMethod.POST})
    public String repeatedErrors(HttpServletRequest request) {
        return faultInjectionService.simulateRepeatedErrors(request.getMethod());
    }
}
