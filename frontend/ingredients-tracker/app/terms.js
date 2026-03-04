import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>📜 Terms & Conditions</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By using this app, you agree to these terms and conditions. If you do not agree, please do not use the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of Service</Text>
          <Text style={styles.text}>
            This app is designed to help you scan and learn about food ingredients. It is not a substitute for professional medical or nutritional advice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Camera Access</Text>
          <Text style={styles.text}>
            You grant permission for the app to access your device's camera only for capturing ingredient labels within the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Processing</Text>
          <Text style={styles.text}>
            Only extracted text from ingredient labels is processed and stored. <Text style={styles.highlight}>Images are never stored or transmitted</Text>.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Accuracy Disclaimer</Text>
          <Text style={styles.text}>
            While we strive for accuracy, ingredient information is provided "as is". Always verify critical health information with official sources.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.text}>
            We are not responsible for any health decisions made based on information provided by this app. Always consult healthcare professionals for medical advice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
          <Text style={styles.text}>
            We may update these terms at any time. Continued use of the app constitutes acceptance of changes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. User Conduct</Text>
          <Text style={styles.text}>
            You agree not to misuse the app or attempt to access it through unauthorized means. You are responsible for maintaining the confidentiality of your device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Questions About These Terms?</Text>
          <TouchableOpacity onPress={() => router.push("/contact")}>
            <Text style={styles.linkButton}>Contact Us →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Other Policies</Text>
          <TouchableOpacity onPress={() => router.push("/privacy")}>
            <Text style={styles.linkButton}>Privacy Policy →</Text>
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
