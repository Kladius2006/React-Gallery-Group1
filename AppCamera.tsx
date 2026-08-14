import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, View, Text, Pressable, StyleSheet, Image } from 'react-native';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission?.granted) {
    return (
      <Button
        title="Allow Camera"
        onPress={requestPermission}
      />
    );
  }

  if (!cameraOpen) {
    return (
      <View style={styles.closedScreen}>
        <Text>Camera closed</Text>

        <Button
          title="Open Camera"
          onPress={() => setCameraOpen(true)}
        />

        {photo && (
          <Image
            source={{ uri: photo }}
            style={{ width: 200, height: 300, marginTop: 20 }}
          />
        )}
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();
      setPhoto(result.uri);
      setCameraOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        ref={cameraRef}
      />

      <Pressable
        style={styles.closeButton}
        onPress={() => setCameraOpen(false)}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <Pressable
        style={styles.captureButton}
        onPress={takePicture}
      >
        <Text style={styles.captureText}>📸</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: { color: 'white', fontSize: 28 },

  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureText: { fontSize: 28 },

  closedScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});
