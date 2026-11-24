
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type HeaderProps = {
  subtitle?: string;
};

export default function Header({
  subtitle = "SIMULADOR DE PANDEMIAS",
}: HeaderProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.bars}>
            <View style={[styles.bar, { height: 8 }]} />
            <View style={[styles.bar, { height: 14 }]} />
            <View style={[styles.bar, { height: 10 }]} />
          </View>
          <Text style={styles.logo}>PeriferiaLab</Text>
        </View>

        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0D1117",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#30363D",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: {
    width: 4,
    backgroundColor: "#4ADE80",
    borderRadius: 1,
  },
  logo: {
    color: "#E6EDF3",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "#7D8590",
    fontSize: 9,
    letterSpacing: 0.5,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },
});
