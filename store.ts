import { AccountType, ShortLink, User } from './types';

// --- CONFIGURAÇÃO DE AMBIENTE SIMPLIFICADA E SEGURA ---

// 1. Tenta ler do padrão Vite (import.meta.env)
const metaEnv: any = (import.meta as any).env || {};

// 2. URL DE PRODUÇÃO HARDCODED (Fallback Seguro)
const HARDCODED_PROD_API = 'https://api.nuturl.com'; 

// Lógica de Decisão da API_URL
let apiUrl = '';

// Verifica se estamos rodando localmente pelo hostname
const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

if (metaEnv.VITE_API_URL) {
  // Prioridade 1: Configuração explícita do Vite
  apiUrl = metaEnv.VITE_API_URL;
} else if (isLocalhost) {
  // Prioridade 2: Desenvolvimento Local
  apiUrl = 'http://localhost:3000';
} else {
  // Prioridade 3: Produção
  apiUrl = HARDCODED_PROD_API;
}

// Garante que termina com /api e não tem barras duplas
const API_BASE = `${apiUrl.replace(/\/$/, '')}/api`;

console.log(`🔗 API Configured to: ${API_BASE}`);

// Armazenamento seguro do Token
let authToken = localStorage.getItem('nuturl_token');

// Helper para chamadas fetch com Auth
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const headers: any = { 'Content-Type': 'application/json' };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE}${cleanEndpoint}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    
    if (res.status === 401) {
      // Evita loop de logout se já estiver na home
      if (window.location.pathname !== '/') {
        logoutUser();
        throw new Error('Sessão expirada');
      }
    }
    
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Connection failed to ${fullUrl}`, err);
    throw err;
  }
}

// --- Gestão de Sessão ---
const STORAGE_KEY_USER = 'nuturl_user_session';

export const getSessionUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  return data ? JSON.parse(data) : null;
};

const setSession = (user: User, token: string) => {
  authToken = token;
  localStorage.setItem('nuturl_token', token);
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
};

export const logoutUser = () => {
  authToken = null;
  localStorage.removeItem('nuturl_token');
  localStorage.removeItem(STORAGE_KEY_USER);
  window.location.href = '/'; 
};

// --- API Methods ---

export const loginUser = async (email: string, password: string): Promise<User> => {
  const data = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setSession(data.user, data.token);
  return data.user;
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  const data = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  setSession(data.user, data.token);
  return data.user;
};

export const googleLogin = async (credential: string): Promise<User> => {
  const data = await apiCall('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential })
  });
  setSession(data.user, data.token);
  return data.user;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await apiCall('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const getLinks = async (userId: string): Promise<ShortLink[]> => {
  return await apiCall(`/links`); 
};

export const createLink = async (originalUrl: string, userId?: string): Promise<ShortLink> => {
  return await apiCall('/links', {
    method: 'POST',
    body: JSON.stringify({ originalUrl, userId }) 
  });
};

export const getLinkDetails = async (slug: string): Promise<ShortLink> => {
  return await apiCall(`/links/public/${slug}`);
};

export const deleteLink = async (id: string): Promise<void> => {
  await apiCall(`/links/${id}`, { method: 'DELETE' }); 
};

export const createCheckoutSession = async (): Promise<string> => {
  const data = await apiCall('/create-checkout', { method: 'POST' });
  return data.init_point;
};

export const getSystemStats = async (): Promise<{ users: number; links: number; clicks: number; uptime: string }> => {
  return await apiCall('/stats');
};