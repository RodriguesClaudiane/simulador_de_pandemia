import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import SettingsPanel from "../components/SettingsPanel";
import SpatialSimulation from "../components/SpatialSimulation";
import SimulationCharts from "../components/SimulationCharts";
import { SafeAreaView } from "react-native-safe-area-context";
import SegmentedControl from "../components/ui/SegmentedControl";
import AppButton from "../components/ui/AppButton";
import { colors, spacing, typography, epidemiologyColors } from "../theme/theme";
import Header from "../components/Header";
import type { RootStackParamList } from "../navigation/types";
import { CITY_POPULATION, runSimulationLocal } from "../simulation/simulationEngine";
import type { City, ScenarioResult, SimulationResult } from "../simulation/simulationEngine";
import { DISEASE_PROFILES } from "../simulation/diseaseProfiles";
import type { DiseaseId } from "../simulation/diseaseProfiles";

type Props = NativeStackScreenProps<RootStackParamList, "Simulation">;
const fmt = (n: number) => n.toLocaleString("pt-BR");

export default function SimulationScreen({ navigation, route }: Props) {
  const { missionTitle, cityName, cityId, missionId, hypothesis } = route.params;
  const [tab,setTab]=useState<"simulation"|"charts"|"results">("simulation");
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [disease, setDisease] = useState<DiseaseId>("covid");
  const [seedText,setSeedText]=useState("12345");
  const [coverage,setCoverage]=useState(80);
  const [efficacy,setEfficacy]=useState(75);
  const [campaign,setCampaign]=useState(4);
  const [deathProtection,setDeathProtection]=useState(90);
  const [intensity,setIntensity]=useState(100);
  const [maskEffect,setMaskEffect]=useState(50);
  const [distanceEffect,setDistanceEffect]=useState(50);
  const [lockEffect,setLockEffect]=useState(80);
  const [startWeek,setStartWeek]=useState(1);
  const [endWeek,setEndWeek]=useState(52);
  const [weeks, setWeeks] = useState(52);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const cancelled = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; cancelled.current = true; }; }, []);
  const validCity = Object.prototype.hasOwnProperty.call(CITY_POPULATION, cityId);
  const city = cityId as City;
  const vaccination = missionId === "vacina";
  const masks = missionId === "mascara";
  const free = missionId === "livre";
  const [freeVaccine, setFreeVaccine] = useState(false);
  const [freeMask, setFreeMask] = useState(false);
  const [freeDistance, setFreeDistance] = useState(false);
  const [freeLockdown, setFreeLockdown] = useState(false);
  const intervention = (enabled: boolean, efficacy: number) => ({ enabled, intensity: intensity/100, efficacy:efficacy/100, start: Math.min(startWeek,weeks), end: Math.min(Math.max(startWeek,endWeek),weeks) });
  async function start() {
    if (busy.current || !validCity) return;
    busy.current = true; cancelled.current = false;
    setSettingsOpen(false); setTab("simulation"); setRunning(true); setProgress(0); setResult(null); setError("");
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 0));
      if(!/^\d+$/.test(seedText)||Number(seedText)>4294967295) throw new Error("Semente inválida (0 a 4294967295)");
      const base = { city, weeks, disease, seed:Number(seedText), contagionFactor: 1, shouldCancel: () => cancelled.current };
      const update = (p: number) => { if (mounted.current) setProgress(p); };
      let data: SimulationResult;
      if (masks) {
        // O motor compara sempre controle/intervenção. Para esta missão,
        // executamos duas comparações e usamos os dois cenários com intervenção.
        const started = performance.now();
        const a = await runSimulationLocal({ ...base, masks: intervention(true,maskEffect), onProgress: (n,t) => update(n/t/2) });
        const b = await runSimulationLocal({ ...base, distancing: intervention(true,distanceEffect), onProgress: (n,t) => update(0.5+n/t/2) });
        data = { scenario1: a.scenario2, scenario2: b.scenario2, elapsedMs: performance.now()-started, seed:base.seed };
      } else {
        data = await runSimulationLocal({ ...base,
          vaccination: { enabled: vaccination || (free && freeVaccine), percentage: coverage/100, week: Math.min(startWeek,weeks), efficacy:efficacy/100, campaignWeeks:campaign, deathProtection:deathProtection/100 },
          masks: intervention(free && freeMask,maskEffect), distancing: intervention(free && freeDistance,distanceEffect), lockdown: intervention(free && freeLockdown,lockEffect),
          onProgress: (n,t) => update(n/t),
        });
      }
      if (mounted.current && !cancelled.current) setResult(data);
    } catch (e) {
      if (mounted.current) setError(cancelled.current ? "Simulação cancelada." : e instanceof Error ? e.message : String(e));
    } finally { busy.current = false; if (mounted.current) setRunning(false); }
  }
  function choices(label:string,value:number,values:number[],set:(n:number)=>void){return <View><Text style={styles.description}>{label}: {value}</Text><View style={[styles.choices,{flexWrap:"wrap"}]}>{values.map(n=><TouchableOpacity key={n} disabled={running} onPress={()=>{set(n);setResult(null);}} style={[styles.choice,n===value&&styles.selected]}><Text style={styles.buttonText}>{n}</Text></TouchableOpacity>)}</View></View>;}
  function scenario(title: string, data?: ScenarioResult) {
    const last = data ? data.healthy.length - 1 : 0;
    return <View style={styles.card}><Text style={styles.scenarioTitle}>{title}</Text>{data ? <>
      <Text style={styles.description}>População: {fmt(data.total_population)}</Text>
      {([ ["Suscetíveis", data.healthy[last], epidemiologyColors.susceptible], ["Expostos", data.exposed[last], epidemiologyColors.exposed], ["Infectados", data.sick[last], epidemiologyColors.infected], ["Mortos", data.dead[last], epidemiologyColors.deceased], ["Imunes", data.immune[last], epidemiologyColors.recovered] ] as const).map(([label, value, color]) => <View key={label} style={styles.stat}><Text style={styles.description}>{label}</Text><Text style={{color, fontWeight:"700"}}>{fmt(value)}</Text></View>)}
      <Text style={styles.description}>Resultados da última semana.</Text>
    </> : <Text style={styles.description}>Aguardando simulação.</Text>}</View>;
  }
