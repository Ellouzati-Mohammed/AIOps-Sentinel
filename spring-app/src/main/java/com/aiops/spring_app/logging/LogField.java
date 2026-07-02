package com.aiops.spring_app.logging;

public record LogField(
        String name,
        String dataType,
        String description,
        String exampleValue,
        boolean required,
        boolean usedForTraining,
        String category) {
}
