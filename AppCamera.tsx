import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Button,
  Alert,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Accelerometer } from 'expo-sensors';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

export default function App() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');

  // Countdown settings
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownTime, setCountdownTime] = useState<number>(3);
  const [isCounting, setIsCounting] = useState<boolean>(false);

  // Camera
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  // Settings screen
  const [Option, setOption] = useState<boolean>(false);

  // Shake sensitivity
  const [shakeThreshold, setShakeThreshold] =
    useState<number>(2.5);

  // Image quality
  // 0.3 = 30%
  // 0.6 = 60%
  // 0.8 = 80%
  // 1.0 = 100%
  const [imageQuality, setImageQuality] =
    useState<number>(0.8);

  // ============================================
  // SHAKE DETECTION
  // ============================================

  useEffect(() => {
    let subscription: any;

    if (!photoUri && !isCounting && !Option) {
      Accelerometer.setUpdateInterval(150);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(
          x * x + y * y + z * z
        );

        if (acceleration > shakeThreshold) {
          startCountdown();
        }
      });
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [
    photoUri,
    isCounting,
    Option,
    shakeThreshold,
  ]);

  // ============================================
  // START COUNTDOWN
  // ============================================

  const startCountdown = () => {
    setIsCounting(true);
    setCountdown(countdownTime);
  };

  // ============================================
  // COUNTDOWN TIMER
  // ============================================

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(
        () => setCountdown(countdown - 1),
        1000
      );

      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsCounting(false);
      takePicture();
    }
  }, [countdown]);

  // ============================================
  // CAMERA PERMISSION
  // ============================================

  if (!cameraPermission) {
    return <View />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.center}>
        <Text
          style={{
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          แอปต้องการสิทธิ์ในการใช้งานกล้อง
        </Text>

        <Button
          onPress={requestCameraPermission}
          title="อนุญาตให้เข้าถึงกล้อง"
        />
      </View>
    );
  }

  // ============================================
  // TAKE PICTURE
  // ============================================

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo =
          await cameraRef.current.takePictureAsync({
            quality: imageQuality,
            shutterSound: false,
          });

        if (photo?.uri) {
          setPhotoUri(photo.uri);
        }
      } catch (error) {
        console.log(
          'Failed to take picture:',
          error
        );

        Alert.alert(
          'เกิดข้อผิดพลาด',
          'ไม่สามารถถ่ายรูปได้'
        );
      }
    }
  };

  // ============================================
  // SAVE PICTURE
  // ============================================

  const savePicture = async () => {
    if (!photoUri) return;

    try {
      let permission =
        await MediaLibrary.getPermissionsAsync(true);

      if (permission.status !== 'granted') {
        permission =
          await MediaLibrary.requestPermissionsAsync(true);
      }

      if (permission.status !== 'granted') {
        Alert.alert(
          'แจ้งเตือน',
          'กรุณาเปิดสิทธิ์เซฟรูปลงเครื่องในการตั้งค่าโทรศัพท์'
        );

        return;
      }

      await MediaLibrary.saveToLibraryAsync(photoUri);

      Alert.alert('', 'Saved!');
    } catch (error) {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถบันทึกไฟล์ได้'
      );

      console.log(error);
    }
  };

  // ============================================
  // SWITCH CAMERA
  // ============================================

  const toggleCameraFacing = () => {
    setFacing(current =>
      current === 'back' ? 'front' : 'back'
    );
  };

  // ============================================
  // PHOTO PREVIEW
  // ============================================

  if (photoUri) {
    return (
      <View style={styles.center}>
        <Image
          source={{ uri: photoUri }}
          style={styles.preview}
        />

        <View style={styles.previewButtonContainer}>
          <Button
            title="Back"
            onPress={() => setPhotoUri(null)}
            color="red"
          />

          <View style={{ width: 20 }} />

          <Button
            title="Save"
            onPress={savePicture}
            color="green"
          />
        </View>
      </View>
    );
  }

  // ============================================
  // SETTINGS SCREEN
  // ============================================

  if (Option) {
    return (
      <View style={styles.center}>

        {/* IMAGE QUALITY */}

        <Text style={styles.settingTitle}>
          Image Quality
        </Text>

        <Text style={styles.settingValue}>
          Current quality:{' '}
          {imageQuality === 0.3
            ? 'Low (30%)'
            : imageQuality === 0.6
            ? 'Medium (60%)'
            : imageQuality === 0.8
            ? 'High (80%)'
            : 'Maximum (100%)'}
        </Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={imageQuality}
            onValueChange={(value) =>
              setImageQuality(value)
            }
            style={styles.picker}
          >
            <Picker.Item
              label="Low (30%)"
              value={0.3}
            />

            <Picker.Item
              label="Medium (60%)"
              value={0.6}
            />

            <Picker.Item
              label="High (80%)"
              value={0.8}
            />

            <Picker.Item
              label="Maximum (100%)"
              value={1.0}
            />
          </Picker>
        </View>

        {/* SHAKE SETTINGS */}

        <Text style={styles.settingTitle}>
          ตั้งค่าการเขย่า
        </Text>

        <Text style={styles.settingValue}>
          ความไวปัจจุบัน:{' '}
          {shakeThreshold.toFixed(1)}
        </Text>

        <Slider
          style={styles.slider}
          minimumValue={2.5}
          maximumValue={20.0}
          step={0.1}
          value={shakeThreshold}
          onValueChange={(val) =>
            setShakeThreshold(val)
          }
          minimumTrackTintColor="#1EB1FC"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1EB1FC"
        />

        {/* COUNTDOWN SETTINGS */}

        <Text style={styles.settingTitle}>
          Countdown time
        </Text>

        <Text style={styles.settingValue}>
          เวลาปัจจุบัน: {countdownTime} วินาที
        </Text>

        <Slider
          style={styles.slider}
          minimumValue={3}
          maximumValue={10}
          step={1}
          value={countdownTime}
          onValueChange={(val) =>
            setCountdownTime(val)
          }
          minimumTrackTintColor="#1EB1FC"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1EB1FC"
        />

        {/* BACK BUTTON */}

        <Button
          title="Back"
          onPress={() => setOption(false)}
          color="red"
        />

      </View>
    );
  }

  // ============================================
  // CAMERA SCREEN
  // ============================================

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        ref={cameraRef}
      >

        {/* COUNTDOWN DISPLAY */}

        {isCounting && countdown !== null && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>
              {countdown}
            </Text>
          </View>
        )}

        {/* CAMERA BUTTONS */}

        <View style={styles.buttonContainer}>

          {/* SWITCH CAMERA */}

          <TouchableOpacity
            style={styles.switchCameraBtn}
            onPress={toggleCameraFacing}
          >
            <Text style={styles.switchText}>
              Camera
            </Text>
          </TouchableOpacity>

          {/* TAKE PHOTO */}

          <TouchableOpacity
            style={[
              styles.captureBtn,
              isCounting && { opacity: 0.5 },
            ]}
            onPress={
              isCounting ? undefined : takePicture
            }
            disabled={isCounting}
          />

          {/* SETTINGS */}

          <TouchableOpacity
            style={styles.switchCameraBtn}
            onPress={() => setOption(true)}
          >
            <Text style={styles.switchText}>
              option
            </Text>
          </TouchableOpacity>

        </View>
      </CameraView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },

  preview: {
    width: 300,
    height: 400,
    borderRadius: 10,
    marginBottom: 20,
  },

  previewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // ============================================
  // CAMERA BUTTONS
  // ============================================

  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#ccc',
    marginHorizontal: 20,
  },

  switchCameraBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  switchText: {
    color: '#fff',
    fontSize: 12,
  },

  // ============================================
  // COUNTDOWN
  // ============================================

  countdownContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {
      width: -1,
      height: 1,
    },
    textShadowRadius: 10,
  },

  // ============================================
  // SETTINGS
  // ============================================

  settingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  settingValue: {
    fontSize: 18,
    marginBottom: 20,
  },

  slider: {
    width: 250,
    height: 40,
    marginBottom: 40,
  },

  // ============================================
  // QUALITY DROPDOWN
  // ============================================

  pickerContainer: {
    width: 250,
    height: 55,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    marginBottom: 40,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  picker: {
    width: '100%',
    height: 55,
  },
});