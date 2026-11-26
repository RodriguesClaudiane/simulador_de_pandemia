import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Circle, Rect, Text as SvgText } from 'react-native-svg';
import type { Theme } from '../theme/theme';
import { useTheme } from '../theme/ThemeProvider';
import type { SimulationResult } from '../simulation/simulationEngine';

type Series = { label: string; values: number[]; color: string; dashed?: boolean };
const fmt = (n: number) => n.toLocaleString('pt-BR');
const states = [
  { key: 'healthy', label: 'Suscetíveis', tone: 'susceptible' },
  { key: 'exposed', label: 'Expostos', tone: 'exposed' },
  { key: 'sick', label: 'Infectados', tone: 'infected' },
  { key: 'immune', label: 'Recuperados', tone: 'recovered' },
  { key: 'dead', label: 'Óbitos', tone: 'deceased' },
] as const;
type StateKey = typeof states[number]['key'];
function Choice({label, active, onPress, disabled = false}: {label:string; active?:boolean; onPress:()=>void; disabled?:boolean}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return <Pressable accessibilityRole="button" accessibilityState={{selected:!!active, disabled}} disabled={disabled} onPress={onPress} style={[styles.button, active && styles.active, disabled && styles.disabled]}><Text style={styles.buttonText}>{active ? '✓ ' : ''}{label}</Text></Pressable>;
}
function Plot({title, series, week, onWeek}: {title:string; series:Series[]; week:number; onWeek:(n:number)=>void}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [w,setWidth] = useState(300);
  const h=260, left=58, right=Math.max(left+1,w-14), top=16, bottom=h-34;
  const count=Math.max(0,...series.map(s=>s.values.length));
  const index=Math.max(0,Math.min(week,count-1));
  const max=Math.max(1,...series.flatMap(s=>s.values));
  const step=Math.max(1,Math.ceil(max/4)), ceiling=step*4;
  const x=(i:number)=>count<=1?(left+right)/2:left+i*(right-left)/(count-1);
  const y=(v:number)=>bottom-v/ceiling*(bottom-top);
  const ticks=[...new Set([0,Math.floor((count-1)/2),count-1])].filter(i=>i>=0);
  return <View style={styles.plot}>
    <Text style={styles.heading}>{title}</Text>
    <View onLayout={e=>setWidth(Math.max(100,e.nativeEvent.layout.width))}>
      {count>0 ? <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        {[0,1,2,3,4].map(i=><React.Fragment key={i}><Line x1={left} x2={right} y1={y(step*i)} y2={y(step*i)} stroke={colors.border}/><SvgText x={left-5} y={y(step*i)+4} fill={colors.muted} fontSize={11} textAnchor="end">{fmt(step*i)}</SvgText></React.Fragment>)}
        {ticks.map(i=><SvgText key={i} x={x(i)} y={bottom+16} fill={colors.muted} fontSize={11} textAnchor="middle">{i+1}</SvgText>)}
        <SvgText x={(left+right)/2} y={h-3} fill={colors.muted} fontSize={11} textAnchor="middle">Semana</SvgText>
        {series.map(s=><React.Fragment key={s.label}>{s.values.length>1 && <Polyline points={s.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ')} stroke={s.color} strokeWidth={2.5} strokeDasharray={s.dashed ? "7 4" : undefined} fill="none"/>}{s.values.length===1 && <Circle cx={x(0)} cy={y(s.values[0])} r={4} fill={s.color}/>}</React.Fragment>)}
        <Line x1={x(index)} x2={x(index)} y1={top} y2={bottom} stroke={colors.muted} strokeDasharray="4 4"/>
        {series.map(s=>index<s.values.length?<Circle key={s.label} cx={x(index)} cy={y(s.values[index])} r={4} fill={s.color} stroke={colors.background} strokeWidth={1}/>:null)}
        <Rect x={left} y={top} width={right-left} height={bottom-top} fill="transparent" onPress={e=>{const px=e.nativeEvent.locationX; if(Number.isFinite(px)) onWeek(Math.max(0,Math.min(count-1,Math.round((px-left)/(right-left)*(count-1)))));}}/>
      </Svg>:<Text style={styles.text}>Sem dados disponíveis.</Text>}
    </View>
    {count>0 && <><Text style={styles.text}>Toque no gráfico ou use os controles para consultar uma semana.</Text><Text accessibilityLiveRegion="polite" style={styles.week}>Semana {index+1} de {count}</Text>
    <View style={styles.row}><Choice label="Anterior" disabled={index===0} onPress={()=>onWeek(index-1)}/><Choice label="Próxima" disabled={index===count-1} onPress={()=>onWeek(index+1)}/></View>
    <View style={styles.row}><Choice label="Início" onPress={()=>onWeek(0)}/><Choice label="Meio" onPress={()=>onWeek(Math.floor((count-1)/2))}/><Choice label="Final" onPress={()=>onWeek(count-1)}/></View>
    {series.map(s=><View key={s.label} style={styles.metric}><Svg width={24} height={12}><Line x1={0} y1={6} x2={24} y2={6} stroke={s.color} strokeWidth={3} strokeDasharray={s.dashed ? "7 4" : undefined}/></Svg><Text style={[styles.text,{flex:1}]}>{s.label}</Text><Text style={styles.value}>{index<s.values.length?fmt(s.values[index]):'—'}</Text></View>)}</>}
  </View>;
}
export default function SimulationCharts({result,labelA,labelB}:{result:SimulationResult;labelA:string;labelB:string}) {
  const { theme } = useTheme();
  const { epidemiologyColors, scenarioColors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [mode,setMode]=useState<'compare'|'states'>('compare');
  const [selected,setSelected]=useState<'a'|'b'>('a');
  const [metric,setMetric]=useState<'sick'|'dead'>('sick');
  const [visible,setVisible]=useState<StateKey[]>(['exposed','sick','immune','dead']);
  const [week,setWeek]=useState(0);
  const a=result.scenario1,b=result.scenario2,s=selected==='a'?a:b;
  const series:Series[]=mode==='compare'?[{label:`A — ${labelA}`,values:a[metric],color:scenarioColors.a},{label:`B — ${labelB}`,values:b[metric],color:scenarioColors.b,dashed:true}]:states.filter(t=>visible.includes(t.key)).map(t=>({label:t.label,values:s[t.key],color:epidemiologyColors[t.tone]}));
  const peak=(values:number[])=>values.length?Math.max(...values):0;
  const peakText=(values:number[])=>values.length?`${fmt(peak(values))} · semana ${values.indexOf(peak(values))+1}`:'—';
  return <View style={styles.container}>
    <Text style={styles.title}>Análise epidemiológica</Text>
    <View style={styles.row}><Choice label="Comparação A/B" active={mode==='compare'} onPress={()=>setMode('compare')}/><Choice label="Estados SEIRD" active={mode==='states'} onPress={()=>setMode('states')}/></View>
    {mode==='compare'?<View style={styles.row}><Choice label="Infectados" active={metric==='sick'} onPress={()=>setMetric('sick')}/><Choice label="Óbitos" active={metric==='dead'} onPress={()=>setMetric('dead')}/></View>:<>
      <View style={styles.row}><Choice label="Cenário A" active={selected==='a'} onPress={()=>setSelected('a')}/><Choice label="Cenário B" active={selected==='b'} onPress={()=>setSelected('b')}/></View>
      <Text style={styles.text}>Selecione os estados. A escala se ajusta às curvas visíveis.</Text>
      <View style={styles.filters}>{states.map(t=><Pressable key={t.key} accessibilityRole="checkbox" accessibilityState={{checked:visible.includes(t.key),disabled:visible.length===1&&visible.includes(t.key)}} disabled={visible.length===1&&visible.includes(t.key)} onPress={()=>setVisible(old=>old.includes(t.key)?old.length>1?old.filter(k=>k!==t.key):old:[...old,t.key])} style={[styles.filter,visible.includes(t.key)&&{borderColor:epidemiologyColors[t.tone]}]}><View style={[styles.dot,{backgroundColor:epidemiologyColors[t.tone],opacity:visible.includes(t.key)?1:0.3}]}/><Text style={styles.buttonText}>{visible.includes(t.key)?'✓ ':''}{t.label}</Text></Pressable>)}</View>
    </>}
    <Plot title={mode==='compare'?(metric==='sick'?'Infectados ativos — comparação':'Óbitos acumulados — comparação'):`Estados epidemiológicos — ${selected.toUpperCase()}`} series={series} week={week} onWeek={setWeek}/>
    {mode==='compare'&&metric==='sick'&&<View style={styles.plot}><Text style={styles.heading}>Picos de infectados ativos</Text><Text style={[styles.value,{color:scenarioColors.a}]}>A: {peakText(a.sick)}</Text><Text style={[styles.value,{color:scenarioColors.b}]}>B: {peakText(b.sick)}</Text><Text style={styles.text}>Primeira semana com o maior valor observado.</Text></View>}
    <Text style={styles.text}>Cada ponto representa o fim de uma semana. Picos diários podem ser maiores. Resultados educacionais de uma execução, não previsões reais.</Text>
  </View>;
}
function createStyles({ colors, layout }: Theme) {
  return StyleSheet.create({container:{gap:8,paddingBottom:8},title:{color:colors.text,fontSize:18,fontWeight:'700'},plot:{gap:8,backgroundColor:colors.surface,borderRadius:12,padding:8,borderWidth:1,borderColor:colors.border},heading:{color:colors.text,fontWeight:'700',fontSize:14},text:{color:colors.muted,fontSize:12,lineHeight:18},week:{color:colors.accent,fontSize:14,fontWeight:'700',textAlign:'center'},metric:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:4},value:{color:colors.text,fontSize:14,fontWeight:'700'},dot:{width:10,height:10,borderRadius:3},row:{flexDirection:'row',gap:6},button:{flex:1,minHeight:layout.minTouchTarget,padding:6,backgroundColor:colors.control,borderRadius:8,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.controlBorder},buttonText:{color:colors.text,fontSize:12,fontWeight:'600',textAlign:'center'},active:{backgroundColor:colors.selectedSurface,borderColor:colors.accent},disabled:{opacity:0.4},filters:{flexDirection:'row',flexWrap:'wrap',gap:6},filter:{flexDirection:'row',alignItems:'center',gap:5,minHeight:layout.minTouchTarget,paddingHorizontal:8,borderRadius:8,borderWidth:1,borderColor:colors.controlBorder,backgroundColor:colors.control}});
}
