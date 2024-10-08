import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '../Components/Header';
import BottomNav from '../Components/BottomNav';

const WRAPPER_WIDTH = '375px';

const Dogam = () => {
    const items = Array.from({ length: 72 }, (_, index) => `Item ${index + 1}`);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const maxPageDisplay = 5;

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const currentItems = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const startPage = Math.floor((currentPage - 1) / maxPageDisplay) * maxPageDisplay + 1;
    const endPage = Math.min(startPage + maxPageDisplay - 1, totalPages);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleNextGroup = () => {
        if (currentPage + maxPageDisplay <= totalPages) {
            setCurrentPage(currentPage + maxPageDisplay);
        } else {
            setCurrentPage(totalPages);
        }
    };

    const handlePrevGroup = () => {
        if (currentPage - maxPageDisplay > 0) {
            setCurrentPage(currentPage - maxPageDisplay);
        } else {
            setCurrentPage(1);
        }
    };

    return (
        <Container>
            <AppWrapper>
                <Header />
                <MainContent>
                    <Title>도감</Title>
                    <Grid>
                        {currentItems.map((item, index) => (
                            <Item key={index}>{item}</Item>
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
    background-color: #fff;
    color: #000;
    border-radius: 10px;
    font-size: 16px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
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
    font-family:'DNFBitBitv2';
`;

export default Dogam;
