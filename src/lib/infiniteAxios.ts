import axios from 'axios';

export const infiniteAxios = axios.create({
  baseURL: 'https://api.infinitepay.io',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
