import { fetchBlogById } from '@/components/Blog/BlogsLogic';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Post = {
    id: string | number;
    title: string;
    content: string;
    thumbnail_url?: string;
    author?: string;
    created_at?: string;
    createdAt?: Date | null;
    createdAtFormatted?: string;
    category?: string;
};

export default function BlogPost() {
    const { blog } = useLocalSearchParams<{ blog: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                if (!blog) return;
                const p = await fetchBlogById(blog);
                if (!cancelled) setPost(p);
            } catch (e) {
                console.warn('load post failed', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [blog]);

    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
    if (!post) return <Text style={{ margin: 24 }}>No se encontró el artículo.</Text>;

    const dateText = post.createdAtFormatted
        || (post.created_at ? new Date(post.created_at).toLocaleString() : '')
        || (post.createdAt ? new Date(post.createdAt).toLocaleString() : '')
        || '';
    const authorText = typeof post.author === 'string'
        ? post.author
        : (post as any).author?.name || (post as any).author?.username || (post as any).author?.email || 'Autor';

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <StatusBar style="dark" backgroundColor="#ffffffff" />
            {/* Hero image with rounded bottom card overlay */}
            <View style={styles.heroContainer}>
                {post.thumbnail_url ? (
                    <Image source={{ uri: post.thumbnail_url }} style={styles.heroImage} />
                ) : (
                    <View style={[styles.heroImage, { backgroundColor: '#eaeef3' }]} />
                )}
                
                
            </View>

            <View style={styles.card}> 
                {post.category ? (
                    <View style={styles.pill}><Text style={styles.pillText}>{post.category}</Text></View>
                ) : null}
                <Text style={styles.title}>{post.title}</Text>

                <View style={styles.metaRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.author}>{authorText}</Text>
                        <Text style={styles.time}>{dateText}</Text>
                    </View>
                    <Pressable style={styles.iconBtn} onPress={() => {}}>
                        <FontAwesome6 name="square-share-nodes" size={16} color="#677482" />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => {}}>
                        <FontAwesome6 name="bookmark" size={16} color="#677482" />
                    </Pressable>
                </View>

                        {/* Contenido como texto plano */}
                        {post.content ? (
                            <Text style={styles.excerpt}>{post.content}</Text>
                        ) : null}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    heroContainer: {
        position: 'relative',
        height: 260,
        backgroundColor: '#000',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    
    card: {
        marginTop: -20,
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    pill: {
        alignSelf: 'flex-start',
        backgroundColor: '#f7e9ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 10,
    },
    pillText: {
        color: '#b149d6',
        fontSize: 12,
        fontWeight: '700',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1f2d3d',
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    author: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2d3d',
    },
    time: {
        fontSize: 12,
        color: '#677482',
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f2f4f7',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    excerpt: {
        fontSize: 14,
        color: '#394b5a',
        lineHeight: 20,
    },
});

    
