/*global kakao*/
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import api from './Api';

const WRAPPER_WIDTH = '375px';

const DongneSetting = () => {
  const [currentLocation, setCurrentLocation] = useState({ lat: 37.5665, lng: 126.9780 }); // 초기값
  const [dongName, setDongName] = useState(''); // 현재 동네 이름
  const [locationCode, setLocationCode] = useState(''); // 법정동 코드
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const location = useLocation();
  const kakaoAccessToken = location.state?.kakaoAccessToken; // Auth 페이지에서 전달된 kakaoAccessToken

  // 마커를 생성하는 함수
  const createMarker = useCallback((mapInstance) => {
    const markerPosition = new kakao.maps.LatLng(currentLocation.lat, currentLocation.lng); 
    const marker = new kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(mapInstance); // 지도에 마커 추가
    mapInstance.setCenter(markerPosition); // 지도 중심을 마커 위치로 설정
  }, [currentLocation]);

  // 주소 및 법정동 코드 가져오기 함수 (Kakao REST API 사용)
  const fetchAddress = useCallback(async () => {
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${currentLocation.lng}&y=${currentLocation.lat}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data && data.documents && data.documents.length > 0) {
        const regionInfo = data.documents.find((doc) => doc.region_type === "B");
        if (regionInfo) {
          setDongName(regionInfo.region_3depth_name);
          setLocationCode(regionInfo.code);
        } else {
          console.warn("법정동 정보가 없습니다.");
        }
      } else {
        console.warn("행정구역 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("주소 정보를 불러오는 중 오류 발생:", error);
    }
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
        fetchAddress(); // 주소 가져오기
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
          setLocationCode(''); // 법정동코드도 초기화
        },
        (error) => {
          console.error("현재 위치를 불러오는 중 오류가 발생했습니다:", error);
        }
      );
    }
  };

  const handleSave = async () => {
    if (!locationCode) {
      console.error("법정동 코드가 없습니다.");
      return;
    }

    try {
      if (kakaoAccessToken) {
        // 회원가입 요청
        const response = await api.post('/api/auth/signup', null, {
          params: {
            kakaoAccessToken: kakaoAccessToken,
            locationCode: locationCode,
          }
        });

        if (response.data) {
          sessionStorage.setItem('jwt_token', response.data); // JWT 토큰을 sessionStorage에 저장.
          navigate('/home'); // 홈 화면으로 이동
        } else {
          console.error('JWT 토큰이 응답에 포함되지 않았습니다:', response.data);
        }
      } else {
        // 동네 재설정 요청
        const response = await api.post('/api/settings/set-location', null, {
          params: {
            locationCode: locationCode,
          }
        });

        if (response.status === 200) {
          console.log('동네가 성공적으로 업데이트되었습니다.');
          navigate('/home');
        } else {
          console.error('동네 업데이트 응답 오류:', response.data);
        }
      }
    } catch (err) {
      console.error('동네 설정 중 오류 발생:', err);
    }
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
