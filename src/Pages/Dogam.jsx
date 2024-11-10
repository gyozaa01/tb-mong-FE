import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from './Api';
import Header from '../Components/Header';
import BottomNav from '../Components/BottomNav';

const WRAPPER_WIDTH = '375px';

const Dogam = () => {
    const [characters, setCharacters] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [modalMessage, setModalMessage] = useState("");
    const navigate = useNavigate();

    const itemsPerPage = 9;
    const maxPageDisplay = 5;

    useEffect(() => {
        fetchCharacters();
    }, []);

    const fetchCharacters = async () => {
        try {
            const response = await api.get('/api/dict');
            setCharacters(response.data);
        } catch (error) {
            console.error("도감 데이터를 가져오는 중 오류 발생:", error);
        }
    };

    const currentItems = characters.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const startPage = Math.floor((currentPage - 1) / maxPageDisplay) * maxPageDisplay + 1;
    const endPage = Math.min(startPage + maxPageDisplay - 1, Math.ceil(characters.length / itemsPerPage));

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleNextGroup = () => {
        if (currentPage + maxPageDisplay <= Math.ceil(characters.length / itemsPerPage)) {
            setCurrentPage(currentPage + maxPageDisplay);
        } else {
            setCurrentPage(Math.ceil(characters.length / itemsPerPage));
        }
    };

    const handlePrevGroup = () => {
        if (currentPage - maxPageDisplay > 0) {
            setCurrentPage(currentPage - maxPageDisplay);
        } else {
            setCurrentPage(1);
        }
    };

    const handleCharacterClick = (character) => {
        setSelectedCharacter(character);
        setModalMessage(character.unlocked ? "대표 캐릭터로 설정하시겠습니까?" : "이 캐릭터는 잠겨 있습니다.");
        setShowModal(true);
    };

    const confirmSetRepresentative = async () => {
        if (selectedCharacter && selectedCharacter.unlocked) {
            try {
                await api.post(`/api/dict/set-repre?characterId=${selectedCharacter.id}`);
                alert("대표 캐릭터가 설정되었습니다.");
                navigate('/home');
            } catch (error) {
                console.error("대표 캐릭터 설정 중 오류 발생:", error);
                alert("캐릭터가 공개되지 않았습니다.");
                navigate('/dogam');
            }
        }
        setShowModal(false);
    };    

    const closeModal = () => {
        setShowModal(false);
        navigate('/dogam');
    };

    return (
        <Container>
            <AppWrapper>
                <Header />
                <MainContent>
                    <Title>도감</Title>
                    <Grid>
                        {currentItems.map((character) => (
                            <Item
                                key={character.id}
                                onClick={() => handleCharacterClick(character)}
                                unlocked={character.unlocked}
                            >
                                {character.unlocked ? (
                                    <CharacterImage src={character.imageUrl} alt={`Character ${character.id}`} />
                                ) : (
                                    <LockedBox />
                                )}
                            </Item>
                        ))}
                    </Grid>
                    <Pagination>
                        <PageButton onClick={handlePrevGroup}>&lt;</PageButton>
                        {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
                            <PageButton
                                key={startPage + index}
                                onClick={() => handlePageChange(startPage + index)}
                                active={currentPage === startPage + index}
                            >
                                {startPage + index}
                            </PageButton>
                        ))}
                        <PageButton onClick={handleNextGroup}>&gt;</PageButton>
                    </Pagination>
                </MainContent>
                <BottomNav />

                {showModal && (
                    <Modal>
                        <CloseButton onClick={closeModal}>&lt;</CloseButton>
                        <ModalMessage>{modalMessage}</ModalMessage>
                        {selectedCharacter?.unlocked && (
                            <ButtonImage onClick={confirmSetRepresentative}>
                                <span>OK</span>
                            </ButtonImage>
                        )}
                    </Modal>
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
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    position: relative;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    width: 100%;
    padding-bottom: 60px;
`;

const Title = styled.h1`
    font-size: 24px;
    color: black;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    width: 100%;
    padding: 0 20px;
`;

const Item = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 100px;
    background-color: ${(props) => (props.unlocked ? '#fff' : '#000')};
    color: #000;
    border-radius: 10px;
    font-size: 16px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
`;

const CharacterImage = styled.img`
    width: 80px;
    height: 80px;
    border-radius: 10px;
`;

const LockedBox = styled.div`
    width: 80px;
    height: 80px;
    background-color: #000;
    border-radius: 10px;
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

const Modal = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    z-index: 1000;
    width: 300px;
    height: 200px;
    text-align: center;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    left: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    font-family: 'DNFBitBitv2';
`;

const ModalMessage = styled.p`
    font-size: 18px;
    margin: 20px 0;
`;

const ButtonImage = styled.button`
    width: 100px;
    height: 40px;
    background-image: url('/setting_button.png');
    background-size: cover;
    background-color: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    span {
        font-size: 16px;
        color: black;
        font-family: 'DNFBitBitv2';
    }
`;

export default Dogam;
