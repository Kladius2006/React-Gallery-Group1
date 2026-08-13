import * as ImagePicker from 'expo-image-picker';
import {Button, Image, View, StyleSheet, useWindowDimensions,} from 'react-native';
import { useState } from 'react';

export default function App() {
  const { width } = useWindowDimensions();

  const [images, setImages] = useState<string[]>([]);

  const imageSize = (width - 50) / 3;

  const pickImage = async () => { //Open phone's gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      //Wait until finish selecting in gallery then continue
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 30,
      allowsEditing: false,
      quality: 1,
    });

    console.log('Picker result:', result);

    if (!result.canceled) {
      setImages(result.assets.map((asset) => asset.uri));
      //find uri of selected assets then 
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.button}>
        <Button
          title="CHOOSE IMAGE"
          onPress={pickImage}
        />
      </View>

      <View style={styles.imageContainer}>
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={{
              width: imageSize,
              height: imageSize,
            }}
          />
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  button: {
    marginTop: 20,
    marginHorizontal: 20,
  },

  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 20,
  },
});