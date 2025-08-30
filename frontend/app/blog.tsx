import { fetchBlogsfromAPI } from "@/components/Blog/BlogsLogic";
import AuthFailed from "@/components/Login/AuthFailed";
import { checkAuth } from "@/components/Login/SingUpLogic";
import BlogThumbnail from "@/components/ui/BlogThumbail";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

export default function Blog() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Simula el estado de autenticación
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const [email, setEmail] = useState('');

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const result = await checkAuth();
                // backwards-compatible: check for user object or ok flag
                if (result && (result.isAuthenticated || result.user || result.ok)) {
                    setIsAuthenticated(true);
                    if (result.user) setUser(result.user);
                    setEmail(result.user?.email || '');
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



    type Post = { id: string | number; title: string; content: string; thumbnail_url: string; date?: string; author?: string; };
    const [posts, setPosts] = useState<Post[]>([]);
    useEffect(() => {
        async function fetchBlogs(){
            try{
                const result = await fetchBlogsfromAPI();
                console.log('Fetched blogs:', result);
                // normalize result: API might return an array or an object like { posts: [...] }
                setPosts(result);
            }
            catch (error) {
                console.error('Error fetching blogs:', error);
                setPosts([]);
            }
        };
        fetchBlogs();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#3d3636ff" />;
    }

    return (
        <>
            {!isAuthenticated && <AuthFailed />}
            <View style={styles.header}>

                <Text style={styles.hello}>Articles</Text>
                <FlatList
                    data={posts}
                style={styles.container}
                renderItem={({ item }) => <BlogThumbnail post={item} />}
                keyExtractor={(item, index) => (item.id != null ? String(item.id) : String(index))}
                ListEmptyComponent={() => <ActivityIndicator size="large" color="#3d3636ff" />}
            />
        </View>
        </>
    );
}
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#c9c6c5ff',
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        paddingTop: 20,
        backgroundColor: '#f8f4f3ff',
        borderRadius: 40,
        minHeight: windowHeight,
    },
    hello: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 80,
    },
});
