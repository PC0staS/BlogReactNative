import { fetchBlogsfromAPI } from "@/components/Blog/BlogsLogic";
import AuthFailed from "@/components/Login/AuthFailed";
import { checkAuth } from "@/components/Login/SingUpLogic";
import BlogThumbnail from "@/components/ui/BlogThumbail";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
    SafeAreaView,
    StyleSheet,
    Text,
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
    useEffect(() => {
        async function fetchBlogs() {
            try {
                const result = await fetchBlogsfromAPI();
                setPosts(result || []);
            } catch (error) {
                console.error("Error fetching blogs:", error);
                setPosts([]);
            }
        }
        fetchBlogs();
    }, []);

    const scrollY = useRef(new Animated.Value(0)).current;
    const topPadding = Platform.OS === "android" ? RNStatusBar.currentHeight ?? 0 : 44;

    const HEADER_EXPANDED_HEIGHT = 160;
    const HEADER_COLLAPSED_HEIGHT = 64 + topPadding;
    const collapseDistance = Math.max(1, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT);

    const headerOpacity = scrollY.interpolate({ inputRange: [0, collapseDistance], outputRange: [0, 1], extrapolate: "clamp" });
    const titleOpacity = scrollY.interpolate({ inputRange: [0, collapseDistance * 0.6, collapseDistance], outputRange: [1, 0.4, 0], extrapolate: "clamp" });

    if (loading) return <ActivityIndicator size="large" color="#3d3636ff" />;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffffff" }}>
            {!isAuthenticated && <AuthFailed />}

            <Animated.View style={[styles.appBar, { paddingTop: topPadding, opacity: headerOpacity }]}>
                <Text style={styles.appBarTitle}>Articles</Text>
            </Animated.View>

            <View style={styles.screenPadding}>
                <View style={styles.topCardContainer}>
                    <Animated.FlatList
                        data={posts}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        ListHeaderComponent={() => (
                            <Animated.View style={[styles.headerInner, { height: HEADER_EXPANDED_HEIGHT }] }>
                                <View style={styles.headerRow}>
                                    <Animated.Text style={[styles.titleBig, { opacity: titleOpacity }]}>Articles</Animated.Text>
                                    <View style={styles.headerActions} />
                                </View>

                                <Animated.View style={[styles.searchBox, { opacity: titleOpacity }]}> 
                                    <Text style={styles.searchText}>Search here</Text>
                                </Animated.View>
                            </Animated.View>
                        )}
                        renderItem={({ item }) => <BlogThumbnail post={item} />}
                        keyExtractor={(item, index) => (item.id != null ? String(item.id) : String(index))}
                        ListEmptyComponent={() => <ActivityIndicator size="large" color="#3d3636ff" />}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
    screenPadding: {
        flex: 1,
        paddingHorizontal: 0,
    },
    topCardContainer: {
        marginTop: 12,
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
        paddingHorizontal: 18,
        paddingTop: 18,
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

    appBar: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 104,
        backgroundColor: "#ffffffee",
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e9eaec",
        zIndex: 30,
    },
    appBarTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1f2d3d",
    },
});
