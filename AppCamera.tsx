import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from 'react-native';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission?.granted) {
    return (
      <Button
        title="Allow Camera"
        onPress={requestPermission}
      />
    );
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
    />
  );
}