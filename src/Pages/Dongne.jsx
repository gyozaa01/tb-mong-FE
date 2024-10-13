import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../Components/Header';
import BottomNav from '../Components/BottomNav';

// 더미 데이터
const walkRecords = [
    {
        title: '좋아요런',
        location: '우산동',
        distance: 4.0,
        likes: 17,
        mapImage: '/good_run.png',
        user: '당당님',
    },
    {
        title: '댕댕이런',
        location: '서석동',
        distance: 3.2,
        likes: 23,
        mapImage: '/dog_run.png',
        user: '산책왕',
    },
    {
        title: '빠른런',
        location: '우산동',
        distance: 5.2,
        likes: 11,
        mapImage: '/fast_run.png',
        user: '러너',
    },
    {
        title: '즐거운산책',
        location: '매곡동',
        distance: 2.8,
        likes: 9,
        mapImage: '/joy_walk.png',
        user: '행복한산책자',
    },
    {
        title: '조용한산책',
        location: '서석동',
        distance: 4.1,
        likes: 5,
        mapImage: '/quiet_walk.png',
        user: '산책러',
    },
    {
        title: '도전런',
        location: '매곡동',
        distance: 3.5,
        likes: 15,
        mapImage: '/challenge_run.png',
        user: '도전자',
    },
];

// 동네별 1위 유저를 관리하는 더미 데이터
const topUsers = {
    우산동: '당당님',
    서석동: '산책왕',
    매곡동: '도전자',
};

// 1위 유저 가져오기 함수
const getTopUserForNeighborhood = (neighborhood) => {
    return topUsers[neighborhood] || '1위 없음';
};

const WRAPPER_WIDTH = '375px';

