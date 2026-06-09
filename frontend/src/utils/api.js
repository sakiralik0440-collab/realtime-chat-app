import axios from 'axios';

const api = axios.create({
    baseURL:'https://realtime-chat-app-nfhn.onrender.com/api',
});

//Automatically attach JWT token to every request
api.interceptors.request.use((config) =>{
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
