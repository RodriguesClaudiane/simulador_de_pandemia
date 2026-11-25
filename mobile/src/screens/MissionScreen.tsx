import React, { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, TextInput, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppText from '../components/ui/AppText';
import SectionHeader from '../components/ui/SectionHeader';
import { colors, spacing, radius, layout } from '../theme/theme';
type Props = NativeStackScreenProps<RootStackParamList, 'Mission'>;
const missions = [
  {
    id: "vacina",
    badge: "MISSÃO 01",
    title: "A vacina salva vidas?",
    description: "Teste com e sem vacina e compare os resultados.",
    heading: "Uma doença chegou à cidade. O que você faz?",
    body: "Um estudante da sua escola chegou gripado. Nos próximos dias, mais colegas começam a faltar. Você é o responsável pela saúde da cidade — decide: vacinar, exigir máscaras, pedir distanciamento... ou não fazer nada?",
    hypothesis: "Cidades que vacinam a população têm menos mortes do que cidades que não vacinam, mesmo com o mesmo vírus.",
    color: colors.accent,
  },
  {
    id: "mascara",
    badge: "MISSÃO 02",
    title: "Máscara ou distanciamento?",
    description: "Qual medida evita mais mortes quando usada sozinha?",
    heading: "O prefeito te ligou. Você tem verba para uma só medida.",
    body: "Há casos confirmados na cidade. O orçamento é limitado — só dá para uma medida. O que salva mais vidas: obrigar máscara em lugares públicos ou pedir que as pessoas fiquem em casa?",
    hypothesis: "O distanciamento social evita mais mortes do que o uso de máscara quando apenas uma dessas medidas é adotada.",
    color: colors.warning,
  },
  {
    id: "sem-intervencao",
    badge: "MISSÃO 03",
    title: "O que acontece sem nenhuma ação?",
    description: "Veja o impacto simulado quando ninguém toma nenhuma medida.",
    heading: "O pior cenário. Sem vacina, sem máscara, sem nada.",
    body: "Nenhuma vacina, máscara, distanciamento ou lockdown. O vírus se espalha livremente. Execute a simulação e veja os resultados simulados.",
    hypothesis: "Sem nenhuma medida de proteção, o número de infectados e de mortes tende a ser maior do que em um cenário com medidas de proteção.",
    color: colors.danger,
  },
  {
    id: "livre",
    badge: "MISSÃO 04",
    title: "Criar minha própria hipótese",
    description: "Você escolhe todas as variáveis e define o que quer testar.",
    heading: "Agora você é o cientista. O que você quer descobrir?",
    body: "Monte os dois cenários do zero. Escolha a taxa de transmissão, as medidas e a cidade. Antes de rodar, escreva o que você acha que vai acontecer — isso é uma hipótese científica.",
    hypothesis: "",
    color: colors.info,
  },
] as const;

const cities = [
  { id: "igarassu", name: "Igarassu", population: "115.196 hab." },
  { id: "goiana", name: "Goiana", population: "81.055 hab." },
  { id: "itapissuma", name: "Itapissuma", population: "27.749 hab." },
  { id: "itamaraca", name: "Itamaracá", population: "24.540 hab." },
  { id: "aracoiaba", name: "Araçoiaba", population: "19.243 hab." },
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
      <StatusBar barStyle="light-content" />
      <Header />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SectionHeader eyebrow="LABORATÓRIO VIRTUAL" title="Escolha seu desafio" description="Explore como diferentes medidas afetam a propagação de doenças." />
        <SectionHeader eyebrow="01 · MISSÃO" title="O que você quer investigar?" />
        <View style={styles.stack}>
          {missions.map(item => {
            const selected = selectedMission === item.id;
            return <Pressable key={item.id} accessibilityRole="button" accessibilityState={{selected}} onPress={() => setSelectedMission(item.id)}>
              <AppCard selected={selected} style={styles.mission}>
                <View style={styles.row}><AppText variant="caption" style={{color:item.color, fontWeight:'700'}}>{item.badge}</AppText><AppText variant="caption" tone={selected?'accent':'muted'}>{selected?'✓ Selecionada':'○'}</AppText></View>
                <AppText variant="button">{item.title}</AppText>
                <AppText variant="caption" tone="muted">{item.description}</AppText>
              </AppCard>
            </Pressable>;
          })}
        </View>
        <SectionHeader eyebrow="02 · INVESTIGAÇÃO" title="Entenda o desafio" />
        <AppCard style={styles.stack}>
          <AppText variant="section">{mission.heading}</AppText>
          <AppText>{mission.body}</AppText>
          <View style={styles.hypothesis}>
            <AppText variant="caption" tone="accent">HIPÓTESE CIENTÍFICA</AppText>
            {selectedMission === 'livre' ? <TextInput accessibilityLabel="Sua hipótese científica" multiline style={styles.input} placeholder="O que você acha que vai acontecer?" placeholderTextColor={colors.muted} value={customHypothesis} onChangeText={setCustomHypothesis} /> : <AppText>{mission.hypothesis}</AppText>}
          </View>
        </AppCard>
        <SectionHeader eyebrow="03 · MUNICÍPIO" title="Onde vamos simular?" description="População utilizada no modelo." />
        <View style={styles.grid}>
          {cities.map(item => {
            const selected = selectedCity === item.id;
            return <Pressable key={item.id} style={styles.city} accessibilityRole="button" accessibilityState={{selected}} onPress={() => setSelectedCity(item.id)}>
              <AppCard selected={selected} style={styles.cityCard}>
                <AppText variant="button" tone={selected?'accent':'text'}>{item.name}{selected?' ✓':''}</AppText>
                <AppText variant="caption" tone="muted">{item.population}</AppText>
              </AppCard>
            </Pressable>;
          })}
        </View>
        <AppText variant="caption" tone="muted">Modelo educacional. Os resultados não são previsões epidemiológicas reais.</AppText>
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <AppText variant="caption" tone="muted">{mission.badge} · {city.name}</AppText>
        <AppButton label="Começar simulação →" onPress={startSimulation} />
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:colors.background}, scroll:{flex:1},
  content:{padding:layout.screenPadding,gap:spacing.lg,paddingBottom:spacing.xl},
  stack:{gap:spacing.sm}, mission:{gap:spacing.xs},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:spacing.sm},
  hypothesis:{backgroundColor:colors.selectedSurface,borderRadius:radius.md,padding:spacing.md,gap:spacing.sm},
  input:{color:colors.text,fontSize:14,minHeight:96,textAlignVertical:'top',borderWidth:1,borderColor:colors.border,borderRadius:radius.sm,padding:spacing.sm},
  grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:spacing.sm},
  city:{width:'48.5%'},cityCard:{minHeight:76,padding:spacing.md,justifyContent:'center',gap:spacing.xs},
  footer:{backgroundColor:colors.background,borderTopWidth:1,borderTopColor:colors.border,paddingHorizontal:layout.screenPadding,paddingTop:spacing.sm,paddingBottom:spacing.sm,gap:spacing.sm},
});