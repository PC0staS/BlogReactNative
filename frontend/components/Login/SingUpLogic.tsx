
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../constants';

// small storage wrapper: prefer window.localStorage on web, otherwise use AsyncStorage
const storage = {
    async setItem(key: string, value: string) {
        try {
            if (typeof window !== 'undefined' && (window as any).localStorage) {
                (window as any).localStorage.setItem(key, value);
            } else {
                await AsyncStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn('storage.setItem error', e);
        }
    },
    async getItem(key: string) {
        try {
            if (typeof window !== 'undefined' && (window as any).localStorage) {
                return (window as any).localStorage.getItem(key);
            } else {
                return await AsyncStorage.getItem(key);
            }
        } catch (e) {
            console.warn('storage.getItem error', e);
            return null;
        }
    },
    async removeItem(key: string) {
        try {
            if (typeof window !== 'undefined' && (window as any).localStorage) {
                (window as any).localStorage.removeItem(key);
            } else {
                await AsyncStorage.removeItem(key);
            }
        } catch (e) {
            console.warn('storage.removeItem error', e);
        }
    }
};

export async function SignUp(name: string, email: string, password: string){
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });

    switch (response.status) {
        case 201:
            const data = await response.json();
            return data;
        case 400:
            return { error: 'Invalid request' };
        case 409:
            return { error: 'User already exists' };
        default:
            return { error: 'Failed to sign up' };
    }
}

export async function Login(email: string, password: string){
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    
    switch (response.status) {
        case 200: {
            const data = await response.json();
            if (data.token) {
                
                await storage.setItem('jwt', data.token);
            }
            return data;
        }
        case 400:
            return { error: 'Invalid request' };
        case 401:
            return { error: 'Invalid Credentials' };
        default:
            return { error: 'Failed to log in' };
    }
}

export async function checkAuth() {
    const token = await storage.getItem('jwt');
     // Debug log
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BACKEND_URL}/api/auth/check`, {
        method: 'GET',
        headers,
    });

    // try to parse body for helpful error messages
    let body: any = null;
    try {
        body = await response.json();
    } catch (err) {
        console.warn('checkAuth: failed to parse json body', err);
        body = null;
    }

    if (response.ok) {
        return body;
    }

    // if server returned structured error, return it for debugging
    if (body && (body.error || body.message)) {
        return { error: body.error || body.message };
    }

    if (response.status === 401) return { error: 'Unauthorized' };

    return { error: `Failed to check authentication (status ${response.status})` };
}
