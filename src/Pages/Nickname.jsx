import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const WRAPPER_WIDTH = '375px';

const Nickname = () => {
    const [nickname, setNickname] = useState('');
    const [isDuplicate, setIsDuplicate] = useState(null); 
    const navigate = useNavigate();

    const handleCheckDuplicate = () => {
        if (nickname === '중복닉네임') {
            setIsDuplicate(true);
        } else {
            setIsDuplicate(false);
        }
    };

    const handleSave = () => {
        if (!isDuplicate) {
            alert("닉네임이 저장되었습니다.");
            navigate('/home');
        } else {
            alert("중복된 닉네임입니다. 다른 닉네임을 입력해주세요.");
        }
    };

    return (
        <Container>
            <AppWrapper>
                <Header>
                    <BackButton onClick={() => navigate(-1)}>&lt;</BackButton>
                    <Title>닉네임 설정</Title>
                </Header>

                <NicknameBox>
                    <Label>닉네임</Label>
                    <InputWrapper>
                        <NicknameInput
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임을 입력하세요"
                        />
                        <CheckButton onClick={handleCheckDuplicate}>중복확인</CheckButton>
                    </InputWrapper>
                    {isDuplicate === true && <ErrorMessage>이미 사용 중인 닉네임입니다.</ErrorMessage>}
                    {isDuplicate === false && <SuccessMessage>사용 가능한 닉네임입니다.</SuccessMessage>}

                    <SaveButton onClick={handleSave}>
                        <img src="/save.png" alt="저장" />
                    </SaveButton>
                </NicknameBox>
            </AppWrapper>
        </Container>
    );
};

// 스타일 컴포넌트들
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

const NicknameBox = styled.div`
    background-color: #51B47D;
    width: 100%;
    border-radius: 10px 10px 0 0;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    text-align: center;
    position: absolute;
    bottom: 0;
    padding-bottom: 60px;
`;

const Label = styled.label`
    font-size: 18px;
    color: black;
    margin-top: 10px;
    margin-bottom: 10px;
    display: block;
`;

const InputWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    width: 80%;
    margin: 0 auto;
    align-items: center;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const NicknameInput = styled.input`
    width: 100%;
    padding: 10px;
    border: none;
    font-size: 16px;
    border-radius: 10px;
    font-family: DNFBitBitv2;
    color: black;
`;

const CheckButton = styled.button`
    padding: 8px 20px;
    background-color: white;
    color: black;
    border: 2px solid green;
    border-radius: 50px;
    cursor: pointer;
    font-size: 14px;
    font-family: DNFBitBitv2;
    white-space: nowrap;
`;

const ErrorMessage = styled.p`
    color: white;
    font-size: 14px;
`;

const SuccessMessage = styled.p`
    color: white;
    font-size: 14px;
`;

const SaveButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    position: absolute;
    right: 10px;
    img {
        width: 120px;
    }
`;

export default Nickname;
