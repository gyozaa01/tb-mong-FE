import React from 'react';

const SocialKakao = () => {
  // REST API 키를 환경 변수에서 가져옴
  const restApiKey = process.env.REACT_APP_KAKAO_REST_API_KEY;

  // 로컬과 배포 환경에 따라 redirect_uri를 설정
  const redirectUri = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/auth' // 로컬 환경에서 사용될 URI
    : 'https://tb-mong-fe.vercel.app/auth'; // 배포 환경에서 사용될 URI

  // Kakao 로그인 URL 생성 (REST API 키를 client_id로 사용)
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?&response_type=code&client_id=${restApiKey}&redirect_uri=${redirectUri}`;

  const handleLogin = () => {
    if (!restApiKey) {
      console.error('Kakao REST API Key가 설정되지 않았습니다.');
      return;
    }
    window.location.href = kakaoURL; // 카카오 로그인 페이지로 리디렉트
  };

  return (
    <>
      <button onClick={handleLogin}>카카오 로그인</button>
    </>
  );
};

export default SocialKakao;
