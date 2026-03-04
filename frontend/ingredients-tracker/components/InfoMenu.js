import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useRouter } from "expo-router";

export default function InfoMenu() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    { label: "🔒 Privacy Policy", route: "/privacy" },
    { label: "ℹ️ About", route: "/about" },
    { label: "📞 Contact", route: "/contact" },
    { label: "📜 Terms & Conditions", route: "/terms" },
  ];

  const handleMenuPress = (route) => {
    setMenuVisible(false);
    router.push(route);
  };

  return (
    <View>
      {/* Menu Button */}
      <TouchableOpacity onPress={() => setMenuVisible(true)}>
        <Text style={styles.menuBtnText}>☰</Text>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        {/* Background Overlay */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          {/* Dropdown Menu */}
          <View style={styles.dropdown}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.route)}
              >
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuBtnText: {
    fontSize: 26,
    color: "#1a1a2e",
    fontWeight: "600",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  dropdown: {
    position: "absolute",
    top: 60,          // adjust based on your navbar height
    right: 16,
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  menuItemText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
});