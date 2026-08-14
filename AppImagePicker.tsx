import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  Alert,
} from 'react-native';

import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';

export default function App() {
  const { width } = useWindowDimensions();

  const [images, setImages] = useState<string[]>([]);

  const imageSize = (width - 40) / 3;

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    // Request/check permission every time the app starts
    const permission = await MediaLibrary.requestPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Please allow access to your photos.'
      );
      return;
    }

    // Permission was granted, so load the photos
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: 'photo',
      first: 100,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    const uris = result.assets.map((asset) => asset.uri);

    setImages(uris);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gallery</Text>

      <FlatList
        data={images}
        numColumns={3}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{
              width: imageSize,
              height: imageSize,
              margin: 5,
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});