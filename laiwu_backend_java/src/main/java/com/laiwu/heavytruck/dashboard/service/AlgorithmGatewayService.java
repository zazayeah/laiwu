package com.laiwu.heavytruck.dashboard.service;

import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class AlgorithmGatewayService {

    private final RestClient restClient;

    public AlgorithmGatewayService(@Value("${algorithm.service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public Map<String, Object> health() {
        try {
            return restClient.get()
                    .uri("/health")
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException ex) {
            return Map.of(
                    "status", "DOWN",
                    "service", "prototype-algorithm",
                    "message", "算法服务未连通，当前为后端骨架预留接口"
            );
        }
    }

    public Map<String, Object> analyzeLoadProfile(Map<String, Object> payload) {
        return post(
                "/load-profile/analyze",
                payload,
                Map.of(
                        "status", "DOWN",
                        "module", "loadProfile",
                        "message", "算法服务未连通，返回 Java 网关占位结果",
                        "generatedAt", OffsetDateTime.now().toString(),
                        "echo", payload
                )
        );
    }

    public Map<String, Object> predictUserProfile(Map<String, Object> payload) {
        return post(
                "/user-profile/predict",
                payload,
                Map.of(
                        "status", "DOWN",
                        "module", "userProfile",
                        "message", "算法服务未连通，返回 Java 网关占位结果",
                        "generatedAt", OffsetDateTime.now().toString(),
                        "echo", payload
                )
        );
    }

    public Map<String, Object> evaluateFlexibility(Map<String, Object> payload) {
        return post(
                "/flexibility/evaluate",
                payload,
                Map.of(
                        "status", "DOWN",
                        "module", "flexibility",
                        "message", "算法服务未连通，返回 Java 网关占位结果",
                        "generatedAt", OffsetDateTime.now().toString(),
                        "echo", payload
                )
        );
    }

    public Map<String, Object> predictForecast(Map<String, Object> payload) {
        return post(
                "/forecast/predict",
                payload,
                Map.of(
                        "status", "DOWN",
                        "module", "forecast",
                        "message", "算法服务未连通，返回 Java 网关占位结果",
                        "generatedAt", OffsetDateTime.now().toString(),
                        "echo", payload
                )
        );
    }

    private Map<String, Object> post(String path, Map<String, Object> payload, Map<String, Object> fallback) {
        try {
            return restClient.post()
                    .uri(path)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException ex) {
            return fallback;
        }
    }
}
