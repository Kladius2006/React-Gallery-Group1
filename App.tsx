import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, useWindowDimensions } from 'react-native';

export default function App() {
  const {width, height} = useWindowDimensions();
  const imageSize = (width - 40)/ 3;
  return (
    <View style={styles.container}>

      <Text style={styles.Text}>
        Gallery
      </Text>
      <StatusBar style="auto" />

      <View style={styles.RowContainer}>
        <Image
          source={require('./assets/hatsune-miku-mesmerizer.gif')}
          style={[styles.ImageContainer,
            {
              width: imageSize,
              height: imageSize,
            }
          ]}
        />
        <Image
          source={require('./assets/hatsune-miku-honkai-star-rail.gif')}
          style={[styles.ImageContainer,
            {
              width: imageSize,
              height: imageSize,
            }
          ]}
        />
        <Image
          source={require('./assets/hatsune-miku-mesmerizer.gif')}
          style={[styles.ImageContainer,
            {
              width: imageSize,
              height: imageSize,
            }
          ]}
        />
        <Image
          source={require('./assets/hatsune-miku-honkai-star-rail.gif')}
          style={[styles.ImageContainer,
            {
              width: imageSize,
              height: imageSize,
            }
          ]}
        />
        <Image
          source={require('./assets/ado-azula-diana.gif')}
          style={[styles.ImageContainer,
            {
              width: imageSize,
              height: imageSize,
            }
          ]}
        />
        <Image
          source={require('./assets/hatsune-miku-honkai-star-rail.gif')}
          style={[styles.ImageContainer,
            {
              width: imageSize,
              height: imageSize,
            }
          ]}
        />
        <Image
          source={require('./assets/hatsune-miku-mesmerizer.gif')}
          style={[styles.ImageContainer,
            {
              width: imageSize,
              height: imageSize,
            }
          ]}
        />
        <Image
          source={require('./assets/hatsune-miku-honkai-star-rail.gif')}
          style={[styles.ImageContainer,
            {
              width: imageSize,
              height: imageSize,
            }
          ]}
        />
        <Image
          source={require('./assets/hatsune-miku-mesmerizer.gif')}
          style={[styles.ImageContainer,
            {
              width: imageSize,
              height: imageSize,
            }
          ]}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Text: {
    fontSize: 30,
  },
  RowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',      // Allow items to wrap to the next row
    justifyContent: 'flex-start',
    padding: 10,
  },
  ImageContainer: {
    marginBottom: 5,
  },
});
