import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  
  // State สำหรับจับเวลา
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // ----------------------------------------------------
  // 1. ระบบตรวจจับการเขย่า (Shake Detection)
  // ----------------------------------------------------
  useEffect(() => {
    let subscription: any;
    
    // จะเปิดเซ็นเซอร์ก็ต่อเมื่อ "ไม่ได้อยู่ในหน้าพรีวิวรูป" และ "ไม่ได้กำลังนับถอยหลังอยู่"
    if (!photoUri && !isCounting) {
      Accelerometer.setUpdateInterval(150); // อัปเดตค่าทุก 150 มิลลิวินาที
      
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        // คำนวณแรงเหวี่ยงรวม (Vector Magnitude)
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        
        // ถ้าแรงเหวี่ยงมากกว่า 2.5 (เขย่าแรงพอสมควร) ให้เริ่มนับถอยหลัง
        if (acceleration > 2.5) {
          startCountdown();
        }
      });
    }

    return () => {
      if (subscription) subscription.remove(); // ล้างค่าเซ็นเซอร์เมื่อปิดหน้าจอหรือเริ่มนับเวลา
    };
  }, [photoUri, isCounting]);

  // ----------------------------------------------------
  // 2. ระบบนับถอยหลัง 3 วินาที
  // ----------------------------------------------------
  const startCountdown = () => {
    setIsCounting(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      // ลดเวลาลง 1 วินาที
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // เมื่อเวลาเหลือ 0 ให้ถ่ายรูป
      setCountdown(null);
      setIsCounting(false);
      takePicture();
    }
  }, [countdown]);

  // ----------------------------------------------------
  // ฟังก์ชันเดิมของกล้อง
  // ----------------------------------------------------
  if (!cameraPermission) return <View />;
  if (!cameraPermission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>แอปต้องการสิทธิ์ในการใช้งานกล้อง</Text>
        <Button onPress={requestCameraPermission} title="อนุญาตให้เข้าถึงกล้อง" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.8,
        shutterSound: false 
      });
      if (photo?.uri) setPhotoUri(photo.uri);
    }
  };

  const savePicture = async () => {
    if (!photoUri) return;
    try {
      let permission = await MediaLibrary.getPermissionsAsync(true);
      if (permission.status !== 'granted') {
        permission = await MediaLibrary.requestPermissionsAsync(true);
      }
      if (permission.status !== 'granted') {
        Alert.alert('แจ้งเตือน', 'กรุณาเปิดสิทธิ์เซฟรูปลงเครื่องในการตั้งค่าโทรศัพท์');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(photoUri);
      Alert.alert('Saved!');
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกไฟล์ได้');
      console.log(error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // หน้าจอแสดงรูปพรีวิว
  if (photoUri) {
    return (
      <View style={styles.center}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.previewButtonContainer}>
          <Button title="Back" onPress={() => setPhotoUri(null)} color="red" />
          <View style={{ width: 20 }} />
          <Button title="Save" onPress={savePicture} color="green" />
        </View>
      </View>
    );
  }

  // หน้าจอกล้อง
  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} facing={facing} ref={cameraRef}>
        
        {/* ตัวเลขแสดงเวลานับถอยหลัง */}
        {isCounting && countdown !== null && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.switchCameraBtn} onPress={toggleCameraFacing}>
            <Text style={styles.switchText}>Camera</Text>
          </TouchableOpacity>
          
          {/* ปุ่มถ่ายรูปปกติ (เผื่อไม่อยากเขย่า) */}
          <TouchableOpacity 
            style={[styles.captureBtn, isCounting && { opacity: 0.5 }]} 
            onPress={isCounting ? undefined : takePicture} 
            disabled={isCounting}
          />
          
          <View style={{ width: 50, marginLeft: 20 }} /> 
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
    },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 20 
    },
  preview: { 
    width: 300, 
    height: 400, 
    borderRadius: 10, 
    marginBottom: 20 
    },
  previewButtonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
    },
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
    marginHorizontal: 20
  },
  switchCameraBtn: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    borderWidth: 2, 
    borderColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  switchText: { color: '#fff', fontSize: 12 },
  
  // สไตล์สำหรับตัวเลขนับถอยหลัง
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
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  }
});