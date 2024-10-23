import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../Components/Header';
/*global kakao*/

const WRAPPER_WIDTH = '375px';

const Walk = () => {
    const [currentLocation, setCurrentLocation] = useState({ lat: 37.5665, lng: 126.9780 });
    const [startLocation, setStartLocation] = useState(null);
    const [startLocationName, setStartLocationName] = useState("위치 확인 중...");
    const [distance, setDistance] = useState(0.0);
    const [time, setTime] = useState(0);
    const [isWalking, setIsWalking] = useState(false);
    const [isEndingWalk, setIsEndingWalk] = useState(false);
    const [isSavingWalk, setIsSavingWalk] = useState(false);
    const [polylineImageUrl, setPolylineImageUrl] = useState(null);
    const previousLocation = useRef({ lat: 37.5665, lng: 126.9780 });
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const polylineInstance = useRef(null);
    const watchId = useRef(null);
    const pathPoints = useRef([]);
    const navigate = useNavigate();

    // 거리 계산 함수
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // 지도와 마커 및 Polyline 생성 함수
    const createMapAndMarker = useCallback(() => {
        if (mapInstance.current) return;

        const container = document.getElementById('map');
        const options = {
            center: new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng),
            level: 3,
        };

        mapInstance.current = new kakao.maps.Map(container, options);

        const markerPosition = new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
        const markerImage = new kakao.maps.MarkerImage('/shoe.png', new kakao.maps.Size(64, 69));
        markerInstance.current = new kakao.maps.Marker({
            position: markerPosition,
            image: markerImage,
        });
        markerInstance.current.setMap(mapInstance.current);
    }, [currentLocation]);

    // 좌표를 주소로 변환하는 함수
    const getAddressFromCoords = (lat, lng) => {
        const geocoder = new kakao.maps.services.Geocoder();
        const coord = new kakao.maps.LatLng(lat, lng);
        const callback = (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const dongName = result[0].address.region_3depth_name; // 동 이름 추출
                setStartLocationName(dongName); // 동 이름 상태로 저장
            }
        };
        geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
    };

    const getLocationUpdates = () => {
        if (navigator.geolocation) {
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newLocation = { lat: latitude, lng: longitude };
                    
                    const dist = calculateDistance(
                        previousLocation.current.lat,
                        previousLocation.current.lng,
                        latitude,
                        longitude
                    );
    
                    if (!startLocation) {
                        setStartLocation({ lat: latitude, lng: longitude });
                        getAddressFromCoords(latitude, longitude); // 좌표에서 동 이름 추출
                    }
    
                    if (isWalking) {
                        setDistance((prevDist) => prevDist + dist);
    
                        const newPoint = new kakao.maps.LatLng(latitude, longitude);

                        // 이전 Polyline 제거 (필요 시)
                        if (polylineInstance.current) {
                            polylineInstance.current.setMap(null);
                        }

                        // 새로운 Polyline 생성 및 설정
                        polylineInstance.current = new kakao.maps.Polyline({
                            map: mapInstance.current,
                            path: [...polylineInstance.current.getPath(), newPoint], // 기존 경로에 새 좌표 추가
                            strokeWeight: 5,
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.7,
                            strokeStyle: "solid",
                        });

                        polylineInstance.current.setMap(mapInstance.current); // 지도에 Polyline 추가

                        // 지도 중심을 새로운 위치로 이동
                        mapInstance.current.setCenter(newPoint);

                        // 경로 점 저장
                        pathPoints.current.push({ lat: latitude, lng: longitude });
                    }
    
                    if (mapInstance.current && markerInstance.current) {
                        const newCenter = new kakao.maps.LatLng(latitude, longitude);
                        mapInstance.current.setCenter(newCenter);
                        markerInstance.current.setPosition(newCenter);
                    }
    
                    setCurrentLocation(newLocation);
                    previousLocation.current = newLocation;
                },
                (error) => {
                    console.error("위치 업데이트 중 오류 발생:", error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                }
            );
        }
    };    

    const removeLocationUpdates = () => {
        if (watchId.current != null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
    };

    // Polyline을 캔버스로 변환해 저장하는 함수
    const drawPathOnCanvas = (path) => {
        const CANVAS_SIZE = 480; // 캔버스 크기
        const CANVAS_OFFSET = CANVAS_SIZE * 0.1; // 경계 여백
        let [minLat, maxLat, minLng, maxLng] = [Infinity, -Infinity, Infinity, -Infinity];
    
        // 경로의 최소/최대 위도 및 경도 계산
        path.forEach(p => {
            minLat = Math.min(minLat, p.lat);
            maxLat = Math.max(maxLat, p.lat);
            minLng = Math.min(minLng, p.lng);
            maxLng = Math.max(maxLng, p.lng);
        });
    
        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        const context = canvas.getContext("2d");

        // 경로 점들을 캔버스 크기에 맞게 스케일 조정
        const scaleX = (canvas.width - CANVAS_OFFSET * 2) / (maxLng - minLng);
        const scaleY = (canvas.height - CANVAS_OFFSET * 2) / (maxLat - minLat);

        // 캔버스 배경 색상
        context.fillStyle = "#F0F0F0";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 경로 선 설정
        context.strokeStyle = "#FF0000"; // 경로 색상
        context.lineWidth = 5; // 경로 두께
        context.beginPath();

        path.forEach((point, index) => {
            // 경로 좌표를 캔버스 좌표로 변환
            const x = CANVAS_OFFSET + (point.lng - minLng) * scaleX;
            const y = canvas.height - CANVAS_OFFSET - (point.lat - minLat) * scaleY;

            if (index === 0) {
                context.moveTo(x, y); // 시작점 이동
            } else {
                context.lineTo(x, y); // 경로 그리기
            }
        });

        context.stroke(); // 경로 그리기 완료
        return canvas.toDataURL(); // 경로를 이미지 데이터로 변환
    };

    const handleStartStopWalk = () => {
        if (!isWalking) {
            setIsWalking(true);
            getLocationUpdates();
            setTime(0);
        } else {
            setIsWalking(false);
            removeLocationUpdates();
            setIsEndingWalk(true);
        }
    };

    const handleConfirmStopWalk = () => {
        setIsEndingWalk(false);
        setIsSavingWalk(true);

        // 캔버스에 경로 그리기
        const polylineImage = drawPathOnCanvas(pathPoints.current);
        setPolylineImageUrl(polylineImage); 
    };

    const handleSaveWalk = () => {
        console.log("산책 저장 완료!");
        navigate("/record");  // 저장 후 record로 이동
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_KEY}&autoload=false&libraries=services`;
        document.head.appendChild(script);

        script.onload = () => {
            kakao.maps.load(() => {
                createMapAndMarker();
            });
        };

        return () => {
            document.head.removeChild(script);
            removeLocationUpdates();
        };
    }, [createMapAndMarker]);

    useEffect(() => {
        if (isWalking) {
            const timer = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isWalking]);

    const formatTime = () => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const formatPace = () => {
        if (distance === 0) {
            return "N/A";  // 거리가 0일 때는 계산하지 않음
        } else {
            const pace = (time / distance).toFixed(2);  // 시간(초) / 거리(킬로미터) -> 분/km 페이스
            return `${pace} 분/km`; 
        }
    };    

    return (
        <Container>
            <AppWrapper>
                <Header />

                {!isEndingWalk && !isSavingWalk && (
                    <>
                        <MapContainer id="map" />
                        <InfoBox>
                            <Stats>
                                <StatItem>
                                    <StatValue>{distance.toFixed(2)}</StatValue>
                                    <StatLabel>킬로미터</StatLabel>
                                </StatItem>
                                <StatItem>
                                    <StatValue>{formatTime()}</StatValue>
                                    <StatLabel>시간</StatLabel>
                                </StatItem>
                            </Stats>
                            <StopButton onClick={handleStartStopWalk}>
                                <img src={isWalking ? "/small_stop.png" : "/small_start.png"} alt="Start/Stop" />
                            </StopButton>
                        </InfoBox>
                    </>
                )}

                {isEndingWalk && (
                    <InfoBoxExpanded>
                        <Title>산책을 종료하시겠습니까?</Title>
                        <BigStopButton onClick={handleConfirmStopWalk}>
                            <img src="/stop.png" alt="Stop" />
                        </BigStopButton>
                    </InfoBoxExpanded>
                )}

                {isSavingWalk && (
                    <InfoBoxExpanded2>
                        <WalkDetails>
                            <StyledInputField placeholder="산책명을 입력하세요" />
                            <LocationBox>
                                <img src="/location.png" alt="Location" />
                                <LocationName>{startLocationName}</LocationName>
                            </LocationBox>
                            {polylineImageUrl ? (
                                <MapImage src={polylineImageUrl} alt="Polyline 경로" />
                            ) : (
                                <p>경로 이미지를 불러오는 중...</p>
                            )}
                            <StatsContainer>
                                <Stats>
                                    <StatItem>
                                        <StatValue>{distance.toFixed(2)}</StatValue>
                                        <StatLabel>킬로미터</StatLabel>
                                    </StatItem>
                                    <StatItem>
                                        <StatValue>{formatTime()}</StatValue>
                                        <StatLabel>시간</StatLabel>
                                    </StatItem>
                                </Stats>
                                <Stats>
                                    <StatItem>
                                        <StatValue>{(distance / (time / 3600)).toFixed(2)}</StatValue>
                                        <StatLabel>시속</StatLabel>
                                    </StatItem>
                                    <StatItem>
                                        <StatValue>{formatPace()}</StatValue>
                                        <StatLabel>평균 페이스</StatLabel>
                                    </StatItem>
                                </Stats>
                            </StatsContainer>
                            <SaveButton onClick={handleSaveWalk}>
                                <img src="/save.png" alt="Save" />
                            </SaveButton>
                        </WalkDetails>
                    </InfoBoxExpanded2>
                )}
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    position: relative;
`;

const MapContainer = styled.div`
    width: 100%;
    flex-grow: 1;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const InfoBox = styled.div`
    background-color: #51B47D;
    width: 100%;
    box-sizing: border-box;
    padding: 20px;
    border-radius: 10px 10px 0 0;
    text-align: center;
    position: relative;
`;

const InfoBoxExpanded = styled(InfoBox)`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const Title = styled.h2`
    font-size: 24px;
    margin-bottom: 20px;
`;

const BigStopButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    img {
        width: 200px;
        height: auto;
    }
`;

const StopButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    img {
        width: 100px;
        height: auto;
    }
`;

const InfoBoxExpanded2 = styled(InfoBox)`
    flex-grow: 1;
`;

const WalkDetails = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
`;

const StyledInputField = styled.input`
    color: black;
    width: 90%;
    padding: 12px;
    margin-bottom: 20px;
    font-size: 18px;
    border: none;
    background-color: transparent;
    font-family:'DNFBitBitv2';
`;

const LocationBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 90%;
`;

const LocationName = styled.p`
    margin-left: 10px;
`;

const MapImage = styled.img`
    width: 100%;
    height: auto;
    margin-bottom: 20px;
`;

const StatsContainer = styled.div`
    background-color: #fff;
    border-radius: 10px;
    padding: 15px;
    width: 90%;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const Stats = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StatValue = styled.p`
    font-size: 28px;
    margin: 0;
`;

const StatLabel = styled.p`
    font-size: 16px;
    margin: 0;
`;

const SaveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 8px;
  bottom: 20px;
  img {
    width: 120px;
  }
`;

export default Walk;
