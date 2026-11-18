import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { useEffect, useRef, useState } from 'react';
import Svg, { Rect } from 'react-native-svg';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

const colors = {
  background: '#07111B',
  surface: '#0C1A27',
  raised: '#102232',
  border: '#1C3546',
  text: '#EDF7FA',
  muted: '#91A4AF',
  green: '#2DD4A7',
  greenDark: '#123F38',
  blue: '#55A8FF',
  yellow: '#F0C75E',
  red: '#FF6174',
  orange: '#E6A85C',
};

type Screen = 'home' | 'simulation';
type MissionId = 'vacina' | 'mascara' | 'nenhuma' | 'livre';

interface Mission {
  id: MissionId;
  number: string;
  title: string;
  description: string;
  accent: string;
  missionTitle: string;
  missionBody: string;
  hypothesis: string;
  defaults: InterventionSettings;
}

interface City {
  id: string;
  name: string;
  population: string;
  gridSize: number;
}

interface InterventionSettings {
  vaccination: boolean;
  vaccinationPct: number;
  vaccinationWeek: number;
  masks: boolean;
  masksAdherence: number;
  masksStart: number;
  masksEnd: number;
  distancing: boolean;
  distancingIntensity: number;
  distancingStart: number;
  distancingEnd: number;
  lockdown: boolean;
  lockdownIntensity: number;
  lockdownStart: number;
  lockdownEnd: number;
}

interface ScenarioResult {
  healthy: number[];
  sick: number[];
  dead: number[];
  immune: number[];
  finalGrid: number[][];
  finalDeaths: number;
}

interface SimResult {
  baseline: ScenarioResult;
  intervention: ScenarioResult;
}

const cities: City[] = [
  { id: 'igarassu', name: 'Igarassu', population: '115 mil hab.', gridSize: 340 },
  { id: 'goiana', name: 'Goiana', population: '81 mil hab.', gridSize: 285 },
  { id: 'itapissuma', name: 'Itapissuma', population: '27 mil hab.', gridSize: 165 },
  { id: 'itamaraca', name: 'Itamaracá', population: '24 mil hab.', gridSize: 160 },
  { id: 'aracoiaba', name: 'Araçoiaba', population: '19 mil hab.', gridSize: 140 },
];

const baseSettings: InterventionSettings = {
  vaccination: false,
  vaccinationPct: 0.6,
  vaccinationWeek: 1,
  masks: false,
  masksAdherence: 0.5,
  masksStart: 1,
  masksEnd: 52,
  distancing: false,
  distancingIntensity: 0.5,
  distancingStart: 1,
  distancingEnd: 52,
  lockdown: false,
  lockdownIntensity: 0.5,
  lockdownStart: 1,
  lockdownEnd: 52,
};

const missions: Mission[] = [
  {
    id: 'vacina',
    number: 'MISSÃO 01',
    title: 'A vacina salva vidas?',
    description: 'Teste com e sem vacina e compare os cenários.',
    accent: colors.green,
    missionTitle: 'Uma gripe chegou em Igarassu. O que você faz?',
    missionBody:
      'Um estudante da sua escola chegou gripado. Nos próximos dias, mais colegas começam a faltar. Você é responsável pela saúde da cidade.',
    hypothesis: 'Cidades que vacinam a população têm menos mortes.',
    defaults: { ...baseSettings, vaccination: true, vaccinationPct: 0.6 },
  },
  {
    id: 'mascara',
    number: 'MISSÃO 02',
    title: 'Máscara ou distanciamento?',
    description: 'Descubra qual medida protege mais pessoas.',
    accent: colors.yellow,
    missionTitle: 'O prefeito te ligou. Você tem verba para uma só medida.',
    missionBody:
      'Há casos confirmados na cidade. O orçamento é limitado. O que salva mais vidas: máscara ou distanciamento social?',
    hypothesis: 'O distanciamento social evita mais mortes do que o uso de máscara sozinho.',
    defaults: { ...baseSettings, masks: true, masksAdherence: 0.8 },
  },
  {
    id: 'nenhuma',
    number: 'MISSÃO 03',
    title: 'Sem nenhuma ação?',
    description: 'Veja o impacto quando ninguém protege a cidade.',
    accent: colors.red,
    missionTitle: 'O pior cenário. Sem vacina, máscara ou distanciamento.',
    missionBody:
      'Nenhuma medida de proteção será aplicada. Execute a simulação e observe o avanço do vírus.',
    hypothesis: 'Sem medidas, o vírus se espalha rapidamente pela cidade.',
    defaults: { ...baseSettings },
  },
  {
    id: 'livre',
    number: 'MISSÃO 04',
    title: 'Criar minha própria hipótese',
    description: 'Escolha todas as variáveis e teste uma ideia.',
    accent: colors.blue,
    missionTitle: 'Agora você é o cientista. O que quer descobrir?',
    missionBody:
      'Monte os cenários, escolha as medidas e registre sua hipótese antes de executar.',
    hypothesis: '',
    defaults: { ...baseSettings, vaccination: true, masks: true },
  },
];

