import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tb-mong.xyz', // www 제거한 기본 도메인
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
    console.error('요청 오류 발생:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response, // 성공 응답 처리
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('401 에러: 인증 실패. 로그인 페이지로 이동 필요');
    } else {
      console.error('응답 오류 발생:', error.response || error);
    }
    return Promise.reject(error);
  }
);

export default api;
