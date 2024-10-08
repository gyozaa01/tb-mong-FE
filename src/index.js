import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // 기존 스타일을 그대로 유지
import App from './App'; // App 컴포넌트를 불러옴 (라우터 포함)
import reportWebVitals from './reportWebVitals';
import { createGlobalStyle } from 'styled-components';
import font from './DNFBitBitv2.ttf';

// GlobalStyle 정의
const GlobalStyle = createGlobalStyle`
   @font-face {
    font-family: 'DNFBitBitv2';
    src: url(${font}) format('truetype');
    font-weight: normal;
    font-style: normal;
   }

   body {
     font-family: 'DNFBitBitv2', sans-serif;
   }
`;

// root에 GlobalStyle 적용
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <>
      <GlobalStyle />
      <App /> {/* 이제 라우터가 포함된 App을 렌더링 */}
    </>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
