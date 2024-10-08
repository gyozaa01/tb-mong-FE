import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const HeaderWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
`;

const LogoImage = styled.img`
    width: 40px;
    height: auto;
    margin-right: 10px;
    transform: rotate(-15deg);
`;

const Title = styled.h1`
    font-size: 24px;
    color: black;
    margin: 0;
    font-weight: bold;
    cursor: pointer;
`;

const DogamIcon = styled.img`
    width: 40px;
    height: auto;
    cursor: pointer;
`;

const Header = () => {
    const navigate = useNavigate();

    return (
        <HeaderWrapper>
            <LogoContainer>
                <LogoImage src="/logo.png" alt="뚜벅몽 로고" />
                <Title>뚜벅몽</Title>
            </LogoContainer>
            <DogamIcon src="/dogam.png" alt="도감 아이콘" onClick={() => navigate('/dogam')} />
        </HeaderWrapper>
    );
};

export default Header;
