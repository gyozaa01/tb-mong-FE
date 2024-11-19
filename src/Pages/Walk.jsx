import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import BottomNav from '../Components/BottomNav';
import Header from '../Components/Header';
import api from './Api';

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
    const [locationCode, setLocationCode] = useState(localStorage.getItem("locationCode") || '');
    const [name, setName] = useState(''); // 산책로명을 저장하는 상태
    const previousPosition = useRef(null); // 이전 위치 저장용 ref
    const visualTimeRef = useRef(null); // 시각적으로 1초마다 시간 증가용
    const updateInterval = 2000; // 거리 및 위치 업데이트 간격 (2초)
    const distanceUpdateRef = useRef(null); // 주기적으로 거리 업데이트를 수행하기 위한 ref
    const watchIdRef = useRef(null); // 위치 추적을 위한 watchId 저장
    const [mapImage, setMapImage] = useState(null); // 캔버스 캡처 이미지
    const [characterImage, setCharacterImage] = useState(null);
    const refreshButtonRef = useRef(null); // 현재 위치 버튼

    const CANVAS_SIZE = 350;
    const CANVAS_OFFSET = CANVAS_SIZE * 0.2;

    // Wakelock 활성화 (Idle 상태 방지)
    useEffect(() => {
        let wakeLock = null;
        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request("screen");
                wakeLock.addEventListener("release", () =>
                    console.log("Screen Wake Lock released")
                );
            } catch (err) {
                console.error("WakeLock request failed: ", err);
            }
        };
        if (isTracking) requestWakeLock();
        return () => wakeLock?.release();
    }, [isTracking]);

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

    // 대표 캐릭터 이미지 불러오기
    useEffect(() => {
        const fetchCharacterImage = async () => {
            try {
                const response = await api.get('/api/home/repre-character', {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`,
                        Accept: 'image/jpeg',
                    },
                    responseType: 'blob',
                });
                const imgUrl = URL.createObjectURL(response.data);
                setCharacterImage(imgUrl);
            } catch (error) {
                console.error('대표 캐릭터 이미지를 불러오는 중 오류 발생:', error);
            }
        };
        fetchCharacterImage();
    }, []);

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
    
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
    
                // 새로고침 버튼 추가 (reset.png 사용)
                const refreshButton = document.createElement("div");
                refreshButton.style.cssText = `
                    position: absolute;
                    bottom: 50px;
                    left: 10px;
                    z-index: 10;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    background: url('${process.env.PUBLIC_URL}/reset.png') no-repeat center center;
                    background-size: contain;
                `;
                refreshButton.onclick = () => {
                    if (previousPosition.current && map) {
                        map.setCenter(previousPosition.current); // 현재 위치로 지도 중심 이동
                    }
                };
                container.appendChild(refreshButton);
                refreshButtonRef.current = refreshButton;
            });
        };
        document.head.appendChild(script);
    };

    // 실시간 위치 추적 시작 (small_start.png 버튼 클릭 시 호출)
    const startTracking = () => {
        setIsTracking(true); // Tracking 시작 상태로 설정
        setPolylinePath([]); // Polyline 초기화
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
                                const dongCode = `${result[0].code}`;
                                setLocation(dongName); // 상태 업데이트
                                setLocationCode(dongCode);
                                localStorage.setItem("startLocation", dongName); // 첫 위치 저장
                                localStorage.setItem("locationCode", dongCode);
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

                    // Polyline 업데이트
                    if (mapInstance) {
                        setPolylinePath((prevPath) => {
                            const updatedPath = [...prevPath, newPos];
                            if (!mapInstance.polyline) {
                                const polyline = new kakao.maps.Polyline({
                                    map: mapInstance,
                                    path: updatedPath,
                                    strokeWeight: 5,
                                    strokeColor: "#FF0000",
                                    strokeOpacity: 0.7,
                                    strokeStyle: "solid",
                                });
                                mapInstance.polyline = polyline;
                            } else {
                                mapInstance.polyline.setPath(updatedPath);
                            }
                            mapInstance.setCenter(newPos); // 맵의 중심을 현재 위치로 설정
                            return updatedPath;
                        });

                        // 대표 캐릭터 마커 설정
                        if (characterImage) { // characterImage가 로드된 경우에만 마커 생성
                            const characterMarkerImage = new kakao.maps.MarkerImage(
                                characterImage,
                                new kakao.maps.Size(40, 40), // 이미지 크기
                                { offset: new kakao.maps.Point(20, 20) } // 이미지 중심 좌표 설정
                            );

                            // 기존 마커 제거 후 새 마커 설정
                            if (mapInstance.characterMarker) {
                                mapInstance.characterMarker.setMap(null);
                            }
                            const characterMarker = new kakao.maps.Marker({
                                position: newPos,
                                image: characterMarkerImage,
                                map: mapInstance,
                            });
                            mapInstance.characterMarker = characterMarker; // 마커를 mapInstance에 저장하여 추적
                        }
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

    // 경로를 캔버스에 그려주는 함수
    const drawPath = (path) => {
        if (path.length === 0) return null;

        let [minLat, maxLat, minLng, maxLng] = [Infinity, -Infinity, Infinity, -Infinity];

        for (const p of path) {
            minLat = Math.min(minLat, p.lat);
            maxLat = Math.max(maxLat, p.lat);
            minLng = Math.min(minLng, p.lng);
            maxLng = Math.max(maxLng, p.lng);
        }

        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;

        const scaleX = (canvas.width - CANVAS_OFFSET * 2) / (maxLng - minLng);
        const scaleY = (canvas.height - CANVAS_OFFSET * 1.5) / (maxLat - minLat);

        const pathCanvas = canvas.getContext("2d");

        if (pathCanvas) {
            pathCanvas.fillStyle = "white"; // 배경색
            pathCanvas.fillRect(0, 0, canvas.width, canvas.height);

            pathCanvas.strokeStyle = "#00a878";
            pathCanvas.lineJoin = "round";
            pathCanvas.lineCap = "round";
            pathCanvas.lineWidth = 7;

            pathCanvas.beginPath();
            for (let i = 0; i < path.length; i++) {
                const x = CANVAS_OFFSET + (path[i].lng - minLng) * scaleX;
                const y = canvas.height - CANVAS_OFFSET - (path[i].lat - minLat) * scaleY;

                if (i === 0) {
                    pathCanvas.moveTo(x, y);
                } else {
                    pathCanvas.lineTo(x, y);
                }
            }
            pathCanvas.stroke();

            // 시작/끝 지점 좌표 설정
            const start = {
                x: CANVAS_OFFSET + (path[0].lng - minLng) * scaleX,
                y: canvas.height - CANVAS_OFFSET - (path[0].lat - minLat) * scaleY,
            };
            const end = {
                x: CANVAS_OFFSET + (path[path.length - 1].lng - minLng) * scaleX,
                y: canvas.height - CANVAS_OFFSET - (path[path.length - 1].lat - minLat) * scaleY,
            };
    
            // 시작과 끝 지점에 이미지를 그리기 위한 Promise 생성
            return new Promise((resolve) => {
                const startImage = new Image();
                const endImage = new Image();
    
                startImage.src = `${process.env.PUBLIC_URL}/logo.png`; // 시작 지점 이미지 경로
                endImage.src = `${process.env.PUBLIC_URL}/flag.png`; // 끝 지점 이미지 경로
    
                // 모든 이미지가 로드된 후 canvas를 반환하는 함수
                const checkIfAllImagesLoaded = () => {
                    if (startImage.complete && endImage.complete) {
                        pathCanvas.drawImage(startImage, start.x - 12, start.y - 12, 24, 24);
                        pathCanvas.drawImage(endImage, end.x - 12, end.y - 12, 24, 24);
                        resolve(canvas.toDataURL("image/png"));
                    }
                };
    
                startImage.onload = checkIfAllImagesLoaded;
                endImage.onload = checkIfAllImagesLoaded;
            });
        }
    
        return null;
    };
    

    // 산책 종료
    const stopTracking = async () => {
        console.log("Tracking stopped.");
        setIsTracking(false);
        setShowEndScreen(true);
        // 위치 추적 중지
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
            console.log("watchPosition stopped.");
        }
        if (distanceUpdateRef.current) {
            clearInterval(distanceUpdateRef.current);
            distanceUpdateRef.current = null;
            console.log("Interval cleared.");
        }
        // Polyline 경로를 저장 후 콘솔에 출력
        const pathData = polylinePath.map(p => ({
            lat: p.Ma,
            lng: p.La,
        }));
        console.log("총 산책 경로:", pathData); // Polyline 점들의 리스트 출력

        // drawPath 호출 시 await 사용
        const pathDataUrl = await drawPath(pathData);

        console.log("생성된 Map Image URL:", pathDataUrl);

        setMapImage(pathDataUrl);
    };

    // small_start.png 클릭 전까지 Polyline 그려지지 않도록 수정
    const handleStartClick = () => {
        setShowMap(true); // 맵 표시
        initializeMap(); // 지도 초기화
        setIsTracking(false); // Tracking 초기화
    };

    const handleEndConfirmation = () => {
        setShowEndScreen(false);
        setShowSaveScreen(true); // 저장 화면으로 전환
    };

    const createDefaultImage = () => {
        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
    
        const context = canvas.getContext("2d");
        if (context) {
            // 흰색 배경 그리기
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
    
        return canvas.toDataURL("image/png");
    };    
    
    const uploadImage = async (trailId) => {
        console.log("업로드할 trailId: ", trailId);
        try {
            // mapImage가 없는 경우 기본 이미지를 생성
            let imageToUpload = mapImage || createDefaultImage();
    
            // Base64 -> Blob 변환
            const base64ToBlob = (base64Data) => {
                const byteString = atob(base64Data.split(",")[1]);
                const mimeString = base64Data.split(",")[0].split(":")[1].split(";")[0];
                const arrayBuffer = new Uint8Array(byteString.length);
                for (let i = 0; i < byteString.length; i++) {
                    arrayBuffer[i] = byteString.charCodeAt(i);
                }
                return new Blob([arrayBuffer], { type: mimeString });
            };
    
            const blob = base64ToBlob(imageToUpload);
    
            // FormData 생성
            const formData = new FormData();
            formData.append("file", blob, "mapImage.png");
    
            // API 호출
            const response = await api.post(`/api/trail/${trailId}/image`, formData, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwt_token")}`,
                    // "Content-Type": "multipart/form-data",
                },
            });
    
            console.log("이미지 업로드 성공:", response.data);
        } catch (error) {
            console.error("이미지 업로드 중 오류 발생:", error.response || error);
        }
    };    

    const handleSave = async () => {
        try {
            const response = await api.post(
                "/api/trail/save",
                {
                    name: name || "산책로",
                    km: distance,
                    pace: formatPace(),
                    time: formatTime(),
                    perHour: calculateSpeed(),
                    locationCode,
                    spotLists: polylinePath.map((p) => ({ la: p.lat, lo: p.lng })),
                },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("jwt_token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
    
            const trailId = response.data.trailId;
            console.log("산책로 저장 성공:", response.data);
    
            // 이미지 업로드 호출
            await uploadImage(trailId);
    
            // 상태 초기화 및 페이지 이동
            setMapImage(null);
            localStorage.removeItem("startLocation");
            localStorage.removeItem("locationCode");
            window.location.href = "/record";
        } catch (error) {
            console.error("저장 중 오류 발생:", error.response || error);
        }
    };
    

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    // 시각적 시간 포맷팅
    const formatTime = () => {
        if (time === 0) return "00:00:00"; // 기본값 설정 (HH:mm:ss)
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // 평균 페이스 계산
    const formatPace = () => {
        if (distance === 0 || time === 0) return "00:00:00"; // 기본값 설정
        const paceInSeconds = time / distance; // 초/km 계산
        const paceMinutes = Math.floor(paceInSeconds / 60);
        const paceSeconds = Math.floor(paceInSeconds % 60);
        return `${String(paceMinutes).padStart(2, '0')}' ${String(paceSeconds).padStart(2, '0')}''`;
    };

    // 속도 계산
    const calculateSpeed = () => {
        if (time === 0 || distance === 0) return "0.00"; // 기본값 설정 (시속 0.00km/h)
        const speed = (distance / (time / 3600)).toFixed(2); // 시속(km/h) 계산
        return speed;
    };


    return (
        <Container>
            <AppWrapper>
                <Header />
                {showSaveScreen ? (
                    <SaveContent>
                        <Input
                            placeholder="산책로명을 입력하세요."
                            value={name}
                            onChange={handleNameChange}
                        />
                        <LocationWrapper>
                            <LocationIcon src="/location.png" alt="location" />
                            <LocationName>{location}</LocationName>
                        </LocationWrapper>
                        {mapImage || sessionStorage.getItem('mapImage') ? (
                            <img
                                src={mapImage || sessionStorage.getItem('mapImage')}
                                alt="산책 경로 캡처"
                            />
                        ) : (
                            <div>경로 이미지가 없습니다.</div>
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