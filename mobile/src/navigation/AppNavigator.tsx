
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MissionScreen from "../screens/MissionScreen";
import SimulationScreen from "../screens/SimulationScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Mission"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#0D1117",
          },
        }}
      >
        <Stack.Screen
          name="Mission"
          component={MissionScreen}
        />
        <Stack.Screen
          name="Simulation"
          component={SimulationScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
