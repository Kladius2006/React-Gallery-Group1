import { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, View, Text, Pressable, StyleSheet } from 'react-native';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(true);

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      <Pressable
        style={styles.closeButton}
        onPress={() => setCameraOpen(false)}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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

  closeText: {
    color: 'white',
    fontSize: 28,
  },

  closedScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});