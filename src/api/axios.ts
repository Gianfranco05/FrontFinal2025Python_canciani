import axios from 'axios';

const api = axios.create({
    baseURL: 'https://final2025python-canciani-1.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor opcional para depuración
api.interceptors.response.use(
    (response) => {
        // El backend ya devuelve 'id_key', así que no necesitamos mapear manualmente
        // a menos que haya endpoints inconsistentes.
        return response;
    },
    (error) => Promise.reject(error)
);

export default api;