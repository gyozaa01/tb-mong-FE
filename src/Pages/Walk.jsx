import React, { useEffect, useState } from 'react';
/*global kakao*/

const Walk = () => {
    const [positions, setPositions] = useState([]); // 실시간 위치 경로 배열
    const [isTracking, setIsTracking] = useState(false); // 추적 상태
    const [mapInstance, setMapInstance] = useState(null); // 카카오 맵 인스턴스

    useEffect(() => {
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_KEY}&autoload=false&libraries=services`;
        script.onload = () => kakao.maps.load(initializeMap);
        document.head.appendChild(script);

        const initializeMap = () => {
            const container = document.getElementById("map");
            const options = {
                center: new kakao.maps.LatLng(37.5665, 126.9780), // 초기 좌표
                level: 3,
            };
            const map = new kakao.maps.Map(container, options);
            setMapInstance(map); // 맵 인스턴스 저장
        };

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const startTracking = () => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = new kakao.maps.LatLng(latitude, longitude);
                    setPositions((prev) => [...prev, newPos]);

                    if (mapInstance) {
                        const polyline = new kakao.maps.Polyline({
                            map: mapInstance,
                            path: [...positions, newPos], // Polyline에 최신 좌표 설정
                            strokeWeight: 5,
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.7,
                            strokeStyle: "solid",
                        });
                        polyline.setPath([...positions, newPos]);
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

    const handleTrackingButton = () => {
        setIsTracking((prev) => {
            const newTrackingState = !prev;
            if (newTrackingState) {
                console.log("추적 시작"); // 추적 시작 콘솔 출력
                startTracking();
            } else {
                console.log("추적 중지"); // 추적 중지 콘솔 출력
            }
            return newTrackingState;
        });
    };

    return (
        <div>
            <button onClick={handleTrackingButton}>
                {isTracking ? "멈춤" : "시작"}
            </button>
            <div id="map" style={{ width: "100%", height: "400px" }}></div>
        </div>
    );
};

export default Walk;
