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
    return config;
  },
  (error) => {
    return Promise.reject(error); // 요청 오류 처리
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response; // 성공 응답 처리
  },
  (error) => {
    // 리디렉션 문제 또는 인증 실패 디버깅
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized: 리디렉션이 필요하거나 인증 실패:', error.response);
    } else {
      console.error('API 요청 중 오류 발생:', error.response || error);
    }
    return Promise.reject(error); // 에러 전달
  }
);

export default api;
