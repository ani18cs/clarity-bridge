import axios from 'axios';
import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000 // 60s for multimodal AI processing
});

// Attach Firebase Auth Token or Guest ID
api.interceptors.request.use(async (config) => {
  let guestId = localStorage.getItem('clarity_guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem('clarity_guest_id', guestId);
  }
  config.headers['x-guest-id'] = guestId;

  if (auth && auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('Could not get auth token', e);
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
