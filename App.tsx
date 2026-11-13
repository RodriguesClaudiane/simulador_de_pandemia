import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

const colors = {
  background: '#06121F',
  panel: '#0A1B2A',
  panelRaised: '#0D2233',
  border: '#17384B',
  text: '#F1F7FA',
  muted: '#8AA4B5',
  green: '#00D084',
  greenDark: '#063B35',
  blue: '#39A8FF',
  yellow: '#F4CB58',
  red: '#FF6578',
};

const missions = [
  {
    id: 'vaccine',
    number: 'MISSÃO 01',
    title: 'A vacina salva vidas?',
    description: 'Teste com e sem vacina e compare os cenários.',
    accent: colors.green,
    icon: '✚',
  },
  {
    id: 'mask',
    number: 'MISSÃO 02',
    title: 'Máscara ou distanciamento?',
    description: 'Qual medida evita mais mortes quando a gripe se espalha?',
    accent: colors.yellow,
    icon: '◈',
  },
  {
    id: 'none',
    number: 'MISSÃO 03',
    title: 'O que acontece sem nenhuma ação?',
    description: 'Veja o impacto real quando ninguém toma nenhuma medida.',
    accent: colors.red,
    icon: '!',
  },
  {
    id: 'custom',
    number: 'MISSÃO 04',
    title: 'Criar minha própria hipótese',
    description: 'Escolha as variáveis e defina o que você quer testar.',
    accent: colors.blue,
    icon: '✳',
  },
];

const cities = [
  { id: 'igarassu', name: 'Igarassu', population: '115 mil hab.' },
  { id: 'goiana', name: 'Goiana', population: '81 mil hab.' },
  { id: 'itapissuma', name: 'Itapissuma', population: '23 mil hab.' },
  { id: 'itamaraca', name: 'Itamaracá', population: '24 mil hab.' },
  { id: 'aracoiaba', name: 'Araçoiaba', population: '31 mil hab.' },
];

