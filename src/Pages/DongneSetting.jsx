/*global kakao*/
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const WRAPPER_WIDTH = '375px';

const DongneSetting = () => {
  const [currentLocation, setCurrentLocation] = useState({ lat: 37.5665, lng: 126.9780 }); // 초기값
  const [dongName, setDongName] = useState(''); // 현재 동네 이름
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  // 마커를 생성하는 함수
  const createMarker = useCallback((mapInstance) => {
    const markerPosition = new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng); 
    const marker = new kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(mapInstance); // 지도에 마커 추가
    mapInstance.setCenter(markerPosition); // 지도 중심을 마커 위치로 설정
  }, [currentLocation]);

  // 주소 가져오기 함수
  const fetchAddress = useCallback((mapInstance) => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(currentLocation.lng, currentLocation.lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setDongName(result[0].address.region_3depth_name);
      } else {
        setDongName("동네를 찾을 수 없습니다.");
      }
    });
  }, [currentLocation]);

  // 지도 및 마커 생성
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_KEY}&autoload=false&libraries=services`;
    document.head.appendChild(script);
  
    script.onload = () => {
      kakao.maps.load(() => {
        const container = document.getElementById("map");
        const options = {
          center: new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng),
          level: 8,
        };
        const newMap = new kakao.maps.Map(container, options);

        createMarker(newMap);  // 마커를 생성하는 함수 호출
        fetchAddress(newMap);  // 주소 가져오기
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [currentLocation, createMarker, fetchAddress]);

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (latitude !== currentLocation.lat || longitude !== currentLocation.lng) {
            setCurrentLocation({ lat: latitude, lng: longitude });
          }
        },
        (error) => {
          console.error("현재 위치를 불러오는 중 오류가 발생했습니다:", error);
        }
      );
    } else {
      console.warn("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  }, [currentLocation]);

  const handleReset = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setDongName(''); // 동네명도 초기화
        },
        (error) => {
          console.error("현재 위치를 불러오는 중 오류가 발생했습니다:", error);
        }
      );
    }
  };

  const handleSave = () => {
    console.log('동네 정보 저장:', { dongName });
    navigate('/home');
  };

  return (
    <Container>
        <AppWrapper>
            <Header>
              <BackButton onClick={() => navigate(-1)}>&lt;</BackButton>
              <Title>내 동네 설정</Title>
            </Header>

            <MapContainer id="map" />

            <DongneBox>
                <ResetButton onClick={handleReset}>
                    <img src="/reset.png" alt="새로고침" />
                </ResetButton>
                <DongneLabel>내 동네</DongneLabel>
                <DongneName>
                    {dongName ? dongName : "동네를 찾는 중..."}
                </DongneName>
                <SaveButton onClick={handleSave}>
                    <img src="/save.png" alt="저장" />
                </SaveButton>
            </DongneBox>
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
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center; 
  margin-bottom: 20px;
  position: relative; 
  margin-top: 20px;
  width: 100%;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: black;
  position: absolute;
  font-family: DNFBitBitv2;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  color: black;
  margin: 0;
  text-align: center;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 50%;
  border-radius: 15px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const DongneBox = styled.div`
  background-color: #51B47D;
  width: 100%;
  padding: 20px;
  margin-top: 20px;
  border-radius: 10px 10px 0 0;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  text-align: center;
  position: relative;
  height: 240px;
`;

const DongneLabel = styled.h2`
  font-size: 18px;
  color: black;
  margin-bottom: 10px;
`;

const DongneName = styled.div`
  font-size: 22px;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  color: black;
  margin-bottom: 20px;
  position: relative;
`;

const ResetButton = styled.button`
  background: transparent;
  border: none;
  position: absolute;
  top: 10px;
  left: 10px;
  cursor: pointer;
  img {
    width: 30px;
  }
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

export default DongneSetting;
