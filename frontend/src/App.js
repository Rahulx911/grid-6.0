import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CaptureImage from './components/CaptureImage';
import Report from './components/Report';
import SelectItemType from './components/SelectItemType';
import PackedItem from './components/PackedItem';
import FruitItem from './components/FruitItem';
import EnterBoxCode from './components/EnterBoxCode';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/capture" element={<CaptureImage />} />
          <Route path="/enter-box-code" element={<EnterBoxCode />} />
          <Route path="/select-item-type" element={<SelectItemType />} />
          <Route path="/packed-item" element={<PackedItem />} />
          <Route path="/fruit-item" element={<FruitItem />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
