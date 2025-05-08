// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api' // Ajusta esta URL según tu backend
});

export default api;
