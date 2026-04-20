from fastapi import APIRouter

from app.schemas import (
    FlexibilityRequest,
    ForecastRequest,
    LoadProfileRequest,
    UserProfileRequest,
)
from app.services.analysis import (
    evaluate_flexibility,
    health_payload,
    predict_forecast,
    predict_user_profile,
    summarize_load_profile,
)

router = APIRouter(prefix="/api", tags=["prototype-algorithm"])


@router.get("/health")
def health() -> dict:
    return health_payload()


@router.post("/load-profile/analyze")
def load_profile_analyze(payload: LoadProfileRequest) -> dict:
    return summarize_load_profile(payload)


@router.post("/user-profile/predict")
def user_profile_predict(payload: UserProfileRequest) -> dict:
    return predict_user_profile(payload)


@router.post("/flexibility/evaluate")
def flexibility_evaluate(payload: FlexibilityRequest) -> dict:
    return evaluate_flexibility(payload)


@router.post("/forecast/predict")
def forecast_predict(payload: ForecastRequest) -> dict:
    return predict_forecast(payload)
