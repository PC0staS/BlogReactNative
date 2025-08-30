import { createPostJSON } from '@/components/Blog/BlogsLogic';
import { checkAuth } from '@/components/Login/SingUpLogic';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CreateBlogPost() {
	const [title, setTitle] = useState('');
	const [mdx, setMdx] = useState('');
	const [image, setImage] = useState<{ uri: string; base64?: string; mimeType?: string } | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [author, setAuthor] = useState('');
		const [createdAt] = useState<string>(new Date().toISOString());

	// Prefill author from auth endpoint if present
	useState(() => {
		(async () => {
			try {
				const res = await checkAuth();
				const name = (res && (res.name || res.user?.name || res.user?.username || res.user?.email)) || '';
				if (name) setAuthor(name);
			} catch {}
		})();
		return undefined;
	});

	async function pickImage() {
		// Request permissions
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permisos requeridos', 'Se necesita acceso a la galería para seleccionar una imagen.');
			return;
		}
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				quality: 0.8,
				base64: true,
				exif: false,
			});
		if (!result.canceled && result.assets && result.assets.length > 0) {
				const a = result.assets[0] as { uri: string; base64?: string | null; mimeType?: string };
				setImage({ uri: a.uri, base64: a.base64 ?? undefined, mimeType: a.mimeType });
		}
	}

		async function onSubmit() {
		if (!title.trim()) {
			Alert.alert('Título requerido', 'Introduce un título');
			return;
		}
		if (!mdx.trim()) {
			Alert.alert('Contenido requerido', 'Introduce el contenido');
			return;
		}
		// image es opcional según tu backend; si hay imagen, se envía en base64
		try {
					setSubmitting(true);
									let thumbnail_base64: string | undefined = undefined;
									if (image?.base64) {
										const mime = image.mimeType || (image.uri.toLowerCase().endsWith('.png') ? 'image/png' : image.uri.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg');
										thumbnail_base64 = `data:${mime};base64,${image.base64}`;
									} else if (image?.uri) {
								try {
									const base64 = await FileSystem.readAsStringAsync(image.uri, { encoding: FileSystem.EncodingType.Base64 });
									// intentar detectar mime por extensión
									const lower = image.uri.toLowerCase();
									const mime = lower.endsWith('.png') ? 'image/png' : lower.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
									thumbnail_base64 = `data:${mime};base64,${base64}`;
								} catch (e) {
									console.warn('No se pudo leer la imagen en base64', e);
								}
							}
					await createPostJSON({ title: title.trim(), mdx, thumbnail_base64, author: author.trim() || undefined, created_at: createdAt });
			Alert.alert('Publicado', 'El post se creó correctamente.');
			// Navigate back to blog list
			router.push('/blog');
		} catch (err: any) {
			Alert.alert('Error', err?.message || 'No se pudo crear el post');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
			<ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
				<Text style={styles.title}>Crear nuevo artículo</Text>

				<Text style={styles.label}>Título</Text>
				<TextInput
					style={styles.input}
					value={title}
					onChangeText={setTitle}
					placeholder="Título del artículo"
				/>

				<Text style={styles.label}>Imagen</Text>
				{image ? (
					<View style={{ alignItems: 'center', marginBottom: 12 }}>
						<Image source={{ uri: image.uri }} style={styles.preview} />
						<Pressable onPress={() => setImage(null)} style={[styles.button, styles.buttonSecondary]}>
							<Text style={[styles.buttonText, { color: '#1f2d3d' }]}>Quitar imagen</Text>
						</Pressable>
					</View>
				) : (
					<Pressable onPress={pickImage} style={[styles.button, styles.buttonSecondary]}>
						<Text style={[styles.buttonText, { color: '#1f2d3d' }]}>Seleccionar imagen</Text>
					</Pressable>
				)}

				

				<Text style={styles.label}>Autor</Text>
				<TextInput
					style={styles.input}
					value={author}
					onChangeText={setAuthor}
					placeholder="Autor"
				/>

				<Text style={styles.label}>Fecha de creación</Text>
				<TextInput
					style={styles.input}
					value={createdAt}
					placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
					autoCapitalize="none"
					autoCorrect={false}
				  editable={false}
				  selectTextOnFocus={false}
				/>
                <Text style={styles.label}>Contenido (Plain)</Text>
				<TextInput
					style={[styles.input, styles.textarea]}
					value={mdx}
					onChangeText={setMdx}
					placeholder="Escribe aquí tu contenido en texto plano..."
					multiline
					textAlignVertical="top"
				/>

				<Pressable onPress={onSubmit} style={[styles.button, submitting && styles.buttonDisabled]} disabled={submitting}>
					{submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Publicar</Text>}
				</Pressable>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 18,
	},
	title: {
		fontSize: 22,
		fontWeight: '700',
		color: '#1f2d3d',
		marginBottom: 12,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		color: '#394b5a',
		marginTop: 12,
		marginBottom: 6,
	},
	input: {
		borderWidth: 1,
		borderColor: '#d0d5dd',
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: '#fff',
		color: '#222',
	},
	textarea: {
		minHeight: 180,
	},
	button: {
		marginTop: 16,
		backgroundColor: '#1f2d3d',
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonSecondary: {
		backgroundColor: '#f2f4f7',
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: '#fff',
		fontWeight: '700',
	},
	preview: {
		width: 200,
		height: 200,
		borderRadius: 12,
		marginBottom: 8,
	},
});
