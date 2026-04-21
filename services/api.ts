import axios from 'axios';

// Substitua pelo IP da sua máquina ou domínio do túnel
const API_URL = "http://192.168.1.6:8080"; 

export const api = axios.create({
  baseURL: API_URL,
});

export const getRanking = async () => {
  try {
    const response = await api.get('/ranking');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return [];
  }
};