package com.laiwu.heavytruck.dashboard.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.LinkedHashMap;
import java.util.Map;

@Schema(description = "负荷预测请求")
public record ForecastRequest(
        @Schema(description = "场景标识", example = "spring") @NotBlank String scenarioKey,
        @Schema(description = "预测范围", example = "region") String scope,
        @Schema(description = "预测时长", example = "4h") String horizon
) {
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("scenarioKey", scenarioKey);
        payload.put("scope", scope == null ? "region" : scope);
        payload.put("horizon", horizon == null ? "4h" : horizon);
        return payload;
    }
}
