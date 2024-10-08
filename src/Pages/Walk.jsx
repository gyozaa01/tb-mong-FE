import React from 'react';
import styled from 'styled-components';
import Header from '../Components/Header';
import BottomNav from '../Components/BottomNav';

const WRAPPER_WIDTH = '375px';

const Walk = () => {
    return (
        <Container>
            <AppWrapper>
                <Header />

                <MainContent>
                    <img src="/start.png" alt="산책 시작" />
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
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    img {
        width: 250px;
        height: auto;
    }
`;

export default Walk;
