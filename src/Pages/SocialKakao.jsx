import React, { useEffect } from 'react';

const SocialKakao = () => {
  const restApiKey = process.env.REACT_APP_KAKAO_REST_API_KEY;

  // 로컬과 배포 환경에 따라 redirect_uri를 설정
  const redirectUri = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/auth' // 로컬 환경에서 사용될 URI
    : 'https://tb-mong.xyz/auth'; // 배포 환경에서 사용될 URI

  // Kakao 로그인 URL 생성 (REST API 키를 client_id로 사용)
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?&response_type=code&client_id=${restApiKey}&redirect_uri=${redirectUri}`;

  useEffect(() => {
    if (!window.Kakao) {
      console.error('Kakao SDK가 로드되지 않았습니다.');
      return;
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(restApiKey);
      console.log('Kakao SDK 초기화 완료');
    } else {
      console.log('Kakao SDK 이미 초기화됨');
    }

    console.log(`Redirect URI: ${redirectUri}`); // Redirect URI 확인용 로깅
  }, [restApiKey, redirectUri]);

  const handleLogin = () => {
    if (!restApiKey) {
      console.error('Kakao REST API Key가 설정되지 않았습니다.');
      alert('Kakao REST API Key가 설정되지 않았습니다.');
      return;
    }

    if (!redirectUri) {
      console.error('Redirect URI가 설정되지 않았습니다.');
      alert('Redirect URI가 설정되지 않았습니다.');
      return;
    }

    console.log(`로그인 URL로 이동: ${kakaoURL}`); // 로그인 URL 확인
    window.location.href = kakaoURL; // 카카오 로그인 페이지로 리디렉션
  };

  return (
    <>
      <button onClick={handleLogin}>카카오 로그인</button>
    </>
  );
};

export default SocialKakao;
