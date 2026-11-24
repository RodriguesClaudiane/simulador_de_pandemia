
import React, { useState } from "react";
import Header from "../components/Header";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Mission"
>;

import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  bg: "#0D1117",
  surface: "#161B22",
  border: "#30363D",
  green: "#4ADE80",
  greenDark: "#238636",
  text: "#E6EDF3",
  secondary: "#B0BAC4",
  muted: "#7D8590",
};

const missions = [
  {
    id: "vacina",
    badge: "MISSÃO 01",
    title: "A vacina salva vidas?",
    description: "Teste com e sem vacina e compare os resultados.",
    heading: "Uma gripe chegou em Igarassu. O que você faz?",
    body: "Um estudante da sua escola chegou gripado. Nos próximos dias, mais colegas começam a faltar. Você é o responsável pela saúde da cidade — decide: vacinar, exigir máscaras, pedir distanciamento... ou não fazer nada?",
    hypothesis: "Cidades que vacinam a população têm menos mortes do que cidades que não vacinam, mesmo com o mesmo vírus.",
    color: COLORS.green,
  },
  {
    id: "mascara",
    badge: "MISSÃO 02",
    title: "Máscara ou distanciamento?",
    description: "Qual medida evita mais mortes quando usada sozinha?",
    heading: "O prefeito te ligou. Você tem verba para uma só medida.",
    body: "Há casos confirmados na cidade. O orçamento é limitado — só dá para uma medida. O que salva mais vidas: obrigar máscara em lugares públicos ou pedir que as pessoas fiquem em casa?",
    hypothesis: "O distanciamento social evita mais mortes do que o uso de máscara quando apenas uma dessas medidas é adotada.",
    color: "#E3B341",
  },
  {
    id: "sem-intervencao",
    badge: "MISSÃO 03",
    title: "O que acontece sem nenhuma ação?",
    description: "Veja o impacto real quando ninguém toma nenhuma medida.",
    heading: "O pior cenário. Sem vacina, sem máscara, sem nada.",
    body: "Nenhuma vacina, máscara, distanciamento ou lockdown. O vírus se espalha livremente. Execute a simulação e veja os números reais.",
    hypothesis: "Sem nenhuma medida de proteção, o número de mortes cresce tão rápido que ultrapassa a capacidade dos hospitais em menos de 8 semanas.",
    color: "#DA3633",
  },
  {
    id: "livre",
    badge: "MISSÃO 04",
    title: "Criar minha própria hipótese",
    description: "Você escolhe todas as variáveis e define o que quer testar.",
    heading: "Agora você é o cientista. O que você quer descobrir?",
    body: "Monte os dois cenários do zero. Escolha a taxa de transmissão, as medidas e a cidade. Antes de rodar, escreva o que você acha que vai acontecer — isso é uma hipótese científica.",
    hypothesis: "",
    color: "#38BDF8",
  },
] as const;

const cities = [
  { id: "igarassu", name: "Igarassu", population: "115 mil hab." },
  { id: "goiana", name: "Goiana", population: "81 mil hab." },
  { id: "itapissuma", name: "Itapissuma", population: "27 mil hab." },
  { id: "itamaraca", name: "Itamaracá", population: "24 mil hab." },
  { id: "aracoiaba", name: "Araçoiaba", population: "19 mil hab." },
] as const;

