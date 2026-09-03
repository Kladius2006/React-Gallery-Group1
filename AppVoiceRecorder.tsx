import React, { useEffect, useState } from 'react';
import { Alert, Modal, Text, TouchableOpacity, View,} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import styles from './RecorderStyles';

export default function App() {
  // ==================================================
  // AUDIO QUALITY
  // ==================================================

  const [audioQuality, setAudioQuality] = useState<
    'HIGH_QUALITY' | 'LOW_QUALITY'
  >('HIGH_QUALITY');

  const [settingsVisible, setSettingsVisible] = useState(false);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Change the actual RecordingOptions
  // based on selected quality
  const recordingPreset =
    audioQuality === 'HIGH_QUALITY'
      ? RecordingPresets.HIGH_QUALITY
      : RecordingPresets.LOW_QUALITY;

  // ==================================================
  // RECORDER
  // ==================================================

  const recorder = useAudioRecorder(
    recordingPreset
  );

  const recorderState = useAudioRecorderState(
    recorder
  );

  // ==================================================
  // RECORDING URI
  // ==================================================

  const [recordingUri, setRecordingUri] = useState<
    string | null
  >(null);

  // ==================================================
  // AUDIO PLAYER
  // ==================================================

  const player = useAudioPlayer(recordingUri);

  // Get real-time playback information
  //
  // currentTime = current playback position in seconds
  // duration    = total audio duration in seconds
  //
  const playerStatus = useAudioPlayerStatus(player);

  // ==================================================
  // SLIDER
  // ==================================================

  // Value displayed while the user is dragging
  // the slider.
  const [sliderValue, setSliderValue] = useState(0);

  // Used to determine whether the user is
  // currently dragging the slider.
  const [isSliding, setIsSliding] = useState(false);

  // ==================================================
  // REQUEST MICROPHONE PERMISSION
  // ==================================================

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
        console.log(
          'Audio setup error:',
          error
        );
      }
    }

    setupAudio();
  }, []);

  // ==================================================
  // KEEP SLIDER SYNCHRONIZED WITH AUDIO
  // ==================================================

  useEffect(() => {
    // Don't update the slider while the user
    // is manually dragging it.
    if (!isSliding) {
      setSliderValue(playerStatus.currentTime);
    }
  }, [
    playerStatus.currentTime,
    isSliding,
  ]);

  // ==================================================
  // START RECORDING
  // ==================================================

  const startRecording = async () => {
    try {
      // Remove previous recording
      setRecordingUri(null);

      // Reset slider
      setSliderValue(0);

      await recorder.prepareToRecordAsync();

      recorder.record();

      console.log('Recording started');
      console.log(
        'Quality:',
        audioQuality
      );
    } catch (error) {
      console.log(
        'Failed to start recording:',
        error
      );

      Alert.alert(
        'Error',
        'Could not start recording.'
      );
    }
  };

  // ==================================================
  // STOP RECORDING
  // ==================================================

  const stopRecording = async () => {
    try {
      await recorder.stop();

      const uri = recorder.uri;

      console.log('Recording stopped');
      console.log(
        'Recording URI:',
        uri
      );

      if (uri) {
        setRecordingUri(uri);
        setSliderValue(0);
      }
    } catch (error) {
      console.log(
        'Failed to stop recording:',
        error
      );

      Alert.alert(
        'Error',
        'Could not stop recording.'
      );
    }
  };

  // ==================================================
  // PLAY RECORDING
  // ==================================================

  const playRecording = () => {
    if (!recordingUri) {
      Alert.alert(
        'No Recording',
        'Record something first.'
      );

      return;
    }

    try {
      // Play from the current position.
      //
      // This means:
      // - after pressing PAUSE -> resumes
      // - after moving slider -> continues there
      //
      player.play();
    } catch (error) {
      console.log(
        'Playback error:',
        error
      );
    }
  };

  // ==================================================
  // RESTART RECORDING PLAYBACK
  // ==================================================

  const restartRecording = async () => {
    if (!recordingUri) {
      return;
    }

    try {
      await player.seekTo(0);

      setSliderValue(0);

      player.play();
    } catch (error) {
      console.log(
        'Restart error:',
        error
      );
    }
  };

  // ==================================================
  // PAUSE RECORDING PLAYBACK
  // ==================================================

  const pauseRecording = () => {
    try {
      player.pause();
    } catch (error) {
      console.log(
        'Pause error:',
        error
      );
    }
  };

  // ==================================================
  // CHANGE PLAYBACK POSITION
  // ==================================================

  const handleSlidingStart = () => {
    setIsSliding(true);
  };

  const handleSliderChange = (
    value: number
  ) => {
    setSliderValue(value);
  };

  const handleSlidingComplete = async (
    value: number
  ) => {
    try {
      await player.seekTo(value);
    } catch (error) {
      console.log(
        'Seek error:',
        error
      );
    }

    setSliderValue(value);
    setIsSliding(false);
  };

  // ==================================================
  // FORMAT TIME
  // ==================================================

  // Input is seconds
  const formatTime = (
    seconds: number
  ) => {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return '0:00';
    }

    const totalSeconds = Math.floor(
      seconds
    );

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const remainingSeconds =
      totalSeconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  // ==================================================
  // CHANGE AUDIO QUALITY
  // ==================================================

  const selectAudioQuality = (
    quality:
      | 'HIGH_QUALITY'
      | 'LOW_QUALITY'
  ) => {
    // Don't allow changing settings
    // while recording.
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

  // ==================================================
  // UI
  // ==================================================

  return (
    <View style={styles.container}>

      {/* =================================================
          SETTINGS BUTTON
      ================================================= */}

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() =>
          setSettingsVisible(true)
        }
      >
        <Text
          style={styles.settingsButtonText}
        >
          ⚙
        </Text>
      </TouchableOpacity>

      {/* =================================================
          TITLE
      ================================================= */}

      <Text style={styles.title}>
        Voice Recorder
      </Text>

      {/* =================================================
          RECORDING TIME
      ================================================= */}

      <Text style={styles.timer}>
        {formatTime(
          recorderState.durationMillis / 1000
        )}
      </Text>

      {/* =================================================
          RECORDING STATUS
      ================================================= */}

      <Text style={styles.status}>
        {recorderState.isRecording
          ? 'Recording...'
          : recordingUri
          ? 'Recording complete'
          : 'Ready to record'}
      </Text>

      {/* =================================================
          RECORD BUTTON
      ================================================= */}

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

      {/* =================================================
          PLAYBACK
      ================================================= */}

      {recordingUri && (
        <View style={styles.playbackSection}>

          {/* ---------------------------------------------
              TIME DISPLAY
          --------------------------------------------- */}

          <View
            style={styles.timeContainer}
          >
            <Text style={styles.timeText}>
              {formatTime(
                isSliding
                  ? sliderValue
                  : playerStatus.currentTime
              )}
            </Text>

            <Text style={styles.timeText}>
              {formatTime(
                playerStatus.duration
              )}
            </Text>
          </View>

          {/* ---------------------------------------------
              SLIDER
          --------------------------------------------- */}

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={
              playerStatus.duration || 1
            }
            value={sliderValue}
            minimumTrackTintColor="#333"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#333"

            onSlidingStart={
              handleSlidingStart
            }

            onValueChange={
              handleSliderChange
            }

            onSlidingComplete={
              handleSlidingComplete
            }
          />

          {/* ---------------------------------------------
              PLAYBACK BUTTONS
          --------------------------------------------- */}

          <View
            style={styles.playbackContainer}
          >

            {/* PLAY */}

            <TouchableOpacity
              style={styles.playButton}
              onPress={playRecording}
            >
              <Text
                style={styles.buttonText}
              >
                ▶ PLAY
              </Text>
            </TouchableOpacity>

            {/* PAUSE */}

            <TouchableOpacity
              style={styles.pauseButton}
              onPress={pauseRecording}
            >
              <Text
                style={styles.buttonText}
              >
                ⏸ PAUSE
              </Text>
            </TouchableOpacity>

          </View>

          {/* ---------------------------------------------
              RESTART BUTTON
          --------------------------------------------- */}

          <TouchableOpacity
            style={styles.restartButton}
            onPress={restartRecording}
          >
            <Text
              style={styles.buttonText}
            >
              ↻ RESTART
            </Text>
          </TouchableOpacity>

        </View>
      )}

      {/* =================================================
          RECORDING INFORMATION
      ================================================= */}

      {recordingUri && (
        <View
          style={styles.infoContainer}
        >

          <Text
            style={styles.infoTitle}
          >
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

      {/* =================================================
          SETTINGS MODAL
      ================================================= */}

      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setSettingsVisible(false)
        }
      >

        <View
          style={styles.modalOverlay}
        >

          <View
            style={styles.settingsModal}
          >

            {/* -----------------------------------------
                MODAL TITLE
            ----------------------------------------- */}

            <Text
              style={styles.settingsTitle}
            >
              Settings
            </Text>

            {/* -----------------------------------------
                AUDIO QUALITY LABEL
            ----------------------------------------- */}

            <Text
              style={styles.settingLabel}
            >
              Audio Record Quality
            </Text>

            {/* -----------------------------------------
                DROPDOWN
            ----------------------------------------- */}

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() =>
                setDropdownVisible(
                  !dropdownVisible
                )
              }
            >

              <Text
                style={styles.dropdownText}
              >
                {audioQuality ===
                'HIGH_QUALITY'
                  ? 'High Quality'
                  : 'Low Quality'}
              </Text>

              <Text
                style={styles.dropdownArrow}
              >
                {dropdownVisible
                  ? '▲'
                  : '▼'}
              </Text>

            </TouchableOpacity>

            {/* -----------------------------------------
                DROPDOWN OPTIONS
            ----------------------------------------- */}

            {dropdownVisible && (
              <View
                style={styles.dropdownOptions}
              >

                {/* HIGH QUALITY */}

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
                    <Text
                      style={
                        styles.checkmark
                      }
                    >
                      ✓
                    </Text>
                  )}

                </TouchableOpacity>

                {/* LOW QUALITY */}

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
                    <Text
                      style={
                        styles.checkmark
                      }
                    >
                      ✓
                    </Text>
                  )}

                </TouchableOpacity>

              </View>
            )}

            {/* -----------------------------------------
                CLOSE BUTTON
            ----------------------------------------- */}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setDropdownVisible(false);
                setSettingsVisible(false);
              }}
            >
              <Text
                style={styles.buttonText}
              >
                CLOSE
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
}