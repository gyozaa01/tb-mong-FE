# 뚜벅몽

<img width="100%" alt="image" src="https://github.com/user-attachments/assets/e8d4847d-c753-437e-a548-b8ee99902e6a" />

![image](https://github.com/user-attachments/assets/4ebeacb2-ff9d-429a-a010-ef101423dac9)


## 프로젝트 개요
👑 2024년 2학기 산학프로젝트2 - 교내 IT Festival **은상 수상** 👑  
2024.09.02 ~ 2024.12.16


## 프로젝트 기획 배경

최근 **MZ세대**는 장비나 시설 없이 쉽게 할 수 있는 걷기를 가장 선호하며, 이를 게임처럼 즐기고 건강한 라이프스타일을 추구하는 **헬시플레저 트렌드**가 확산되고 있습니다.  

하지만 사용자들은 다음과 같은 불편함을 느끼고 있습니다:
- "같은 길을 반복하며 지루함을 느낀다."
- "산책 기록을 예쁘게 남기고 싶다."
- "지속적인 동기 부여가 어렵다."

이를 바탕으로 저희는 **산책을 기록하고 공유하며, 재미있고 지속 가능한 운동 경험**을 제공하는 서비스를 기획했습니다.


## 서비스 소개

![image](https://github.com/user-attachments/assets/26dcf112-069e-4301-a189-1fa2d116a7f7)  
뚜벅뚜벅 걷는 작은 여정이 모여 하나의 커다란 이야기를 완성한다는 의미의 **뚜벅몽**은  
산책을 하고 싶지만 운동이 지루한 사용자를 위해 **아트러닝**과 **캐릭터 수집** 같은  
게이미피케이션 요소를 통해 사용자들이 꾸준히 운동을 할 수 있도록 돕는 서비스입니다.


## 서비스 화면
### ➀ 회원가입  
<table>
  <tr>
    <td align="center">
      <img width="450" alt="초기화면" src="https://github.com/user-attachments/assets/2d6aaa6f-4a9e-4aa7-aaaf-17729a54caca">
      <br><b>초기화면</b>
    </td>
    <td align="center">
      <img width="450" alt="내동네설정" src="https://github.com/user-attachments/assets/162158ba-3fd9-4ed5-902c-bcf431870d72">
      <br><b>내 동네 설정</b>
    </td>
  </tr>
</table>

### 카카오 API를 활용한 간편 로그인
1. **로그인 성공 → 신규 사용자**  
   - 동네 설정 페이지 → 홈 화면  

2. **로그인 성공 → 기존 사용자**  
   - 바로 홈 화면으로 이동  


---


### ➁ 홈
<table>
  <tr>
    <td align="center">
      <img width="450" alt="홈" src="https://github.com/user-attachments/assets/9325f91d-ef86-416a-a662-1437569fc5fa">
      <br><b>홈</b>
    </td>
    <td align="center">
      <img width="450" alt="도감" src="https://github.com/user-attachments/assets/3bd07390-45ad-43c2-941c-837a1e3009f4">
      <br><b>도감</b>
    </td>
  </tr>
</table>


### 1. 한 눈에 보이는 산책 정보  
- 사용자의 **총 산책 횟수와 거리**와 **오늘 산책 횟수와 거리**를 요약하여 표시합니다.  
- 간단한 데이터 시각화를 통해 사용자의 성취를 한눈에 확인할 수 있습니다.

### 2. 함께 성장하는 캐릭터  
- 사용자가 선택한 **대표 캐릭터**가 홈 화면에 표시되어 개인의 성취를 시각적으로 보여줍니다.  
- **산책을 3번 완료할 때마다 새로운 캐릭터**를 획득할 수 있으며, 경험치와 레벨 시스템으로 동기 부여를 제공합니다.

### 3. 도감과의 연결  
- 사용자가 수집한 캐릭터는 **도감**에서 확인 가능하며, 원하는 캐릭터를 대표 캐릭터로 설정할 수 있습니다.  
- **도감**은 사용자의 성취와 수집 활동을 시각적으로 기록하여 꾸준한 동기 부여를 지원합니다.


---


### ➂ 설정
<table>
  <tr>
    <td align="center">
      <img width="300" alt="설정" src="https://github.com/user-attachments/assets/764f1a95-c166-4113-9f42-71d8da1588c5">
      <br><b>설정</b>
    </td>
    <td align="center">
      <img width="300" alt="동네 설정" src="https://github.com/user-attachments/assets/162158ba-3fd9-4ed5-902c-bcf431870d72">
      <br><b>동네 설정</b>
    </td>
    <td align="center">
      <img width="300" alt="닉네임 설정" src="https://github.com/user-attachments/assets/13cadef3-3c75-4749-9d8b-e86793f84d20">
      <br><b>닉네임 설정</b>
    </td>
  </tr>
</table>

### 1. 동네 재설정  
- 사용자가 회원가입 시 설정한 동네를 **새로운 동네로 업데이트**할 수 있습니다.  
- 새로운 지역으로 이동하거나 생활권이 바뀌었을 때 간편하게 동네 정보를 변경할 수 있습니다.

### 2. 닉네임 설정  
- 커뮤니티 활동을 위해 사용할 **닉네임**을 설정합니다.  
- 닉네임은 자유롭게 변경 가능하며, 다른 사용자와의 소통에 활용됩니다.

### 3. 로그아웃  
- 현재 계정을 **로그아웃**하고 초기 화면으로 돌아갑니다.  
- 안전한 로그아웃을 통해 사용자 정보 보호를 지원합니다.


---


### ➃ 산책
<table>
  <tr>
    <td align="center">
      <img width="450" alt="산책" src="https://github.com/user-attachments/assets/e173620d-e3fb-4fac-a808-117a515315be">
      <br><b>산책</b>
    </td>
    <td align="center">
      <img width="450" alt="산책 저장" src="https://github.com/user-attachments/assets/a206fcb2-1a77-4e72-b0ae-7c411aded94f">
      <br><b>산책 저장</b>
    </td>
  </tr>
</table>

### 1. 실시간 경로 기록  
- GPS를 기반으로 사용자의 **현재 위치와 이동 경로**를 실시간으로 지도에 시각화합니다.  
- 지정한 **대표 캐릭터**가 화면에 함께 표시되어 산책에 동반하는 즐거움을 제공합니다.

### 2. 산책 완료 및 경로 저장  
- 산책 종료 시 **경로를 자동으로 저장**하며, 기록 페이지에서 언제든지 확인할 수 있습니다.  
- **킬로미터, 시간, 시속, 평균 페이스**가 자동으로 계산되어 사용자에게 제공됩니다.  
- 경로 저장 시 **산책로명만 작성**하면 되어 간편하게 저장할 수 있습니다.


---


### ➄ 기록
<table>
  <tr>
    <td align="center">
      <img width="450" alt="기록" src="https://github.com/user-attachments/assets/0b6b51c6-9b43-4bf0-9e5e-7bf424794319">
      <br><b>기록</b>
    </td>
  </tr>
</table>

### 1. 달력 기반 기록 관리  
- 사용자가 완료한 산책 기록을 **달력을 통해 직관적으로 확인**할 수 있습니다.  
- 산책 완료된 날짜에 **신발 아이콘**이 표시되며, 한눈에 산책 여부를 파악할 수 있습니다.  
- 특정 날짜를 클릭하면 **해당 산책 경로와 세부 기록**이 표시되어 상세 내용을 확인할 수 있습니다.  

### 2. 지정 동네와 상관없는 기록 관리  
- 설정된 동네와 **상관없이 사용자가 한 모든 산책 기록**을 확인할 수 있습니다.  
- 개인의 이동 패턴과 산책 데이터를 효과적으로 관리할 수 있도록 지원합니다.


---


### ➅ 동네
<table>
  <tr>
    <td align="center">
      <img width="300" alt="동네" src="https://github.com/user-attachments/assets/859000d1-f272-44e4-a212-0ce5e21fbae5">
      <br><b>동네</b>
    </td>
    <td align="center">
      <img width="300" alt="1위유저" src="https://github.com/user-attachments/assets/5fe40ceb-8d81-4469-88f2-a366b0c3f1e9">
      <br><b>1위 유저</b>
    </td>
    <td align="center">
      <img width="300" alt="정렬" src="https://github.com/user-attachments/assets/373e28ea-9370-4182-b9dd-efcceaecd609">
      <br><b>정렬</b>
    </td>
  </tr>
</table>

### 1. 동네 기반 경로 공유  
- 사용자가 자신의 **동네에서 걸었던 경로를 다른 사용자와 공유**할 수 있습니다.  
- 공유된 경로를 통해 새로운 산책 코스를 발견할 수 있습니다.

### 2. 랭킹 시스템  
- **거리왕**: 사용자가 산책한 총 거리를 기준으로 순위를 제공합니다.  
- **횟수왕**: 사용자가 산책을 완료한 총 횟수를 기준으로 순위를 제공합니다.  

### 3. 좋아요 및 정렬 검색 기능  
- 동네 페이지에서 사용자가 좋아요를 누른 경로를 확인할 수 있습니다.  
- 경로를 **좋아요 순, 최신 순 등으로 정렬 및 검색**할 수 있습니다.  
- **돋보기 모양 버튼**을 누르면 다른 사용자가 걸은 경로를 자세히 확인할 수 있으며, 루트를 지도로 시각화합니다.


---


### ➆ NFC 태그 키링
<table>
  <tr>
    <td align="center">
      <img width="300" height="300" alt="키링" src="https://github.com/user-attachments/assets/a74e9731-d3a2-4795-b515-026efe57cb0c">
      <br><b>키링</b>
    </td>
    <td align="center">
  </tr>
</table>

### 웹앱의 문제점 해결
- 웹앱의 접근성을 강화하기 위해 **리사이클링 병뚜껑**을 활용하여 **NFC 태그 키링**을 제작하였습니다.  
- 사용자는 키링을 스마트폰에 태그하는 간단한 동작만으로 **웹앱 사이트에 즉시 연결**됩니다.


## 시연 영상
[📽️ 시연 영상 보기 (Google Drive)](https://drive.google.com/file/d/1uPN8kw5IpwuaQ2O6L76bjN59bePKeurZ/view?usp=sharing)  
**배포 사이트**: [https://tb-mong.xyz](https://tb-mong.xyz)


## 기술 스택

### **Frontend**
![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Styled-Components](https://img.shields.io/badge/Styled--Components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white)

### **Backend**
![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white)
![Spring](https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Spring Boot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![OAuth2.0](https://img.shields.io/badge/OAuth2.0-3E57E3?style=for-the-badge&logo=oauth&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### **Deployment**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

### Open API
![Kakao](https://img.shields.io/badge/Kakao%20API-FFCD00?style=for-the-badge&logo=kakao&logoColor=black)


## 팀원
<table>
  <tr>
    <td align="center">
      <img width="300" height="300" alt="서교진" src="https://github.com/user-attachments/assets/2260e021-f3f9-4d8a-858a-512f839b365a">
      <br><b>서교진</b><br>
      프론트엔드 개발, UI/UX 디자인
    </td>
    <td align="center">
      <img width="300" height="300"alt="한지우" src="https://github.com/user-attachments/assets/2d06a29c-a036-4b65-bc8b-31c6247d6eae">
      <br><b>한지우</b><br>
      백엔드 개발, 일러스트 제작
    </td>
  </tr>
</table>
