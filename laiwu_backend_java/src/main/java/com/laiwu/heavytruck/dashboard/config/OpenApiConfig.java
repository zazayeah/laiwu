package com.laiwu.heavytruck.dashboard.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI prototypeOpenApi() {
        return new OpenAPI().info(
                new Info()
                        .title("莱芜重卡充电运营分析原型系统 API")
                        .version("0.1.0")
                        .description("包含场景数据接口、算法网关接口和系统健康检查接口")
        );
    }
}
