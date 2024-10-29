import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import BottomNav from '../Components/BottomNav';
import Header from '../Components/Header';
/*global kakao*/

const WRAPPER_WIDTH = '375px';

const Walk = () => {
    const [showMap, setShowMap] = useState(false); // 맵 표시 여부
    const [isTracking, setIsTracking] = useState(false); // 추적 상태 (start/pause)
    const [isWalking, setIsWalking] = useState(false); // 산책 종료 상태
    const [mapInstance, setMapInstance] = useState(null); // 카카오 맵 인스턴스
    const [distance, setDistance] = useState(0.0); // 이동 거리
    const [time, setTime] = useState(0); // 시간 (초 단위)
    const timerRef = useRef(null); // 타이머 관리용 useRef

    // 타이머용 useEffect (isTracking이 바뀔 때만 실행)
    useEffect(() => {
        if (isTracking) {
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current); // Cleanup
    }, [isTracking]);

    // 산책 페이지에서 start.png 클릭 시 맵을 띄우고 실시간 경로 추적 시작
    const handleStartClick = () => {
        setShowMap(true); // start.png 클릭 시 맵 표시
        initializeMap(); // 맵 초기화
    };

    // 카카오 맵 초기화 함수
    const initializeMap = () => {
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_KEY}&autoload=false&libraries=services`;
        script.onload = () => {
            kakao.maps.load(() => {
                const container = document.getElementById("map");
                const options = {
                    center: new kakao.maps.LatLng(37.5665, 126.9780), // 초기 좌표
                    level: 5,
                };
                const map = new kakao.maps.Map(container, options);
                setMapInstance(map); // 맵 인스턴스 저장
            });
        };
        document.head.appendChild(script);
    };

    // 실시간 위치 추적 시작
    const startTracking = () => {
        setIsTracking(true);
        setIsWalking(true);
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = new kakao.maps.LatLng(latitude, longitude);

                    // 거리 계산 로직 (임시로 가정)
                    setDistance((prev) => prev + 0.001); // 이동 거리 증가 (임시)

                    if (mapInstance) {
                        const polyline = new kakao.maps.Polyline({
                            map: mapInstance,
                            path: [newPos], // Polyline에 최신 좌표 설정
                            strokeWeight: 5,
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.7,
                            strokeStyle: "solid",
                        });
                        polyline.setPath([newPos]);
                        mapInstance.setCenter(newPos); // 새로운 위치로 지도 이동
                    }
                },
                (error) => console.error("Error in getting geolocation: ", error),
                { enableHighAccuracy: true, maximumAge: 0 }
            );

            // 추적 중지 시 watchPosition 해제
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            console.warn("이 브라우저는 위치 정보를 지원하지 않습니다.");
        }
    };

    // 일시정지
    const pauseTracking = () => {
        setIsTracking(false);
    };

    // 산책 종료
    const stopTracking = () => {
        setIsTracking(false);
        setIsWalking(false); // 산책 종료 상태로 전환
    };

    // 시작/일시정지 버튼 클릭 시 동작
    const handleStartPauseButton = () => {
        if (isTracking) {
            pauseTracking(); // 일시정지
        } else {
            startTracking(); // 시작
        }
    };

    return (
        <Container>
            <AppWrapper>
                <Header />
                <MainContent>
                    {!showMap ? (
                        <img
                            src="/start.png"
                            alt="Start"
                            className="start-button"
                            onClick={handleStartClick}
                        />
                    ) : (
                        <>
                            <MapWrapper>
                                <div id="map" style={{ width: "100%", height: "100%" }}></div>
                            </MapWrapper>
                            <GreenBox>
                                <DistanceTimeWrapper>
                                    <StatBox>
                                        <StatNumber>{distance.toFixed(2)}</StatNumber>
                                        <StatLabel>킬로미터</StatLabel>
                                    </StatBox>
                                    <StatBox>
                                        <StatNumber>{Math.floor(time / 60).toString().padStart(2, '0')}:{(time % 60).toString().padStart(2, '0')}</StatNumber>
                                        <StatLabel>시간</StatLabel>
                                    </StatBox>
                                </DistanceTimeWrapper>
                                <StartStopButtonWrapper>
                                    <StartPauseButton
                                        src={isTracking ? "/small_pause.png" : "/small_start.png"}
                                        alt={isTracking ? "일시정지" : "시작"}
                                        onClick={handleStartPauseButton}
                                    />
                                </StartStopButtonWrapper>
                                {isWalking && (
                                    <StopButton
                                        src="/small_stop.png"
                                        alt="멈춤"
                                        onClick={stopTracking}
                                    />
                                )}
                            </GreenBox>
                        </>
                    )}
                </MainContent>
                {!showMap && <BottomNav />}
            </AppWrapper>
        </Container>
    );
};

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
    height: 100vh;
    background-color: #A7D2FF;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const MainContent = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: center;
    align-items: center;
    margin-bottom: -20px;
`;

const MapWrapper = styled.div`
    width: 100%;
    flex-grow: 7; /* 지도는 화면의 70% 차지 */
    background-color: #ffffff;
    border-radius: 10px;
    overflow: hidden;
`;

const GreenBox = styled.div`
    width: 100%;
    height: 30%; /* GreenBox는 화면의 30% 차지 */
    background-color: #51B47D;
    border-radius: 10px 10px 0 0;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin-bottom: 0;
    position: relative;
`;

const DistanceTimeWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-family: DNFBitBitv2;
`;

const StatBox = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StatNumber = styled.div`
    font-size: 30px;
`;

const StatLabel = styled.div`
    font-size: 14px;
`;

const StartStopButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

const StartPauseButton = styled.img`
    width: 80px;
    height: auto;
    cursor: pointer;
`;

const StopButton = styled.img`
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: auto;
    cursor: pointer;
`;

export default Walk;
