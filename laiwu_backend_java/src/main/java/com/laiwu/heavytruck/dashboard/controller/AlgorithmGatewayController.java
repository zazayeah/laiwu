package com.laiwu.heavytruck.dashboard.controller;

import com.laiwu.heavytruck.dashboard.dto.request.FlexibilityRequest;
import com.laiwu.heavytruck.dashboard.dto.request.ForecastRequest;
import com.laiwu.heavytruck.dashboard.dto.request.LoadProfileRequest;
import com.laiwu.heavytruck.dashboard.dto.request.UserProfileRequest;
import com.laiwu.heavytruck.dashboard.service.AlgorithmGatewayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/integration/algorithm")
@Tag(name = "算法网关接口")
public class AlgorithmGatewayController {

    private final AlgorithmGatewayService algorithmGatewayService;

    public AlgorithmGatewayController(AlgorithmGatewayService algorithmGatewayService) {
        this.algorithmGatewayService = algorithmGatewayService;
    }

    @GetMapping("/health")
    @Operation(summary = "算法服务健康检查")
    public Map<String, Object> health() {
        return algorithmGatewayService.health();
    }

    @PostMapping("/load-profile/analyze")
    @Operation(summary = "负荷画像分析")
    public Map<String, Object> analyzeLoadProfile(@Valid @RequestBody LoadProfileRequest payload) {
        return algorithmGatewayService.analyzeLoadProfile(payload.toPayload());
    }

    @PostMapping("/user-profile/predict")
    @Operation(summary = "用户画像与行为预测")
    public Map<String, Object> predictUserProfile(@Valid @RequestBody UserProfileRequest payload) {
        return algorithmGatewayService.predictUserProfile(payload.toPayload());
    }

    @PostMapping("/flexibility/evaluate")
    @Operation(summary = "调节潜力评估")
    public Map<String, Object> evaluateFlexibility(@Valid @RequestBody FlexibilityRequest payload) {
        return algorithmGatewayService.evaluateFlexibility(payload.toPayload());
    }

    @PostMapping("/forecast/predict")
    @Operation(summary = "超短期与中长期负荷预测")
    public Map<String, Object> predictForecast(@Valid @RequestBody ForecastRequest payload) {
        return algorithmGatewayService.predictForecast(payload.toPayload());
    }
}
