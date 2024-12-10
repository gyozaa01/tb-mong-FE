import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import api from './Api';
import Header from '../Components/Header';
import BottomNav from '../Components/BottomNav';

/*global kakao*/

const WRAPPER_WIDTH = '375px';

const FollowTrail = () => {
    const { trailId } = useParams(); // URL에서 trailId 가져오기
    const [trailData, setTrailData] = useState(null); // 산책로 데이터

    // 산책로 데이터 불러오기
    useEffect(() => {
        const fetchTrailData = async () => {
            try {
                const response = await api.get(`/api/trail/load?trailId=${trailId}`, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                    }
                });
                setTrailData(response.data);
            } catch (error) {
                console.error("산책로 데이터를 불러오는 중 오류 발생:", error);
            }
        };
        fetchTrailData();
    }, [trailId]);

    // 카카오 맵 초기화 및 경로 그리기
    useEffect(() => {
        if (trailData) {
            const script = document.createElement("script");
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_KEY}&autoload=false&libraries=services`;
            script.onload = () => {
                kakao.maps.load(() => {
                    const container = document.getElementById("map");
                    const options = {
                        center: new kakao.maps.LatLng(trailData.spotLists[0].lo, trailData.spotLists[0].la), // 첫 번째 지점으로 중심 설정
                        level: 10,
                    };
                    const map = new kakao.maps.Map(container, options);

                    // 경로 그리기
                    const path = trailData.spotLists.map(spot => new kakao.maps.LatLng(spot.lo, spot.la));
                    new kakao.maps.Polyline({
                        map: map,
                        path: path,
                        strokeWeight: 5,
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.7,
                        strokeStyle: "solid",
                    });
                });
            };
            document.head.appendChild(script);
        }
    }, [trailData]);

    return (
        <Container>
            <AppWrapper>
                <Header />
                <MapWrapper>
                    <div id="map" style={{ width: "100%", height: "100%" }}></div>
                </MapWrapper>
                <StyledBottomNav />
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

const MapWrapper = styled.div`
    width: 100%;
    height: calc(100% - 130px);
    background-color: #ffffff;
    border-radius: 10px;
    overflow: hidden;
`;

const StyledBottomNav = styled(BottomNav)`
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 10; /* 맨 위 레이어에 배치 */
`;

export default FollowTrail;
