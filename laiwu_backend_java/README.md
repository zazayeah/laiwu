# Java 后端骨架

技术栈：

- `Spring Boot`
- `Spring Web`
- `Actuator`
- `Springdoc OpenAPI`

## 当前接口

- `GET /api/system/health`
- `GET /api/dashboard/scenarios/{scenarioKey}`
- `GET /api/integration/algorithm/health`
- `POST /api/integration/algorithm/load-profile/analyze`
- `POST /api/integration/algorithm/user-profile/predict`
- `POST /api/integration/algorithm/flexibility/evaluate`
- `POST /api/integration/algorithm/forecast/predict`
- `GET /swagger-ui/index.html`
- `GET /v3/api-docs`

## 说明

- 当前项目为接口骨架，场景数据来自 `src/main/resources/mock/scenarios/*.json`
- 已内置 `spring`、`summer`、`weekend` 三个场景
- 若请求的场景文件不存在，默认回退到 `spring.json`
- 算法网关默认访问 `http://localhost:8000/api`
- 算法服务未启动时，网关接口返回占位结构，便于前端联调
- 算法接口请求体已抽成 DTO，可直接在 Swagger 中查看

## 启动

```bash
mvn spring-boot:run
```

## 当前环境限制

- 本机当前环境未安装 `mvn`，因此本次只完成骨架与源码搭建，未执行启动验证