const labelA = masks ? "Máscaras" : "Sem intervenção";
  const labelB = masks ? "Distanciamento" : missionId === "sem-intervencao" || (free && !freeVaccine && !freeMask && !freeDistance && !freeLockdown) ? "Sem intervenção (repetição)" : "Com intervenção";
  return <View style={styles.container}>
    <Header subtitle="LABORATÓRIO VIRTUAL" />
    <View style={styles.top}>
      <View style={styles.stat}><TouchableOpacity accessibilityRole="button" disabled={running} onPress={()=>navigation.goBack()}><Text style={styles.link}>‹ Missões</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityState={{expanded:settingsOpen,disabled:running}} disabled={running} onPress={()=>setSettingsOpen(v=>!v)}><Text style={styles.link}>{"⚙ Configurações"}</Text></TouchableOpacity></View>
      <Text style={styles.title}>{missionTitle}</Text>
      <Text style={styles.description}>{cityName} · {validCity ? fmt(CITY_POPULATION[city]) : "Cidade inválida"} hab. · {weeks} semanas</Text>
      {<SegmentedControl options={[{label:"Simulação",value:"simulation"},{label:"Gráficos",value:"charts"},{label:"Resultados",value:"results"}]} value={tab} onChange={setTab}/>}
    </View>
    <ScrollView key={tab} style={{flex:1}} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {tab === "simulation" && <>
        <View style={styles.card}><Text style={styles.cardLabel}>HIPÓTESE CIENTÍFICA</Text><Text style={styles.description}>{hypothesis}</Text></View>
        {result ? <SpatialSimulation result={result} labelA={labelA} labelB={labelB}/> : <View style={styles.card}><Text style={styles.scenarioTitle}>Experimento {running?"em andamento":"pronto para configurar"}</Text><Text style={styles.description}>A — {labelA}</Text><Text style={styles.description}>B — {labelB}</Text><Text style={styles.description}>Execute a simulação para visualizar a propagação espacial.</Text></View>}
      </>}
      {tab === "charts" && (result ? <SimulationCharts result={result} labelA={labelA} labelB={labelB}/> : <View style={styles.card}><Text style={styles.description}>Execute a simulação para visualizar os gráficos.</Text></View>)}
      {tab === "results" && <>
        {result && <View style={styles.card}><Text style={styles.cardLabel}>TEMPO TOTAL DO MOTOR</Text><Text style={styles.cardValue}>{(result.elapsedMs/1000).toFixed(3)} s</Text><Text style={styles.description}>Semente: {result.seed}. Execução local, sem HTTP. Não inclui renderização final.</Text></View>}
        {scenario(`CENÁRIO A — ${labelA}`,result?.scenario1)}
        {scenario(`CENÁRIO B — ${labelB}`,result?.scenario2)}
      </>}
    </ScrollView>
    <SettingsPanel visible={settingsOpen} onClose={()=>setSettingsOpen(false)} basic={<>
    <View style={styles.card}><Text style={styles.cardLabel}>PERFIL EPIDEMIOLÓGICO</Text>{(Object.keys(DISEASE_PROFILES) as DiseaseId[]).map(id => <TouchableOpacity key={id} disabled={running} onPress={() => {setDisease(id);setResult(null);}} style={[styles.choice,disease===id && styles.selected]}><Text style={styles.buttonText}>{DISEASE_PROFILES[id].name}</Text></TouchableOpacity>)}<Text style={styles.description}>Parâmetros educacionais ilustrativos, não calibrados.</Text></View>
    <View style={styles.card}><Text style={styles.cardLabel}>DURAÇÃO (SEMANAS)</Text><View style={styles.choices}>{[2,10,26,52].map(n => <TouchableOpacity key={n} disabled={running} onPress={() => {setWeeks(n);setStartWeek(1);setEndWeek(n);setResult(null);}} style={[styles.choice, weeks===n && styles.selected]}><Text style={styles.buttonText}>{n}</Text></TouchableOpacity>)}</View>
    <Text style={styles.description}>Transmissão por contato diário: {DISEASE_PROFILES[disease].transmissionPerContact * 100}%. {vaccination ? "Vacinação configurável." : masks ? "Máscaras versus distanciamento." : "Intervenções conforme a missão."}</Text>
    {free && ([ ["Vacinação",freeVaccine,setFreeVaccine], ["Máscaras",freeMask,setFreeMask], ["Distanciamento",freeDistance,setFreeDistance], ["Lockdown",freeLockdown,setFreeLockdown] ] as const).map(([label,value,set]) => <TouchableOpacity key={label} disabled={running} style={styles.choice} onPress={() => {set(!value);setResult(null);}}><Text style={styles.buttonText}>{value ? "✓ " : "○ "}{label}</Text></TouchableOpacity>)}
    {free && <Text style={styles.description}>Parâmetros educacionais, não calibrados.</Text>}
    </View>
    </>} advanced={<>
    <View style={styles.card}><Text style={styles.cardLabel}>CONFIGURAÇÃO DO EXPERIMENTO</Text>
    <Text style={styles.description}>Semente aleatória (mesma semente e parâmetros reproduzem o resultado)</Text>
    <TextInput editable={!running} keyboardType="numeric" value={seedText} onChangeText={v=>{setSeedText(v);setResult(null);}} style={{color:"#FFFFFF",backgroundColor:"#30363D",padding:12,borderRadius:8}}/>
    {(vaccination||masks||free)&&<>{choices("Semana inicial",startWeek,[1,2,4,10].filter(n=>n<=weeks),setStartWeek)}</>}
    {(vaccination||(free&&freeVaccine))&&<>{choices("Cobertura (%)",coverage,[0,25,50,80,100],setCoverage)}{choices("Eficácia contra infecção (%)",efficacy,[25,50,75,90],setEfficacy)}{choices("Proteção contra óbito (%)",deathProtection,[0,50,75,90],setDeathProtection)}{choices("Campanha (semanas)",campaign,[1,2,4,8],setCampaign)}</>}
    {(masks||(free&&(freeMask||freeDistance||freeLockdown)))&&<>{choices("Adesão/intensidade (%)",intensity,[25,50,75,100],setIntensity)}{choices("Semana final (limitada à duração)",Math.min(endWeek,weeks),[2,10,26,52].filter(n=>n<=weeks),setEndWeek)}</>}
    {(masks||(free&&freeMask))&&choices("Eficácia das máscaras (%)",maskEffect,[25,50,75,90],setMaskEffect)}
    {(masks||(free&&freeDistance))&&choices("Redução de contatos por distanciamento (%)",distanceEffect,[25,50,75,90],setDistanceEffect)}
    {(free&&freeLockdown)&&choices("Redução de contatos por lockdown (%)",lockEffect,[25,50,80,100],setLockEffect)}
    <Text style={styles.description}>Proteção vacinal: 180 dias. Valores ilustrativos. Imunes na contagem representam recuperação, não cobertura vacinal.</Text></View>
    </>}/>
    <SafeAreaView edges={["bottom"]} style={styles.bottom}>
      {!!error && <Text accessibilityRole="alert" style={{color:colors.danger}}>{error}</Text>}
      {running ? <><Text style={styles.description}>{Math.round(progress*100)}% concluído</Text><View style={styles.track}><View style={[styles.fill,{width:`${Math.round(progress*100)}%` as `${number}%`}]}/></View><AppButton label="Cancelar" variant="secondary" onPress={()=>{cancelled.current=true;}}/></> : <AppButton label={result?"Executar novamente":"Executar simulação local"} disabled={!validCity} onPress={start}/>}
    </SafeAreaView>
  </View>;
}
const styles = StyleSheet.create({
  top:{paddingHorizontal:spacing.lg,paddingVertical:spacing.sm,gap:spacing.sm,borderBottomWidth:1,borderBottomColor:colors.border},bottom:{padding:spacing.lg,gap:spacing.sm,borderTopWidth:1,borderTopColor:colors.border,backgroundColor:colors.background},link:{color:colors.accent,fontWeight:"600",paddingVertical:12},container:{flex:1,backgroundColor:colors.background},content:{padding:spacing.lg,paddingBottom:spacing.xl},label:{color:colors.accent,fontSize:11,fontWeight:"700",marginBottom:12},title:{color:colors.text,...typography.section},card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:10,padding:18,marginBottom:12},cardLabel:{color:colors.muted,fontSize:11,marginBottom:8},cardValue:{color:colors.text,fontSize:18,fontWeight:"600"},description:{color:"#B0BAC4",fontSize:14,lineHeight:22},scenarioTitle:{color:colors.accent,fontSize:14,fontWeight:"700",marginBottom:12},button:{backgroundColor:colors.primary,padding:17,borderRadius:10,alignItems:"center",marginVertical:12},buttonText:{color:colors.onPrimary,fontWeight:"700"},choices:{flexDirection:"row",flexWrap:"wrap",gap:8,marginBottom:12},choice:{backgroundColor:colors.border,padding:12,borderRadius:8,marginTop:6},selected:{backgroundColor:colors.primary},stat:{flexDirection:"row",justifyContent:"space-between",paddingVertical:5},track:{height:8,backgroundColor:colors.border,borderRadius:4,overflow:"hidden",marginVertical:10},fill:{height:8,backgroundColor:colors.accent}
});