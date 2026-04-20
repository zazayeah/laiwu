package com.laiwu.heavytruck.dashboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
@Tag(name = "系统接口")
public class SystemController {

    @GetMapping("/health")
    @Operation(summary = "系统健康检查")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "prototype-backend",
                "message", "Java 后端骨架服务已启动"
        );
    }
}
