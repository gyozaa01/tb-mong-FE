import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Header from '../Components/Header';
import BottomNav from '../Components/BottomNav';
import api from './Api';
import { useNavigate } from 'react-router-dom';

const WRAPPER_WIDTH = '375px';

const Dongne = () => {
    const [neighborhoodName, setNeighborhoodName] = useState('');
    const [locationCode, setLocationCode] = useState('');
    const [sortOption, setSortOption] = useState('like');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [topUser, setTopUser] = useState('');
    const [topUserType, setTopUserType] = useState('kmTopUser'); // 기본 값: 거리왕
    const [walkRecords, setWalkRecords] = useState([]);
    const navigate = useNavigate();

    // 동네 이름과 locationCode를 가져오는 함수
    const fetchNeighborhoodName = useCallback(async () => {
        try {
            const response = await api.get('/api/dongne', {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            setNeighborhoodName(response.data.locationName);
            setLocationCode(response.data.locationCode); // locationCode 설정
        } catch (error) {
            console.error('동네 이름을 불러오는 중 오류 발생:', error);
        }
    }, []);

    // locationCode와 topUserType에 따라 1위 유저 데이터를 가져오는 함수
    const fetchTopUser = useCallback(async () => {
        if (!locationCode) return; // locationCode가 없으면 함수 종료
        try {
            const response = await api.get(`/api/dongne/top-user?locationId=${locationCode}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            setTopUser(response.data[topUserType]);
        } catch (error) {
            console.error('1위 유저 데이터를 불러오는 중 오류 발생:', error);
        }
    }, [locationCode, topUserType]);

    // 기본 목록을 가져오는 함수
    const fetchWalkRecords = useCallback(async () => {
        if (!locationCode) return; // locationCode가 없으면 함수 종료
        try {
            const response = await api.get(`/api/dongne/trails?locationId=${locationCode}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            setWalkRecords(response.data);
        } catch (error) {
            console.error('산책로 데이터를 불러오는 중 오류 발생:', error);
        }
    }, [locationCode]);

    // 검색 기능을 사용한 목록을 가져오는 함수
    const fetchSearchResults = useCallback(async () => {
        if (!locationCode) return; // locationCode가 없으면 함수 종료
        try {
            const response = await api.get(`/api/dongne/search?locationId=${locationCode}&trailSortOption=${sortOption.toUpperCase()}&keyword=${searchQuery || ''}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            setFilteredRecords(response.data);
        } catch (error) {
            console.error('검색 결과를 불러오는 중 오류 발생:', error);
        }
    }, [locationCode, sortOption, searchQuery]);

    useEffect(() => {
        fetchNeighborhoodName();
    }, [fetchNeighborhoodName]);

    useEffect(() => {
        if (searchQuery) {
            fetchSearchResults(); // 검색어가 있을 때 검색 결과를 가져옴
        } else {
            fetchWalkRecords(); // 검색어가 없을 때 기본 목록을 가져옴
        }
        fetchTopUser();
    }, [fetchWalkRecords, fetchSearchResults, fetchTopUser, searchQuery]);

    useEffect(() => {
        setFilteredRecords(walkRecords);
    }, [walkRecords]);

    const handleSortOptionChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleTopUserTypeChange = (e) => {
        setTopUserType(e.target.value); // topUserType 설정
    };

    const handleStartTrail = (trailId) => {
        navigate(`/walk/${trailId}`);
    };

    return (
        <Container>
            <AppWrapper>
                <Header />

                <MainSection>
                    <RankingSection>
                        <img src="/win.png" alt="Winner" />
                        <p>{topUser}</p>
                        <StyledSelect onChange={handleTopUserTypeChange}>
                            <option value="kmTopUser">거리왕</option>
                            <option value="countTopUser">횟수왕</option>
                        </StyledSelect>
                    </RankingSection>

                    <DropdownSection>
                        <LeftDropdown>
                            <NeighborhoodLabel>{neighborhoodName}</NeighborhoodLabel>
                        </LeftDropdown>
                        <RightDropdown>
                            <StyledSelect onChange={handleSortOptionChange}>
                                <option value="like">좋아요순</option>
                                <option value="recent">최신순</option>
                                <option value="my_likes">찜한 산책로</option>
                                <option value="my_walks">내가 한 산책</option>
                            </StyledSelect>
                        </RightDropdown>
                    </DropdownSection>

                    <SearchBar>
                        <input
                            type="text"
                            placeholder="산책로 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <img src="/search.png" alt="Search Icon" />
                    </SearchBar>

                    <WalkList>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record, index) => (
                                <RecordItem key={index}>
                                    <MapImage src={record.image || '/default.png'} alt={record.name} />
                                    <RecordDetails>
                                        <Title>{record.name}</Title>
                                        <Detail>
                                            <img src="/location.png" alt="Location Icon" />
                                            <Location>{record.location_name}</Location>
                                        </Detail>
                                        <Detail>
                                            <img src="/logo.png" alt="Distance Icon" />
                                            <Distance>{record.km} km</Distance>
                                        </Detail>
                                        <Detail>
                                            <img src="/user.png" alt="User Icon" />
                                            <User>{record.nickname}</User>
                                        </Detail>
                                    </RecordDetails>
                                    <RightSection>
                                        <Likes>
                                            <img src="/heart.png" alt="Likes" /> {record.like_count}
                                        </Likes>
                                        <StartButton onClick={() => handleStartTrail(record.id)}>
                                            <img src="/start.png" alt="Start" />
                                        </StartButton>
                                    </RightSection>
                                </RecordItem>
                            ))
                        ) : (
                            <NoRecordMessage>해당 조건에 맞는 산책로가 없습니다.</NoRecordMessage>
                        )}
                    </WalkList>
                </MainSection>

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
    justify-content: space-between;
    position: relative;
    overflow: hidden;
`;

const MainSection = styled.div`
    width: 100%;
    flex-grow: 1;
    padding-bottom: 100px;
`;

const RankingSection = styled.div`
    text-align: center;
    margin-bottom: 10px;

    img {
        width: 50px;
        height: 50px;
    }

    p {
        font-size: 18px;
        margin-top: 10px;
    }
`;

const DropdownSection = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const LeftDropdown = styled.div`
    display: flex;
    align-items: center;
`;

const NeighborhoodLabel = styled.span`
    font-size: 14px;
    padding: 5px 10px;
    font-family: 'DNFBitBitv2';
    background-color: white;
    border: 2px solid #51B47D;
    border-radius: 15px;
`;

const RightDropdown = styled.div``;

const StyledSelect = styled.select`
    font-size: 14px;
    padding: 5px 10px;
    font-family: 'DNFBitBitv2';
    background-color: white;
    border: 2px solid #51B47D;
    border-radius: 15px;
`;

const SearchBar = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    input {
        width: 100%;
        padding: 8px 40px 8px 8px;
        font-size: 14px;
        border: none;
        border-radius: 10px;
        font-family: 'DNFBitBitv2';
    }

    img {
        position: absolute;
        right: 10px;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }
`;

const WalkList = styled.div`
    display: flex;
    flex-direction: column;
`;

const RecordItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #FFF;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
`;

const MapImage = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 5px;
`;

const RecordDetails = styled.div`
    flex-grow: 1;
    margin-left: 10px;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 20px;
`;

const Detail = styled.div`
    display: flex;
    align-items: center;
    margin-top: 5px;

    img {
        width: 16px;
        height: 16px;
        margin-right: 5px;
    }
`;

const Location = styled.p`
    font-size: 14px;
    margin: 0;
`;

const Distance = styled.p`
    font-size: 14px;
    margin: 0;
`;

const User = styled.p`
    font-size: 14px;
    margin: 0;
`;

const RightSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Likes = styled.p`
    font-size: 20px;
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    img {
        width: 40px;
        height: 40px;
        margin-right: 5px;
    }
`;

const StartButton = styled.div`
    img {
        width: 100px;
        cursor: pointer;
    }
`;

const NoRecordMessage = styled.p`
    text-align: center;
    font-size: 16px;
    color: #999;
`;

const StyledBottomNav = styled(BottomNav)`
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #fff;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    padding: 10px 0;
`;

export default Dongne;
