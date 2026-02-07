import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

export async function loginRequest(email, password) {
  const res = await client.post('/auth/login', { email, password });
  return res.data;
}