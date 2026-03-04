import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";

export default function Contact() {
  const router = useRouter();

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>📞 Contact Us</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💌 Email</Text>
          <TouchableOpacity onPress={() => handleEmailPress("support@foodingretracker.com")}>
            <Text style={styles.contactLink}>📧 support@foodingretracker.com</Text>
          </TouchableOpacity>
          <Text style={styles.note}>Tap to send an email</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Website</Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://foodingretracker.com")}>
            <Text style={styles.contactLink}>🔗 Visit our website</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ How to Reach Us</Text>
          <Text style={styles.text}>
            Have questions, feedback, or issues? We'd love to hear from you!
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>📧 Email us for general inquiries</Text>
            <Text style={styles.bulletItem}>🐛 Report bugs or technical issues</Text>
            <Text style={styles.bulletItem}>💡 Share feature requests</Text>
            <Text style={styles.bulletItem}>⭐ Send feedback to help us improve</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 More Information</Text>
          <TouchableOpacity onPress={() => router.push("/privacy")}>
            <Text style={styles.linkButton}>Privacy Policy →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/about")}>
            <Text style={styles.linkButton}>About Us →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Response Time</Text>
          <Text style={styles.text}>
            We typically respond to emails within 24-48 hours.
          </Text>
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
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  contactLink: {
    fontSize: 15,
    color: "#1E88E5",
    fontWeight: "600",
    paddingVertical: 10,
  },
  note: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  bulletList: {
    marginTop: 12,
  },
  bulletItem: {
    fontSize: 14,
    color: "#555",
    lineHeight: 24,
    paddingLeft: 12,
  },
  linkButton: {
    fontSize: 14,
    color: "#1E88E5",
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 12,
  },
  spacer: {
    height: 32,
  },
});
