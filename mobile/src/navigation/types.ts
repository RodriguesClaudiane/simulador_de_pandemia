export type RootStackParamList = {
  Mission: undefined;
  Simulation: {
    missionId: string;
    missionTitle: string;
    cityId: string;
    cityName: string;
    hypothesis: string;
  };
};