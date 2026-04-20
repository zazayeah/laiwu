package com.laiwu.heavytruck.dashboard.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Schema(description = "负荷画像分析请求")
public record LoadProfileRequest(
        @Schema(description = "场景标识", example = "spring") @NotBlank String scenarioKey,
        @Schema(description = "关注站点", example = "fengcheng") String focusStation,
        @Schema(description = "站点集合") List<String> stationIds
) {
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("scenarioKey", scenarioKey);
        payload.put("focusStation", focusStation);
        payload.put("stationIds", stationIds == null ? List.of() : stationIds);
        return payload;
    }
}
