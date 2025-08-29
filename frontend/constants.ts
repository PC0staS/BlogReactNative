import Constants from 'expo-constants';

export const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || process.env.BACKEND_URL || '';
