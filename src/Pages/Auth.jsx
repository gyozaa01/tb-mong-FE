import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const code = params.get('code'); // 인가 코드 추출
    const error = params.get('error'); // 에러 여부 확인
  
    if (code) {
      const tokenUrl = 'https://kauth.kakao.com/oauth/token';

      const bodyData = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.REACT_APP_KAKAO_REST_API_KEY, // REST API 키 사용
        redirect_uri: 'https://tb-mong-fe.vercel.app/auth', // 리디렉트 URI
        code: code, // 발급된 인가 코드
      });

      console.log('보낼 body 데이터:', bodyData.toString());

      fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.access_token) {
            console.log('액세스 토큰:', data.access_token);

            // 액세스 토큰을 sessionStorage에 저장
            sessionStorage.setItem('kakao_access_token', data.access_token);

            navigate('/dongne-setting'); // 토큰 발급 후 리다이렉트
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
