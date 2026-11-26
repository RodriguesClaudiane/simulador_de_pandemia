import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { SimulationResult, ScenarioResult } from '../simulation/simulationEngine';
import type { Theme } from '../theme/theme';
import { useTheme } from '../theme/ThemeProvider';

function useSpatialTheme() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { epidemiologyColors, scenarioColors } = theme;
  const palette = [epidemiologyColors.susceptible, epidemiologyColors.exposed, epidemiologyColors.infected, epidemiologyColors.recovered, epidemiologyColors.deceased];
  return { styles, palette, scenarioColors };
}
const names = ['Suscetíveis', 'Expostos', 'Infectados', 'Recuperados', 'Óbitos'];
const fmt = (n: number) => n.toLocaleString('pt-BR');

function Grid({data, week, label, accent, zoom}: {data: ScenarioResult; week: number; label: string; accent: string; zoom: number}) {
  const { styles, palette } = useSpatialTheme();
  const {width, frames} = data.spatial;
  const frame = frames[week];
  const paths = useMemo(() => {
    const runs: string[][] = [[], [], [], [], []];
    for (let j = 0; j < frame.length;) {
      const state = frame[j], x = j % width, y = Math.floor(j / width);
      let end = j + 1;
      const limit = Math.min(frame.length, j + width - x);
      while (end < limit && frame[end] === state) end++;
      const len = end - j;
      runs[state].push(`M${x} ${y}h${len}v1h-${len}z`);
      j = end;
    }
    return runs.map(p => p.join(''));
  }, [frame, width]);
  return <View style={styles.card}>
    <Text style={[styles.heading, {color: accent}]}>{label}</Text>
    <Text style={styles.caption}>{fmt(frame.length)} habitantes</Text>
    <View style={styles.grid}>
      <Svg width="100%" height="100%" viewBox={`${(width-width/zoom)/2} ${(Math.ceil(frame.length/width)-Math.ceil(frame.length/width)/zoom)/2} ${width/zoom} ${Math.ceil(frame.length/width)/zoom}`} preserveAspectRatio="xMidYMid meet">
        {paths.map((d, i) => d ? <Path key={i} d={d} fill={palette[i]}/> : null)}
      </Svg>
    </View>
  </View>;
}

function Counts({a, b, week}: {a: ScenarioResult; b: ScenarioResult; week: number}) {
  const { styles, palette, scenarioColors } = useSpatialTheme();
  const fa = a.spatial.frames[week], fb = b.spatial.frames[week];
  const counts = useMemo(() => [fa, fb].map(frame => {
    const totals = [0, 0, 0, 0, 0];
    for (let i = 0; i < frame.length; i++) totals[frame[i]]++;
    return totals;
  }), [fa, fb]);
  return <View style={styles.card}>
    <Text style={styles.heading}>Dados epidemiológicos — semana {week}</Text>
    <View style={styles.metric}><Text style={styles.metricLabel}>Estado</Text><Text style={[styles.metricValue,{color:scenarioColors.a}]}>A</Text><Text style={[styles.metricValue,{color:scenarioColors.b}]}>B</Text></View>
    {names.map((name,i) => <View key={name} style={styles.metric}><View style={[styles.dot,{backgroundColor:palette[i]}]}/><Text style={styles.metricLabel}>{name}</Text><Text style={styles.metricValue}>{fmt(counts[0][i])}</Text><Text style={styles.metricValue}>{fmt(counts[1][i])}</Text></View>)}
    <Text style={styles.caption}>Contagens da população inteira, inclusive com zoom.</Text>
  </View>;
}

