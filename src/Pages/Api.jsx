import axios from 'axios';

const api = axios.create({
  baseURL: 'https://www.tb-mong.xyz',
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Request Config:', config); // 요청 디버깅
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response); // 응답 디버깅
    return response;
  },
  (error) => {
    console.error('Error:', error.response || error); // 에러 디버깅
    return Promise.reject(error);
  }
);

export default api;
