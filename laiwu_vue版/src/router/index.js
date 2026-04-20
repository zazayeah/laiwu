import { createRouter, createWebHashHistory } from "vue-router";
import OverviewPage from "../pages/OverviewPage.vue";
import GovernancePage from "../pages/GovernancePage.vue";
import LoadProfilePage from "../pages/LoadProfilePage.vue";
import UserProfilePage from "../pages/UserProfilePage.vue";
import FlexibilityPage from "../pages/FlexibilityPage.vue";
import ForecastPage from "../pages/ForecastPage.vue";
import DecisionPage from "../pages/DecisionPage.vue";
import MapStationManagementPage from "../pages/MapStationManagementPage.vue";
import MapSiteAnalysisPage from "../pages/MapSiteAnalysisPage.vue";

const routes = [
  { path: "/", name: "overview", component: OverviewPage },
  { path: "/governance", name: "governance", component: GovernancePage },
  { path: "/load-profile", name: "loadProfile", component: LoadProfilePage },
  { path: "/user-profile", name: "userProfile", component: UserProfilePage },
  { path: "/flexibility", name: "flexibility", component: FlexibilityPage },
  { path: "/forecast", name: "forecast", component: ForecastPage },
  { path: "/decision", name: "decision", component: DecisionPage },
  { path: "/map-station-management", name: "mapStationManagement", component: MapStationManagementPage },
  { path: "/map-site-analysis", name: "mapSiteAnalysis", component: MapSiteAnalysisPage },
  { path: "/map-topic", redirect: "/map-station-management" }
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});
