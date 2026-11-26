import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { SimulationResult, ScenarioResult } from '../simulation/simulationEngine';
import { colors, epidemiologyColors, scenarioColors, spacing, radius, layout } from '../theme/theme';

const palette = [epidemiologyColors.susceptible, epidemiologyColors.exposed, epidemiologyColors.infected, epidemiologyColors.recovered, epidemiologyColors.deceased];
const names = ['Suscetíveis', 'Expostos', 'Infectados', 'Recuperados', 'Óbitos'];
const fmt = (n: number) => n.toLocaleString('pt-BR');

function Grid({data, week, label, accent}: {data: ScenarioResult; week: number; label: string; accent: string}) {
  const {width, frames} = data.spatial;
  const frame = frames[week];
  const {paths, counts} = useMemo(() => {
    const runs: string[][] = [[], [], [], [], []];
    const counts = [0, 0, 0, 0, 0];
    for (let j = 0; j < frame.length;) {
      const state = frame[j], x = j % width, y = Math.floor(j / width);
      let end = j + 1;
      const limit = Math.min(frame.length, j + width - x);
      while (end < limit && frame[end] === state) end++;
      const len = end - j;
      counts[state] += len;
      runs[state].push(`M${x} ${y}h${len}v1h-${len}z`);
      j = end;
    }
    return {paths: runs.map(p => p.join('')), counts};
  }, [frame, width]);
  return <View style={styles.card}>
    <Text style={[styles.heading, {color: accent}]}>{label}</Text>
    <Text style={styles.caption}>{fmt(frame.length)} habitantes</Text>
    <View style={styles.grid}>
      <Svg width="100%" height={190} viewBox={`0 0 ${width} ${Math.ceil(frame.length / width)}`} preserveAspectRatio="xMidYMid meet">
        {paths.map((d, i) => d ? <Path key={i} d={d} fill={palette[i]}/> : null)}
      </Svg>
    </View>
    <View style={styles.counts}>
      {names.map((name, i) => <View key={name} style={styles.metric}><Text style={styles.caption}>{name}</Text><Text style={[styles.heading, {color: palette[i]}]}>{fmt(counts[i])}</Text></View>)}
    </View>
  </View>;
}

export default function SpatialSimulation({result, labelA, labelB}: {result: SimulationResult; labelA: string; labelB: string}) {
  const [week, setWeek] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = Math.min(result.scenario1.spatial.frames.length, result.scenario2.spatial.frames.length) - 1;
  const index = Math.max(0, Math.min(week, last));
  useEffect(() => {setWeek(0); setPlaying(false);}, [result]);
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
    <Text style={styles.title}>Comparação espacial</Text>
    <Text style={styles.caption}>Grades simuladas na mesma semana. Não são mapas geográficos.</Text>
    <View style={styles.card}>
      <Text accessibilityLiveRegion="polite" style={styles.heading}>Semana {index} de {last}</Text>
      <View style={styles.track}><View style={[styles.fill, {width: `${last > 0 ? index / last * 100 : 0}%` as `${number}%`}]}/></View>
      <View style={styles.row}>{button('Anterior', () => seek(index - 1), index === 0)}{button(playing ? 'Pausar' : 'Reproduzir', () => {if (!playing && index === last) setWeek(0); setPlaying(v => !v);}, last === 0, true)}{button('Próxima', () => seek(index + 1), index === last)}</View>
      <View style={styles.row}>{button('Início', () => seek(0))}{button('Meio', () => seek(Math.floor(last / 2)))}{button('Final', () => seek(last))}</View>
    </View>
    <Grid data={result.scenario1} week={index} label={`A — ${labelA}`} accent={scenarioColors.a}/>
    <Grid data={result.scenario2} week={index} label={`B — ${labelB}`} accent={scenarioColors.b}/>
    <View style={styles.legend}>{names.map((name, i) => <View key={name} style={styles.legendItem}><View style={[styles.dot, {backgroundColor: palette[i]}]}/><Text style={styles.caption}>{name}</Text></View>)}</View>
  </View>;
}
const styles = StyleSheet.create({
  container:{gap:spacing.md}, card:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,padding:spacing.md,gap:spacing.sm},
  title:{color:colors.text,fontSize:18,fontWeight:'700'}, heading:{color:colors.text,fontSize:14,fontWeight:'700'}, caption:{color:colors.muted,fontSize:12,lineHeight:18},
  grid:{backgroundColor:colors.background,borderRadius:radius.md,overflow:'hidden',padding:spacing.xs}, counts:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm}, metric:{minWidth:'29%',flexGrow:1},
  row:{flexDirection:'row',gap:spacing.xs}, button:{flex:1,minHeight:layout.minTouchTarget,justifyContent:'center',alignItems:'center',backgroundColor:colors.control,borderRadius:radius.md,padding:spacing.xs}, active:{backgroundColor:colors.primary}, disabled:{opacity:0.4}, buttonText:{color:colors.text,fontSize:12,fontWeight:'600',textAlign:'center'},
  track:{height:6,backgroundColor:colors.border,borderRadius:radius.pill,overflow:'hidden'}, fill:{height:6,backgroundColor:colors.accent}, legend:{flexDirection:'row',flexWrap:'wrap',gap:spacing.md}, legendItem:{flexDirection:'row',alignItems:'center',gap:spacing.xs}, dot:{width:10,height:10,borderRadius:2}
});
