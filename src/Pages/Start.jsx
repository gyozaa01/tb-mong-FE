import React, { useEffect } from 'react';
import styled from 'styled-components';

const WRAPPER_WIDTH = '375px';

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #FEFEFE;
`;

const AppWrapper = styled.div`
    width: ${WRAPPER_WIDTH};
    max-width: ${WRAPPER_WIDTH};
    min-height: 100vh;
    background-color: #A7D2FF;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    position: relative;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const LogoContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20%;
`;

const LogoImage = styled.img`
    width: 80px;
    height: auto;
    transform: rotate(-15deg);
    margin-right: 130%;
`;

const Title = styled.h1`
    font-size: 50px;
    color: black;
    margin: 0;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30px;
    cursor: pointer;
`;

const KakaoLoginImage = styled.img`
    width: 80%;
    cursor: pointer;
    margin-bottom: 50%;
`;

const GreenBox = styled.div`
    width: 100%;
    height: 130px;
    background-color: #51B47D;
    position: absolute;
    bottom: 0;
    left: 0;
`;

const Start = () => {
    useEffect(() => {
        const kakaoKey = process.env.REACT_APP_KAKAO_JS_KEY;
        if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
            console.log('카카오 SDK 초기화 완료');
        }
    }, []);

    const handleKakaoLogin = () => {
        const redirect_uri = 'http://localhost:3000/auth'; // 인증 후 리디렉트될 URI

        if (window.Kakao && window.Kakao.Auth) {
            window.Kakao.Auth.authorize({
                redirectUri: redirect_uri, // 카카오 로그인 성공 후 리디렉트 URI
            });
        } else {
            console.log('Kakao Auth 객체를 사용할 수 없습니다.');
        }
    };

    return (
        <Container>
            <AppWrapper>
                <LogoContainer>
                    <LogoImage src="/logo.png" alt="뚜벅몽 로고" />
                    <Title>뚜벅몽</Title>
                </LogoContainer>

                <KakaoLoginImage
                    src="/kakao_login_large_narrow.png"
                    alt="카카오 로그인"
                    onClick={handleKakaoLogin}
                />

                <GreenBox />
            </AppWrapper>
        </Container>
    );
};

export default Start;
