import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './Api';
import styled, { keyframes } from 'styled-components';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const code = params.get('code'); // 인가 코드 추출
    const error = params.get('error'); // 에러 여부 확인

    const checkUserStatus = (token) => {
      api.post('/api/auth/kakao', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        if (response.data.code === 401) {
          // 401 에러일 경우 dongne-setting 페이지로 이동하여 locationCode 입력받기
          navigate('/dongne-setting', { state: { token } });
        } else if (response.data.jwtToken) {
          sessionStorage.setItem('jwt_token', response.data.jwtToken);
          sessionStorage.setItem('userId', response.data.userId); // userId 저장
          navigate('/home');
        } else {
          console.error('예상치 못한 응답:', response.data);
        }
      })
      .catch(err => {
        console.error('사용자 정보 확인 중 오류 발생:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });      
    };

    if (code) {
      const tokenUrl = 'https://kauth.kakao.com/oauth/token';

      const bodyData = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.REACT_APP_KAKAO_REST_API_KEY, // REST API 키 사용
        redirect_uri: 'https://tb-mong-fe.vercel.app/auth', // 리디렉트 URI
        code: code, // 발급된 인가 코드
      });

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
            checkUserStatus(data.access_token);
          } else {
            console.error('카카오 API 오류:', data);
            setIsLoading(false);
          }
        })
        .catch(err => {
          console.error('토큰 요청 중 오류 발생:', err);
          setIsLoading(false);
        });
    } else if (error) {
      console.error('카카오 로그인 실패:', error);
      setIsLoading(false);
    }
  }, [navigate]);

  return isLoading ? <Spinner /> : null;
};

export default Auth;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 8px solid #f3f3f3;
  border-top: 8px solid #51B47D;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
  margin: 100px auto;
`;
