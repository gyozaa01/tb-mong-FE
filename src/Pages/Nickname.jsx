import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from './Api';

const WRAPPER_WIDTH = '375px';

const Nickname = () => {
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();

    const handleSave = async () => {
        try {
            const response = await api.post('/api/settings/set-nickname', null, {
                params: { newNickname: nickname },
            });

            if (response.status === 200) {
                alert("닉네임이 저장되었습니다.");
                navigate('/home');
            } else {
                console.error("닉네임 설정 실패:", response);
            }
        } catch (error) {
            console.error("닉네임 설정 중 오류 발생:", error);
            alert("닉네임 설정 중 오류가 발생했습니다.");
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
                        {/* <CheckButton>중복확인</CheckButton> */}
                    </InputWrapper>

                    <SaveButton onClick={handleSave}>
                        <img src="/save.png" alt="저장" />
                    </SaveButton>
                </NicknameBox>
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
// const CheckButton = styled.button`
//     padding: 8px 20px;
//     background-color: white;
//     color: black;
//     border: 2px solid green;
//     border-radius: 50px;
//     cursor: pointer;
//     font-size: 14px;
//     font-family: DNFBitBitv2;
//     white-space: nowrap;
// `;

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
