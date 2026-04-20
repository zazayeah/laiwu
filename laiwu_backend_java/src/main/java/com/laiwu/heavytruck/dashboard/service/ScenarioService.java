package com.laiwu.heavytruck.dashboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class ScenarioService {

    private final ObjectMapper objectMapper;

    public ScenarioService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public JsonNode getScenario(String scenarioKey) {
        JsonNode fromRequested = readScenario("mock/scenarios/" + scenarioKey + ".json");
        return fromRequested != null ? fromRequested : readScenario("mock/scenarios/spring.json");
    }

    private JsonNode readScenario(String path) {
        try (InputStream inputStream = new ClassPathResource(path).getInputStream()) {
            return objectMapper.readTree(inputStream);
        } catch (IOException ex) {
            return null;
        }
    }
}
