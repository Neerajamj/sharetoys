import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const API_URL = extra.apiUrl || 'http://localhost:5000/api';
export const CLOUDINARY_CLOUD_NAME = extra.cloudinaryCloudName || '';
export const CLOUDINARY_UPLOAD_PRESET = extra.cloudinaryUploadPreset || '';
