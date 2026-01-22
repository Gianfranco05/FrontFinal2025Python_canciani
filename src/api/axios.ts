import axios from 'axios';

const api = axios.create({
    // URL CORREGIDA (Sin el -1)
    baseURL: 'https://final2025python-canciani.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper para normalizar id a id_key recursivamente
const normalizeIds = (data: any): any => {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.map(normalizeIds);
    }

    const normalized: any = { ...data };

    // Si el backend devuelve 'id' pero no 'id_key', lo mapeamos
    if ('id' in normalized && !('id_key' in normalized)) {
        normalized.id_key = normalized.id;
    }

    // Procesar objetos anidados
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