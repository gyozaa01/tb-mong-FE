import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Header from '../Components/Header';
/*global kakao*/

const WRAPPER_WIDTH = '375px';

const Walk = () => {
    const [currentLocation, setCurrentLocation] = useState({ lat: 37.5665, lng: 126.9780 });
    const [startLocation, setStartLocation] = useState(null); // 산책 시작 시점의 위치 저장
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

        polylineInstance.current = new kakao.maps.Polyline({
            path: [markerPosition],
            strokeWeight: 5,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
        });
        polylineInstance.current.setMap(mapInstance.current);
    }, [currentLocation]);

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
                        // 산책을 처음 시작할 때 위치 저장
                        setStartLocation({ lat: latitude, lng: longitude });
                    }

                    if (isWalking) {
                        setDistance((prevDist) => prevDist + dist);

                        const newPoint = new kakao.maps.LatLng(latitude, longitude);
                        const path = polylineInstance.current.getPath();
                        path.push(newPoint);
                        polylineInstance.current.setPath(path);
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
        setPolylineImageUrl('/path_to_generated_polyline_image.png'); // 예시 이미지 경로 적용
    };

    const handleSaveWalk = () => {
        console.log("산책 저장 완료!");
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
                        <StopButton onClick={handleConfirmStopWalk}>
                            <img src="/stop.png" alt="Stop" />
                        </StopButton>
                    </InfoBoxExpanded>
                )}

                {isSavingWalk && (
                    <InfoBoxExpanded>
                        <WalkDetails>
                            <StyledInputField placeholder="산책명을 입력하세요" />
                            <LocationBox>
                                <img src="/location.png" alt="Location" />
                                <LocationName>{startLocation ? "우산동" : "위치 확인 중..."}</LocationName>
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
                                        <StatValue>{(time / distance).toFixed(2)}</StatValue>
                                        <StatLabel>평균 페이스</StatLabel>
                                    </StatItem>
                                </Stats>
                            </StatsContainer>
                            <SaveButton onClick={handleSaveWalk}>
                                <img src="/save.png" alt="Save" />
                            </SaveButton>
                        </WalkDetails>
                    </InfoBoxExpanded>
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
`;

const Title = styled.h2`
    font-size: 24px;
    margin-bottom: 20px;
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

const WalkDetails = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StyledInputField = styled.input`
    color: black;
    width: 80%;
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
    margin-bottom: 20px;
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
    img {
        width: 100px;
        height: auto;
    }
`;

export default Walk;