export default function SpatialSimulation({result, labelA, labelB}: {result: SimulationResult; labelA: string; labelB: string}) {
  const { styles, scenarioColors } = useSpatialTheme();
  const [week, setWeek] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [playing, setPlaying] = useState(false);
  const last = Math.min(result.scenario1.spatial.frames.length, result.scenario2.spatial.frames.length) - 1;
  const index = Math.max(0, Math.min(week, last));
  useEffect(() => {setWeek(0); setPlaying(false); setZoom(1);}, [result]);
  useEffect(() => {
    if (!playing) return;
    if (index >= last) {setPlaying(false); return;}
    const timer = setTimeout(() => setWeek(w => Math.min(w + 1, last)), 700);
    return () => clearTimeout(timer);
  }, [playing, index, last]);
  const seek = (n: number) => {setPlaying(false); setWeek(Math.max(0, Math.min(n, last)));};
  const button = (label: string, action: () => void, disabled = false, active = false) => <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={action} style={[styles.button, active && styles.active, disabled && styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
  if (last < 0) return <Text style={styles.caption}>Não há quadros espaciais disponíveis para comparação.</Text>;
  return <View style={styles.container}>
    <Text style={styles.caption}>Grades simuladas na mesma semana. Não são mapas geográficos.</Text>
    <Text style={styles.heading}>Ampliação central: {zoom}×</Text>
    <View style={styles.row}>{[1,2,4,8].map(z => <Pressable key={z} accessibilityRole="button" accessibilityState={{selected:zoom===z}} onPress={()=>setZoom(z)} style={[styles.button,zoom===z&&styles.active]}><Text style={styles.buttonText}>{zoom===z?"✓ ":""}{z}×</Text></Pressable>)}</View>
    {zoom > 1 && <Text style={styles.caption}>Recorte central ampliado nas duas grades.</Text>}
    <Grid zoom={zoom} data={result.scenario1} week={index} label={`A — ${labelA}`} accent={scenarioColors.a}/>
    <Grid zoom={zoom} data={result.scenario2} week={index} label={`B — ${labelB}`} accent={scenarioColors.b}/>
    <View style={styles.card}>
      <Text accessibilityLiveRegion="polite" style={styles.heading}>Semana {index} de {last}</Text>
      <View style={styles.track}><View style={[styles.fill, {width: `${last > 0 ? index / last * 100 : 0}%` as `${number}%`}]}/></View>
      <View style={styles.row}>{button('Anterior', () => seek(index - 1), index === 0)}{button(playing ? 'Pausar' : 'Reproduzir', () => {if (!playing && index === last) setWeek(0); setPlaying(v => !v);}, last === 0, true)}{button('Próxima', () => seek(index + 1), index === last)}</View>
      <View style={styles.row}>{button('Início', () => seek(0))}{button('Meio', () => seek(Math.floor(last / 2)))}{button('Final', () => seek(last))}</View>
    </View>
    <Counts a={result.scenario1} b={result.scenario2} week={index}/>
  </View>;
}
function createStyles({ colors, spacing, radius, layout }: Theme) {
  return StyleSheet.create({
  container:{gap:spacing.sm}, card:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,padding:spacing.sm,gap:spacing.xs},
  title:{color:colors.text,fontSize:18,fontWeight:'700'}, heading:{color:colors.text,fontSize:14,fontWeight:'700'}, caption:{color:colors.muted,fontSize:12,lineHeight:18},
  grid:{width:'100%',aspectRatio:1,backgroundColor:colors.background,borderRadius:radius.sm,overflow:'hidden'},
  metric:{flexDirection:'row',alignItems:'center',gap:4,minHeight:30}, metricLabel:{flex:1,color:colors.muted,fontSize:12}, metricValue:{minWidth:65,textAlign:'right',color:colors.text,fontSize:13,fontWeight:'700',fontVariant:['tabular-nums']},

  row:{flexDirection:'row',gap:spacing.xs}, button:{flex:1,minHeight:layout.minTouchTarget,justifyContent:'center',alignItems:'center',backgroundColor:colors.control,borderWidth:1,borderColor:colors.controlBorder,borderRadius:radius.md,padding:spacing.xs}, active:{backgroundColor:colors.selectedSurface,borderColor:colors.accent}, disabled:{opacity:0.4}, buttonText:{color:colors.text,fontSize:12,fontWeight:'600',textAlign:'center'},
  track:{height:6,backgroundColor:colors.border,borderRadius:radius.pill,overflow:'hidden'}, fill:{height:6,backgroundColor:colors.accent}, legend:{flexDirection:'row',flexWrap:'wrap',gap:spacing.md}, legendItem:{flexDirection:'row',alignItems:'center',gap:spacing.xs}, dot:{width:10,height:10,borderRadius:2}
});
}
