import { DISEASE_PROFILES } from './diseaseProfiles';
import type { DiseaseProfile, DiseaseId } from './diseaseProfiles';
export type City = 'igarassu' | 'goiana' | 'itapissuma' | 'itamaraca' | 'aracoiaba';
export const CITY_POPULATION: Record<City, number> = {igarassu:115196, goiana:81055, itapissuma:27749, itamaraca:24540, aracoiaba:19243};
export interface Intervention { enabled:boolean; intensity:number; start:number; end:number; efficacy?:number }
export interface SimulationOptions {
  city:City; weeks:number; disease?:DiseaseId | DiseaseProfile;
  /** Relative transmission multiplier; 1 uses the profile unchanged. */
  contagionFactor?:number;
  vaccination?: {enabled:boolean; percentage:number; week:number; efficacy?:number; deathProtection?:number; campaignWeeks?:number; protectionDays?:number};
  seed?:number;
  masks?:Intervention; distancing?:Intervention; lockdown?:Intervention;
  onProgress?:(completed:number,total:number)=>void; shouldCancel?:()=>boolean;
}
export interface ScenarioResult {
  healthy:number[]; exposed:number[]; sick:number[]; dead:number[]; immune:number[];
  final_deaths:number; total_population:number;
}
export interface SimulationResult {scenario1:ScenarioResult; scenario2:ScenarioResult; elapsedMs:number; seed?:number}
const S=0,E=1,I=2,R=3,D=4;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const active=(i:Intervention|undefined,w:number)=>i?.enabled && w>=i.start && w<=i.end ? clamp(i.intensity):0;
// Stateless keyed random draws keep equivalent contacts/transitions comparable.
function draw(seed:number,day:number,person:number,event:number):number {
  let x=(seed ^ Math.imul(day,0x9e3779b1) ^ Math.imul(person+1,0x85ebca6b) ^ Math.imul(event+1,0xc2b2ae35))|0;
  x=Math.imul(x^(x>>>16),0x7feb352d); x=Math.imul(x^(x>>>15),0x846ca68b);
  return ((x^(x>>>16))>>>0)/4294967296;
}
function validate(o:SimulationOptions,p:DiseaseProfile) {
  if (!Object.prototype.hasOwnProperty.call(CITY_POPULATION,o.city)) throw new Error('Cidade inválida');
  if (!Number.isInteger(o.weeks)||o.weeks<1||o.weeks>520) throw new Error('Duração inválida');
  for(const v of [p.incubationDays,p.infectiousDays,p.immunityDays]) if(!Number.isFinite(v)||v<1) throw new Error('Duração epidemiológica inválida');
  for(const v of [p.fatalityRisk,p.transmissionPerContact,o.contagionFactor??1]) if(!Number.isFinite(v)||v<0||v>1) throw new Error('Probabilidade inválida');
  for(const i of [o.masks,o.distancing,o.lockdown]) if(i && (!Number.isFinite(i.intensity)||i.intensity<0||i.intensity>1||!Number.isInteger(i.start)||!Number.isInteger(i.end)||i.start<1||i.end<i.start)) throw new Error('Intervenção inválida');
  if(o.seed!==undefined && (!Number.isInteger(o.seed)||o.seed<0||o.seed>4294967295)) throw new Error('Semente inválida');
  for(const i of [o.masks,o.distancing,o.lockdown]) if(i?.efficacy!==undefined && (!Number.isFinite(i.efficacy)||i.efficacy<0||i.efficacy>1)) throw new Error('Eficácia inválida');
  const v=o.vaccination;
  for(const x of [v?.efficacy,v?.deathProtection]) if(x!==undefined && (!Number.isFinite(x)||x<0||x>1)) throw new Error('Proteção inválida');
  for(const x of [v?.campaignWeeks,v?.protectionDays]) if(x!==undefined && (!Number.isInteger(x)||x<1||x>3640)) throw new Error('Duração de vacinação inválida');
  if(v && (!Number.isFinite(v.percentage)||v.percentage<0||v.percentage>1||!Number.isInteger(v.week)||v.week<1)) throw new Error('Vacinação inválida');
}
async function simulate(o:SimulationOptions,p:DiseaseProfile,enabled:boolean,base:number,seed:number):Promise<ScenarioResult>{
  const n=CITY_POPULATION[o.city], width=Math.ceil(Math.sqrt(n));
  let current=new Uint8Array(n), next=new Uint8Array(n);
  current[Math.min(n-1,Math.floor(Math.ceil(n/width)/2)*width+Math.floor(width/2))]=I;
  const vaccinatedUntil=new Uint16Array(n);
  const result:ScenarioResult={healthy:[],exposed:[],sick:[],dead:[],immune:[],final_deaths:0,total_population:n};
  const cancel=()=>{if(o.shouldCancel?.()) throw new Error('Simulação cancelada');};
  const yieldUI=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
  for(let day=1;day<=o.weeks*7;day++){
    cancel(); const week=Math.ceil(day/7);
    const v=o.vaccination;
    const campaignStart=((v?.week??1)-1)*7+1;
    const campaignDays=(v?.campaignWeeks??4)*7;
    if(enabled && v?.enabled && day>=campaignStart && day<campaignStart+campaignDays){
      for(let j=0;j<n;j++){
        // Assign each targeted person exactly one campaign day, independent of disease state.
        if(current[j]!==D && draw(seed,0,j,20)<v.percentage && Math.floor(draw(seed,0,j,21)*campaignDays)===day-campaignStart)
          vaccinatedUntil[j]=day+(v.protectionDays??180);
      }
    }
    const mask=enabled?active(o.masks,week):0;
    const distance=enabled?active(o.distancing,week):0;
    const lockdown=enabled?active(o.lockdown,week):0;
    const beta=clamp(p.transmissionPerContact*(o.contagionFactor??1)*(1-(o.masks?.efficacy??.5)*mask));
    const contact=1-Math.max((o.distancing?.efficacy??.5)*distance,(o.lockdown?.efficacy??.8)*lockdown);
    next.set(current);
    for(let j=0;j<n;j++){
      const state=current[j];
      if(state===I){
        const row=Math.floor(j/width),col=j%width;
        for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
          if((dr===0&&dc===0)||row+dr<0||col+dc<0||col+dc>=width) continue;
          const k=(row+dr)*width+col+dc;
          if(k<n && current[k]===S && next[k]===S && draw(seed,day,j,30+(dr+1)*3+dc+1)<contact*beta*(vaccinatedUntil[k]>day?1-(v?.efficacy??.75):1)) next[k]=E;
        }
        if(draw(seed,day,j,1)<1/p.infectiousDays) next[j]=draw(seed,day,j,2)<p.fatalityRisk*(vaccinatedUntil[j]>day?1-(v?.deathProtection??.9):1)?D:R;
      }else if(state===E){if(draw(seed,day,j,3)<1/p.incubationDays) next[j]=I;}
      else if(state===R){if(draw(seed,day,j,4)<1/p.immunityDays) next[j]=S;}
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
  const seed=o.seed??Math.floor(Math.random()*4294967296);
  const scenario1=await simulate(o,p,false,0,seed), scenario2=await simulate(o,p,true,o.weeks,seed);
  return {scenario1,scenario2,elapsedMs:performance.now()-start,seed};
}
