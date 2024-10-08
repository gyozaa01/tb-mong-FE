import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const BottomNavWrapper = styled.div`
    width: 90%;
    height: 100px;
    background-color: #51B47D;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    bottom: 0;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    border-radius: 20px 20px 0 0;
`;

const NavItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    color: black;
    text-align: center;
    padding: 0 20px;
`;

const HomeButton = styled.div`
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
        width: 70px;
        height: auto;
    }
`;

const BottomNav = () => {
    const navigate = useNavigate(); 

    return (
        <BottomNavWrapper>
            <NavItem onClick={() => navigate('/walk')}>
                <span>산책</span>
            </NavItem>
            <NavItem onClick={() => navigate('/dongne')}>
                <span>동네</span>
            </NavItem>

            <HomeButton onClick={() => navigate('/home')}>
                <img src="/home.png" alt="홈 아이콘" />
            </HomeButton>

            <NavItem onClick={() => navigate('/record')}>
                <span>기록</span>
            </NavItem>
            <NavItem onClick={() => navigate('/setting')}>
                <span>설정</span>
            </NavItem>
        </BottomNavWrapper>
    );
};

export default BottomNav;
