package com.laiwu.heavytruck.dashboard.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.LinkedHashMap;
import java.util.Map;

@Schema(description = "调节潜力评估请求")
public record FlexibilityRequest(
        @Schema(description = "场景标识", example = "spring") @NotBlank String scenarioKey,
        @Schema(description = "最低服务保障约束", example = "90") Integer serviceGuard,
        @Schema(description = "价差假设", example = "0.82") Double priceSpread
) {
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("scenarioKey", scenarioKey);
        payload.put("serviceGuard", serviceGuard == null ? 90 : serviceGuard);
        payload.put("priceSpread", priceSpread == null ? 0.82D : priceSpread);
        return payload;
    }
}
