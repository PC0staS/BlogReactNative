import { fetchBlogsfromAPI } from "@/components/Blog/BlogsLogic";
import AuthFailed from "@/components/Login/AuthFailed";
import { checkAuth } from "@/components/Login/SingUpLogic";
import BlogThumbnail from "@/components/ui/BlogThumbail";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function Blog() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const result = await checkAuth();
                if (result && (result.isAuthenticated || result.user || result.ok)) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.warn("checkAuthStatus failed", err);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, []);

    type Post = { id: string | number; title: string; content: string; thumbnail_url: string; date?: string; author?: string };
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    useEffect(() => {
        async function fetchBlogs() {
            setPostsLoading(true);
            try {
                const result = await fetchBlogsfromAPI();
                setPosts(result || []);
            } catch (error) {
                console.error("Error fetching blogs:", error);
                setPosts([]);
            }
            finally {
                setPostsLoading(false);
            }
        }
        fetchBlogs();
    }, []);

    // Search state and debounce
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const filteredPosts = debouncedQuery.length > 0
        ? posts.filter(p => ((p.title || '') + ' ' + (p.content || '')).toLowerCase().includes(debouncedQuery))
        : posts;

    // Make a fixed sticky header height (title + search) so it remains above the posts.
    const HEADER_HEIGHT = 160;

    if (loading) return <ActivityIndicator size="large" color="#3d3636ff" />;

    return (
        <>
            {!isAuthenticated && <AuthFailed />}

            <View style={styles.screenPadding}>
                <View style={[styles.topCardContainer, { marginTop: 0 }]}> 
                    {/* Sticky header overlay above the posts */}
                    <View style={[styles.headerInner, { height: HEADER_HEIGHT, zIndex: 40 }]} pointerEvents="box-none">
                        <View style={styles.headerRow}>
                            <Text style={styles.titleBig}>Artículos</Text>
                            <View style={styles.headerActions}>
                                <Pressable onPress={() => {}}>
                                    <FontAwesome6 name="add" size={18} color="black" />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.searchBox}> 
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search here"
                                placeholderTextColor={styles.searchText.color}
                                style={styles.searchInput}
                                returnKeyType="search"
                                underlineColorAndroid="transparent"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {postsLoading ? (
                        <View style={{ padding: 28, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#3d3636ff" />
                        </View>
                    ) : filteredPosts.length === 0 ? (
                        <View style={{ padding: 28, alignItems: 'center' }}>
                            <Text style={{ color: '#666', fontSize: 15 }}>
                                {debouncedQuery
                                    ? `No se encontraron artículos para "${debouncedQuery}"`
                                    : 'No hay artículos disponibles.'}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            contentContainerStyle={{ paddingBottom: 40, paddingTop: HEADER_HEIGHT }}
                            style={{ flex: 1 }}
                            // iOS: avoid automatic safe-area/content inset adjustments that add unexpected top spacing
                            contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'never' : undefined}
                            data={filteredPosts}
                            renderItem={({ item }) => <BlogThumbnail post={item} />}
                            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#b9b9b9ff', marginHorizontal: 0 }} />}
                            keyExtractor={(item, index) => (item.id != null ? String(item.id) : String(index))}
                            scrollEventThrottle={16}
                            keyboardShouldPersistTaps="handled"
                        />
                    )}
                </View>
            </View>
        </>
    );
}

const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
    screenPadding: {
        flex: 1,
        paddingHorizontal: 0,
    },
    topCardContainer: {
        marginTop: 0,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#ffffff",
        flex: 1,
        minHeight: windowHeight - 120,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    headerInner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 18,
    paddingTop: 90,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 12,
    },
    headerActions: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#f2f4f7",
        justifyContent: "center",
        alignItems: "center",
    },
    titleBig: {
        color: "#1f2d3d",
        fontSize: 26,
        fontWeight: "700",
    },
    searchBox: {
        height: 46,
        borderRadius: 12,
        backgroundColor: "#f2f4f7",
        justifyContent: "center",
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    searchText: {
        color: "#9aa0a6",
    },
    searchInput: {
        height: 44,
        fontSize: 15,
        color: '#222',
        padding: 0,
    },

    // appBar removed
});
