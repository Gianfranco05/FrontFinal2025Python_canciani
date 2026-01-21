import axios from 'axios';

const api = axios.create({
    baseURL: 'https://final2025python-canciani-1.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to normalize id to id_key recursively
const normalizeIds = (data: any): any => {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.map(normalizeIds);
    }

    const normalized: any = { ...data };

    // If backend returns 'id' but not 'id_key', map it
    if ('id' in normalized && !('id_key' in normalized)) {
        normalized.id_key = normalized.id;
    }

    // Process nested objects
    Object.keys(normalized).forEach(key => {
        normalized[key] = normalizeIds(normalized[key]);
    });

    return normalized;
};

api.interceptors.response.use(
    (response) => {
        response.data = normalizeIds(response.data);
        return response;
    },
    (error) => Promise.reject(error)
);

export default api;
