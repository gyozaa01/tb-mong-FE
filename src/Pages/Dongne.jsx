import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Header from '../Components/Header';
import BottomNav from '../Components/BottomNav';
import api from './Api';
import { useNavigate, useParams } from 'react-router-dom';

const WRAPPER_WIDTH = '375px';
const ITEMS_PER_PAGE = 5; // 페이지당 항목 수

const Dongne = () => {
    const { locationId } = useParams(); // URL에서 locationId 파라미터 가져오기
    const [neighborhoodName, setNeighborhoodName] = useState('');
    const [sortOption, setSortOption] = useState('like');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [topUser, setTopUser] = useState('');
    const [topUserType, setTopUserType] = useState('kmTopUser'); // 기본 값: 거리왕
    const [walkRecords, setWalkRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
    const navigate = useNavigate();

    // 동네 이름을 가져오는 함수
    const fetchNeighborhoodName = useCallback(async () => {
        try {
            const response = await api.get(`/api/dongne?locationId=${locationId}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            setNeighborhoodName(response.data.locationName);
        } catch (error) {
            console.error('동네 이름을 불러오는 중 오류 발생:', error);
        }
    }, [locationId]);

    // topUserType에 따라 1위 유저 데이터를 가져오는 함수
    const fetchTopUser = useCallback(async () => {
        if (!locationId) return; // locationId가 없으면 함수 종료
        try {
            const response = await api.get(`/api/dongne/top-user?locationId=${locationId}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            setTopUser(response.data[topUserType]);
        } catch (error) {
            console.error('1위 유저 데이터를 불러오는 중 오류 발생:', error);
        }
    }, [locationId, topUserType]);

    // 기본 목록을 가져오는 함수
    const fetchWalkRecords = useCallback(async () => {
        if (!locationId) return; // locationId가 없으면 함수 종료
        try {
            const response = await api.get(`/api/dongne/trails?locationId=${locationId}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`,
                },
            });
    
            const recordsWithImages = await Promise.all(
                response.data.map(async (record) => {
                    const imageResponse = await api.get(`/api/trail/${record.id}/image`, {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`,
                        },
                        responseType: 'blob', // 이미지 데이터를 Blob으로 받음
                    });
                    const imageUrl = URL.createObjectURL(imageResponse.data);
                    return { ...record, image: imageUrl };
                })
            );
    
            setWalkRecords(recordsWithImages);
        } catch (error) {
            console.error('산책로 데이터를 불러오는 중 오류 발생:', error);
        }
    }, [locationId]);

    // 검색 기능을 사용한 목록을 가져오는 함수
    const fetchSearchResults = useCallback(async () => {
        if (!locationId) return;
        try {
            const response = await api.get(`/api/dongne/search?locationId=${locationId}&trailSortOption=${sortOption.toUpperCase()}&keyword=${searchQuery || ''}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            setFilteredRecords(response.data);
        } catch (error) {
            console.error('검색 결과를 불러오는 중 오류 발생:', error);
        }
    }, [locationId, sortOption, searchQuery]);

    useEffect(() => {
        fetchNeighborhoodName();
        fetchTopUser();
        if (searchQuery) {
            fetchSearchResults(); // 검색어가 있을 때 검색 결과를 가져옴
        } else {
            fetchWalkRecords(); // 검색어가 없을 때 기본 목록을 가져옴
        }
    }, [fetchNeighborhoodName, fetchWalkRecords, fetchSearchResults, fetchTopUser, searchQuery, locationId]);

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

    // 좋아요 클릭 핸들러
    const handleLikeClick = async (trailId) => {
        try {
            const response = await api.post(`/api/dongne/like?trailId=${trailId}`, {}, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            // 좋아요 수를 업데이트
            setWalkRecords((prevRecords) =>
                prevRecords.map((record) =>
                    record.id === trailId ? { ...record, like_count: response.data.like_count } : record
                )
            );
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert("이미 좋아요가 눌러진 산책로입니다.");
            } else {
                console.error("좋아요 요청 중 오류 발생:", error);
            }
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Container>
            <AppWrapper>
                <Header />

                <MainSection>
                    <RankingSection>
                        <img src="/win.png" alt="Winner" />
                        <p>{topUser}님</p>
                        <StyledSelect onChange={handleTopUserTypeChange} value={topUserType}>
                            <option value="kmTopUser">거리왕</option>
                            <option value="countTopUser">횟수왕</option>
                        </StyledSelect>
                    </RankingSection>

                    <DropdownSection>
                        <LeftDropdown>
                            <NeighborhoodLabel>{neighborhoodName}</NeighborhoodLabel>
                        </LeftDropdown>
                        <RightDropdown>
                            <StyledSelect onChange={handleSortOptionChange} value={sortOption}>
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
                        {paginatedRecords.length > 0 ? (
                            paginatedRecords.map((record, index) => (
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
                                            <User>{record.nickname}님</User>
                                        </Detail>
                                    </RecordDetails>
                                    <RightSection>
                                        <Likes onClick={() => handleLikeClick(record.id)}>
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

                    <Pagination>
                        {Array.from({ length: Math.ceil(filteredRecords.length / ITEMS_PER_PAGE) }, (_, index) => (
                            <PageButton
                                key={index}
                                active={index + 1 === currentPage}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </PageButton>
                        ))}
                    </Pagination>
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
    overflow-y: auto;
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

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
`;

const PageButton = styled.div`
    padding: 5px 10px;
    font-size: 16px;
    color: ${(props) => (props.active ? '#51B47D' : 'black')};
    cursor: pointer;
    font-family: 'DNFBitBitv2';
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
