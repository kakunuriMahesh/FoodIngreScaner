import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const getRiskColor = (risk) => {
  if (!risk) return "#888";
  const r = risk.toLowerCase();
  if (r === "high" || r === "dangerous") return "#E53935";
  if (r === "medium" || r === "moderate") return "#FB8C00";
  if (r === "low" || r === "safe") return "#43A047";
  return "#888";
};

const getRiskBg = (risk) => {
  if (!risk) return "#f0f0f0";
  const r = risk.toLowerCase();
  if (r === "high" || r === "dangerous") return "#FFEBEE";
  if (r === "medium" || r === "moderate") return "#FFF3E0";
  if (r === "low" || r === "safe") return "#E8F5E9";
  return "#f0f0f0";
};

export default function IngredientDetail() {
  const router = useRouter();
  const { name, icon, category, health_risk, description, tip } =
    useLocalSearchParams();

  // Parse tip JSON (passed as stringified object)
  let tipData = {};
  try {
    tipData = tip ? JSON.parse(tip) : {};
  } catch (e) {
    tipData = {};
  }

  const descriptionPoints = tipData.description_points || [];
  const whatItDoes = tipData.what_it_does || [];
  const dailyLimits = tipData.daily_limits || "";

  const hasTip = descriptionPoints.length > 0 || whatItDoes.length > 0 || dailyLimits;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        {/* Header Card */}
        <View style={styles.headerCard}>
          {icon && icon.startsWith("http") ? (
            <Image
              source={{ uri: icon }}
              style={[
                styles.iconImage,
                {
                  backgroundColor: getRiskBg(health_risk),
                  borderColor: getRiskColor(health_risk),
                },
              ]}
            />
          ) : (
            <Text
              style={[
                styles.icon,
                {
                  backgroundColor: getRiskBg(health_risk),
                  borderColor: getRiskColor(health_risk),
                  borderWidth: 2,
                  borderRadius: 100,
                },
              ]}
            >
              {icon || "🧪"}
            </Text>
          )}
          <Text style={styles.name}>{name || "Unknown"}</Text>

          {/* {category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ) : null} */}
        </View>

        {/* Health Risk */}
        {/* <View
          style={[
            styles.riskCard,
            { backgroundColor: getRiskBg(health_risk) },
          ]}
        >
          <Text style={styles.riskLabel}>Health Risk</Text>
          <Text
            style={[styles.riskValue, { color: getRiskColor(health_risk) }]}
          >
            {health_risk || "Unknown"}
          </Text>
        </View> */}

        {/* Description */}
        {description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Description</Text>
            <Text style={styles.sectionText}>{description}</Text>
          </View>
        ) : null}

        {/* Tip Section */}
        {hasTip && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipHeader}>💡 Tip</Text>

            {/* Description Points */}
            {descriptionPoints.length > 0 && (
              <View style={styles.tipSection}>
                <Text style={styles.tipSectionTitle}>Key Points</Text>
                {descriptionPoints.map((point, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* What It Does */}
            {whatItDoes.length > 0 && (
              <View style={styles.tipSection}>
                <Text style={styles.tipSectionTitle}>What It Does</Text>
                {whatItDoes.map((point, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Daily Limits */}
            {dailyLimits ? (
              <View style={styles.limitsCard}>
                <Text style={styles.limitsLabel}>⚠️ Daily Limit</Text>
                <Text style={styles.limitsValue}>{dailyLimits}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  backBtn: {
    paddingVertical: 10,
    marginBottom: 8,
  },
  backBtnText: {
    color: "#60A5FA",
    fontSize: 16,
    fontWeight: "600",
  },

  // ── Header ──
  headerCard: {
    // backgroundColor: "#1E293B",
    borderRadius: 16,
    // padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    // borderColor: "#334155",
  },
  iconImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
  },
  icon: {
    fontSize: 48,
    width: 100,
    height: 100,
    textAlign: "center",
    textAlignVertical: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#F8FAFC",
    textAlign: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Risk ──
  riskCard: {
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  riskLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  riskValue: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // ── Description ──
  section: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E2E8F0",
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 22,
  },

  // ── Tip Container ──
  tipContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  tipHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#60A5FA",
    marginBottom: 14,
  },
  tipSection: {
    marginBottom: 16,
  },
  tipSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 4,
  },
  bullet: {
    color: "#60A5FA",
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 22,
  },

  // ── Daily Limits ──
  limitsCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  limitsLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  limitsValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#78350F",
  },
});
