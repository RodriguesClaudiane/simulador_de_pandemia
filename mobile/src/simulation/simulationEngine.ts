import { DISEASE_PROFILES } from './diseaseProfiles';
import type { DiseaseProfile, DiseaseId } from './diseaseProfiles';
export type City = 'igarassu' | 'goiana' | 'itapissuma' | 'itamaraca' | 'aracoiaba';
export const CITY_POPULATION: Record<City, number> = {igarassu:115196, goiana:81055, itapissuma:27749, itamaraca:24540, aracoiaba:19243};
export interface Intervention { enabled:boolean; intensity:number; start:number; end:number }
export interface SimulationOptions {
  city:City; weeks:number; disease?:DiseaseId | DiseaseProfile;
  /** Relative transmission multiplier; 1 uses the profile unchanged. */
  contagionFactor?:number;
  vaccination?: {enabled:boolean; percentage:number; week:number};
  masks?:Intervention; distancing?:Intervention; lockdown?:Intervention;
  onProgress?:(completed:number,total:number)=>void; shouldCancel?:()=>boolean;
}
export interface ScenarioResult {
  healthy:number[]; exposed:number[]; sick:number[]; dead:number[]; immune:number[];
  final_deaths:number; total_population:number;
}
export interface SimulationResult {scenario1:ScenarioResult; scenario2:ScenarioResult; elapsedMs:number}
const S=0,E=1,I=2,R=3,D=4;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const active=(i:Intervention|undefined,w:number)=>i?.enabled && w>=i.start && w<=i.end ? clamp(i.intensity):0;
function validate(o:SimulationOptions,p:DiseaseProfile) {
  if (!Object.prototype.hasOwnProperty.call(CITY_POPULATION,o.city)) throw new Error('Cidade inválida');
  if (!Number.isInteger(o.weeks)||o.weeks<1||o.weeks>520) throw new Error('Duração inválida');
  for(const v of [p.incubationDays,p.infectiousDays,p.immunityDays]) if(!Number.isFinite(v)||v<1) throw new Error('Duração epidemiológica inválida');
  for(const v of [p.fatalityRisk,p.transmissionPerContact,o.contagionFactor??1]) if(!Number.isFinite(v)||v<0||v>1) throw new Error('Probabilidade inválida');
  for(const i of [o.masks,o.distancing,o.lockdown]) if(i && (!Number.isFinite(i.intensity)||i.intensity<0||i.intensity>1||!Number.isInteger(i.start)||!Number.isInteger(i.end)||i.start<1||i.end<i.start)) throw new Error('Intervenção inválida');
  const v=o.vaccination; if(v && (!Number.isFinite(v.percentage)||v.percentage<0||v.percentage>1||!Number.isInteger(v.week)||v.week<1)) throw new Error('Vacinação inválida');
}
async function simulate(o:SimulationOptions,p:DiseaseProfile,enabled:boolean,base:number):Promise<ScenarioResult>{
  const n=CITY_POPULATION[o.city], width=Math.ceil(Math.sqrt(n));
  let current=new Uint8Array(n), next=new Uint8Array(n);
  current[Math.min(n-1,Math.floor(Math.ceil(n/width)/2)*width+Math.floor(width/2))]=I;
  const result:ScenarioResult={healthy:[],exposed:[],sick:[],dead:[],immune:[],final_deaths:0,total_population:n};
  const cancel=()=>{if(o.shouldCancel?.()) throw new Error('Simulação cancelada');};
  const yieldUI=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
  for(let day=1;day<=o.weeks*7;day++){
    cancel(); const week=Math.ceil(day/7);
    // Transitional vaccination model: successful doses move susceptible people to R.
    const v=o.vaccination;
    if(enabled && v?.enabled && day===(v.week-1)*7+1){
      for(let j=0;j<n;j++) if(current[j]===S && Math.random()<v.percentage*.75) current[j]=R;
    }
    const mask=enabled?active(o.masks,week):0;
    const distance=enabled?active(o.distancing,week):0;
    const lockdown=enabled?active(o.lockdown,week):0;
    const beta=clamp(p.transmissionPerContact*(o.contagionFactor??1)*(1-.18*mask)*(1-Math.max(.30*distance,.60*lockdown)));
    next.set(current);
    for(let j=0;j<n;j++){
      const state=current[j];
      if(state===I){
        const row=Math.floor(j/width),col=j%width;
        for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
          if((dr===0&&dc===0)||row+dr<0||col+dc<0||col+dc>=width) continue;
          const k=(row+dr)*width+col+dc;
          if(k<n && current[k]===S && next[k]===S && Math.random()<beta) next[k]=E;
        }
        if(Math.random()<1/p.infectiousDays) next[j]=Math.random()<p.fatalityRisk?D:R;
      }else if(state===E){if(Math.random()<1/p.incubationDays) next[j]=I;}
      else if(state===R){if(Math.random()<1/p.immunityDays) next[j]=S;}
    }
    [current,next]=[next,current];
    if(day%7===0){
      const counts=[0,0,0,0,0]; for(let j=0;j<n;j++) counts[current[j]]++;
      result.healthy.push(counts[S]); result.exposed.push(counts[E]); result.sick.push(counts[I]); result.immune.push(counts[R]); result.dead.push(counts[D]);
      o.onProgress?.(base+week,o.weeks*2);
    }
    await yieldUI();
  }
  cancel(); result.final_deaths=result.dead[result.dead.length-1]; return result;
}
export async function runSimulationLocal(o:SimulationOptions):Promise<SimulationResult>{
  const disease=o.disease??'covid';
  const p=typeof disease==='string'?DISEASE_PROFILES[disease]:disease;
  if(!p) throw new Error('Perfil inválido'); validate(o,p);
  const start=performance.now();
  const scenario1=await simulate(o,p,false,0), scenario2=await simulate(o,p,true,o.weeks);
  return {scenario1,scenario2,elapsedMs:performance.now()-start};
}
