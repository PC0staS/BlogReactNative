import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut, interpolate, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { checkAuth, Login, SignUp } from './SingUpLogic';

type Props = {
    isSigningUp: boolean;
    setIsSigningUp: (v: boolean) => void;
};

export default function SignUpComponent({ isSigningUp, setIsSigningUp }: Props) {
    // console.log('SignUpComponent render start, platform=', Platform.OS);
        const progress = useSharedValue(isSigningUp ? 1 : 0);

    // form state for registration/login
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [serverError, setServerError] = useState<string | null>(null);

    // refs to move focus between inputs when pressing Enter
    const nameRef = useRef<TextInput | null>(null);
    const emailRef = useRef<TextInput | null>(null);
    const passwordRef = useRef<TextInput | null>(null);

    // show/hide password
    const [showPassword, setShowPassword] = useState(false);
    // loading indicator while checking credentials
    const [loading, setLoading] = useState(false);

    // translate the whole component when keyboard appears so it can cover welcome text
    const translateY = useSharedValue(0);
    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    useEffect(() => {
        // console.log('SignUp: keyboard useEffect mounting');
        try {
            const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
            const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

            if (Keyboard && typeof (Keyboard as any).addListener === 'function') {
                const showSub = Keyboard.addListener(showEvent, (e: any) => {
                    const h = e?.endCoordinates?.height ?? 300;
                    // move up by a portion of keyboard height so the component covers welcome text
                    translateY.value = withTiming(-Math.min(h * 0.6, 260), { duration: 300 });
                });
                const hideSub = Keyboard.addListener(hideEvent, () => {
                    translateY.value = withTiming(0, { duration: 250 });
                });

                return () => { showSub.remove(); hideSub.remove(); };
            } else {
                // console.log('SignUp: Keyboard.addListener not available on this platform');
                return () => {};
            }
        } catch (err) {
            console.error('SignUp: keyboard useEffect failed', err);
        }
    }, [translateY]);

        useEffect(() => {
                // animate underline progress (500ms)
                try {
                    // console.log('SignUp: progress useEffect run, isSigningUp=', isSigningUp);
                    progress.value = withTiming(isSigningUp ? 1 : 0, { duration: 500 });
                } catch (err) {
                    console.error('SignUp: progress useEffect failed', err);
                }
        }, [isSigningUp, progress]);

    const leftUnderline = useAnimatedStyle(() => ({
        transform: [{ scaleX: interpolate(progress.value, [0, 1], [1, 0]) }],
        opacity: interpolate(progress.value, [0, 1], [1, 0]),
    }));

    const rightUnderline = useAnimatedStyle(() => ({
        transform: [{ scaleX: interpolate(progress.value, [0, 1], [0, 1]) }],
        opacity: interpolate(progress.value, [0, 1], [0, 1]),
    }));

    // we'll use Reanimated Layout animations for reflow when Nombre mounts/unmounts

        // button scale shared values
        const loginBtnScale = useSharedValue(1);
        const signupBtnScale = useSharedValue(1);

        const loginBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: loginBtnScale.value }] }));
        const signupBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: signupBtnScale.value }] }));

    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setErrors(['All fields are required']);
            return;
        }
        setErrors([]);
        setServerError(null);
        setLoading(true);
        try {
            const result = await SignUp(name, email, password);
            if (result.error) {
                setServerError(result.error);
            } else {
                setServerError(null);
                setErrors([]);
                setName('');
                setEmail('');
                setPassword('');
                setIsSigningUp(false);
                alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            }
        } catch (err: any) {
            setServerError(err?.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };
    const handleLogin = async () => {
        if (!email || !password) {
            setErrors(['All fields are required']);
            return;
        }
        setErrors([]);
        setServerError(null);
        setLoading(true);
        try {
            const result = await Login(email, password);
            // console.log('handleLogin: login result', result);
            if (!result.error) {
                setServerError(null);
                setErrors([]);
                setEmail('');
                setPassword('');
                setIsSigningUp(false);
                alert('¡Inicio de sesión exitoso!');
                // console.log('handleLogin: success, checking auth on server...');
                try {
                    await checkAuth();
                    // console.log('handleLogin: checkAuth returned');
                } catch (err) {
                    console.warn('handleLogin: checkAuth failed', err);
                }

                // console.log('handleLogin: navigating to /blog');
                router.push('/blog');
                // web fallback in case router is not working
                if (typeof window !== 'undefined' && (window as any).location) {
                    setTimeout(() => { try { (window as any).location.href = '/blog'; } catch {} }, 300);
                }
            } else {
                setServerError(result.error);
            }
        } catch (err: any) {
            setServerError(err?.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            {/* Tabs with animated underlines */}
            <View style={styles.tabsRow}>
                <Pressable onPress={() => setIsSigningUp(false)} style={styles.tab}>
                    <Text style={styles.tabText}>Iniciar sesión</Text>
                    <Animated.View style={[styles.underline, leftUnderline]} />
                </Pressable>

                <Pressable onPress={() => setIsSigningUp(true)} style={styles.tab}>
                    <Text style={styles.tabText}>Registrarse</Text>
                    <Animated.View style={[styles.underline, rightUnderline]} />
                </Pressable>
            </View>

            {/* Form area */}
            <View style={styles.formContainer}>
                                {isSigningUp && (
                                            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(220)} layout={LinearTransition.springify()}>
                                                    <Text style={styles.label}>Nombre</Text>
                                                    <TextInput
                                                        ref={nameRef}
                                                        onChangeText={setName}
                                                        style={styles.input}
                                                        returnKeyType="next"
                                                        onSubmitEditing={() => emailRef.current?.focus()}
                                                        autoCapitalize="words"
                                                    />
                                            </Animated.View>
                                        )}

                                <Animated.View layout={LinearTransition.springify()}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        ref={emailRef}
                                        value={email}
                                        onChangeText={setEmail}
                                        style={styles.input}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        returnKeyType="next"
                                        onSubmitEditing={() => passwordRef.current?.focus()}
                                    />
                                </Animated.View>

                                <Animated.View layout={LinearTransition.springify()}>
                                    <Text style={styles.label}>{isSigningUp ? 'Crea una contraseña' : 'Introduce tu contraseña'}</Text>
                                    <View style={styles.inputRow}>
                                        <TextInput
                                            ref={passwordRef}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            style={[styles.input, styles.inputFlexible]}
                                            returnKeyType={isSigningUp ? 'done' : 'go'}
                                            onSubmitEditing={() => { if (isSigningUp) handleRegister(); /* else: trigger login if implemented */ }}
                                        />
                                        <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                                            <Text style={styles.eyeText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
                                        </Pressable>
                                    </View>
                                </Animated.View>

                {/* Action button with scale + haptic */}
                {!isSigningUp ? (
                    <Animated.View layout={LinearTransition.springify()} style={loginBtnStyle}>
                        {(errors.length > 0 || serverError) && (
                            <View style={styles.errorBox}>
                                {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}
                                {errors.map((e, i) => (
                                    <Text key={i} style={styles.errorText}>{e}</Text>
                                ))}
                            </View>
                        )}
                        <Pressable
                            onPressIn={() => { loginBtnScale.value = withTiming(0.96, { duration: 60 }); Haptics.selectionAsync(); }}
                            onPressOut={() => { loginBtnScale.value = withTiming(1, { duration: 120 }); }}
                            onPress={handleLogin}
                            disabled={loading}
                            style={styles.actionBtn}
                        >
                            <Text style={styles.actionText}>Iniciar sesión</Text>
                        </Pressable>
                    </Animated.View>
                ) : (
                    
                    <Animated.View layout={LinearTransition.springify()} style={signupBtnStyle}>
                        {/* show validation/server errors above button */}
                        {isSigningUp && (errors.length > 0 || serverError) && (
                            <View style={styles.errorBox}>
                                {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}
                                {errors.map((e, i) => (
                                    <Text key={i} style={styles.errorText}>{e}</Text>
                                ))}
                            </View>
                        )}
                        <Pressable
                            onPressIn={() => { signupBtnScale.value = withTiming(0.96, { duration: 60 }); Haptics.selectionAsync(); }}
                            onPressOut={() => { signupBtnScale.value = withTiming(1, { duration: 120 }); }}
                            onPress={handleRegister}
                            disabled={loading}
                            style={styles.actionBtn}
                        >
                            <Text style={styles.actionText}>Registrarse</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </View>

            <View style={styles.termsWrap}>
                <Text style={styles.terms}>Aplican Términos y Condiciones*</Text>
            </View>
            {loading && (
                <View style={styles.loadingOverlay} pointerEvents="auto">
                    <ActivityIndicator size="large" color="#5b2f24" />
                </View>
            )}
    </Animated.View>
    );

}

// ensure we know the window height so the component can cover the whole screen when moved by the keyboard
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'column', paddingTop: 20, backgroundColor: '#FBEAE7', borderRadius: 40, minHeight: windowHeight, overflow: 'hidden' },
    tabsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 40, paddingTop: 8, marginBottom: 12 },
    tab: { alignItems: 'center', paddingHorizontal: 8 },
    tabText: { fontWeight: '700', color: '#5b2f24', fontSize: 16 },
    underline: { height: 3, width: 80, backgroundColor: '#5b2f24', marginTop: 6, transform: [{ scaleX: 0 }] },
    formsWrap: { height: 360, paddingHorizontal: 0 },
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0 },
    formContainer: { paddingHorizontal: 26, paddingTop: 8, backgroundColor: 'transparent' },
    label: { fontWeight: '600', color: '#5b2f24', fontSize: 20, marginTop: 12 },
    input: { borderWidth: 2, borderColor: '#5b2f24', padding: 20, borderRadius: 40, marginTop: 12 },
    actionBtn: { alignItems: 'center', backgroundColor: '#5b2f24', padding: 24, borderRadius: 35, marginTop: 12, marginLeft: 70, marginRight: 70},
    actionText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 24 },
    termsWrap: { position:"absolute", alignItems: 'center', bottom: 24, left: 0 , right: 0 },
    errorBox: { backgroundColor: '#fff1f0', borderColor: '#ffccd5', borderWidth: 1, padding: 8, borderRadius: 8, marginBottom: 8, marginTop: 8 },
    errorText: { color: '#b91c1c', fontSize: 12 },
    terms: { fontWeight: '400', color: '#5b2f24', fontSize: 12, textAlign: 'center' },
    inputRow: { flexDirection: 'row', alignItems: 'center' },
    inputFlexible: { flex: 1, marginRight: 8 },
    eyeBtn: { paddingHorizontal: 10, paddingVertical: 8 },
    eyeText: { color: '#5b2f24', fontWeight: '600' },
    loadingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 40 },
});