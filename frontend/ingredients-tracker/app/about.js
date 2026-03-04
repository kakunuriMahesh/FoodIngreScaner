import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function About() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>ℹ️ About</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍎 Food Ingredient Tracker</Text>
          <Text style={styles.text}>
            Your personal AI-powered ingredient scanner app. Quickly scan food labels and instantly learn about ingredients, their health risks, and helpful tips for healthier choices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Features</Text>
          <Text style={styles.featureItem}>📸 <Text style={styles.featureText}>Scan ingredient labels using your camera</Text></Text>
          <Text style={styles.featureItem}>🔍 <Text style={styles.featureText}>Identify ingredients instantly</Text></Text>
          <Text style={styles.featureItem}>⚠️ <Text style={styles.featureText}>Get health risk assessments</Text></Text>
          <Text style={styles.featureItem}>💡 <Text style={styles.featureText}>Receive helpful health tips</Text></Text>
          <Text style={styles.featureItem}>🌱 <Text style={styles.featureText}>Make informed food choices</Text></Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Our Mission</Text>
          <Text style={styles.text}>
            We aim to empower people to make healthier food choices by providing quick, accurate information about food ingredients and their health impacts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔬 How It Works</Text>
          <Text style={styles.text}>
            1. <Text style={styles.highlight}>Capture</Text> an ingredient list with your camera{"\n"}
            2. <Text style={styles.highlight}>Analyze</Text> text extracted from the image{"\n"}
            3. <Text style={styles.highlight}>Learn</Text> about each ingredient{"\n"}
            4. <Text style={styles.highlight}>Decide</Text> based on health information
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Privacy First</Text>
          <Text style={styles.text}>
            Your privacy is our priority. <Text style={styles.highlight}>Images are never stored</Text> — we only process extracted text locally and securely.
          </Text>
          <TouchableOpacity onPress={() => router.push("/privacy")}>
            <Text style={styles.linkButton}>Read Privacy Policy →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📧 Questions?</Text>
          <TouchableOpacity onPress={() => router.push("/contact")}>
            <Text style={styles.linkButton}>Contact Us →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 10,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtnText: {
    fontSize: 16,
    color: "#1E88E5",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E88E5",
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  featureItem: {
    fontSize: 14,
    color: "#555",
    lineHeight: 24,
    marginBottom: 8,
  },
  featureText: {
    color: "#333",
  },
  highlight: {
    fontWeight: "bold",
    color: "#E53935",
  },
  linkButton: {
    fontSize: 14,
    color: "#1E88E5",
    fontWeight: "600",
    marginTop: 10,
  },
  spacer: {
    height: 32,
  },
});
