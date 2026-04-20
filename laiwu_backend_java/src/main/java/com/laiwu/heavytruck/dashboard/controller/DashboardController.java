package com.laiwu.heavytruck.dashboard.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.laiwu.heavytruck.dashboard.service.ScenarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "场景数据接口")
public class DashboardController {

    private final ScenarioService scenarioService;

    public DashboardController(ScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    @GetMapping("/scenarios/{scenarioKey}")
    @Operation(summary = "获取场景数据")
    public JsonNode scenario(@PathVariable String scenarioKey) {
        return scenarioService.getScenario(scenarioKey);
    }
}
