/** Motor local inspirado nas regras de randomWalk.py.
 * Estados: 0 saudável, 1 doente, 2 morto, 3 imune.
 * Não usa objetos por indivíduo nem mantém histórico completo da grade.
 */
export type City = 'igarassu' | 'goiana' | 'itapissuma' | 'itamaraca' | 'aracoiaba';
export const CITY_POPULATION: Record<City, number> = {
  igarassu: 115196, goiana: 81055, itapissuma: 27749,
  itamaraca: 24540, aracoiaba: 19243,
};
export interface Intervention {
  enabled: boolean;
  intensity: number;
  start: number;
  end: number;
}
export interface SimulationOptions {
  city: City;
  weeks: number;
  contagionFactor: number;
  vaccination?: { enabled: boolean; percentage: number; week: number };
  masks?: Intervention;
  distancing?: Intervention;
  lockdown?: Intervention;
  onProgress?: (completed: number, total: number) => void;
  shouldCancel?: () => boolean;
}
export interface ScenarioResult {
  healthy: number[];
  sick: number[];
  dead: number[];
  immune: number[];
  final_deaths: number;
  total_population: number;
}
export interface SimulationResult {
  scenario1: ScenarioResult;
  scenario2: ScenarioResult;
  elapsedMs: number;
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
function active(i: Intervention | undefined, week: number): number {
  return i?.enabled && week >= i.start && week <= i.end ? clamp01(i.intensity) : 0;
}
function simulateOne(options: SimulationOptions, interventions: boolean, progressBase: number): ScenarioResult {
  const count = CITY_POPULATION[options.city];
  const width = Math.ceil(Math.sqrt(count));
  const current = new Uint8Array(count);
  const next = new Uint8Array(count);
  const center = Math.floor(count / 2);
  current[center] = 1;
  next[center] = 1;
  const result: ScenarioResult = {healthy: [], sick: [], dead: [], immune: [], final_deaths: 0, total_population: count};
  for (let week = 1; week <= options.weeks; week++) {
    if (options.shouldCancel?.()) throw new Error('Simulação cancelada');
    // Mantém a vacinação do modelo original: somente saudáveis, antes da geração.
    if (interventions && options.vaccination?.enabled && week === options.vaccination.week) {
      const pct = clamp01(options.vaccination.percentage);
      for (let p = 0; p < count; p++) {
        if (current[p] === 0 && Math.random() < pct) {current[p] = 3; next[p] = 3;}
      }
    }
    const mask = interventions ? active(options.masks, week) : 0;
    const distance = interventions ? active(options.distancing, week) : 0;
    const lockdown = interventions ? active(options.lockdown, week) : 0;
    const contagion = clamp01(options.contagionFactor * (1 - mask));
    const avoidance = clamp01(1 - (1 - distance) * (1 - lockdown));
    // Semântica original: processar cada indivíduo da grade na ordem e
    // aplicar contágio à grade NEXT, antes da transição do infectado.
    for (let p = 0; p < count; p++) {
      const state = current[p];
      if (state === 1) {
        const row = Math.floor(p / width), col = p % width;
        for (let dr = -1; dr <= 1; dr++) {
          const rr = row + dr;
          if (rr < 0) continue;
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const cc = col + dc;
            if (cc < 0 || cc >= width) continue;
            const q = rr * width + cc;
            if (q < 0 || q >= count) continue;
            // O modelo original sorteia contato antes de testar estado do vizinho.
            if (Math.random() >= avoidance && next[q] === 0 && Math.random() <= contagion) next[q] = 1;
          }
        }
        const r = Math.random();
        next[p] = r <= 0.1 ? 0 : r <= 0.3 ? 1 : r <= 0.6 ? 2 : 3;
      } else if (state === 3) {
        next[p] = Math.random() <= 0.03 ? 0 : 3;
      }
    }
    current.set(next);
    let healthy = 0, sick = 0, dead = 0, immune = 0;
    for (let p = 0; p < count; p++) {
      switch (current[p]) {case 0: healthy++; break; case 1: sick++; break; case 2: dead++; break; case 3: immune++; break;}
    }
    result.healthy.push(healthy); result.sick.push(sick);
    result.dead.push(dead); result.immune.push(immune);
    options.onProgress?.(progressBase + week, options.weeks * 2);
  }
  result.final_deaths = result.dead[result.dead.length - 1] ?? 0;
  return result;
}
export function runSimulationLocal(options: SimulationOptions): SimulationResult {
  if (!Number.isInteger(options.weeks) || options.weeks < 1 || options.weeks > 520) throw new Error('weeks deve estar entre 1 e 520');
  if (!(options.city in CITY_POPULATION)) throw new Error('Cidade inválida');
  const start = performance.now();
  const scenario1 = simulateOne(options, false, 0);
  const scenario2 = simulateOne(options, true, options.weeks);
  return {scenario1, scenario2, elapsedMs: performance.now() - start};
}
