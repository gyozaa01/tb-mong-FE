import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Start from './Pages/Start';
import Auth from './Pages/Auth';
import DongneSetting from './Pages/DongneSetting';
import Home from './Pages/Home';
import Setting from './Pages/setting';
import Nickname from './Pages/Nickname';
import Walk from './Pages/Walk';
import Record from './Pages/Record';
import Dogam from './Pages/Dogam';

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
            <Route path="/walk" element={<Walk />} />
            <Route path="/record" element={<Record />} />
            <Route path="/dogam" element={<Dogam />} />
        </Routes>
    </Router>
  );
};

export default App;
