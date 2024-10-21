import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const code = params.get('code'); // URL에서 인가 코드 추출
    const error = params.get('error');

    if (code) {
      // 인가 코드로 액세스 토큰 요청
      fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.REACT_APP_KAKAO_REST_API_KEY, // REST API 키 사용
          redirect_uri: 'http://localhost:3000/auth', // 리디렉트 URI (Auth 페이지)
          code: code, // 인가 코드
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('카카오 액세스 토큰:', data.access_token);
          if (data.access_token) {
            // 액세스 토큰 발급 성공 시 동네 설정 페이지로 이동
            navigate('/dongne-setting');
          }
        })
        .catch(err => {
          console.error('토큰 요청 중 오류 발생:', err);
        });
    } else if (error) {
      console.error('카카오 로그인 실패:', error);
    }
  }, [navigate]);

  return <div>카카오 로그인 중...</div>;
};

export default Auth;
