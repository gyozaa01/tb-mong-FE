import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import BottomNav from '../Components/BottomNav';
import Header from '../Components/Header';
import html2canvas from 'html2canvas';

/*global kakao*/

const WRAPPER_WIDTH = '375px';

const Walk = () => {
    const [showMap, setShowMap] = useState(false); // 맵 표시 여부
    const [isTracking, setIsTracking] = useState(false); // 추적 상태 (start/pause)
    const [showEndScreen, setShowEndScreen] = useState(false); // 종료 화면 표시 여부
    const [showSaveScreen, setShowSaveScreen] = useState(false); // 저장 화면 표시 여부
    const [mapInstance, setMapInstance] = useState(null); // 카카오 맵 인스턴스
    const [distance, setDistance] = useState(0.0); // 이동 거리
    const [time, setTime] = useState(0); // 시간 (초 단위)
    const [polylinePath, setPolylinePath] = useState([]); // Polyline 경로를 저장하는 배열
    const [location, setLocation] = useState(localStorage.getItem("startLocation") || ''); // 초기 위치 설정
    const previousPosition = useRef(null); // 이전 위치 저장용 ref
    const visualTimeRef = useRef(null); // 시각적으로 1초마다 시간 증가용
    const updateInterval = 2000; // 거리 및 위치 업데이트 간격 (2초)
    const distanceUpdateRef = useRef(null); // 주기적으로 거리 업데이트를 수행하기 위한 ref
    const watchIdRef = useRef(null); // 위치 추적을 위한 watchId 저장
    const [mapImage, setMapImage] = useState(null); // 캔버스 캡처 이미지
    const canvasRef = useRef(null); // 캔버스 ref

    // 시각적 시간을 1초마다 증가시키기 위한 useEffect
    useEffect(() => {
        if (isTracking) {
            // Tracking이 활성화되면 매 1초마다 시간을 증가시킴
            visualTimeRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1); // 시각적 시간 1초씩 증가
            }, 1000);
        } else {
            clearInterval(visualTimeRef.current); // Tracking이 중지되면 타이머 해제
        }
        return () => clearInterval(visualTimeRef.current); // 컴포넌트가 언마운트될 때 타이머 해제
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
        setIsTracking(true); // Tracking 시작 상태로 설정
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = new kakao.maps.LatLng(latitude, longitude);

                    // 최초 위치 설정
                    if (!previousPosition.current) {
                        // 처음 위치에서 동네명 설정
                        const geocoder = new kakao.maps.services.Geocoder();
                        geocoder.coord2RegionCode(longitude, latitude, (result, status) => {
                            if (status === kakao.maps.services.Status.OK) {
                                const dongName = `${result[0].region_3depth_name}`;
                                setLocation(dongName); // 상태 업데이트
                                localStorage.setItem("startLocation", dongName); // 첫 위치 저장
                            }
                        });
                        previousPosition.current = newPos; // 초기 위치 설정
                    } else {
                        // Polyline 경로 업데이트 및 거리 계산
                        const polyline = new kakao.maps.Polyline({
                            path: [previousPosition.current, newPos],
                        });
                        const distanceBetween = polyline.getLength(); // 두 위치 간의 거리 계산
                        setDistance((prev) => prev + distanceBetween / 1000); // km 단위 거리 계산
                        previousPosition.current = newPos; // 이전 위치를 현재 위치로 업데이트
                    }

                    // Polyline 경로를 설정하고 맵에 반영
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
                            mapInstance.setCenter(newPos); // 맵의 중심을 현재 위치로 설정
                            return updatedPath;
                        });
                    }
                },
                (error) => console.error("Error in getting geolocation: ", error),
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000, // Timeout 값을 10초로 늘려 위치 정보를 얻기 위한 대기 시간을 증가
                }
            );

            // 일정 간격으로 Polyline 및 거리 업데이트
            distanceUpdateRef.current = setInterval(() => {
                if (previousPosition.current) {
                    // 현재 위치를 기준으로 Polyline 업데이트
                    const currentPolylinePath = polylinePath;
                    if (currentPolylinePath.length > 1) {
                        const polyline = new kakao.maps.Polyline({
                            path: currentPolylinePath,
                        });
                        setDistance(polyline.getLength() / 1000); // Polyline 경로의 총 길이를 계산하여 km 단위로 설정
                    }
                }
            }, updateInterval);
        } else {
            console.warn("이 브라우저는 위치 정보를 지원하지 않습니다.");
        }
    };

    // Polyline 경로를 캔버스에 그리기 및 캡처
    const captureCanvasPolyline = () => {
        const canvas = canvasRef.current;
        if (!canvas) return; // canvas가 존재하는지 확인
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        ctx.beginPath();
        polylinePath.forEach((point, index) => {
            const { Ma, La } = point;
            if (index === 0) {
                ctx.moveTo(La, Ma);
            } else {
                ctx.lineTo(La, Ma);
            }
        });
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 2;
        ctx.stroke();
    
        html2canvas(canvas).then((canvas) => {
            const imageData = canvas.toDataURL("image/png");
            setMapImage(imageData);
        });
    };    

    // 산책 종료
    const stopTracking = () => {
        console.log("Tracking stopped."); // 확인용 로그
        setIsTracking(false);
        setShowEndScreen(true);
        
        // 거리 및 위치 업데이트 중지
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
            console.log("watchPosition stopped."); // 확인용 로그
        }
        if (distanceUpdateRef.current) {
            clearInterval(distanceUpdateRef.current);
            distanceUpdateRef.current = null;
            console.log("Interval cleared."); // 확인용 로그
        }

        captureCanvasPolyline(); // 캔버스 캡처 실행
    };

    const handleStartClick = () => {
        setShowMap(true); // start.png 클릭 시 맵 표시
        initializeMap(); // 맵 초기화
    };

    const handleEndConfirmation = () => {
        setShowEndScreen(false);
        setShowSaveScreen(true); // 저장 화면으로 전환
    };

    const handleSave = () => {
        console.log("산책 정보 저장");

        // 산책 정보를 저장 후, localStorage에서 polylinePath와 startLocation 삭제
        localStorage.removeItem("startLocation");
        localStorage.removeItem("polylinePath");
        window.location.href = "/record";
    };

    // 시각적 시간 포맷팅
    const formatTime = () => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    // 평균 페이스 계산
    const formatPace = () => {
        if (distance === 0) return "N/A"; // 거리 0일 때는 계산하지 않음
        const paceInSeconds = time / distance; // 초/km 계산
        const paceMinutes = Math.floor(paceInSeconds / 60);
        const paceSeconds = Math.floor(paceInSeconds % 60);
        return `${paceMinutes}' ${String(paceSeconds).padStart(2, '0')}''`; 
    };
    // 속도 계산
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
                        {mapImage ? (
                            <img src={mapImage} alt="산책 경로 캡처" /> // 캡처된 이미지 표시
                        ) : (
                            <canvas ref={canvasRef} width="375" height="375" style={{ display: "none" }} />
                        )}
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