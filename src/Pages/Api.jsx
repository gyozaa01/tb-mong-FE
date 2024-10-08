import axios from 'axios';

// Axios 인스턴스를 생성하여 기본 URL 설정
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