const Dongne = () => {
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('우산동');
    const [sortOption, setSortOption] = useState('like');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputNeighborhood, setInputNeighborhood] = useState('');  // 직접 입력한 동네명 저장
    const [topUser, setTopUser] = useState(getTopUserForNeighborhood('우산동')); // 1위 유저 상태 저장
    const [errorMessage, setErrorMessage] = useState('');  // 에러 메시지 상태 저장

    // 동네 검색 모달 열기
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // 동네 검색 모달 닫기
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setErrorMessage('');  // 모달을 닫으면 에러 메시지 초기화
    };

    // 동네 선택 후 저장하기
    const handleSaveNeighborhood = () => {
        if (inputNeighborhood) {
            // '동'으로 끝나는지 확인
            if (!inputNeighborhood.endsWith('동')) {
                setErrorMessage('동네명은 "동"으로 끝나야 합니다.');
                return;
            }
            console.log('동네 저장 중:', inputNeighborhood);  // 저장 전 로그
            setSelectedNeighborhood(inputNeighborhood);  // 입력한 동네명 저장
            setTopUser(getTopUserForNeighborhood(inputNeighborhood)); // 해당 동네의 1위 유저 설정
            setErrorMessage('');  // 성공적으로 저장되면 에러 메시지 초기화
        } else {
            setErrorMessage('동네명을 입력해주세요.');
        }
        setIsModalOpen(false);
    };

    useEffect(() => {
        console.log('필터링 전 현재 동네:', selectedNeighborhood);
        console.log('검색어:', searchQuery);
        console.log('정렬 옵션:', sortOption);

        let filtered = walkRecords;

        // 동네 필터링
        filtered = filtered.filter(record => record.location === selectedNeighborhood);
        console.log(`동네 필터링 후 산책 기록 (${selectedNeighborhood}):`, filtered);

        // 검색어 필터링
        if (searchQuery) {
            filtered = filtered.filter(record => record.title.includes(searchQuery));
            console.log(`검색어 필터링 후 산책 기록 (${searchQuery}):`, filtered);
        }

        // 정렬 필터링
        switch (sortOption) {
            case 'like':
                filtered = filtered.sort((a, b) => b.likes - a.likes);
                console.log('좋아요순 정렬 후:', filtered);
                break;
            case 'recent':
                filtered = filtered.sort((a, b) => b.likes - a.likes);
                console.log('최신순 정렬 후:', filtered);
                break;
            case 'my_likes':
                filtered = filtered.filter(record => record.likes > 10);
                console.log('내가 찜한 산책로 필터링 후:', filtered);
                break;
            case 'my_walks':
                filtered = filtered.filter(record => record.distance > 3);
                console.log('내가 한 산책 필터링 후:', filtered);
                break;
            default:
                break;
        }

        console.log('최종 필터링된 기록:', filtered);
        setFilteredRecords(filtered);
    }, [selectedNeighborhood, sortOption, searchQuery]);

    return (
        <Container>
        <AppWrapper>
            <Header />

            <MainSection>
            <RankingSection>
                <img src="/win.png" alt="Winner" />
                <p>{topUser}</p>
            </RankingSection>

            <DropdownSection>
                <LeftDropdown>
                    <button onClick={handleOpenModal}>{selectedNeighborhood}</button>
                    {isModalOpen && (
                        <NeighborhoodModal 
                        onClose={handleCloseModal} 
                        onSave={handleSaveNeighborhood} 
                        setInputNeighborhood={setInputNeighborhood}
                        errorMessage={errorMessage}
                        />
                    )}
                </LeftDropdown>

                <RightDropdown>
                    <select onChange={(e) => setSortOption(e.target.value)}>
                        <option value="like">좋아요순</option>
                        <option value="recent">최신순</option>
                        <option value="my_likes">찜한 산책로</option>
                        <option value="my_walks">내가 한 산책</option>
                    </select>
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
                        <MapImage src={record.mapImage} alt={record.title} />
                        <RecordDetails>
                            <Title>{record.title}</Title>
                            <Detail>
                                <img src="/location.png" alt="Location Icon" />
                                <Location>{record.location}</Location>
                            </Detail>
                            <Detail>
                                <img src="/logo.png" alt="Distance Icon" />
                                <Distance>{record.distance} km</Distance>
                            </Detail>
                            <Detail>
                                <img src="/user.png" alt="User Icon" />
                                <User>{record.user}</User>
                            </Detail>
                        </RecordDetails>
                        <RightSection>
                            <Likes>
                                <img src="/heart.png" alt="Likes" /> {record.likes}
                            </Likes>
                            <StartButton>
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

// 동네 검색 모달 컴포넌트
const NeighborhoodModal = ({ onClose, onSave, setInputNeighborhood, errorMessage }) => {
    const [inputValue, setInputValue] = useState('');

    return (
        <ModalOverlay>
            <ModalContent>
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setInputNeighborhood(e.target.value);
                    }} 
                    placeholder="동네명을 입력하세요" 
                />
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
                <button onClick={onSave}>저장하기</button>
                <button onClick={onClose}>닫기</button>
            </ModalContent>
        </ModalOverlay>
    );
};

const ErrorMessage = styled.p`
    color: red;
    font-size: 12px;
    margin-top: 5px;
`;

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
    button {
        font-size: 14px;
        padding: 5px 10px;
        font-family:'DNFBitBitv2';
        background-color: white;
        border: 2px solid #51B47D;
        border-radius: 15px;
    }
`;

const RightDropdown = styled.div`
    select {
        font-size: 14px;
        padding: 5px 10px;
        font-family:'DNFBitBitv2';
        background-color: white;
        border: 2px solid #51B47D;
        border-radius: 15px;
    }
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

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    width: 300px;

    input {
        width: 90%;
        padding: 10px;
        margin-bottom: 10px;
        font-size: 14px;
        border: 1px solid #ddd;
        font-family:'DNFBitBitv2';
    }

    button {
        width: 100%;
        padding: 10px;
        font-size: 14px;
        background-color: #51B47D;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
    }
`;

export default Dongne;