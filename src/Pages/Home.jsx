import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import BottomNav from '../Components/BottomNav';
import Header from '../Components/Header';
import api from './Api';

const WRAPPER_WIDTH = '375px';

const Home = () => {
    const [level, setLevel] = useState(1);
    const [experience, setExperience] = useState(0);
    const [characterImage, setCharacterImage] = useState('/mong1.png'); // 기본 이미지
    const [stats, setStats] = useState({ today_cnt: 0, today_km: 0, total_cnt: 0, total_km: 0 });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCharacter();
        fetchLevelExperience();
        fetchWalkStats();
    }, []);

    const fetchCharacter = async () => {
        try {
            const response = await api.get('/api/home/repre-character', { responseType: 'blob' });
            const imageUrl = URL.createObjectURL(response.data);
            setCharacterImage(imageUrl);
        } catch (error) {
            console.error('대표 캐릭터를 가져오는 중 오류 발생:', error);
        }
    };

    const fetchLevelExperience = async () => {
        try {
            const response = await api.get('/api/home/level');
            setLevel(response.data.level);
            setExperience(response.data.exp);
        } catch (error) {
            console.error('레벨 및 경험치를 가져오는 중 오류 발생:', error);
        }
    };

    const fetchWalkStats = async () => {
        try {
            const response = await api.get('/api/home/info');
            setStats(response.data);
        } catch (error) {
            console.error('산책 정보를 가져오는 중 오류 발생:', error);
        }
    };

    const handleBalloonClick = () => {
        setShowModal(true);
    };

    const confirmLevelUp = async () => {
        try {
            const response = await api.post('/api/home/levelup');
            setLevel(response.data.level);
            setExperience(response.data.exp);
        } catch (error) {
            console.error('레벨업 처리 중 오류 발생:', error);
        }
        setShowModal(false);
    };

    return (
        <Container>
            <AppWrapper>
                <Header />

                <Stats>
                    <StatItem>
                        <img src="/b1.png" alt="Today" />
                        <span>TODAY: {stats.today_cnt}번</span>
                    </StatItem>
                    <StatItem>
                        <img src="/b4.png" alt="KM" />
                        <span>KM: {stats.today_km}km</span>
                    </StatItem>
                    <StatItem>
                        <img src="/b3.png" alt="Total" />
                        <span>TOTAL: {stats.total_cnt}번</span>
                    </StatItem>
                    <StatItem>
                        <img src="/b2.png" alt="Total" className='b2' />
                        <span className='totalkm'>TOTAL KM: {stats.total_km}km</span>
                    </StatItem>
                </Stats>

                <MainContent>
                    <CharacterContainer>
                        <img src={characterImage} alt="메인 캐릭터" className="mong" />
                        {experience === 3 && (
                            <Balloon onClick={handleBalloonClick}>
                                <Exclamation>!</Exclamation>
                            </Balloon>
                        )}
                        <img src="/bottom.png" alt="카펫" className="carpet" />
                    </CharacterContainer>

                    <LevelInfo>
                        <span>Lv.{level}</span>
                        <ExperienceImage src={`/exp${experience}.png`} alt={`Experience ${experience}`} />
                    </LevelInfo>
                </MainContent>

                <Modal $show={showModal}>
                    <Stars>
                        <img src="/star.png" alt="Star" />
                        <StarOffset src="/star.png" alt="Star" />
                        <img src="/star.png" alt="Star" />
                    </Stars>
                    <LevelUpText>LEVEL UP</LevelUpText>
                    <ButtonImage onClick={confirmLevelUp}>
                        <span>OK</span>
                    </ButtonImage>
                </Modal>

                <BottomNav />
            </AppWrapper>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    background-color: #FEFEFE;
    margin: 0;
`;

const AppWrapper = styled.div`
    width: ${WRAPPER_WIDTH};
    max-width: ${WRAPPER_WIDTH};
    min-height: 100vh;
    background-color: #A7D2FF;
    padding: 0 20px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    position: relative;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const Stats = styled.div`
    align-self: flex-start;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    font-size: 15px;
    font-weight: bold;
    color: black;
    margin-bottom: 2px;

    img {
        width: 30px;
        height: 30px;
        margin-right: 5px;
    }
    
    .b2 {
        width: 25px;
        height: 25px;
        margin-left: 3px;
    }

    span.totalkm{
        margin-left: 2px;
    }
`;

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    justify-content: center;
    margin-top: -30%;
`;

const CharacterContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    
    .mong {
        width: 150px;
        height: auto;
        z-index: 2;
    }

    .carpet {
        width: 250px;
        height: auto;
        margin-top: -60px;
        z-index: 1;
    }
`;

const bounce = keyframes`
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
`;

const Balloon = styled.div`
    position: absolute;
    top: -40px;
    background-image: url('/nemo.png');
    background-size: cover;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
    animation: ${bounce} 1s infinite;
`;

const Exclamation = styled.span`
    font-size: 20px;
    font-weight: bold;
    color: black;
    margin-top: -2px;
    font-family: 'DNFBitBitv2';
`;

const LevelInfo = styled.div`
    display: flex;
    align-items: center;
    margin-top: -20px;
`;

const ExperienceImage = styled.img`
    width: 200px;
    height: 90px;
    margin-left: 20px;
    margin-top: -5px;
`;

const Modal = styled.div`
    display: ${({ $show }) => ($show ? 'flex' : 'none')};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    flex-direction: column;
    align-items: center;
    background-color: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    width: 250px;
    text-align: center;
    z-index: 1000;
`;

const Stars = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    position: relative;

    img {
        width: 70px;
        height: 70px;
        margin: 0 5px;
    }
`;

const StarOffset = styled.img`
    width: 70px;
    height: 70px;
    margin: 0 1px;
    position: relative;
    top: -30px;
`;

const LevelUpText = styled.h2`
    font-size: 35px;
    margin-bottom: 20px;
`;

const ButtonImage = styled.button`
    width: 200px;
    height: 80px;
    background-image: url('/setting_button.png');
    background-size: cover;
    background-position: center;
    background-color: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    span {
        font-size: 16px;
        color: black;
        font-family: 'DNFBitBitv2';
    }
`;

export default Home;
