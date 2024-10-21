import React from 'react';

const SocialKakao = () => {
  const javascriptKey = process.env.REACT_APP_KAKAO_JS_KEY;
  const redirect_uri = 'https://tb-mong-fe.vercel.app/dongene-setting'; // 인가 코드 처리할 페이지

  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${javascriptKey}&redirect_uri=${redirect_uri}&response_type=code`;

  const handleLogin = () => {
    window.location.href = kakaoURL; // 카카오 로그인 페이지로 리디렉트
  };

  return (
    <>
      <button onClick={handleLogin}>카카오 로그인</button>
    </>
  );
};

export default SocialKakao;
