import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  // RECORDER
  // --------------------------------------------------

  const recorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const recorderState = useAudioRecorderState(recorder);

  // --------------------------------------------------
  // RECORDING URI
  // --------------------------------------------------

  const [recordingUri, setRecordingUri] = useState<string | null>(
    null
  );

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
  // UI
  // --------------------------------------------------

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Voice Recorder
      </Text>

      {/* Recording time */}

      <Text style={styles.timer}>
        {formatTime(recorderState.durationMillis)}
      </Text>

      {/* Recording status */}

      <Text style={styles.status}>
        {recorderState.isRecording
          ? 'Recording...'
          : recordingUri
          ? 'Recording complete'
          : 'Ready to record'}
      </Text>

      {/* Record button */}

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

      {/* Playback buttons */}

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

      {/* Recording information */}

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

    </View>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

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
});