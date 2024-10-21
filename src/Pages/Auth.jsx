import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const code = params.get('code'); // 인가 코드 추출
    const error = params.get('error'); // 에러 여부 확인

    console.log('인가 코드:', code); // 인가 코드 확인

    if (code) {
      // 인가 코드로 액세스 토큰 요청
      fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code', // 고정값
          client_id: process.env.REACT_APP_KAKAO_REST_API_KEY, // REST API 키 사용
          redirect_uri: 'https://tb-mong-fe.vercel.app/auth', // 리디렉트 URI (인가 코드 처리 페이지)
          code: code, // 인가 코드
        }),
      })
        .then(response => {
          if (!response.ok) {
            console.error(`토큰 요청 실패, 상태 코드: ${response.status}`);
            return response.json(); // 응답을 JSON으로 반환해 오류 메시지 확인
          }
          return response.json();
        })
        .then(data => {
          console.log('카카오 응답 데이터:', data); // 응답 전체 출력

          if (data.error) {
            console.error(`카카오 API 오류: ${data.error}, 설명: ${data.error_description}`);
          } else {
            const access_token = data.access_token;
            console.log('카카오 액세스 토큰:', access_token); // 액세스 토큰 확인

            if (access_token) {
              navigate('/dongne-setting'); // 액세스 토큰 발급 성공 시 동네 설정 페이지로 이동
            }
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
