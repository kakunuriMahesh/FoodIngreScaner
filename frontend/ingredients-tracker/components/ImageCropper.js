import React, { useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Text,
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_DISPLAY_HEIGHT = SCREEN_WIDTH * 1.2;

const MIN_CROP_SIZE = 60;

export default function ImageCropper({ imageUri, onCropDone, onCancel }) {
  const [imageLayout, setImageLayout] = useState({
    width: SCREEN_WIDTH,
    height: IMAGE_DISPLAY_HEIGHT,
  });
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });

  // Crop box state
  const [cropBox, setCropBox] = useState({
    x: 40,
    y: 40,
    width: SCREEN_WIDTH - 80,
    height: IMAGE_DISPLAY_HEIGHT - 80,
  });

  const cropRef = useRef(cropBox);
  cropRef.current = cropBox;

  // Resolve natural image dimensions
  React.useEffect(() => {
    Image.getSize(imageUri, (w, h) => {
      setNaturalSize({ width: w, height: h });
      // Fit image to screen width
      const ratio = SCREEN_WIDTH / w;
      const displayH = h * ratio;
      setImageLayout({ width: SCREEN_WIDTH, height: displayH });
      setCropBox({
        x: 30,
        y: 30,
        width: SCREEN_WIDTH - 60,
        height: displayH - 60,
      });
    });
  }, [imageUri]);

  // PanResponder for dragging the crop box
  const movePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setCropBox((prev) => {
          let newX = prev.x + gesture.dx;
          let newY = prev.y + gesture.dy;
          // Clamp within image bounds
          newX = Math.max(0, Math.min(newX, imageLayout.width - prev.width));
          newY = Math.max(0, Math.min(newY, imageLayout.height - prev.height));
          return { ...prev, x: newX, y: newY };
        });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // PanResponder for resizing from bottom-right corner
  const resizePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setCropBox((prev) => {
          let newW = prev.width + gesture.dx;
          let newH = prev.height + gesture.dy;
          // Enforce minimum size
          newW = Math.max(MIN_CROP_SIZE, newW);
          newH = Math.max(MIN_CROP_SIZE, newH);
          // Clamp to image bounds
          newW = Math.min(newW, imageLayout.width - prev.x);
          newH = Math.min(newH, imageLayout.height - prev.y);
          return { ...prev, width: newW, height: newH };
        });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleCrop = async () => {
    try {
      // Convert screen coordinates to original image coordinates
      const scaleX = naturalSize.width / imageLayout.width;
      const scaleY = naturalSize.height / imageLayout.height;

      const originX = Math.round(cropRef.current.x * scaleX);
      const originY = Math.round(cropRef.current.y * scaleY);
      const cropWidth = Math.round(cropRef.current.width * scaleX);
      const cropHeight = Math.round(cropRef.current.height * scaleY);

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX,
              originY,
              width: cropWidth,
              height: cropHeight,
            },
          },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      onCropDone(result.uri);
    } catch (error) {
      console.log("Crop error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crop Image</Text>
      <Text style={styles.subtitle}>
        Drag to move • Drag corner to resize
      </Text>

      <View
        style={[
          styles.imageContainer,
          { width: imageLayout.width, height: imageLayout.height },
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: imageLayout.width, height: imageLayout.height }}
          resizeMode="cover"
        />

        {/* Dark overlay — top */}
        <View
          style={[
            styles.overlay,
            { top: 0, left: 0, right: 0, height: cropBox.y },
          ]}
        />
        {/* Dark overlay — bottom */}
        <View
          style={[
            styles.overlay,
            {
              top: cropBox.y + cropBox.height,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />
        {/* Dark overlay — left */}
        <View
          style={[
            styles.overlay,
            {
              top: cropBox.y,
              left: 0,
              width: cropBox.x,
              height: cropBox.height,
            },
          ]}
        />
        {/* Dark overlay — right */}
        <View
          style={[
            styles.overlay,
            {
              top: cropBox.y,
              left: cropBox.x + cropBox.width,
              right: 0,
              height: cropBox.height,
            },
          ]}
        />

        {/* Crop rectangle (drag to move) */}
        <View
          style={[
            styles.cropBox,
            {
              left: cropBox.x,
              top: cropBox.y,
              width: cropBox.width,
              height: cropBox.height,
            },
          ]}
          {...movePan.panHandlers}
        >
          {/* Corner indicators */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />

          {/* Bottom-right resize handle */}
          <View
            style={[styles.corner, styles.cornerBR, styles.resizeHandle]}
            {...resizePan.panHandlers}
          />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cropBtn} onPress={handleCrop}>
          <Text style={styles.cropBtnText}>✓ Confirm Crop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 50,
  },
  header: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  cropBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#fff",
    borderStyle: "dashed",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#4FC3F7",
    borderWidth: 3,
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  resizeHandle: {
    width: 28,
    height: 28,
    borderColor: "#FFD54F",
    borderWidth: 3,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 16,
    paddingHorizontal: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cropBtn: {
    flex: 1,
    backgroundColor: "#4FC3F7",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cropBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
