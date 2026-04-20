import { getScenario } from "../data/dashboard";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchScenario(key) {
  if (!BASE_URL) {
    return getScenario(key);
  }
  try {
    const response = await fetch(`${BASE_URL}/dashboard/scenarios/${key}`);
    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return getScenario(key);
  }
}
