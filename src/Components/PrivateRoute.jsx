import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
    const token = sessionStorage.getItem('jwt_token');
    if (!token) return false;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isTokenExpired = payload.exp * 1000 < Date.now();
      if (isTokenExpired) {
        sessionStorage.removeItem('jwt_token'); // 만료된 토큰 삭제
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
      return !isTokenExpired;
    } catch (error) {
      console.error('Invalid token', error);
      return false;
    }
};


const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/" replace />;
};

export default PrivateRoute;