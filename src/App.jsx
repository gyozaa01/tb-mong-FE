import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Start from './Pages/Start';
import Auth from './Pages/Auth';
import DongneSetting from './Pages/DongneSetting';
import Home from './Pages/Home';
import Setting from './Pages/setting';
import Nickname from './Pages/Nickname';
import Walk from './Pages/Walk';
import FollowTrail from './Pages/FollowTrail';
import Record from './Pages/Record';
import Dogam from './Pages/Dogam';
import Dongne from './Pages/Dongne';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dongne-setting" element={<DongneSetting />} />
        <Route path="/home" element={<Home />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/nickname" element={<Nickname />} />
        <Route path="/walk" element={<Walk />} /> {/* 새로운 산책 시작 */}
        <Route path="/walk/:trailId" element={<FollowTrail />} /> {/* 저장된 산책 경로 따라가기 */}
        <Route path="/record" element={<Record />} />
        <Route path="/dogam" element={<Dogam />} />
        <Route path="/dongne/:locationId" element={<Dongne />} /> {/* 동네 페이지 */}
      </Routes>
    </Router>
  );
};

export default App;
