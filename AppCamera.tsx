import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export default function App() {
  // --------------------------------------------------
  // AUDIO QUALITY
  // --------------------------------------------------

  const [audioQuality, setAudioQuality] = useState<
    'HIGH_QUALITY' | 'LOW_QUALITY'
  >('HIGH_QUALITY');

  const [settingsVisible, setSettingsVisible] = useState(false);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Change the actual RecordingOptions based on selected quality
  const recordingPreset =
    audioQuality === 'HIGH_QUALITY'
      ? RecordingPresets.HIGH_QUALITY
      : RecordingPresets.LOW_QUALITY;

  // --------------------------------------------------
  // RECORDER
  // --------------------------------------------------

  const recorder = useAudioRecorder(
    recordingPreset
  );

  const recorderState = useAudioRecorderState(
    recorder
  );

  // --------------------------------------------------
  // RECORDING URI
  // --------------------------------------------------

  const [recordingUri, setRecordingUri] = useState<
    string | null
  >(null);

  // --------------------------------------------------
  // PLAYER
  // --------------------------------------------------

  const player = useAudioPlayer(recordingUri);

  // --------------------------------------------------
  // REQUEST MICROPHONE PERMISSION
  // --------------------------------------------------

  useEffect(() => {
    async function setupAudio() {
      try {
        const permission =
          await AudioModule.requestRecordingPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Microphone Permission',
            'Please allow microphone access to record audio.'
          );
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      } catch (error) {
        console.log('Audio setup error:', error);
      }
    }

    setupAudio();
  }, []);

  // --------------------------------------------------
  // START RECORDING
  // --------------------------------------------------

  const startRecording = async () => {
    try {
      // Remove the previous recording reference
      setRecordingUri(null);

      await recorder.prepareToRecordAsync();

      recorder.record();

      console.log('Recording started');
      console.log('Quality:', audioQuality);
    } catch (error) {
      console.log('Failed to start recording:', error);

      Alert.alert(
        'Error',
        'Could not start recording.'
      );
    }
  };

  // --------------------------------------------------
  // STOP RECORDING
  // --------------------------------------------------

  const stopRecording = async () => {
    try {
      await recorder.stop();

      const uri = recorder.uri;

      console.log('Recording stopped');
      console.log('Recording URI:', uri);

      if (uri) {
        setRecordingUri(uri);
      }
    } catch (error) {
      console.log('Failed to stop recording:', error);

      Alert.alert(
        'Error',
        'Could not stop recording.'
      );
    }
  };

  // --------------------------------------------------
  // PLAY RECORDING
  // --------------------------------------------------

  const playRecording = () => {
    if (!recordingUri) {
      Alert.alert(
        'No Recording',
        'Record something first.'
      );
      return;
    }

    try {
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.log('Playback error:', error);
    }
  };

  // --------------------------------------------------
  // PAUSE RECORDING PLAYBACK
  // --------------------------------------------------

  const pauseRecording = () => {
    try {
      player.pause();
    } catch (error) {
      console.log('Pause error:', error);
    }
  };

  // --------------------------------------------------
  // FORMAT TIME
  // --------------------------------------------------

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(
      milliseconds / 1000
    );

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  // --------------------------------------------------
  // CHANGE AUDIO QUALITY
  // --------------------------------------------------

  const selectAudioQuality = (
    quality: 'HIGH_QUALITY' | 'LOW_QUALITY'
  ) => {
    // Don't allow changing settings while recording
    if (recorderState.isRecording) {
      Alert.alert(
        'Currently Recording',
        'Stop the current recording before changing audio quality.'
      );
      return;
    }

    setAudioQuality(quality);
    setDropdownVisible(false);
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <View style={styles.container}>

      {/* ------------------------------------------------
          SETTINGS BUTTON
      ------------------------------------------------ */}

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
      >
        <Text style={styles.settingsButtonText}>
          ⚙
        </Text>
      </TouchableOpacity>

      {/* ------------------------------------------------
          TITLE
      ------------------------------------------------ */}

      <Text style={styles.title}>
        Voice Recorder
      </Text>

      {/* ------------------------------------------------
          RECORDING TIME
      ------------------------------------------------ */}

      <Text style={styles.timer}>
        {formatTime(
          recorderState.durationMillis
        )}
      </Text>

      {/* ------------------------------------------------
          RECORDING STATUS
      ------------------------------------------------ */}

      <Text style={styles.status}>
        {recorderState.isRecording
          ? 'Recording...'
          : recordingUri
          ? 'Recording complete'
          : 'Ready to record'}
      </Text>

      {/* ------------------------------------------------
          RECORD BUTTON
      ------------------------------------------------ */}

      <TouchableOpacity
        style={[
          styles.recordButton,
          recorderState.isRecording &&
            styles.stopButton,
        ]}
        onPress={
          recorderState.isRecording
            ? stopRecording
            : startRecording
        }
      >
        <Text style={styles.buttonText}>
          {recorderState.isRecording
            ? 'STOP'
            : 'RECORD'}
        </Text>
      </TouchableOpacity>

      {/* ------------------------------------------------
          PLAYBACK BUTTONS
      ------------------------------------------------ */}

      {recordingUri && (
        <View style={styles.playbackContainer}>

          <TouchableOpacity
            style={styles.playButton}
            onPress={playRecording}
          >
            <Text style={styles.buttonText}>
              ▶ PLAY
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pauseButton}
            onPress={pauseRecording}
          >
            <Text style={styles.buttonText}>
              ⏸ PAUSE
            </Text>
          </TouchableOpacity>

        </View>
      )}

      {/* ------------------------------------------------
          RECORDING INFORMATION
      ------------------------------------------------ */}

      {recordingUri && (
        <View style={styles.infoContainer}>

          <Text style={styles.infoTitle}>
            Recording saved
          </Text>

          <Text
            style={styles.uri}
            numberOfLines={3}
          >
            {recordingUri}
          </Text>

        </View>
      )}

      {/* ==================================================
          SETTINGS MODAL
      ================================================== */}

      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setSettingsVisible(false)
        }
      >
        <View style={styles.modalOverlay}>

          <View style={styles.settingsModal}>

            {/* Modal title */}

            <Text style={styles.settingsTitle}>
              Settings
            </Text>

            {/* Audio quality label */}

            <Text style={styles.settingLabel}>
              Audio Record Quality
            </Text>

            {/* Dropdown */}

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() =>
                setDropdownVisible(
                  !dropdownVisible
                )
              }
            >
              <Text style={styles.dropdownText}>
                {audioQuality === 'HIGH_QUALITY'
                  ? 'High Quality'
                  : 'Low Quality'}
              </Text>

              <Text style={styles.dropdownArrow}>
                {dropdownVisible ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {/* Dropdown options */}

            {dropdownVisible && (
              <View style={styles.dropdownOptions}>

                <TouchableOpacity
                  style={[
                    styles.dropdownOption,
                    audioQuality ===
                      'HIGH_QUALITY' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    selectAudioQuality(
                      'HIGH_QUALITY'
                    )
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      audioQuality ===
                        'HIGH_QUALITY' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    High Quality
                  </Text>

                  {audioQuality ===
                    'HIGH_QUALITY' && (
                    <Text style={styles.checkmark}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dropdownOption,
                    audioQuality ===
                      'LOW_QUALITY' &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    selectAudioQuality(
                      'LOW_QUALITY'
                    )
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      audioQuality ===
                        'LOW_QUALITY' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Low Quality
                  </Text>

                  {audioQuality ===
                    'LOW_QUALITY' && (
                    <Text style={styles.checkmark}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>

              </View>
            )}

            {/* Close button */}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setDropdownVisible(false);
                setSettingsVisible(false);
              }}
            >
              <Text style={styles.buttonText}>
                CLOSE
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </Modal>

    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // --------------------------------------------------
  // SETTINGS BUTTON
  // --------------------------------------------------

  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,

    width: 50,
    height: 50,

    borderRadius: 25,
    backgroundColor: '#333',

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 5,
  },

  settingsButtonText: {
    color: 'white',
    fontSize: 28,
  },

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  status: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },

  recordButton: {
    width: 150,
    height: 150,
    borderRadius: 75,

    backgroundColor: 'red',

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 5,
  },

  stopButton: {
    backgroundColor: '#333',
  },

  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // --------------------------------------------------
  // PLAYBACK
  // --------------------------------------------------

  playbackContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 15,
  },

  playButton: {
    backgroundColor: 'green',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },

  pauseButton: {
    backgroundColor: '#555',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },

  // --------------------------------------------------
  // RECORDING INFORMATION
  // --------------------------------------------------

  infoContainer: {
    marginTop: 40,
    width: '100%',
    padding: 15,

    backgroundColor: 'white',
    borderRadius: 10,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  uri: {
    fontSize: 12,
    color: '#666',
  },

  // ==================================================
  // SETTINGS MODAL
  // ==================================================

  modalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(0, 0, 0, 0.5)',

    justifyContent: 'center',
    alignItems: 'center',
  },

  settingsModal: {
    width: '85%',

    backgroundColor: 'white',

    borderRadius: 15,

    padding: 25,

    elevation: 10,
  },

  settingsTitle: {
    fontSize: 26,
    fontWeight: 'bold',

    marginBottom: 25,
  },

  settingLabel: {
    fontSize: 16,
    fontWeight: '600',

    marginBottom: 10,
  },

  // --------------------------------------------------
  // DROPDOWN
  // --------------------------------------------------

  dropdown: {
    width: '100%',
    height: 50,

    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,

    paddingHorizontal: 15,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#fafafa',
  },

  dropdownText: {
    fontSize: 16,
    color: '#333',
  },

  dropdownArrow: {
    fontSize: 14,
    color: '#555',
  },

  dropdownOptions: {
    marginTop: 5,

    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,

    overflow: 'hidden',

    backgroundColor: 'white',
  },

  dropdownOption: {
    height: 50,

    paddingHorizontal: 15,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedOption: {
    backgroundColor: '#eeeeee',
  },

  optionText: {
    fontSize: 16,
    color: '#333',
  },

  selectedOptionText: {
    fontWeight: 'bold',
  },

  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // --------------------------------------------------
  // CLOSE BUTTON
  // --------------------------------------------------

  closeButton: {
    marginTop: 25,

    backgroundColor: '#333',

    paddingVertical: 14,

    borderRadius: 8,

    alignItems: 'center',
  },
});
