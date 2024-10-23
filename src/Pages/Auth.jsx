import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const code = params.get('code');
    const error = params.get('error');
  
    if (code) {
      // 액세스 토큰을 요청하는 URL
      const tokenUrl = 'https://kauth.kakao.com/oauth/token';
  
      // 요청 보내기
      fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.REACT_APP_KAKAO_REST_API_KEY, // REST API 키 사용
          redirect_uri: 'https://tb-mong-fe.vercel.app/auth', // 리디렉트 URI
          code: code, // 발급된 인가 코드
        }),
      })
        .then(response => {
          if (!response.ok) {
            console.error(`토큰 요청 실패, 상태 코드: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.access_token) {
            console.log('액세스 토큰:', data.access_token);
            navigate('/dongne-setting');
          } else {
            console.error('카카오 API 오류:', data);
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
