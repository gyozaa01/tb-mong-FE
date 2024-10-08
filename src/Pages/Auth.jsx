import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './Api';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // URL에서 카카오 인증 결과를 받아옴
    const params = new URL(window.location.href).searchParams;
    const code = params.get('code');
    const error = params.get('error');

    if (code) {
      // 카카오 인증 성공 -> 서버로 인가 코드를 보내서 액세스 토큰 발급 요청
      api.post('/api/kakao-login', { code })
        .then(response => {
          console.log('카카오 로그인 성공:', response.data);
          const { isRegistered } = response.data; // 서버에서 회원가입 여부 정보 받음
          
          // 회원가입 여부에 따라 다른 페이지로 이동
          if (isRegistered) {
            navigate('/home'); // 이미 회원가입한 사용자는 홈으로 이동
          } else {
            navigate('/dongne-setting'); // 회원가입하지 않은 사용자는 동네 설정 페이지로 이동
          }
        })
        .catch(err => {
          console.error('로그인 처리 중 오류 발생:', err);
        });
    } else if (error) {
      console.error('카카오 로그인 실패:', error);
      // 에러 처리 로직 (필요 시 추가)
    }
  }, [navigate]);

  return <div>카카오 로그인 중...</div>;
};

export default Auth;
