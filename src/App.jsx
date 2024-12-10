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
import PrivateRoute from './Components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dongne-setting" element={<PrivateRoute element={<DongneSetting />} />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/setting" element={<PrivateRoute element={<Setting />} />} />
        <Route path="/nickname" element={<PrivateRoute element={<Nickname />} />} />
        <Route path="/walk" element={<PrivateRoute element={<Walk />} />} />
        <Route path="/walk/:trailId" element={<PrivateRoute element={<FollowTrail />} />} />
        <Route path="/record" element={<PrivateRoute element={<Record />} />} />
        <Route path="/dogam" element={<PrivateRoute element={<Dogam />} />} />
        <Route path="/dongne/:locationId" element={<PrivateRoute element={<Dongne />} />} />
      </Routes>
    </Router>
  );
};

export default App;