function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.brandMark}>
        <View style={styles.brandBars}>
          <View style={[styles.brandBar, { height: 9 }]} />
          <View style={[styles.brandBar, { height: 14 }]} />
          <View style={[styles.brandBar, { height: 20 }]} />
          <View style={[styles.brandBar, { height: 12 }]} />
        </View>
      </View>
      <View>
        <Text style={styles.brandName}>Periferia.lab</Text>
        <Text style={styles.brandSubtitle}>SIMULADOR DE PANDEMIA</Text>
      </View>
    </View>
  );
}

function Toggle({
  value,
  onChange,
  activeColor = colors.green,
}: {
  value: boolean;
  onChange: () => void;
  activeColor?: string;
}) {
  return (
    <Pressable
      onPress={onChange}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={[styles.toggle, value && { backgroundColor: activeColor }]}
    >
      <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
    </Pressable>
  );
}

function SliderControl({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}) {
  const steps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderLabelRow}>
        <Text style={styles.controlLabel}>{label}</Text>
        <Text style={[styles.controlValue, { color }]}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={styles.sliderSteps}>
        {steps.map((step) => (
          <Pressable
            key={step}
            onPress={() => onChange(step)}
            style={[
              styles.sliderStep,
              step <= value && { backgroundColor: color },
              step === value && styles.sliderStepSelected,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function cloneGrid(gridSize: number) {
  const grid = Array.from({ length: gridSize }, () => Array<number>(gridSize).fill(0));
  grid[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = 1;
  return grid;
}

function stepScenario(
  grid: number[][],
  week: number,
  settings: InterventionSettings,
): ScenarioResult {
  const gridSize = grid.length;
  let contagion = 0.72;
  let distancing = 0;

  if (settings.masks && week >= settings.masksStart && week <= settings.masksEnd) {
    contagion *= 1 - 0.18 * settings.masksAdherence;
  }
  if (
    settings.distancing &&
    week >= settings.distancingStart &&
    week <= settings.distancingEnd
  ) {
    distancing = Math.max(distancing, 0.3 * settings.distancingIntensity);
  }
  if (settings.lockdown && week >= settings.lockdownStart && week <= settings.lockdownEnd) {
    distancing = Math.max(distancing, 0.6 * settings.lockdownIntensity);
  }

  if (
    settings.vaccination &&
    week >= settings.vaccinationWeek &&
    week < settings.vaccinationWeek + 4
  ) {
    const target = 1 - Math.pow(1 - settings.vaccinationPct, 1 / 4);
    const dose = target * 0.75;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === 0 && Math.random() < dose) grid[row][col] = 3;
      }
    }
  }

  const next = grid.map((row) => row.slice());

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const state = grid[row][col];
      if (state === 1) {
        const roll = Math.random();
        if (roll < 0.18) next[row][col] = 2;
        else if (roll < 0.68) next[row][col] = 3;

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr < 0 || nc < 0 || nr >= gridSize || nc >= gridSize) continue;
            if (next[nr][nc] !== 0) continue;
            if (Math.random() < distancing) continue;
            if (Math.random() < contagion) next[nr][nc] = 1;
          }
        }
      } else if (state === 3 && Math.random() < 0.008) {
        next[row][col] = 0;
      }
    }
  }

  const totals = [0, 0, 0, 0];
  next.forEach((row) => row.forEach((state) => totals[state]++));
  return {
    healthy: [totals[0]],
    sick: [totals[1]],
    dead: [totals[2]],
    immune: [totals[3]],
    finalGrid: next,
    finalDeaths: totals[2],
  };
}

