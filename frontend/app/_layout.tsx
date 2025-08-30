
import { deletePost } from '@/components/Blog/BlogsLogic';
import { Poppins_400Regular, Poppins_600SemiBold, useFonts } from '@expo-google-fonts/poppins';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
        <Stack.Screen
          name="blogpost"
          options={{
            headerTitle: "Crea un nuevo artículo",
            headerStyle: { backgroundColor: '#c9c6c5ff' },
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={{ padding: 12 }}>
                <AntDesign name="arrowleft" size={24} color="#1f2d3d" />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name='[blog]'
          options={({ route }) => {
            // In expo-router, the dynamic segment [blog] provides the param key 'blog'
            const id = (route.params as { blog?: string } | undefined)?.blog ?? '';
            return {
              headerTitle: "Ver artículo",
              headerStyle: { backgroundColor: '#f0efefff' },
              headerShown: true,
              header: (props) => <BlogHeader {...props} postId={id} />,
            };
          }}
        />
      </Stack>
    </View>
  );
};

const BlogHeader = ({ postId, ..._props }: { postId: string }) => {
  const [dropdownVisible, setDropdownVisible] = React.useState(false);

  const handleDeletePost = async (id: string) => {
    const numId = Number(id);
    if (!id || Number.isNaN(numId)) {
      alert('ID de artículo inválido');
      return;
    }
    await deletePost(String(numId));
    alert('Artículo eliminado');
    router.back();
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, backgroundColor: '#f0efefff', paddingHorizontal: 8, marginTop: Platform.OS === 'ios' ? 44 : 0, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <FontAwesome6 name="arrow-left" size={16} color="#000000ff" />
      </Pressable>
      <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', fontSize: 18 }}>Ver artículo</Text>
      <View style={{ position: 'relative' }}>
        <Pressable
          style={styles.menuBtn}
          onPress={() => setDropdownVisible((v: boolean) => !v)}
        >
          <FontAwesome6 name="ellipsis-vertical" size={16} color="#000000ff" />
        </Pressable>
        {dropdownVisible && (
          <View
            style={{
              position: 'absolute',
              top: 40,
              right: 8, // separate a bit from the screen edge
              backgroundColor: '#fff',
              borderRadius: 8,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              paddingVertical: 6,
              zIndex: 100,
              minWidth: 180,
              maxWidth: 260,
              overflow: 'hidden',
              borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
              borderColor: '#e5e7eb',
            }}
          >
            <Pressable onPress={() => { setDropdownVisible(false); handleDeletePost(postId); }} style={{ paddingVertical: 10, paddingHorizontal: 12 }}>
              <Text style={{ color:'red' }}>Eliminar</Text>
            </Pressable>
            <Pressable onPress={() => { setDropdownVisible(false); /* acción 2 */ }} style={{ paddingVertical: 10, paddingHorizontal: 12 }}>
              <Text>Opción 2</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  menuBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});