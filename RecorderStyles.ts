import {StyleSheet} from 'react-native';

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  // ====================================================
  // MAIN CONTAINER
  // ====================================================

  container: {
    flex: 1,

    backgroundColor: '#f5f5f5',

    justifyContent: 'center',
    alignItems: 'center',

    padding: 20,
  },

  // ====================================================
  // SETTINGS BUTTON
  // ====================================================

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

  // ====================================================
  // MAIN UI
  // ====================================================

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

  // ====================================================
  // RECORD BUTTON
  // ====================================================

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

  // ====================================================
  // PLAYBACK SECTION
  // ====================================================

  playbackSection: {
    width: '100%',

    marginTop: 35,

    alignItems: 'center',
  },

  // ====================================================
  // TIME DISPLAY
  // ====================================================

  timeContainer: {
    width: '100%',

    flexDirection: 'row',

    justifyContent: 'space-between',

    paddingHorizontal: 5,
  },

  timeText: {
    fontSize: 14,

    color: '#555',

    fontVariant: ['tabular-nums'],
  },

  // ====================================================
  // SLIDER
  // ====================================================

  slider: {
    width: '100%',

    height: 40,

    marginTop: 2,
  },

  // ====================================================
  // PLAYBACK BUTTONS
  // ====================================================

  playbackContainer: {
    flexDirection: 'row',

    marginTop: 5,

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

  restartButton: {
    backgroundColor: '#777',

    paddingVertical: 12,
    paddingHorizontal: 25,

    borderRadius: 10,

    marginTop: 15,
  },

  // ====================================================
  // RECORDING INFORMATION
  // ====================================================

  infoContainer: {
    marginTop: 30,

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

  // ====================================================
  // SETTINGS MODAL
  // ====================================================

  modalOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(0, 0, 0, 0.5)',

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

  // ====================================================
  // DROPDOWN
  // ====================================================

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

  // ====================================================
  // CLOSE BUTTON
  // ====================================================

  closeButton: {
    marginTop: 25,

    backgroundColor: '#333',

    paddingVertical: 14,

    borderRadius: 8,

    alignItems: 'center',
  },
});

export default styles