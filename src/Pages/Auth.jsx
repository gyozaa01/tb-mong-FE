import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const code = params.get('code');
    const error = params.get('error');

    console.log('인가 코드:', code); // 인가 코드 확인

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
          redirect_uri: 'https://tb-mong-fe.vercel.app/auth', // 리디렉트 URI (Auth 페이지)
          code: code, // 인가 코드
        }),
      })
        .then(response => {
          if (!response.ok) {
            console.error(`토큰 요청 실패, 상태 코드: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('카카오 응답 데이터:', data); // 응답 전체를 출력
          console.log('카카오 액세스 토큰:', data.access_token); // 액세스 토큰 확인
          if (data.access_token) {
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