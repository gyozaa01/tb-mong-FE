import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.tb-mong.xyz', // 상대 경로로 설정
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 세션 쿠키를 포함하기 위해 설정
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;