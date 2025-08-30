
import { Poppins_400Regular, Poppins_600SemiBold, useFonts } from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput, View } from 'react-native';

export default function RootLayout() {

  let [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_600SemiBold });

  if (!fontsLoaded) {
    // Wait for fonts to load; render nothing until ready
    return null;
  }

  // Apply Poppins as default for Text and TextInput
  // Use any cast to avoid TypeScript complaints about defaultProps
  const TextAny = Text as any;
  const TextInputAny = TextInput as any;
  if (TextAny.defaultProps == null) TextAny.defaultProps = {};
  if (TextInputAny.defaultProps == null) TextInputAny.defaultProps = {};
  TextAny.defaultProps.style = { ...(TextAny.defaultProps.style || {}), fontFamily: 'Poppins_400Regular' };
  TextInputAny.defaultProps.style = { ...(TextInputAny.defaultProps.style || {}), fontFamily: 'Poppins_400Regular' };

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="index"
          
          options={{
            headerTitle: "",
            headerStyle: { backgroundColor: '#5b2f24' },
            headerShown: false // Oculta el header solo en esta pantalla
          }}
        />
        <Stack.Screen
          name="blog"
          options={{
            headerTitle: "",
            headerStyle: { backgroundColor: '#c9c6c5ff' },
            headerShown: false
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </View>
  );

}
