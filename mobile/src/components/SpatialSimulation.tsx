import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { SimulationResult } from '../simulation/simulationEngine';
const colors = ['#22C55E','#EAB308','#EF4444','#60A5FA','#94A3B8'];
const names = ['Suscetíveis','Expostos','Infectados','Recuperados','Falecidos'];
export default function SpatialSimulation({result,labelA,labelB}:{result:SimulationResult;labelA:string;labelB:string}) {
  const [scenario,setScenario]=useState(0);
  const [week,setWeek]=useState(0);
  const [playing,setPlaying]=useState(false);
  const spatial=(scenario===0?result.scenario1:result.scenario2).spatial;
  const last=spatial.frames.length-1;
  const index=Math.min(week,last);
  useEffect(()=>{setWeek(0);setPlaying(false);},[result]);
  useEffect(()=>{
    if(!playing)return;
    if(index>=last){setPlaying(false);return;}
    const timer=setTimeout(()=>setWeek(w=>Math.min(w+1,last)),400);
    return ()=>clearTimeout(timer);
  },[playing,index,last]);
  const frame=spatial.frames[index];
  const {paths,counts}=useMemo(()=>{
    const paths:string[][]=[[],[],[],[],[]]; const counts=[0,0,0,0,0];
    // Exact horizontal runs: five SVG paths, not one React element per person.
    for(let j=0;j<frame.length;){
      const state=frame[j], x=j%spatial.width,y=Math.floor(j/spatial.width);
      let end=j+1; const limit=Math.min(frame.length,j+spatial.width-x);
      while(end<limit&&frame[end]===state)end++;
      const len=end-j;counts[state]+=len;
      paths[state].push(`M${x} ${y}h${len}v1h-${len}z`);j=end;
    }
    return {paths:paths.map(p=>p.join('')),counts};
  },[frame,spatial.width]);
  const button=(label:string,action:()=>void,selected=false)=><TouchableOpacity accessibilityRole="button" onPress={action} style={[styles.button,selected&&styles.selected]}><Text style={styles.text}>{label}</Text></TouchableOpacity>;
  return <View style={styles.card}>
    <Text style={styles.title}>PROPAGAÇÃO ESPACIAL</Text>
    <Text style={styles.text}>Grade simulada — não é um mapa geográfico.</Text>
    <View style={styles.row}>{button(labelA,()=>setScenario(0),scenario===0)}{button(labelB,()=>setScenario(1),scenario===1)}</View>
    <Svg width="100%" height={300} viewBox={`0 0 ${spatial.width} ${Math.ceil(frame.length/spatial.width)}`}>
      {paths.map((d,i)=>d?<Path key={i} d={d} fill={colors[i]}/>:null)}
    </Svg>
    <Text style={styles.title}>Semana {index} / {last}</Text>
    <View style={styles.row}>{button('Anterior',()=>{setPlaying(false);setWeek(Math.max(0,index-1));})}{button(playing?'Pausar':'Reproduzir',()=>{if(!playing&&index===last)setWeek(0);setPlaying(!playing);})}{button('Próxima',()=>{setPlaying(false);setWeek(Math.min(last,index+1));})}{button('Reiniciar',()=>{setPlaying(false);setWeek(0);})}</View>
    <View style={styles.row}>{button('Início',()=>{setPlaying(false);setWeek(0);})}{button('Meio',()=>{setPlaying(false);setWeek(Math.floor(last/2));})}{button('Final',()=>{setPlaying(false);setWeek(last);})}</View>
    {names.map((name,i)=><View key={name} style={styles.row}><View style={{width:12,height:12,backgroundColor:colors[i]}}/><Text style={styles.text}>{name}: {counts[i].toLocaleString('pt-BR')}</Text></View>)}
    <Text style={styles.text}>População: {frame.length.toLocaleString('pt-BR')}</Text>
  </View>;
}
const styles=StyleSheet.create({card:{backgroundColor:'#161B22',padding:14,borderRadius:12,gap:10},title:{color:'#4ADE80',fontWeight:'bold',fontSize:16},text:{color:'#E5E7EB',fontSize:13},row:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:8},button:{padding:10,backgroundColor:'#30363D',borderRadius:6},selected:{backgroundColor:'#166534'}});
