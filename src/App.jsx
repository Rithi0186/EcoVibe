import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CarbonFootprint from './pages/CarbonFootprint';
import GreenSwap from './pages/GreenSwap';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/footprint" element={<CarbonFootprint />} />
          <Route path="/greenswap" element={<GreenSwap />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