export default function App() {
  const { width, height } = useWindowDimensions();
  const [selectedMission, setSelectedMission] = useState(missions[0].id);
  const [selectedCity, setSelectedCity] = useState(cities[0].id);
  const isWide = width > height || width >= 900;
  const isCompactLandscape = isWide && height < 460;
  const activeMission = missions.find((mission) => mission.id === selectedMission) ?? missions[0];
  const activeCity = cities.find((city) => city.id === selectedCity) ?? cities[0];

  const missionRows = [missions.slice(0, 2), missions.slice(2)];

  return (
    <View
      style={styles.root}
      onMoveShouldSetResponderCapture={() => true}
    >
      <StatusBar hidden />
      <NavigationBar hidden />
      <View style={styles.screenContent}>
        <View style={[styles.page, isWide && styles.pageWide]}>
          <View style={[styles.header, isCompactLandscape && styles.headerCompact]}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>P</Text>
              </View>
              <View>
                <Text style={styles.brandName}>Periferia.lab</Text>
                <Text style={styles.brandSubtitle}>SIMULADOR DE PANDEMIAS</Text>
              </View>
            </View>
            <View style={styles.headerTag}>
              <View style={styles.liveDot} />
              <Text style={styles.headerTagText}>MISSÃO 01</Text>
            </View>
          </View>

          <View
            style={[
              styles.mainGrid,
              isWide && styles.mainGridWide,
              isCompactLandscape && styles.mainGridCompact,
            ]}
          >
            <View
              style={[
                styles.introColumn,
                isWide && styles.introColumnWide,
                isCompactLandscape && styles.introColumnCompact,
              ]}
            >
              <View style={styles.sectionLabel}>
                <View style={styles.labelLine} />
                <Text style={styles.eyebrow}>ESCOLHA A MISSÃO</Text>
              </View>
              <Text style={[styles.headline, isCompactLandscape && styles.headlineCompact]}>
                Uma gripe chegou em <Text style={styles.headlineAccent}>Igarassu.</Text> O que
                você faz?
              </Text>
              <Text style={[styles.introText, isCompactLandscape && styles.introTextCompact]}>
                Um estudante da sua escola chegou gripado. Nos próximos dias, mais colegas
                começam a faltar. Você decide como agir para proteger a comunidade.
              </Text>

              <View style={[styles.infoCard, isCompactLandscape && styles.infoCardCompact]}>
                <View style={styles.infoIcon}>
                  <Text style={styles.infoIconText}>i</Text>
                </View>
                <View style={styles.infoCopy}>
                  <Text style={styles.infoTitle}>Dados que você já tem</Text>
                  <Text style={styles.infoText}>
                    A cada semana, acompanhe o que está acontecendo e teste suas decisões.
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.missionsColumn,
                isWide && styles.missionsColumnWide,
                isCompactLandscape && styles.missionsColumnCompact,
              ]}
            >
              <View
                style={[
                  styles.missionGrid,
                  isCompactLandscape && styles.missionGridCompact,
                ]}
              >
                {missionRows.map((row, rowIndex) => (
                  <View
                    key={`mission-row-${rowIndex}`}
                    style={[
                      styles.missionRow,
                      isCompactLandscape && styles.missionRowCompact,
                    ]}
                  >
                    {row.map((mission) => {
                      const isSelected = selectedMission === mission.id;
                      return (
                        <Pressable
                          key={mission.id}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          onPress={() => setSelectedMission(mission.id)}
                          style={({ pressed }) => [
                            styles.missionCard,
                            isCompactLandscape && styles.missionCardCompact,
                            isSelected && styles.missionCardSelected,
                            pressed && styles.pressed,
                          ]}
                        >
                          <View style={styles.missionCardTop}>
                            <Text style={[styles.missionNumber, { color: mission.accent }]}>
                              {mission.number}
                            </Text>
                            <View
                              style={[
                                styles.missionIcon,
                                isCompactLandscape && styles.missionIconCompact,
                                { backgroundColor: `${mission.accent}20` },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.missionIconText,
                                  isCompactLandscape && styles.missionIconTextCompact,
                                  { color: mission.accent },
                                ]}
                              >
                                {mission.icon}
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={[
                              styles.missionTitle,
                              isCompactLandscape && styles.missionTitleCompact,
                            ]}
                          >
                            {mission.title}
                          </Text>
                          <Text
                            style={[
                              styles.missionDescription,
                              isCompactLandscape && styles.missionDescriptionCompact,
                            ]}
                          >
                            {mission.description}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            <View
              style={[
                styles.cityColumn,
                isWide && styles.cityColumnWide,
                isCompactLandscape && styles.cityColumnCompact,
              ]}
            >
              <View style={styles.cityHeader}>
                <Text style={styles.eyebrow}>ESCOLHA A CIDADE</Text>
                <View
                  style={[
                    styles.cityBadge,
                    isCompactLandscape && styles.cityBadgeCompact,
                  ]}
                >
                  <Text style={styles.cityBadgeText}>PE</Text>
                </View>
              </View>

              <View
                style={[
                  styles.cityList,
                  isCompactLandscape && styles.cityListCompact,
                ]}
              >
                {cities.map((city) => {
                  const isSelected = selectedCity === city.id;
                  return (
                    <Pressable
                      key={city.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      onPress={() => setSelectedCity(city.id)}
                      style={({ pressed }) => [
                        styles.cityOption,
                        isCompactLandscape && styles.cityOptionCompact,
                        isSelected && styles.cityOptionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={[styles.pin, isSelected && styles.pinSelected]}>
                        <Text style={[styles.pinText, isSelected && styles.pinTextSelected]}>
                          +
                        </Text>
                      </View>
                      <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                        {city.name}
                      </Text>
                      <Text style={styles.population}>{city.population}</Text>
                      <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert(
                    'Missão selecionada',
                    `${activeMission.title}\n${activeCity.name} - ${activeCity.population}`,
                  )
                }
                style={({ pressed }) => [
                  styles.startButton,
                  isCompactLandscape && styles.startButtonCompact,
                  pressed && styles.startButtonPressed,
                ]}
              >
                <Text style={styles.startButtonText}>Começar simulação</Text>
                <Text style={styles.startButtonArrow}>→</Text>
              </Pressable>
              <Text style={styles.missionHint}>
                {activeMission.number} · {activeCity.name}
              </Text>
            </View>
          </View>

          <View style={[styles.footer, isCompactLandscape && styles.footerCompact]}>
            <Text style={styles.footerPartner}>IFPE Campus Igarassu</Text>
            <View style={styles.footerDivider} />
            <Text style={styles.footerPartner}>Periferia faz Ciência</Text>
            <View style={styles.footerDivider} />
            <Text style={styles.footerPartner}>Ciência para transformar</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  page: {
    flex: 1,
    width: '100%',
    maxWidth: 1080,
  },
  pageWide: {
    paddingHorizontal: 16,
  },
  header: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 24,
  },
  headerCompact: {
    minHeight: 40,
    marginBottom: 6,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
  },
  brandMarkText: {
    color: colors.background,
    fontSize: 20,
    fontWeight: '900',
  },
  brandName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  brandSubtitle: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 2,
  },
  headerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.panelRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  headerTagText: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mainGrid: {
    gap: 22,
  },
  mainGridWide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 18,
  },
  mainGridCompact: {
    gap: 8,
  },
  introColumn: {
    gap: 12,
  },
  introColumnCompact: {
    gap: 7,
  },
  introColumnWide: {
    flex: 1.12,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelLine: {
    width: 18,
    height: 2,
    backgroundColor: colors.green,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headline: {
    color: colors.text,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headlineAccent: {
    color: colors.green,
  },
  headlineCompact: {
    fontSize: 22,
    lineHeight: 27,
  },
  introText: {
    color: '#A8BBC8',
    fontSize: 13,
    lineHeight: 20,
  },
  introTextCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#155045',
    backgroundColor: '#08251F',
  },
  infoCardCompact: {
    padding: 9,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#164D3E',
  },
  infoIconText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '800',
  },
  infoCopy: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    color: '#B8F4DB',
    fontSize: 11,
    fontWeight: '700',
  },
  infoText: {
    color: '#83B9A6',
    fontSize: 10,
    lineHeight: 15,
  },
  missionsColumn: {
    gap: 10,
  },
  missionsColumnWide: {
    flex: 1.22,
    justifyContent: 'center',
  },
  missionsColumnCompact: {
    gap: 7,
  },
  missionGrid: {
    gap: 10,
  },
  missionGridCompact: {
    gap: 6,
  },
  missionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  missionRowCompact: {
    gap: 6,
  },
  missionCard: {
    flex: 1,
    minHeight: 126,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    gap: 7,
  },
  missionCardCompact: {
    minHeight: 84,
    padding: 7,
    gap: 3,
  },
  missionCardSelected: {
    borderColor: colors.green,
    backgroundColor: '#0B2A2B',
  },
  missionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missionNumber: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  missionIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionIconText: {
    fontSize: 13,
    fontWeight: '900',
  },
  missionIconCompact: {
    width: 18,
    height: 18,
    borderRadius: 6,
  },
  missionIconTextCompact: {
    fontSize: 11,
  },
  missionTitle: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  missionTitleCompact: {
    fontSize: 10,
    lineHeight: 13,
  },
  missionDescription: {
    flex: 1,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
  },
  missionDescriptionCompact: {
    fontSize: 9,
    lineHeight: 12,
  },
  cityColumn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    gap: 12,
  },
  cityColumnCompact: {
    padding: 7,
    gap: 4,
  },
  cityColumnWide: {
    flex: 0.88,
    justifyContent: 'center',
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: '#0B2D3B',
  },
  cityBadgeCompact: {
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  cityBadgeText: {
    color: colors.blue,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cityList: {
    gap: 7,
  },
  cityListCompact: {
    gap: 3,
  },
  cityOption: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#193448',
    backgroundColor: '#091725',
  },
  cityOptionSelected: {
    borderColor: '#008D68',
    backgroundColor: '#0A302D',
  },
  cityOptionCompact: {
    minHeight: 24,
    paddingHorizontal: 5,
    gap: 4,
  },
  pin: {
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10293A',
  },
  pinSelected: {
    backgroundColor: '#07553F',
  },
  pinText: {
    color: colors.blue,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  pinTextSelected: {
    color: colors.green,
  },
  cityName: {
    flex: 1,
    color: '#B7C7D1',
    fontSize: 11,
    fontWeight: '600',
  },
  cityNameSelected: {
    color: '#D5F9E8',
  },
  population: {
    color: colors.muted,
    fontSize: 9,
  },
  radio: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#426071',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.green,
  },
  radioDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  startButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 9,
    backgroundColor: colors.green,
    paddingHorizontal: 16,
  },
  startButtonCompact: {
    minHeight: 30,
  },
  startButtonPressed: {
    backgroundColor: '#00B775',
    transform: [{ scale: 0.99 }],
  },
  startButtonText: {
    color: '#04251D',
    fontSize: 12,
    fontWeight: '800',
  },
  startButtonArrow: {
    color: '#04251D',
    fontSize: 17,
    fontWeight: '800',
  },
  missionHint: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 9,
  },
  pressed: {
    opacity: 0.82,
  },
  footer: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerCompact: {
    minHeight: 26,
    marginTop: 4,
  },
  footerPartner: {
    color: '#7D96A5',
    fontSize: 9,
    fontWeight: '600',
  },
  footerDivider: {
    width: 1,
    height: 13,
    backgroundColor: '#254052',
  },
});
