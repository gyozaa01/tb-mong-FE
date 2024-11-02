import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import BottomNav from '../Components/BottomNav';
import Header from '../Components/Header';
/*global kakao*/

const WRAPPER_WIDTH = '375px';

const Walk = () => {
    const [showMap, setShowMap] = useState(false); // 맵 표시 여부
    const [isTracking, setIsTracking] = useState(false); // 추적 상태 (start/pause)
    const [showEndScreen, setShowEndScreen] = useState(false); // 종료 화면 표시 여부
    const [showSaveScreen, setShowSaveScreen] = useState(false);
    const [mapInstance, setMapInstance] = useState(null); // 카카오 맵 인스턴스
    const [distance, setDistance] = useState(0.0); // 이동 거리
    const [time, setTime] = useState(0); // 시간 (초 단위)
    const [polylinePath, setPolylinePath] = useState([]);
    const [location, setLocation] = useState(localStorage.getItem("startLocation") || ''); // 초기 위치 설정
    const timerRef = useRef(null); // 타이머 관리용 useRef
    const [previousPosition, setPreviousPosition] = useState(null);

    // 타이머 관리용 useEffect
    useEffect(() => {
        if (isTracking) {
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1); // 타이머 1초씩 증가
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current); // Cleanup
    }, [isTracking]);

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
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = new kakao.maps.LatLng(latitude, longitude);

                    if (!previousPosition) {
                        // 처음 위치에서 동네명 설정
                        const geocoder = new kakao.maps.services.Geocoder();
                        geocoder.coord2RegionCode(longitude, latitude, (result, status) => {
                            if (status === kakao.maps.services.Status.OK) {
                                const dongName = `${result[0].region_3depth_name}`;
                                setLocation(dongName); // 상태 업데이트
                                localStorage.setItem("startLocation", dongName); // 첫 위치 저장
                            }
                        });
                        setPreviousPosition(newPos); // 초기 위치 설정
                    } else {
                        // 두 위치 간의 거리 계산
                        const polyline = new kakao.maps.Polyline({
                            path: [previousPosition, newPos],
                        });
                        const distanceBetween = polyline.getLength(); // 거리 계산
                        setDistance((prev) => prev + distanceBetween / 1000); // km 단위 거리 계산
                        setPreviousPosition(newPos); // 이전 위치를 현재 위치로 업데이트
                    }

                    if (mapInstance) {
                        setPolylinePath((prevPath) => {
                            const updatedPath = [...prevPath, newPos];
                            let polyline = mapInstance.polyline;
                            if (!polyline) {
                                polyline = new kakao.maps.Polyline({
                                    map: mapInstance,
                                    path: updatedPath,
                                    strokeWeight: 5,
                                    strokeColor: "#FF0000",
                                    strokeOpacity: 0.7,
                                    strokeStyle: "solid",
                                });
                                mapInstance.polyline = polyline;
                            } else {
                                polyline.setPath(updatedPath);
                            }
                            mapInstance.setCenter(newPos);
                            return updatedPath;
                        });
                    }
                },
                (error) => console.error("Error in getting geolocation: ", error),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );

            return () => navigator.geolocation.clearWatch(watchId); // 추적 중지 시 watchPosition 해제
        } else {
            console.warn("이 브라우저는 위치 정보를 지원하지 않습니다.");
        }
    };

    // 산책 종료
    const stopTracking = () => {
        setIsTracking(false);
        setShowEndScreen(true); // 종료 화면으로 전환
    };

    const handleStartClick = () => {
        setShowMap(true); // start.png 클릭 시 맵 표시
        initializeMap(); // 맵 초기화
    };

    const handleEndConfirmation = () => {
        setShowEndScreen(false);
        setShowSaveScreen(true);
    };

    const handleSave = () => {
        console.log("산책 정보 저장");

        // 산책 정보를 저장 후, localStorage에서 polylinePath와 startLocation 삭제
        localStorage.removeItem("startLocation");
        localStorage.removeItem("polylinePath");
        
        window.location.href = "/record";
    };

    const formatTime = () => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const formatPace = () => {
        if (distance === 0) return "N/A"; // 거리 0일 때는 계산하지 않음
        const paceInSeconds = time / distance; // 초/km 계산
        const paceMinutes = Math.floor(paceInSeconds / 60);
        const paceSeconds = Math.floor(paceInSeconds % 60);
        return `${paceMinutes}' ${String(paceSeconds).padStart(2, '0')}''`; 
    };

    const calculateSpeed = () => {
        if (time === 0 || distance === 0) return "N/A"; // 시간 또는 거리 0일 때는 계산하지 않음
        const speed = (distance / (time / 3600)).toFixed(2); // 시속(km/h) 계산
        return `${speed}`;
    };

    return (
        <Container>
            <AppWrapper>
                <Header />
                {showSaveScreen ? (
                    <SaveContent>
                        <Input placeholder="산책로명을 입력하세요." />
                        <LocationWrapper>
                            <LocationIcon src="/location.png" alt="location" />
                            <LocationName>{location}</LocationName> {/* 저장된 위치 출력 */}
                        </LocationWrapper>
                        <PolylineMap polylinePath={polylinePath} />
                        <SummaryBox>
                            <SummaryRow>
                                <SummaryItem>
                                    <StatNumber>{distance.toFixed(2)}</StatNumber>
                                    <StatLabel>킬로미터</StatLabel>
                                </SummaryItem>
                                <SummaryItem>
                                    <StatNumber>{formatTime()}</StatNumber>
                                    <StatLabel>시간</StatLabel>
                                </SummaryItem>
                            </SummaryRow>
                            <SummaryRow>
                                <SummaryItem>
                                    <StatNumber>{calculateSpeed()}</StatNumber>
                                    <StatLabel>시속</StatLabel>
                                </SummaryItem>
                                <SummaryItem>
                                    <StatNumber>{formatPace()}</StatNumber>
                                    <StatLabel>평균 페이스</StatLabel>
                                </SummaryItem>
                            </SummaryRow>
                        </SummaryBox>
                        <SaveButton src="/save.png" alt="Save" onClick={handleSave} />
                    </SaveContent>
                ) : (
                    !showEndScreen ? (
                        <MainContent>
                            {!showMap ? (
                                <img src="/start.png" alt="Start" className="start-button" onClick={handleStartClick} />
                            ) : (
                                <>
                                    <TrackingMapWrapper>
                                        <div id="map" style={{ width: "100%", height: "100%" }}></div>
                                    </TrackingMapWrapper>
                                    <GreenBox>
                                        <DistanceTimeWrapper>
                                            <StatBox>
                                                <StatNumber>{distance.toFixed(2)}</StatNumber>
                                                <StatLabel>킬로미터</StatLabel>
                                            </StatBox>
                                            <StatBox>
                                                <StatNumber>{formatTime()}</StatNumber>
                                                <StatLabel>시간</StatLabel>
                                            </StatBox>
                                        </DistanceTimeWrapper>
                                        <StartStopButtonWrapper>
                                            {!isTracking ? (
                                                <StartPauseButton src="/small_start.png" alt="시작" onClick={startTracking} />
                                            ) : (
                                                <StopButton src="/small_stop.png" alt="멈춤" onClick={stopTracking} />
                                            )}
                                        </StartStopButtonWrapper>
                                    </GreenBox>
                                </>
                            )}
                        </MainContent>
                    ) : (
                        <EndScreen>
                            <EndText>산책을 종료하시겠습니까?</EndText>
                            <StopIcon src="/stop.png" alt="stop" onClick={handleEndConfirmation} />
                        </EndScreen>
                    )
                )}
                {!showMap && !showSaveScreen && <BottomNav />}
            </AppWrapper>
        </Container>
    );
};

