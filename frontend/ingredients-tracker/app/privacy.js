import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>🔒 Privacy Policy</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Images Not Stored</Text>
          <Text style={styles.text}>
            This app uses your camera only for capturing ingredient labels. <Text style={styles.highlight}>Images are NOT stored</Text> on our servers. The image is processed locally on your device and deleted after analysis.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Only Text Processed</Text>
          <Text style={styles.text}>
            We only process the <Text style={styles.highlight}>extracted text from ingredient lists</Text>. The text is sent to our servers for ingredient analysis and health risk assessment. Original images are never transmitted.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Camera Permission</Text>
          <Text style={styles.text}>
            The app requests camera permission to enable you to scan ingredient labels. This permission is <Text style={styles.highlight}>only used to capture photos</Text> within the app and is never shared with third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Data Security</Text>
          <Text style={styles.text}>
            We are committed to protecting your data. Extracted ingredient text is used only for analysis and is stored securely on our servers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Terms of Service</Text>
          <Text style={styles.linkText}>
            For complete terms and conditions, please visit our website.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📧 Contact Us</Text>
          <TouchableOpacity onPress={() => router.push("/contact")}>
            <Text style={styles.linkButton}>Contact Information →</Text>
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
  linkText: {
    fontSize: 14,
    color: "#1E88E5",
    lineHeight: 22,
  },
  linkButton: {
    fontSize: 14,
    color: "#1E88E5",
    fontWeight: "600",
    marginTop: 8,
  },
  spacer: {
    height: 32,
  },
});
