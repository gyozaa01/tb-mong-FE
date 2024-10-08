import React from 'react';
import styled from 'styled-components';
import BottomNav from '../Components/BottomNav';
import Header from '../Components/Header';

const WRAPPER_WIDTH = '375px';

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
    min-height: 100vh;
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
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    position: relative;

    .mong {
        width: 150px;
        height: auto;
        z-index: 2;
    }

    .carpet {
        width: 250px;
        height: auto;
        margin-top: -60px;
        z-index: 1;
    }
`;

const Home = () => {
    return (
        <Container>
            <AppWrapper>
                <Header />

                <MainContent>
                    <img src="/mong1.png" alt="메인 캐릭터" className="mong" />
                    <img src="/bottom.png" alt="카펫" className="carpet" />
                </MainContent>

                <BottomNav />
            </AppWrapper>
        </Container>
    );
};

export default Home;