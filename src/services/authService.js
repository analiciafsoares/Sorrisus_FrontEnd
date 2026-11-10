import { jwtDecode } from "jwt-decode";
import api from "./api";

const storage = window.sessionStorage;
const CHAVES_SESSAO = ["token", "user", "role", "userId"];

CHAVES_SESSAO.forEach((chave) => localStorage.removeItem(chave));

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const alterarSenha = (senhaAtual, novaSenha) => {
  return api.put("/usuarios/me/senha", { senhaAtual, novaSenha });
};

export const logout = () => {
  CHAVES_SESSAO.forEach((chave) => storage.removeItem(chave));
};

export const getToken = () => {
  return storage.getItem("token");
};

const tokenExpirado = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp ? exp * 1000 <= Date.now() : false;
  } catch {
    return true;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  if (tokenExpirado(token)) {
    logout();
    return false;
  }
  return true;
};

export const getUser = () => {
  const user = storage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getRole = () => {
  return storage.getItem("role");
};

export const getUserId = () => {
  return storage.getItem("userId");
};

export const setAuthData = (authData) => {
  storage.setItem("token", authData.accessToken);
  storage.setItem("user", JSON.stringify({
    email: authData.email,
    role: authData.role
  }));
  storage.setItem("role", authData.role);
  storage.setItem("userId", authData.userId);
};
