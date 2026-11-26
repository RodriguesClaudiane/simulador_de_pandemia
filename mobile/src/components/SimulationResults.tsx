import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SimulationResult, ScenarioResult } from '../simulation/simulationEngine';
import { colors, scenarioColors, epidemiologyColors, spacing, radius, typography } from '../theme/theme';

type Props = { result: SimulationResult; labelA: string; labelB: string };
const fmt = (n: number) => n.toLocaleString('pt-BR');
const pct = (n: number) => n.toFixed(2).replace('.', ',') + '%';
function peak(s: ScenarioResult) {
  const value = Math.max(0, ...s.sick);
  return { value, week: value > 0 ? s.sick.indexOf(value) + 1 : null };
}
function Compare({ title, a, b, labelA, labelB }: {title:string; a:number; b:number; labelA:string; labelB:string}) {
  const max = Math.max(1,a,b);
  const diff = a-b;
  return <View style={styles.card}>
    <Text style={styles.heading}>{title}</Text>
    {([{label:labelA,value:a,color:scenarioColors.a,id:'A'},{label:labelB,value:b,color:scenarioColors.b,id:'B'}]).map(item => <View key={item.id} style={styles.group}>
      <Text style={[styles.caption,{color:item.color}]}>{item.id} — {item.label}</Text>
      <Text style={styles.metric}>{fmt(item.value)}</Text>
      <View style={styles.track}><View style={{height:10,backgroundColor:item.color,width:`${100*item.value/max}%` as `${number}%`}}/></View>
    </View>)}
    <Text style={[styles.heading,{color:diff>0?colors.accent:diff<0?colors.danger:colors.text}]}>{diff===0?'Sem diferença':`${fmt(Math.abs(diff))} a ${diff>0?'menos':'mais'} em B`}</Text>
    <Text style={styles.caption}>{a===0?'Variação relativa não definida (A = 0).':`${diff<0?'Aumento':diff>0?'Redução':'Variação'} relativo em B: ${pct(Math.abs(diff)/a*100)}`}</Text>
  </View>;
}
function FinalState({data,title,color}:{data:ScenarioResult;title:string;color:string}) {
  const last=data.healthy.length-1;
  const rows=[['Suscetíveis',data.healthy[last],epidemiologyColors.susceptible],['Expostos',data.exposed[last],epidemiologyColors.exposed],['Infectados ativos',data.sick[last],epidemiologyColors.infected],['Recuperados / imunes',data.immune[last],epidemiologyColors.recovered],['Óbitos',data.dead[last],epidemiologyColors.deceased]] as const;
  const p=peak(data);
  return <View style={styles.card}>
    <Text style={[styles.heading,{color}]}>{title}</Text>
    <Text style={styles.caption}>População: {fmt(data.total_population)}</Text>
    <Text style={styles.caption}>Pico observado: {fmt(p.value)} · {p.week===null?'Sem infectados nas amostras':`Semana ${p.week}`}</Text>
    <Text style={styles.caption}>Mortalidade populacional: {data.total_population>0?pct(data.final_deaths/data.total_population*100):'Não definida'}</Text>
    <Text style={styles.heading}>Estados ao final da simulação</Text>
    {rows.map(([label,value,c])=><View key={label} style={styles.row}><Text style={styles.caption}>{label}</Text><Text style={[styles.value,{color:c}]}>{value===undefined?'—':fmt(value)}</Text></View>)}
  </View>;
}
export default function SimulationResults({result,labelA,labelB}:Props) {
  const a=result.scenario1,b=result.scenario2;
  return <View style={styles.root}>
    <Text style={styles.title}>Resultados comparativos</Text>
    <Compare title="Pico de infectados ativos (amostras semanais)" a={peak(a).value} b={peak(b).value} labelA={labelA} labelB={labelB}/>
    <Compare title="Óbitos acumulados" a={a.final_deaths} b={b.final_deaths} labelA={labelA} labelB={labelB}/>
    <FinalState data={a} title={`A — ${labelA}`} color={scenarioColors.a}/>
    <FinalState data={b} title={`B — ${labelB}`} color={scenarioColors.b}/>
    <View style={styles.card}><Text style={styles.heading}>Tempo total do motor</Text><Text style={styles.metric}>{(result.elapsedMs/1000).toFixed(3)} s</Text><Text style={styles.caption}>Semente: {result.seed ?? 'Não informada'}. Execução local, sem HTTP. Não inclui renderização final.</Text></View>
    <Text style={styles.caption}>Picos observados no fim de cada semana; picos diários podem ser maiores. Mortalidade populacional não é letalidade entre infectados. Resultados educacionais de uma execução, não previsões reais.</Text>
  </View>;
}
const styles=StyleSheet.create({root:{gap:spacing.md,paddingBottom:spacing.lg},card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:spacing.lg,gap:spacing.md},group:{gap:spacing.xs},title:{...typography.section,color:colors.text},heading:{...typography.body,fontWeight:'700',color:colors.text},caption:{...typography.caption,color:'#B0BAC4'},metric:{...typography.metric,color:colors.text},value:{...typography.body,fontWeight:'700'},track:{height:10,backgroundColor:colors.control,borderRadius:radius.pill,overflow:'hidden'},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:spacing.sm}});
