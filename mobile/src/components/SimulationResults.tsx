import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SimulationResult, ScenarioResult } from '../simulation/simulationEngine';
import type { Theme } from '../theme/theme';
import { useTheme } from '../theme/ThemeProvider';

function useResultsTheme() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return { styles, colors: theme.colors, scenarioColors: theme.scenarioColors, epidemiologyColors: theme.epidemiologyColors };
}

type Props = { result: SimulationResult; labelA: string; labelB: string };
const fmt = (n: number) => n.toLocaleString('pt-BR');
const pct = (n: number) => n.toFixed(2).replace('.', ',') + '%';
const show = (n: number | undefined) => n === undefined ? '—' : fmt(n);
function peak(s: ScenarioResult) {
  const value = Math.max(0, ...s.sick);
  return { value, week: value > 0 ? s.sick.indexOf(value) + 1 : null };
}
function Compare({title,a,b,detailA,detailB}: {title:string;a:number;b:number;detailA?:string;detailB?:string}) {
  const { styles, colors, scenarioColors } = useResultsTheme();
  const max = Math.max(1,a,b), diff = a-b;
  return <View style={styles.card}>
    <Text style={styles.heading}>{title}</Text>
    <View style={styles.columns}>
      {[{id:'A',value:a,color:scenarioColors.a,detail:detailA},{id:'B',value:b,color:scenarioColors.b,detail:detailB}].map(item => <View key={item.id} style={styles.column}>
        <Text style={[styles.caption,{color:item.color}]}>Cenário {item.id}</Text>
        <Text style={[styles.metric,{color:item.color}]}>{fmt(item.value)}</Text>
        <View style={styles.track}><View style={{height:7,backgroundColor:item.color,width:`${100*item.value/max}%` as `${number}%`}}/></View>
        {item.detail !== undefined && <Text style={styles.caption}>{item.detail}</Text>}
      </View>)}
    </View>
    <View style={styles.separator}/>
    <Text style={[styles.heading,{color:diff>0?colors.accent:diff<0?colors.danger:colors.text}]}>{diff===0?'Sem diferença':`${fmt(Math.abs(diff))} a ${diff>0?'menos':'mais'} em B`}</Text>
    <Text style={styles.caption}>{a===0?'Variação relativa não definida (A = 0).':diff===0?'Variação relativa em B: 0,00%.':`${diff>0?'Redução relativa':'Aumento relativo'} em B: ${pct(Math.abs(diff)/a*100)}.`}</Text>
  </View>;
}
function FinalTable({a,b}:{a:ScenarioResult;b:ScenarioResult}) {
  const { styles, scenarioColors, epidemiologyColors } = useResultsTheme();
  const last = (v:number[]) => v[v.length-1];
  const rows = [
    ['Suscetíveis',last(a.healthy),last(b.healthy),epidemiologyColors.susceptible],
    ['Expostos',last(a.exposed),last(b.exposed),epidemiologyColors.exposed],
    ['Infectados ativos',last(a.sick),last(b.sick),epidemiologyColors.infected],
    ['Recuperados / imunes',last(a.immune),last(b.immune),epidemiologyColors.recovered],
    ['Óbitos',last(a.dead),last(b.dead),epidemiologyColors.deceased],
  ] as const;
  const mortality = (s:ScenarioResult) => s.total_population>0?pct(s.final_deaths/s.total_population*100):'—';
  return <View style={styles.card}>
    <Text style={styles.heading}>Estados epidemiológicos finais</Text>
    <View style={styles.row}><Text style={styles.name}>Estado</Text><Text style={[styles.cell,{color:scenarioColors.a}]}>A</Text><Text style={[styles.cell,{color:scenarioColors.b}]}>B</Text></View>
    {rows.map(([name,va,vb,c])=><View key={name} style={styles.tableRow}>
      <View style={styles.nameGroup}><View style={[styles.dot,{backgroundColor:c}]}/><Text style={styles.name}>{name}</Text></View>
      <Text style={styles.cell}>{show(va)}</Text><Text style={styles.cell}>{show(vb)}</Text>
    </View>)}
    <View style={styles.tableRow}><Text style={styles.name}>População total</Text><Text style={styles.cell}>{fmt(a.total_population)}</Text><Text style={styles.cell}>{fmt(b.total_population)}</Text></View>
    <View style={styles.tableRow}><Text style={styles.name}>Mortalidade populacional</Text><Text style={styles.cell}>{mortality(a)}</Text><Text style={styles.cell}>{mortality(b)}</Text></View>
  </View>;
}
export default function SimulationResults({result,labelA,labelB}:Props) {
  const { styles, scenarioColors } = useResultsTheme();
  const a=result.scenario1,b=result.scenario2,pa=peak(a),pb=peak(b);
  const describe = (x:number,y:number,metric:string) => x===y?`Os cenários tiveram o mesmo ${metric}.`:`O cenário B apresentou ${metric} ${y<x?'menor':'maior'} que A.`;
  const week = (p:ReturnType<typeof peak>) => p.week===null?'Sem infectados nas amostras':`Semana ${p.week}`;
  return <View style={styles.root}>
    <Text style={styles.title}>Resultados comparativos</Text>
    <View style={styles.legend}>{[{id:'A',label:labelA,color:scenarioColors.a},{id:'B',label:labelB,color:scenarioColors.b}].map(item=><View key={item.id} style={styles.legendItem}><View style={[styles.dot,{backgroundColor:item.color}]}/><Text style={styles.name}>{item.id} — {item.label}</Text></View>)}</View>
    <Compare title="Pico de infectados ativos (amostras semanais)" a={pa.value} b={pb.value} detailA={week(pa)} detailB={week(pb)}/>
    <Compare title="Óbitos acumulados" a={a.final_deaths} b={b.final_deaths}/>
    <FinalTable a={a} b={b}/>
    <View style={styles.card}>
      <Text style={styles.heading}>Interpretação do experimento</Text>
      <Text style={styles.body}>{describe(pa.value,pb.value,'pico de infectados ativos')} {describe(a.final_deaths,b.final_deaths,'total de óbitos')}</Text>
      <Text style={styles.caption}>Compare estes resultados com a hipótese da missão. Uma única execução não comprova uma hipótese científica.</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.heading}>Informações do experimento</Text>
      {[
        ['Motor','SEIRD local'],['Semente',String(result.seed ?? 'Não informada')],
        ['Semanas registradas',a.sick.length===b.sick.length?fmt(a.sick.length):`A: ${a.sick.length} / B: ${b.sick.length}`],
        ['Tempo do motor',`${(result.elapsedMs/1000).toFixed(3)} s`],['Processamento','No dispositivo, sem HTTP'],
      ].map(([label,value])=><View key={label} style={styles.tableRow}><Text style={styles.name}>{label}</Text><Text style={styles.techValue}>{value}</Text></View>)}
      <Text style={styles.caption}>O tempo do motor não inclui a renderização final.</Text>
    </View>
    <Text style={styles.caption}>Picos observados no fim de cada semana; picos diários podem ser maiores. Mortalidade populacional não é letalidade entre infectados. Resultados educacionais de uma execução, não previsões reais.</Text>
  </View>;
}
function createStyles({ colors, spacing, radius, typography }: Theme) {
  return StyleSheet.create({
  root:{gap:spacing.sm,paddingBottom:spacing.lg},
  card:{backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:radius.lg,padding:spacing.md,gap:spacing.sm},
  title:{...typography.section,color:colors.text},heading:{...typography.body,fontWeight:'700',color:colors.text},
  caption:{...typography.caption,color:colors.muted},body:{...typography.body,color:colors.text},
  metric:{fontSize:24,lineHeight:32,fontWeight:'700',fontVariant:['tabular-nums']},
  columns:{flexDirection:'row',gap:spacing.md},column:{flex:1,minWidth:0,gap:spacing.xs},
  track:{height:7,backgroundColor:colors.control,borderRadius:radius.pill,overflow:'hidden'},
  separator:{height:1,backgroundColor:colors.border},
  row:{flexDirection:'row',alignItems:'center',gap:spacing.xs},
  tableRow:{flexDirection:'row',alignItems:'center',gap:spacing.xs,borderTopWidth:1,borderTopColor:colors.border,paddingVertical:spacing.xs},
  name:{flex:1,minWidth:0,...typography.caption,color:colors.muted},
  nameGroup:{flex:1,minWidth:0,flexDirection:'row',alignItems:'center',gap:spacing.xs},
  cell:{width:'25%',textAlign:'right',fontSize:13,fontWeight:'700',color:colors.text,fontVariant:['tabular-nums']},
  techValue:{flex:1,textAlign:'right',...typography.caption,color:colors.text},
  legend:{gap:spacing.xs},legendItem:{flexDirection:'row',alignItems:'center',gap:spacing.xs},dot:{width:9,height:9,borderRadius:2},
});
}
