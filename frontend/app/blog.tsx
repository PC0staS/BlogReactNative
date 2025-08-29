import AuthFailed from "@/components/Login/AuthFailed";
import { checkAuth } from "@/components/Login/SingUpLogic";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Blog() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Simula el estado de autenticación
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const [email, setEmail] = useState('');

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const result = await checkAuth();
                // console.log('checkAuthStatus: result', result);
                // backwards-compatible: check for user object or ok flag
                if (result && (result.isAuthenticated || result.user || result.ok)) {
                    setIsAuthenticated(true);
                    if (result.user) setUser(result.user);
                    setEmail(result.user?.email || '');
                    // console.log('checkAuthStatus: user is authenticated');
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.warn('checkAuthStatus failed', err);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
    // console.log('checking authentication status (on mount)');
    checkAuthStatus();
    }, []);

    return (
        loading ? (
            <ActivityIndicator size="large" color="#3d3636ff" />
        ) : isAuthenticated ? (
            <View>
                <Text>Blog</Text>
                {user ? <Text>Hola, {user.name}</Text> : null}  {/* TODO: Blog content */}
            </View>
        ) : (
            <AuthFailed />
        )
    );
}
