from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class BaseScenarioRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    scenario_key: str = Field(default="spring", alias="scenarioKey")


class LoadProfileRequest(BaseScenarioRequest):
    focus_station: str | None = Field(default=None, alias="focusStation")
    station_ids: list[str] = Field(default_factory=list, alias="stationIds")


class UserProfileRequest(BaseScenarioRequest):
    station_ids: list[str] = Field(default_factory=list, alias="stationIds")
    horizon_hours: int = Field(default=4, alias="horizonHours")


class FlexibilityRequest(BaseScenarioRequest):
    service_guard: int = Field(default=72, alias="serviceGuard")
    price_spread: float = Field(default=0.62, alias="priceSpread")


class ForecastRequest(BaseScenarioRequest):
    scope: Literal["region", "station", "mediumLong"] = "region"
    horizon: Literal["4h", "24h", "month"] = "4h"
