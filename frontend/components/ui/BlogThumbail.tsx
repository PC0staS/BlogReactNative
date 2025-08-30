import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Post = { id: string | number; title: string; content: string; thumbnail_url?: string; date?: string; author?: string; created_at?: string; createdAtFormatted?: string };



export default function BlogThumbnail({ post }: { post: Post }) {
    const imageUri = post.thumbnail_url;
    // Prefer the normalized Date object, then formatted string, then raw fields
    let createdAtDate: Date | null = null;
    if ((post as any).createdAt instanceof Date) createdAtDate = (post as any).createdAt;
    else if (post.createdAtFormatted) createdAtDate = new Date(post.createdAtFormatted);
    else if (post.date) createdAtDate = new Date(post.date);
    else if (post.created_at) createdAtDate = new Date(post.created_at);

    // Validate date
    const date = createdAtDate && !isNaN(createdAtDate.getTime()) ? timeAgo(createdAtDate) : "";

    function timeAgo(date: Date) {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        const intervals: [number, string][] = [
            [60, "segundo"],
            [60, "minuto"],
            [24, "hora"],
            [30, "día"],
            [12, "mes"],
            [Number.POSITIVE_INFINITY, "año"],
        ];

        let i = 0;
        let value = seconds;
        while (i < intervals.length - 1 && value >= intervals[i][0]) {
            value = Math.floor(value / intervals[i][0]);
            i++;
        }

        const label = intervals[i][1];
        return `hace ${value} ${label}${value !== 1 ? "s" : ""}`;
    }
    return (
    <Pressable onPress={() => router.push(`/${post.id}`)}>
            <View style={styles.thumbnailContainer}>
                <View style={styles.thumbnailInfo}>
                    <Text style={styles.thumbnailTitle}>{post.title}</Text>
                    <View style={styles.thumbnailMeta}>
                        <Text style={styles.thumbnailAuthor}>{post.author}</Text>
                        <Text style={styles.thumbnailDate}>{date}</Text>
                        
                    </View>
                </View>
                <View>
                    {imageUri && (
                        <Image source={{ uri: imageUri }} style={styles.thumbnailImage} resizeMode="cover" />
                    )}
                </View>

            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    
    thumbnailContainer: {
        flex: 1,
      flexDirection: 'row',
      overflow: 'hidden',
      marginBottom: 0,
      justifyContent: 'space-between',
      
      padding: 24,
      
    },
    thumbnailInfo: {
        flex: 1,
        paddingRight: 12,
    },
    thumbnailMeta: {
        flexDirection: 'row',

    },
    thumbnailImage: {
        width: 150,
        height: 200,
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        shadowColor: '#000',
    },
    thumbnailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 46,
        height: 130,
        flexShrink: 1,
    },
    thumbnailDate: {
        fontSize: 12,
        color: '#666',
       
    },
    thumbnailAuthor: {
        fontSize: 12,
        color: '#04065aff',
        marginRight: 12,
        fontWeight: 'bold',
    },
    placeholder: {
        backgroundColor: '#eee',
    },
});
