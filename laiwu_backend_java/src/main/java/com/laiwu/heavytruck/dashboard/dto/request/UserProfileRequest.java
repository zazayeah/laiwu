package com.laiwu.heavytruck.dashboard.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Schema(description = "用户画像与行为预测请求")
public record UserProfileRequest(
        @Schema(description = "场景标识", example = "spring") @NotBlank String scenarioKey,
        @Schema(description = "站点集合") List<String> stationIds,
        @Schema(description = "预测时长，单位小时", example = "4") Integer horizonHours
) {
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("scenarioKey", scenarioKey);
        payload.put("stationIds", stationIds == null ? List.of() : stationIds);
        payload.put("horizonHours", horizonHours == null ? 4 : horizonHours);
        return payload;
    }
}
