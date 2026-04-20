# Python 算法服务骨架

技术栈：

- `Python`
- `FastAPI`
- `pydantic`
- `pandas`
- `numpy`

## 当前接口

- `GET /api/health`
- `POST /api/load-profile/analyze`
- `POST /api/user-profile/predict`
- `POST /api/flexibility/evaluate`
- `POST /api/forecast/predict`

## 说明

- 当前为算法服务骨架，返回可联调的模拟结果
- 返回结构覆盖负荷画像、用户画像、调节评估、负荷预测四类能力
- 可直接作为 Java 网关的下游服务启动

## 安装

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 启动

```bash
uvicorn app.main:app --reload --port 8000
```

## 当前环境限制

- 本机当前环境未安装 FastAPI 依赖，因此本次只完成骨架与源码搭建，未执行服务启动验证
