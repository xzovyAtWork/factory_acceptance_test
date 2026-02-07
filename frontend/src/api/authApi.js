import axios from 'axios';

const client = axios.create({
  baseURL: '/api'
});

export async function loginRequest(email, password) {
  const res = await client.post('/auth/login', { email, password });
  return res.data;
}