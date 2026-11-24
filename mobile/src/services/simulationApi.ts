
const API_URL = "http://192.168.101.7:8000";

export type SimulationRequest = {
  city: string;
  weeks: number;
  contagion_factor: number;
  vaccination: boolean;
  vaccination_pct: number;
  vaccination_week: number;
  masks: boolean;
  masks_adherence: number;
  masks_start: number;
  masks_end: number;
  distancing: boolean;
  distancing_intensity: number;
  distancing_start: number;
  distancing_end: number;
  lockdown: boolean;
  lockdown_intensity: number;
  lockdown_start: number;
  lockdown_end: number;
};

export async function runSimulation(
  params: SimulationRequest
): Promise<unknown> {
  const response = await fetch(`${API_URL}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const details = await response.text();

    throw new Error(
      `Erro na simulação (${response.status}): ${details}`
    );
  }

  return response.json();
}