const PolylineMap = ({ polylinePath }) => {
    useEffect(() => {
        if (window.kakao && window.kakao.maps) {
            const mapContainer = document.getElementById('save-map');
            const mapOption = {
                center: new window.kakao.maps.LatLng(polylinePath[0].Ma, polylinePath[0].La),
                level: 6,
            };
            const map = new window.kakao.maps.Map(mapContainer, mapOption);

            const polyline = new window.kakao.maps.Polyline({
                path: polylinePath,
                strokeWeight: 3,
                strokeColor: '#FF0000',
                strokeOpacity: 0.7,
                strokeStyle: 'solid',
            });

            polyline.setMap(map);
        }
    }, [polylinePath]);

    return <SaveMapWrapper id="save-map" />;
};

// Styled Components
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

const SaveContent = styled.div`
    width: 100%;
    height: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #51B47D;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    margin-bottom: -20px;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 14px;
    background-color: transparent;
    border: none;
    color: black;
    font-family: DNFBitBitv2;
`;

const LocationWrapper = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 15px;
    font-family: DNFBitBitv2;
`;

const LocationIcon = styled.img`
    width: 24px;
    height: 24px;
    margin-right: 5px;
`;

const LocationName = styled.span`
    font-size: 14px;
    color: #333;
`;

const SummaryBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90%;
    margin-top: 10px;
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const SummaryRow = styled.div`
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin-bottom: 20px;
`;

const SummaryItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const SaveMapWrapper = styled.div`
    width: 100%;
    height: 40%;
    background-color: #e5e5e5;
    border: 1px solid #ddd;
    margin-bottom: 20px;
    border-radius: 10px;
`;

const TrackingMapWrapper = styled.div`
    width: 100%;
    flex-grow: 7;
    background-color: #ffffff;
    border-radius: 10px;
    overflow: hidden;
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

const GreenBox = styled.div`
    width: 100%;
    height: 30%;
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
    width: 80px;
    height: auto;
    cursor: pointer;
`;

const EndScreen = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #51B47D;
    border-radius: 10px 10px 0 0;
    position: relative;
    margin-bottom: -20px;
`;

const EndText = styled.div`
    font-size: 24px;
    margin-bottom: 20px;
`;

const StopIcon = styled.img`
    width: 250px;
    height: auto;
    cursor: pointer;
`;

const SaveButton = styled.img`
    background: none;
    border: none;
    cursor: pointer;
    position: absolute;
    right: 10px;
    bottom: -1px;
    width: 80px;
`;

export default Walk;