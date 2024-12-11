import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  const token = sessionStorage.getItem('jwt_token');
  if (!token) return { authenticated: false, redirectTo: '/' };

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isTokenExpired = payload.exp * 1000 < Date.now();
    if (isTokenExpired) {
      sessionStorage.removeItem('jwt_token'); // 만료된 토큰 삭제
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      return { authenticated: false, redirectTo: '/' };
    }

    const isSignedUp = !!payload.locationCode; // locationCode로 회원가입 여부 확인
    return {
      authenticated: true,
      redirectTo: isSignedUp ? null : '/dongne-setting',
    };
  } catch (error) {
    console.error('Invalid token', error);
    return { authenticated: false, redirectTo: '/' };
  }
};

const PrivateRoute = ({ element }) => {
  const { authenticated, redirectTo } = isAuthenticated();

  if (authenticated) {
    return element; // 인증된 경우 컴포넌트 렌더링
  } else {
    return <Navigate to={redirectTo} replace />; // 리다이렉트 경로로 이동
  }
};

export default PrivateRoute;
