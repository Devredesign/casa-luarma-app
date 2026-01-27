// src/services/api.js
import axios from "axios";

const rawBase = process.env.REACT_APP_API_BASE_URL;

// Si existe env var, la usamos. Si no, dejamos /api para dev con proxy (CRA)
const baseURL = rawBase
  ? `${rawBase.replace(/\/$/, "")}/api`
  : "/api";

const api = axios.create({ baseURL });

// Opcional (quitalo luego): para confirmar a dónde está pegando en prod
console.log("[api] baseURL =", baseURL);

export default api;