export default function MissionScreen({ navigation }: Props) {
  const [selectedMission, setSelectedMission] = useState("vacina");
  const [selectedCity, setSelectedCity] = useState("igarassu");
  const [customHypothesis, setCustomHypothesis] = useState("");

  const mission = missions.find(
    (item) => item.id === selectedMission
  )!;

  const city = cities.find(
    (item) => item.id === selectedCity
  )!;

  function startSimulation() {
  if (
    selectedMission === "livre" &&
    !customHypothesis.trim()
  ) {
    Alert.alert(
      "Hipótese necessária",
      "Escreva sua hipótese antes de continuar."
    );
    return;
  }

  navigation.navigate("Simulation", {
    missionId: mission.id,
    missionTitle: mission.title,
    cityId: city.id,
    cityName: city.name,
    hypothesis:
      selectedMission === "livre"
        ? customHypothesis.trim()
        : mission.hypothesis,
  });
}

 return (
  <View style={styles.container}>
    <StatusBar
      barStyle="light-content"
    />

    <View style={{ padding: 20, backgroundColor: "#0D1117" }}>
  <Text style={{ color: "#4ADE80", fontSize: 20 }}>
    PeriferiaLab
  </Text>
</View>

    {/* Conteúdo com rolagem */}
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >

        <Text style={styles.eyebrow}>
          {mission.badge} · SAÚDE PÚBLICA
        </Text>

        <Text style={styles.heading}>{mission.heading}</Text>

        <Text style={styles.body}>{mission.body}</Text>

        {selectedMission === "livre" ? (
          <View style={styles.hypothesisBox}>
            <Text style={styles.hypothesisLabel}>
              SUA HIPÓTESE CIENTÍFICA
            </Text>
            <TextInput
              style={styles.input}
              placeholder="O que você acha que vai acontecer?"
              placeholderTextColor={COLORS.muted}
              multiline
              value={customHypothesis}
              onChangeText={setCustomHypothesis}
            />
          </View>
        ) : (
          <View style={styles.hypothesisBox}>
            <Text style={styles.hypothesisText}>
              💡 {mission.hypothesis}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          01 · ESCOLHA A MISSÃO
        </Text>

        {missions.map((item) => {
          const selected = selectedMission === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setSelectedMission(item.id)}
              style={[
                styles.missionCard,
                selected && styles.selectedCard,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.missionBadge,
                    { color: item.color },
                  ]}
                >
                  {item.badge}
                </Text>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: item.color },
                  ]}
                />
              </View>

              <Text style={styles.cardTitle}>
                {item.title}
              </Text>

              <Text style={styles.cardDescription}>
                {item.description}
              </Text>

              {selected && (
                <Text style={styles.selectedText}>
                  ✓ Selecionada
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionTitle}>
          02 · ESCOLHA A CIDADE
        </Text>

        <View style={styles.cityContainer}>
          {cities.map((item) => {
            const selected = selectedCity === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedCity(item.id)}
                style={[
                  styles.cityCard,
                  selected && styles.selectedCard,
                ]}
              >
                <Text
                  style={[
                    styles.cityName,
                    selected && { color: COLORS.green },
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.cityPopulation}>
                  {item.population}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={startSimulation}
        >
          <Text style={styles.startText}>
            ▶ Começar simulação — {mission.badge}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          SIMULADOR DE PANDEMIAS · PERIFERIALAB
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
  paddingHorizontal: 20,
  paddingTop: 24,
  paddingBottom: 48,

  },

  eyebrow: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heading: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "700",
    lineHeight: 32,
    marginBottom: 14,
  },
  body: {
    color: COLORS.secondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  hypothesisBox: {
    backgroundColor: "#0D2818",
    borderRadius: 10,
    padding: 16,
    marginBottom: 28,
  },
  hypothesisLabel: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 10,
  },
  hypothesisText: {
    color: COLORS.green,
    fontSize: 13,
    lineHeight: 20,
  },
  input: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 75,
    textAlignVertical: "top",
  },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
    marginBottom: 14,
  },
  missionCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: COLORS.green,
    backgroundColor: "#0D2818",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  missionBadge: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 5,
  },
  cardDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  selectedText: {
    color: COLORS.green,
    fontSize: 11,
    marginTop: 10,
  },
  cityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
  },
  cityCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 11,
    minWidth: 105,
  },
  cityName: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  cityPopulation: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },
  startButton: {
    backgroundColor: COLORS.greenDark,
    borderRadius: 9,
    paddingVertical: 17,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  footer: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 28,
    letterSpacing: 1,
  },

scrollView: {
  flex: 1,
},
});
