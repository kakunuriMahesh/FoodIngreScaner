import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useRouter } from "expo-router";
import MlkitOcr from "expo-mlkit-ocr";


// App states: "camera" | "preview" | "results"
export default function Scan() {
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [found, setFound] = useState([]);
  const [missing, setMissing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState("camera");
  const [sortOrder, setSortOrder] = useState("default"); // "default", "high", "low"

  // ─── Risk hierarchy ───
  const riskMap = {
    high: 3,
    medium: 2,
    low: 1,
    unknown: 0,
  };

  const getSortedResults = () => {
    if (sortOrder === "default") return found;

    return [...found].sort((a, b) => {
      const riskA = riskMap[a.health_risk?.toLowerCase()] || 0;
      const riskB = riskMap[b.health_risk?.toLowerCase()] || 0;
      return sortOrder === "high" ? riskB - riskA : riskA - riskB;
    });
  };

  const toggleSort = () => {
    setSortOrder((prev) => {
      if (prev === "default") return "high";
      if (prev === "high") return "low";
      return "default";
    });
  };

  const sortedFound = getSortedResults();

  // ─── Auto-launch camera on mount ───
  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "This app needs camera access to scan ingredient labels. Please enable camera permission in your device settings.",
        [
          { text: "Try Again", onPress: openCamera },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setFound([]);
      setMissing([]);
      setAppState("preview");
      setSortOrder("default");
    }
  }, []);

  useEffect(() => {
    openCamera();
  }, []);



  // ─── Upload to backend ───
  // const uploadImage = async () => {
  //   try {
  //     setLoading(true);

  //     const formData = new FormData();
  //     formData.append("image", {
  //       uri: image,
  //       type: "image/jpeg",
  //       name: "photo.jpg",
  //     });

  //     const response = await axios.post(
  //       // "http://192.168.1.114:5000/api/scan",
  //       "http://10.32.30.172:5000/api/scan",
  //       formData,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       }
  //     );

  //     setFound(response.data.found || []);
  //     setMissing(response.data.missing || []);
  //     setAppState("results");
  //   } catch (error) {
  //     console.log("Upload Error:", error);
  //     Alert.alert("Error", "Failed to scan image. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const uploadImage = async () => {
  try {
    setLoading(true);

    // 🔹 Run OCR on device
    const ocrResult = await MlkitOcr.detectFromUri(image);

    let extractedText = "";

    ocrResult.forEach(block => {
      extractedText += block.text + " ";
    });

    console.log("Extracted Text:", extractedText);

    if (!extractedText.trim()) {
      Alert.alert("No Text Found", "Please try again with clearer image.");
      setLoading(false);
      return;
    }

    // 🔹 Send extracted TEXT (not image) to backend
    const response = await axios.post(
      // "http://10.32.30.172:5000/api/scan-text", // <-- change backend route
      "https://foodingrescanerbackend.onrender.com/api/scan-text",
      {
        text: extractedText,
      }
    );

    setFound(response.data.found || []);
    setMissing(response.data.missing || []);
    setAppState("results");

  } catch (error) {
    console.log("OCR Error:", error);
    Alert.alert("Error", "Failed to scan text. Please try again.");
  } finally {
    setLoading(false);
  }
};


  // ─── Add missing ingredients ───
  const addAllMissing = async () => {
    try {
      await axios.post("http://192.168.1.114:5000/api/add-ingredient", {
        ingredients: missing,
      });

      Alert.alert("Success", "All missing ingredients added!");
      setMissing([]);
    } catch (error) {
      console.log("Add Error:", error);
      Alert.alert("Error", "Failed to add ingredients.");
    }
  };

  // ─── Navigate to ingredient detail ───
  const goToDetail = (item) => {
    router.push({
      pathname: "/ingredient-detail",
      params: {
        name: item.name,
        icon: item.icon || "🧪",
        category: item.category,
        health_risk: item.health_risk,
        description: item.description,
        tip: JSON.stringify(item.tip || {}),
      },
    });
  };



  // ────────────────────────────────────────────
  // RENDER: Camera launching state
  // ────────────────────────────────────────────
  if (appState === "camera") {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.launchingText}>📸 Opening Camera...</Text>
        <ActivityIndicator size="large" color="#4FC3F7" style={{ marginTop: 16 }} />
        <TouchableOpacity style={styles.retryBtn} onPress={openCamera}>
          <Text style={styles.retryBtnText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ────────────────────────────────────────────
  // RENDER: Preview + Results
  // ────────────────────────────────────────────
  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={styles.title}>🔍 Ingredient Scanner</Text>

        {/* Image Preview */}
        {image && (
          <View style={styles.previewCard}>
            <Image source={{ uri: image }} style={styles.previewImage} />

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => {
                  setAppState("camera");
                  openCamera();
                }}
              >
                <Text style={styles.retakeBtnText}>📷 Retake</Text>
              </TouchableOpacity>
            </View>

            {appState === "preview" && (
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={uploadImage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.scanBtnText}>🚀 Scan Ingredients</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4FC3F7" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        )}

        {/* ✅ Detected Ingredients */}
        {Array.isArray(found) && found.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={styles.sectionIcon}>✅</Text>
                <Text style={styles.sectionTitle}>Detected Ingredients</Text>
              </View>

              {/* Sort Toggle */}
              <TouchableOpacity style={styles.sortBadge} onPress={toggleSort}>
                <Text style={styles.sortBadgeText}>
                  {sortOrder === "default" ? "Sort: Default" : sortOrder === "high" ? "Sort: High Risk First" : "Sort: Low Risk First"}
                </Text>
              </TouchableOpacity>
            </View>

            {sortedFound.map((item, index) => (
              <View key={index} style={styles.foundCard}>
                <View style={styles.foundCardTop}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    {item.icon && item.icon.startsWith("http") ? (
                      <Image source={{ uri: item.icon }} style={styles.itemIconImage} />
                    ) : (
                      <Text style={styles.itemIconEmoji}>{item.icon || "🧪"}</Text>
                    )}
                    <Text style={styles.foundName}>{item.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.tipBtn}
                    onPress={() => goToDetail(item)}
                  >
                    <Text style={styles.tipBtnText}>💡 Tip</Text>
                  </TouchableOpacity>
                </View>
                {/* <Text style={styles.foundCategory}>
                  📂 {item.category || "N/A"}
                </Text> */}
                <Text
                  style={[
                    styles.foundRisk,
                    {
                      color:
                        item.health_risk?.toLowerCase() === "high"
                          ? "#E53935"
                          : item.health_risk?.toLowerCase() === "medium"
                          ? "#FB8C00"
                          : "#43A047",
                    },
                  ]}
                >
                  {item.health_risk?.toLowerCase() === "high" ? "🍎" : item.health_risk?.toLowerCase() === "medium" ? "💛" : "🍏"} Risk: {item.health_risk || "Unknown"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ❌ Unknown Ingredients */}
        {Array.isArray(missing) && missing.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>❓</Text>
              <Text style={styles.sectionTitle}>Unknown Ingredients</Text>
            </View>

            <View style={styles.unknownList}>
              {missing.map((item, index) => (
                <View key={index} style={styles.unknownCard}>
                  <View style={styles.unknownNumber}>
                    <Text style={styles.unknownNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.unknownName}>{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addAllBtn}
              onPress={addAllMissing}
            >
              <Text style={styles.addAllBtnText}>
                ➕ Add All Missing Ingredients
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* New Scan button after results */}
        {appState === "results" && (
          <TouchableOpacity
            style={styles.newScanBtn}
            onPress={() => {
              setAppState("camera");
              setFound([]);
              setMissing([]);
              setSortOrder("default");
              openCamera();
            }}
          >
            <Text style={styles.newScanBtnText}>📸 New Scan</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── Layout ───
  wrapper: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 52,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },

  // ─── Header ───
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 20,
  },

  // ─── Camera launch ───
  launchingText: {
    fontSize: 18,
    color: "#555",
    fontWeight: "500",
  },
  retryBtn: {
    marginTop: 24,
    backgroundColor: "#4FC3F7",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ─── Preview ───
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  previewImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    resizeMode: "cover",
  },
  previewActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  retakeBtn: {
    flex: 1,
    backgroundColor: "#ECEFF1",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  retakeBtnText: {
    color: "#37474F",
    fontWeight: "600",
    fontSize: 14,
  },
  reCropBtn: {
    flex: 1,
    backgroundColor: "#E8EAF6",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  reCropBtnText: {
    color: "#3949AB",
    fontWeight: "600",
    fontSize: 14,
  },
  scanBtn: {
    backgroundColor: "#4FC3F7",
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  scanBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  // ─── Loading ───
  loadingBox: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    color: "#888",
    fontSize: 14,
  },

  // ─── Sections ───
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a2e",
  },

  // ─── Found Cards ───
  foundCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#43A047",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  foundCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  foundName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1a1a2e",
    flex: 1,
  },
  tipBtn: {
    backgroundColor: "#FFF8E1",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD54F",
  },
  tipBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F57F17",
  },
  itemIconImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  itemIconEmoji: {
    fontSize: 20,
  },
  foundCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  foundRisk: {
    fontSize: 14,
    fontWeight: "600",
  },

  // ─── Unknown Ingredients ───
  unknownList: {
    gap: 8,
  },
  unknownCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EF5350",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  unknownNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
  },
  unknownNumberText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#E53935",
  },
  unknownName: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },

  // ─── Add All Button ───
  addAllBtn: {
    backgroundColor: "#1E88E5",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#1E88E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addAllBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ─── New Scan ───
  newScanBtn: {
    backgroundColor: "#26A69A",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  newScanBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sortBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#90CAF9",
  },
  sortBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1976D2",
  },
});