function PopulationGrid({
  grid,
  label,
  population,
}: {
  grid: number[][];
  label: string;
  population: number;
}) {
  const { width, height } = useWindowDimensions();
  const cardWidth = width < 700
    ? (width - 32) / 2
    : Math.min(260, (height - 170) * 0.9, (width - 48) / 2);
  const displaySize = 40;
  const sourceSize = grid.length;
  const cellSize = 160 / displaySize;

  return (
    <View style={[styles.gridCard, { width: cardWidth }]}>
      <View style={styles.gridCardHeader}>
        <Text style={styles.gridCardTitle}>{label}</Text>
        <Text style={styles.gridPopulation}>{population} indivíduos</Text>
      </View>
      <View style={[styles.populationGrid, { aspectRatio: 1 }]}>
        <Svg width="100%" height="100%" viewBox="0 0 160 160">
          {Array.from({ length: displaySize * displaySize }, (_, index) => {
            const row = Math.floor(index / displaySize);
            const col = index % displaySize;
            const sourceRow = Math.min(sourceSize - 1, Math.floor((row / displaySize) * sourceSize));
            const sourceCol = Math.min(sourceSize - 1, Math.floor((col / displaySize) * sourceSize));
            const state = grid[sourceRow]?.[sourceCol] ?? 0;
            const fill =
              state === 1
                ? colors.red
                : state === 2
                  ? '#4A5056'
                  : state === 3
                    ? colors.blue
                    : '#246B43';
            return (
              <Rect
                key={index}
                x={col * cellSize}
                y={row * cellSize}
                width={cellSize + 0.03}
                height={cellSize + 0.03}
                fill={fill}
              />
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

function createInitialScenario(gridSize: number): ScenarioResult {
  const grid = cloneGrid(gridSize);
  return {
    healthy: [gridSize * gridSize - 1],
    sick: [1],
    dead: [0],
    immune: [0],
    finalGrid: grid,
    finalDeaths: 0,
  };
}

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width > 700;
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedMission, setSelectedMission] = useState<MissionId>('vacina');
  const [selectedCity, setSelectedCity] = useState('igarassu');
  const [customHypothesis, setCustomHypothesis] = useState('');
  const [result, setResult] = useState<SimResult | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [settings, setSettings] = useState<InterventionSettings>(() => ({
    ...missions[0].defaults,
  }));
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mission = missions.find((item) => item.id === selectedMission) ?? missions[0];
  const city = cities.find((item) => item.id === selectedCity) ?? cities[0];

  useEffect(() => {
    if (animationRef.current) clearInterval(animationRef.current);
    if (!result || screen !== 'simulation') return;
    animationRef.current = setInterval(() => {
      setCurrentWeek((week) => {
        if (week >= 51) {
          if (animationRef.current) clearInterval(animationRef.current);
          return week;
        }
        const nextWeek = week + 1;
        setResult((current) => {
          if (!current) return current;
          const baseline = stepScenario(
            current.baseline.finalGrid,
            nextWeek,
            { ...baseSettings },
          );
          const intervention = stepScenario(
            current.intervention.finalGrid,
            nextWeek,
            settings,
          );

          return {
            baseline: {
              ...baseline,
              healthy: [...current.baseline.healthy, ...baseline.healthy],
              sick: [...current.baseline.sick, ...baseline.sick],
              dead: [...current.baseline.dead, ...baseline.dead],
              immune: [...current.baseline.immune, ...baseline.immune],
            },
            intervention: {
              ...intervention,
              healthy: [...current.intervention.healthy, ...intervention.healthy],
              sick: [...current.intervention.sick, ...intervention.sick],
              dead: [...current.intervention.dead, ...intervention.dead],
              immune: [...current.intervention.immune, ...intervention.immune],
            },
          };
        });
        return nextWeek;
      });
    }, 500);
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [result, screen, settings]);

  const startSimulation = () => {
    setControlsOpen(false);
    setScreen('simulation');
    setCurrentWeek(0);
    setResult({
      baseline: createInitialScenario(city.gridSize),
      intervention: createInitialScenario(city.gridSize),
    });
  };

  const updateSetting = (patch: Partial<InterventionSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };


  if (screen === 'simulation') {
    const baselineWeek = result?.baseline.dead[currentWeek] ?? 0;
    const interventionWeek = result?.intervention.dead[currentWeek] ?? 0;

    return (
      <View style={styles.root}>
        <StatusBar hidden />
        <NavigationBar hidden />
        <View style={styles.header}>
          <Pressable onPress={() => setScreen('home')} accessibilityRole="button">
            <Brand />
          </Pressable>
          <View style={styles.headerActions}>
            <Text style={styles.headerMission}>{mission.number}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir medidas da simulação"
              onPress={() => setControlsOpen(true)}
              style={styles.menuButton}
            >
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.simulationContent, isWide && styles.simulationWide]}
          showsVerticalScrollIndicator={false}
        >
          {result ? (
            <>
              <View style={styles.simulationBanner}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>SIMULAÇÃO ATIVA</Text>
                </View>
                <Text style={styles.simulationTitle}>
                  {mission.title} · {city.name}
                </Text>
                <Text style={styles.weekLabel}>Semana {currentWeek + 1} de 52</Text>
              </View>

              <View style={[styles.resultsLayout, isWide && styles.resultsLayoutWide]}>
                <PopulationGrid
                  grid={result.baseline.finalGrid}
                  label="Sem intervenção"
                  population={city.gridSize * city.gridSize}
                />
                <PopulationGrid
                  grid={result.intervention.finalGrid}
                  label="Com intervenção"
                  population={city.gridSize * city.gridSize}
                />
              </View>

              <View style={styles.metricsRow}>
                <View style={[styles.metricCard, styles.metricRed]}>
                  <Text style={styles.metricValue}>
                    {baselineWeek.toLocaleString('pt-BR')}
                  </Text>
                  <Text style={styles.metricLabel}>óbitos sem ação</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={[styles.metricValue, { color: colors.green }]}>
                    {interventionWeek.toLocaleString('pt-BR')}
                  </Text>
                  <Text style={styles.metricLabel}>óbitos com ação</Text>
                </View>
              </View>

              <View style={styles.legend}>
                {[
                  ['Saudável', '#246B43'],
                  ['Infectado', colors.red],
                  ['Imune', colors.blue],
                  ['Óbito', '#4A5056'],
                ].map(([label, color]) => (
                  <View key={label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: color }]} />
                    <Text style={styles.legendText}>{label}</Text>
                  </View>
                ))}
              </View>

            </>
          ) : null}
        </ScrollView>

        <Modal
          visible={controlsOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setControlsOpen(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setControlsOpen(false)} />
          <View style={styles.controlsSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Configuração da simulação</Text>
                <Text style={styles.sheetSubtitle}>
                  {city.name} · {city.population}
                </Text>
              </View>
              <Pressable onPress={() => setControlsOpen(false)}>
                <Text style={styles.sheetClose}>×</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.controlsScroll}>
              <View style={styles.populationControl}>
                <Text style={styles.controlLabel}>População simulada</Text>
                <Text style={styles.controlValue}>{city.gridSize * city.gridSize} pessoas</Text>
              </View>

              {[
                {
                  key: 'vaccination',
                  title: 'Vacinação',
                  color: colors.green,
                  active: settings.vaccination,
                  onToggle: () => updateSetting({ vaccination: !settings.vaccination }),
                },
                {
                  key: 'masks',
                  title: 'Uso de máscaras',
                  color: colors.yellow,
                  active: settings.masks,
                  onToggle: () => updateSetting({ masks: !settings.masks }),
                },
                {
                  key: 'distancing',
                  title: 'Distanciamento social',
                  color: colors.blue,
                  active: settings.distancing,
                  onToggle: () => updateSetting({ distancing: !settings.distancing }),
                },
                {
                  key: 'lockdown',
                  title: 'Lockdown',
                  color: colors.red,
                  active: settings.lockdown,
                  onToggle: () => updateSetting({ lockdown: !settings.lockdown }),
                },
              ].map((control) => (
                <View key={control.key} style={styles.controlCard}>
                  <View style={styles.controlCardHeader}>
                    <View style={styles.controlTitleWrap}>
                      <View style={[styles.controlDot, { backgroundColor: control.color }]} />
                      <Text style={styles.controlTitle}>{control.title}</Text>
                    </View>
                    <Toggle
                      value={control.active}
                      onChange={control.onToggle}
                      activeColor={control.color}
                    />
                  </View>

                  {control.active && control.key === 'vaccination' && (
                    <SliderControl
                      label="Cobertura da vacinação"
                      value={settings.vaccinationPct}
                      onChange={(value) => updateSetting({ vaccinationPct: value })}
                      color={control.color}
                    />
                  )}
                  {control.active && control.key === 'masks' && (
                    <SliderControl
                      label="Aderência ao uso de máscaras"
                      value={settings.masksAdherence}
                      onChange={(value) => updateSetting({ masksAdherence: value })}
                      color={control.color}
                    />
                  )}
                  {control.active && control.key === 'distancing' && (
                    <SliderControl
                      label="Aderência ao distanciamento"
                      value={settings.distancingIntensity}
                      onChange={(value) => updateSetting({ distancingIntensity: value })}
                      color={control.color}
                    />
                  )}
                  {control.active && control.key === 'lockdown' && (
                    <SliderControl
                      label="Aderência ao lockdown"
                      value={settings.lockdownIntensity}
                      onChange={(value) => updateSetting({ lockdownIntensity: value })}
                      color={control.color}
                    />
                  )}
                </View>
              ))}
            </ScrollView>

            <Pressable style={styles.startButton} onPress={startSimulation}>
              <Text style={styles.startButtonText}>Executar nova simulação</Text>
            </Pressable>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <NavigationBar hidden />
      <View style={styles.header}>
        <Brand />
        <View style={styles.headerActions}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>ENTRADA · PE</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.homeContent, isWide && styles.homeWide]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainLayout, isWide && styles.mainLayoutWide]}>
          <View style={[styles.leftColumn, isWide && styles.leftColumnWide]}>
            <View style={styles.missionCard}>
              <View style={styles.missionTag}>
                <Text style={styles.missionTagText}>{mission.number}</Text>
              </View>
              <Text style={styles.heroTitle}>
                {mission.missionTitle.split('Igarassu').map((part, index, parts) =>
                  index < parts.length - 1 ? (
                    <Text key={index}>
                      {part}<Text style={styles.heroAccent}>Igarassu</Text>
                    </Text>
                  ) : (
                    <Text key={index}>{part}</Text>
                  ),
                )}
              </Text>
              <Text style={styles.heroBody}>{mission.missionBody}</Text>

              {mission.id === 'livre' ? (
                <TextInput
                  value={customHypothesis}
                  onChangeText={setCustomHypothesis}
                  placeholder="Escreva sua hipótese científica..."
                  placeholderTextColor={colors.muted}
                  multiline
                  style={styles.hypothesisInput}
                />
              ) : (
                <View style={styles.hypothesisBox}>
                  <Text style={styles.hypothesisText}>{mission.hypothesis}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>i</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Como funciona</Text>
                <Text style={styles.infoText}>
                  Compare o cenário sem ação com as medidas escolhidas ao longo de 52 semanas.
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.middleColumn, isWide && styles.middleColumnWide]}>
            <Text style={styles.sectionLabel}>ESCOLHA SUA MISSÃO</Text>
            <View style={styles.missionGrid}>
              {missions.map((item) => {
                const active = item.id === selectedMission;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setSelectedMission(item.id);
                      setSettings({ ...item.defaults });
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.missionOption,
                      active && {
                        borderColor: item.accent,
                        backgroundColor: `${item.accent}12`,
                      },
                    ]}
                  >
                    <View style={styles.missionOptionHeader}>
                      <Text style={[styles.optionNumber, { color: item.accent }]}>
                        {item.number}
                      </Text>
                      <View style={[styles.optionDot, { backgroundColor: item.accent }]} />
                    </View>
                    <Text style={styles.optionTitle}>{item.title}</Text>
                    <Text style={styles.optionDescription}>{item.description}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.cityColumn, isWide && styles.cityColumnWide]}>
            <View style={styles.cityHeader}>
              <Text style={styles.sectionLabel}>ESCOLHA A CIDADE</Text>
              <Text style={styles.cityCountry}>PE</Text>
            </View>
            {cities.map((item) => {
              const active = item.id === selectedCity;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedCity(item.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  style={[styles.cityOption, active && styles.cityOptionActive]}
                >
                  <View style={[styles.cityPin, active && styles.cityPinActive]}>
                    <Text style={styles.cityPinText}>●</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cityName, active && styles.cityNameActive]}>
                      {item.name}
                    </Text>
                    <Text style={styles.cityPopulation}>{item.population}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
              );
            })}

            <Pressable style={styles.startButton} onPress={startSimulation}>
              <Text style={styles.startButtonText}>Começar simulação</Text>
              <Text style={styles.startButtonArrow}>›</Text>
            </Pressable>
            <Text style={styles.selectionSummary}>
              {mission.number} · {city.name}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#092D43',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBars: {
    height: 21,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  brandBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.blue,
  },
  brandName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  brandSubtitle: {
    color: colors.muted,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.raised,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  menuLine: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text,
  },
  headerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.raised,
  },
  headerBadgeText: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '800',
  },
  headerMission: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '800',
  },
  homeContent: {
    flexGrow: 1,
    padding: 16,
  },
  homeWide: {
    alignItems: 'center',
  },
  mainLayout: {
    gap: 14,
  },
  mainLayoutWide: {
    width: '100%',
    maxWidth: 1120,
    flexDirection: 'row',
  },
  leftColumn: {
    gap: 12,
  },
  leftColumnWide: {
    flex: 1.12,
  },
  missionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
  },
  missionTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#12372F',
    borderWidth: 1,
    borderColor: '#1E6557',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  missionTagText: {
    color: colors.green,
    fontSize: 8,
    fontWeight: '800',
  },
  heroTitle: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
  },
  heroAccent: {
    color: colors.green,
  },
  heroBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  hypothesisBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 7,
    backgroundColor: '#0B2A28',
    borderWidth: 1,
    borderColor: '#1E6557',
  },
  hypothesisText: {
    color: '#A4D9C8',
    fontSize: 11,
    lineHeight: 16,
  },
  hypothesisInput: {
    minHeight: 74,
    marginTop: 12,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: '#0B2032',
    color: colors.text,
    padding: 10,
    fontSize: 12,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1C584A',
    backgroundColor: '#0A2927',
    padding: 11,
  },
  infoIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1A5145',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    color: colors.green,
    fontWeight: '800',
  },
  infoTitle: {
    color: '#AFE1D2',
    fontSize: 11,
    fontWeight: '700',
  },
  infoText: {
    color: '#86AA9F',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },
  middleColumn: {
    gap: 8,
  },
  middleColumnWide: {
    flex: 1.18,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  missionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  missionOption: {
    width: '48%',
    minHeight: 112,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 10,
  },
  missionOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionNumber: {
    fontSize: 8,
    fontWeight: '800',
  },
  optionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  optionDescription: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 5,
  },
  cityColumn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 7,
  },
  cityColumnWide: {
    flex: 0.82,
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cityCountry: {
    color: colors.blue,
    fontSize: 8,
    fontWeight: '800',
  },
  cityOption: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1B3445',
    backgroundColor: '#091724',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  cityOptionActive: {
    borderColor: '#23836D',
    backgroundColor: '#0A302C',
  },
  cityPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10283A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityPinActive: {
    backgroundColor: '#155647',
  },
  cityPinText: {
    color: colors.blue,
    fontSize: 7,
  },
  cityName: {
    color: '#BCD0DA',
    fontSize: 11,
    fontWeight: '700',
  },
  cityNameActive: {
    color: '#D8F6EC',
  },
  cityPopulation: {
    color: colors.muted,
    fontSize: 8,
  },
  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#496173',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.green,
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  startButton: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  startButtonText: {
    color: '#082018',
    fontSize: 12,
    fontWeight: '900',
  },
  startButtonArrow: {
    color: '#082018',
    fontSize: 22,
  },
  selectionSummary: {
    color: colors.muted,
    fontSize: 8,
    textAlign: 'center',
  },
  simulationContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  simulationWide: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  loadingCard: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  loadingText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
  },
  simulationBanner: {
    marginBottom: 6,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  liveText: {
    color: colors.green,
    fontSize: 8,
    fontWeight: '800',
  },
  simulationTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },
  weekLabel: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 3,
  },
  resultsLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  resultsLayoutWide: {
    justifyContent: 'space-between',
  },
  gridCard: {
    flex: 1,
    maxWidth: 440,
  },
  gridCardHeader: {
    marginBottom: 5,
  },
  gridCardTitle: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  gridPopulation: {
    color: colors.muted,
    fontSize: 8,
  },
  populationGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  populationCell: {
    borderWidth: 0.2,
    borderColor: '#09131A',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  metricCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 6,
  },
  metricRed: {
    borderColor: '#5A2C38',
  },
  metricValue: {
    color: colors.red,
    fontSize: 15,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 8,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: colors.muted,
    fontSize: 8,
  },
  chartCard: {
    height: 150,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 10,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartTitle: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  chartKeys: {
    flexDirection: 'row',
    gap: 8,
  },
  chartKeyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  chartKey: {
    width: 7,
    height: 7,
  },
  chartKeyText: {
    color: colors.muted,
    fontSize: 7,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    paddingTop: 12,
  },
  chartColumn: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  chartBar: {
    flex: 1,
    minHeight: 3,
  },
  chartBaseline: {
    backgroundColor: colors.red,
  },
  chartIntervention: {
    backgroundColor: colors.green,
  },
  bottomBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#0A1824',
    padding: 7,
  },
  bottomBarWide: {
    maxWidth: 650,
    alignSelf: 'center',
  },
  bottomButton: {
    flex: 1,
    height: 38,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: '#15372A',
  },
  resetButton: {
    backgroundColor: '#1A2935',
  },
  controlsButton: {
    backgroundColor: colors.green,
  },
  bottomButtonText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  controlsButtonText: {
    color: '#082018',
    fontSize: 10,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,8,12,0.72)',
  },
  controlsSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '82%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#496172',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 3,
  },
  sheetClose: {
    color: colors.muted,
    fontSize: 26,
    lineHeight: 28,
  },
  controlsScroll: {
    marginVertical: 10,
  },
  populationControl: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  controlCard: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  controlCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  controlDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  controlTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  toggle: {
    width: 38,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#40515C',
    padding: 2,
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#BBC7CC',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  sliderBlock: {
    marginTop: 8,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlLabel: {
    color: colors.muted,
    fontSize: 9,
  },
  controlValue: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '700',
  },
  sliderSteps: {
    height: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  sliderStep: {
    flex: 1,
    height: 5,
    backgroundColor: '#314652',
  },
  sliderStepSelected: {
    height: 8,
  },
});
