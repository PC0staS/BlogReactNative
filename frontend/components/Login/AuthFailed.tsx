import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AuthFailed() {
    const router = useRouter();
    const [pressed, setPressed] = useState(false);

    return (
        <View style={styles.screen}>
            <View style={styles.card}>
                <Text style={styles.icon}>🔒</Text>
                <Text style={styles.title}>Acceso denegado</Text>
                <Text style={styles.message}>
                    No hemos podido iniciar sesión con esas credenciales. Revisa tu usuario y contraseña e inténtalo de nuevo.
                </Text>

                <Pressable
                    onPress={() => router.push('/')}
                    onPressIn={() => setPressed(true)}
                    onPressOut={() => setPressed(false)}
                    style={[styles.button, pressed && styles.buttonPressed]}
                >
                    <Text style={styles.buttonText}>Volver al inicio</Text>
                </Pressable>

                <Pressable onPress={() => router.push('/')} style={styles.linkWrap}>
                    <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F5' },
    card: { width: '86%', backgroundColor: '#fff', padding: 28, borderRadius: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 6 },
    icon: { fontSize: 44, marginBottom: 12 },
    title: { fontSize: 20, fontWeight: '700', color: '#b91c1c', marginBottom: 8 },
    message: { fontSize: 15, color: '#444', textAlign: 'center', lineHeight: 20, marginBottom: 18 },
    button: { backgroundColor: '#b91c1c', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10 },
    buttonPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    linkWrap: { marginTop: 12 },
    link: { color: '#5b2f24', textDecorationLine: 'underline' },
});
