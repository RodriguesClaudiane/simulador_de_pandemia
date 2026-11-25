export interface DiseaseProfile {
  name: string;
  incubationDays: number;
  infectiousDays: number;
  fatalityRisk: number;
  immunityDays: number;
  transmissionPerContact: number;
}
// Illustrative educational parameters, not clinically calibrated estimates.
export const DISEASE_PROFILES = {
  covid: {name: 'COVID-19 simplificada', incubationDays: 4, infectiousDays: 7, fatalityRisk: .005, immunityDays: 180, transmissionPerContact: .08},
  influenza: {name: 'Influenza simplificada', incubationDays: 2, infectiousDays: 5, fatalityRisk: .0005, immunityDays: 180, transmissionPerContact: .06},
  fictional: {name: 'Doença fictícia', incubationDays: 5, infectiousDays: 10, fatalityRisk: .02, immunityDays: 120, transmissionPerContact: .12},
} satisfies Record<string, DiseaseProfile>;
export type DiseaseId = keyof typeof DISEASE_PROFILES;
