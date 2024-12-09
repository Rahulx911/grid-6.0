import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CaptureImage from './components/CaptureImage';
import PackedItem from './components/PackedItem';
import FreshProduce from './components/FreshProduce';
import EnterBoxCode from './components/EnterBoxCode';
import Report from './components/Report';
import BoxReport from './components/BoxReport';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/capture" element={<CaptureImage />} />
          <Route path="/enter-box-code" element={<EnterBoxCode />} />
          <Route path="/packed-item" element={<PackedItem />} />
          <Route path="/fresh-produce" element={<FreshProduce />} />
          <Route path='/report' element={<Report />}/>
          <Route path="/report/:boxCode" element={<BoxReport />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
