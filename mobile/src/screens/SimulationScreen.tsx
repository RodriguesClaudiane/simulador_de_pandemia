
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import Header from "../components/Header";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Simulation"
>;

export default function SimulationScreen({
  navigation,
  route,
}: Props) {
  const { missionTitle, cityName, hypothesis } = route.params;

  return (
    <View style={styles.container}>
      <Header subtitle="SIMULAÇÃO" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>SIMULAÇÃO COMPARATIVA</Text>
        <Text style={styles.title}>{missionTitle}</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>CIDADE SELECIONADA</Text>
          <Text style={styles.cardValue}>{cityName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>HIPÓTESE CIENTÍFICA</Text>
          <Text style={styles.description}>{hypothesis}</Text>
        </View>

        <View style={styles.scenario}>
          <Text style={styles.scenarioTitle}>
            CENÁRIO A — SEM INTERVENÇÃO
          </Text>
          <Text style={styles.description}>
            A visualização da população será implementada aqui.
          </Text>
        </View>

        <View style={styles.scenario}>
          <Text style={styles.scenarioTitle}>
            CENÁRIO B — COM INTERVENÇÃO
          </Text>
          <Text style={styles.description}>
            A visualização da população será implementada aqui.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar para missões</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  label: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12,
  },
  title: {
    color: "#E6EDF3",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#161B22",
    borderColor: "#30363D",
    borderWidth: 1,
    borderRadius: 10,
    padding: 18,
    marginBottom: 12,
  },
  cardLabel: {
    color: "#7D8590",
    fontSize: 11,
    marginBottom: 8,
  },
  cardValue: {
    color: "#E6EDF3",
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    color: "#B0BAC4",
    fontSize: 14,
    lineHeight: 22,
  },
  scenario: {
    backgroundColor: "#161B22",
    borderWidth: 1,
    borderColor: "#30363D",
    borderRadius: 10,
    padding: 20,
    minHeight: 140,
    marginBottom: 14,
  },
  scenarioTitle: {
    color: "#4ADE80",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#238636",
    padding: 17,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
