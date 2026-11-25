import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import type { SimulationResult } from '../simulation/simulationEngine';

type Series = { label: string; values: number[]; color: string };
const fmt = (n: number) => n.toLocaleString('pt-BR');
function Plot({ title, series }: { title: string; series: Series[] }) {
  const { width } = useWindowDimensions();
  const w = Math.max(220, Math.min(700, width - 80)), h = 210;
  const left = 62, right = w - 12, top = 12, bottom = h - 34;
  const count = Math.max(1, ...series.map(s => s.values.length));
  const max = Math.max(1, ...series.flatMap(s => s.values));
  const ceiling = Math.ceil(max / 4) * 4;
  const x = (i: number) => count === 1 ? (left + right) / 2 : left + i * (right-left)/(count-1);
  const y = (v: number) => bottom - v/ceiling*(bottom-top);
  const ticks = [...new Set([0, Math.floor((count-1)/2), count-1])];
  return <View style={styles.plot}>
    <Text style={styles.heading}>{title}</Text>
    <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
      {[0,1,2,3,4].map(i => {const v = ceiling*i/4; return <React.Fragment key={i}><Line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke="#30363D"/><SvgText x={left-5} y={y(v)+4} fill="#B0BAC4" fontSize={10} textAnchor="end">{fmt(v)}</SvgText></React.Fragment>;})}
      {ticks.map(i => <SvgText key={i} x={x(i)} y={bottom+15} fill="#B0BAC4" fontSize={10} textAnchor="middle">{i+1}</SvgText>)}
      <SvgText x={(left+right)/2} y={h-3} fill="#B0BAC4" fontSize={10} textAnchor="middle">Semana</SvgText>
      {series.map(s => <React.Fragment key={s.label}><Polyline points={s.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ')} stroke={s.color} strokeWidth={2} fill="none"/>{s.values.length===1 && <Circle cx={x(0)} cy={y(s.values[0])} r={3} fill={s.color}/>}</React.Fragment>)}
    </Svg>
    {series.map(s=><View key={s.label} style={styles.legend}><View style={[styles.dot,{backgroundColor:s.color}]}/><Text style={styles.text}>{s.label}</Text></View>)}
  </View>;
}
export default function SimulationCharts({result,labelA,labelB}:{result:SimulationResult;labelA:string;labelB:string}) {
  const [selected,setSelected]=useState<'a'|'b'>('a');
  const a=result.scenario1,b=result.scenario2,s=selected==='a'?a:b;
  const peak=(v:number[])=>Math.max(0,...v);
  const diff=a.final_deaths-b.final_deaths;
  const comparison=(key:'sick'|'dead'):Series[]=>[{label:`A — ${labelA}`,values:a[key],color:'#F59E0B'},{label:`B — ${labelB}`,values:b[key],color:'#60A5FA'}];
  return <View style={styles.card}>
    <Text style={styles.heading}>ANÁLISE COMPARATIVA</Text>
    <Text style={styles.text}>A: {labelA} · B: {labelB}</Text>
    <View style={styles.row}>{(['a','b'] as const).map(id=><TouchableOpacity key={id} accessibilityRole="button" accessibilityState={{selected:selected===id}} onPress={()=>setSelected(id)} style={[styles.button,selected===id&&styles.active]}><Text style={styles.heading}>Cenário {id.toUpperCase()}</Text></TouchableOpacity>)}</View>
    <Plot title="Estados epidemiológicos" series={[{label:'Suscetíveis',values:s.healthy,color:'#4ADE80'},{label:'Expostos',values:s.exposed,color:'#F59E0B'},{label:'Infectados',values:s.sick,color:'#F87171'},{label:'Recuperados / imunes',values:s.immune,color:'#60A5FA'},{label:'Óbitos',values:s.dead,color:'#C4B5FD'}]}/>
    <Plot title="Infectados ativos — comparação" series={comparison('sick')}/>
    <Plot title="Óbitos acumulados — comparação" series={comparison('dead')}/>
    <Text style={styles.heading}>Indicadores</Text>
    <Text style={styles.text}>Pico semanal de infectados A: {fmt(peak(a.sick))}</Text>
    <Text style={styles.text}>Pico semanal de infectados B: {fmt(peak(b.sick))}</Text>
    <Text style={styles.text}>Óbitos A: {fmt(a.final_deaths)} · B: {fmt(b.final_deaths)}</Text>
    <Text style={styles.text}>Diferença de óbitos (A − B): {fmt(diff)}</Text>
    <Text style={styles.text}>Variação relativa (B em relação a A): {a.final_deaths===0?'Não definida (A = 0)':`${((b.final_deaths-a.final_deaths)/a.final_deaths*100).toFixed(1)}%`}</Text>
    <Text style={styles.text}>Cada ponto representa o fim de uma semana. Picos diários podem ser maiores. Resultados educacionais de uma execução, não previsões reais.</Text>
  </View>;
}
const styles=StyleSheet.create({card:{backgroundColor:'#161B22',borderColor:'#30363D',borderWidth:1,borderRadius:10,padding:14,marginBottom:12,gap:10},plot:{gap:5,marginVertical:8},heading:{color:'#E6EDF3',fontWeight:'700',fontSize:14},text:{color:'#B0BAC4',fontSize:12,lineHeight:19},legend:{flexDirection:'row',alignItems:'center',gap:7},dot:{width:10,height:10,borderRadius:3},row:{flexDirection:'row',gap:8},button:{flex:1,padding:10,backgroundColor:'#30363D',borderRadius:8,alignItems:'center'},active:{backgroundColor:'#238636'}});
