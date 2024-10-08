import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from '../Components/Header';
import BottomNav from '../Components/BottomNav';

// 더미 데이터
const walkRecords = [
  {
    date: '2024-09-04',
    title: '좋아요런',
    location: '우산동',
    distance: 4.0,
    likes: 17,
    mapImage: '/good_run.png',
  },
  {
    date: '2024-09-04',
    title: '좋아요런',
    location: '우산동',
    distance: 4.0,
    likes: 17,
    mapImage: '/good_run.png',
  },
  {
    date: '2024-09-04',
    title: '좋아요런',
    location: '우산동',
    distance: 4.0,
    likes: 17,
    mapImage: '/good_run.png',
  },
  {
    date: '2024-09-04',
    title: '좋아요런',
    location: '우산동',
    distance: 4.0,
    likes: 17,
    mapImage: '/good_run.png',
  },
  {
    date: '2024-09-05',
    title: '댕댕이런',
    location: '풍남동',
    distance: 3.2,
    likes: 23,
    mapImage: '/dog_run.png',
  },
];

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'DNFBitBitv2';
  }
`;

const WRAPPER_WIDTH = '375px';

const Record = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [flippedDays, setFlippedDays] = useState({});

  // 날짜를 UTC 기준으로 처리하는 함수
  const getFormattedDate = (date) => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      .toISOString()
      .split('T')[0];
  };

  useEffect(() => {
    const formattedDate = getFormattedDate(selectedDate);
    const filtered = walkRecords.filter(record => record.date === formattedDate);
    setFilteredRecords(filtered);
  }, [selectedDate]);

  const handleDateClick = (date) => {
    // 날짜 선택 시도 시 UTC 기준으로 설정
    setSelectedDate(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
  };

  const handleMouseEnter = (day) => {
    setFlippedDays(prev => ({ ...prev, [day]: true }));
  };

  const handleMouseLeave = (day) => {
    setFlippedDays(prev => ({ ...prev, [day]: false }));
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    const calendarDays = [];

    // 요일을 일요일부터 토요일로 설정
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    calendarDays.push(...daysOfWeek.map((day, index) => (
      <Day key={`day-${index}`} $isSunday={index === 0} $isSaturday={index === 6}>
        {day}
      </Day>
    )));

    // 공백 채우기 (이전 달의 빈 칸)
    for (let i = 0; i < firstDayIndex; i++) {
      calendarDays.push(<EmptyDay key={`empty-${i}`} />);
    }

    // 실제 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const formattedDate = getFormattedDate(currentDate);
      const isRecorded = walkRecords.some(record => record.date === formattedDate);
      const isFlipped = flippedDays[day]; // flip 상태 확인

      calendarDays.push(
        <Day
          key={day}
          $isSunday={(firstDayIndex + day - 1) % 7 === 0}
          $isSaturday={(firstDayIndex + day - 1) % 7 === 6}
          onMouseEnter={() => handleMouseEnter(day)}
          onMouseLeave={() => handleMouseLeave(day)}
          onClick={() => handleDateClick(currentDate)}
        >
          {isRecorded ? (
            <FlipCard $isFlipped={isFlipped}>
              <Front>
                <LogoImage src="/logo.png" alt="Logo" />
              </Front>
              <Back>{day}</Back>
            </FlipCard>
          ) : (
            <DateText>{day}</DateText>
          )}
        </Day>
      );
    }

    return calendarDays;
  };

  const renderRecordDetails = () => {
    if (filteredRecords.length > 0) {
      return filteredRecords.map((record, index) => (
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
          </RecordDetails>
          <Likes>
            <img src="/heart.png" alt="Likes" /> {record.likes}
          </Likes>
        </RecordItem>
      ));
    } else {
      return <NoRecordMessage>해당 날짜에는 기록이 없습니다.</NoRecordMessage>;
    }
  };

  return (
    <Container>
      <GlobalStyle />
      <AppWrapper>
        <Header />
        <ScrollWrapper>
          <CalendarWrapper>
            <MonthNavigation>
              <Arrow onClick={() => handleDateClick(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>&lt;</Arrow>
              <MonthTitle>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월</MonthTitle>
              <Arrow onClick={() => handleDateClick(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>&gt;</Arrow>
            </MonthNavigation>

            <CalendarGrid>{renderCalendar()}</CalendarGrid>
          </CalendarWrapper>

          {/* 클릭된 날짜의 데이터 출력 */}
          <RecordDetailsWrapper>
            <RecordDateTitle>
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            </RecordDateTitle>
            {renderRecordDetails()}
          </RecordDetailsWrapper>
        </ScrollWrapper>

        <StyledBottomNav />
      </AppWrapper>
    </Container>
  );
};

// Styled Components
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

const ScrollWrapper = styled.div`
  flex-grow: 1;
  width: 100%;
  overflow-y: auto;
  padding-bottom: 100px;
`;

const CalendarWrapper = styled.div`
  width: 100%;
  margin-bottom: 10px;
`;

const MonthNavigation = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 10px;
`;

const MonthTitle = styled.h3`
  margin: 0;
`;

const Arrow = styled.div`
  cursor: pointer;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
`;

const Day = styled.div`
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: ${(props) => (props.isSelected ? '#51B47D' : 'transparent')};
  color: ${(props) => (props.isSelected ? 'white' : 'black')};
  border-radius: 50%;
  color: ${props => (props.$isSunday ? '#FF3B30' : props.$isSaturday ? '#007AFF' : 'black')};
`;

const EmptyDay = styled.div`
  height: 50px;
`;

const FlipCard = styled.div`
  width: 100%;
  height: 100%;
  perspective: 1000px;
  position: relative;
`;

const Front = styled.div`
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  transform: ${(props) => (props.$isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)')};
  transition: transform 0.6s;
`;

const Back = styled.div`
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateY(180deg);
  background-color: #fff;
`;

const LogoImage = styled.img`
  width: 20px;
  height: 20px;
`;

const DateText = styled.div`
  font-size: 14px;
  color: inherit;
  text-align: center;
`;

const RecordDetailsWrapper = styled.div`
  margin-top: 10px;
  width: 90%;
  background-color: transparent;
  padding: 20px;
  border-radius: 10px;
`;

const RecordDateTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 10px;
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

const Likes = styled.p`
  font-size: 16px;
  display: flex;
  align-items: center;

  img {
    width: 50px;
    height: 50px;
    margin-right: 5px;
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

export default Record;
