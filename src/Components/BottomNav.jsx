import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from '../Pages/Api';

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
    const [locationId, setLocationId] = useState(localStorage.getItem('locationId'));

    // 동네 ID를 가져오는 함수
    const fetchLocationId = async () => {
        try {
            const response = await api.get('/api/dongne', {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const fetchedLocationId = response.data.id;
            setLocationId(fetchedLocationId);
            localStorage.setItem('locationId', fetchedLocationId); // localStorage에 저장
            return fetchedLocationId;
        } catch (error) {
            console.error('동네 정보를 불러오는 중 오류 발생:', error);
            return null;
        }
    };

    // 동네 버튼 클릭 시 실행되는 함수
    const handleDongneClick = async () => {
        let id = locationId;

        if (!id) {
            // locationId가 없는 경우 API 호출로 가져오기
            id = await fetchLocationId();
        }

        if (id) {
            navigate(`/dongne/${id}`);
        } else {
            alert('동네 정보를 불러올 수 없습니다. 다시 시도해주세요.');
        }
    };

    return (
        <BottomNavWrapper>
            <NavItem onClick={() => navigate('/walk')}>
                <span>산책</span>
            </NavItem>
            <NavItem onClick={handleDongneClick}>
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
