import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import Home_contain from "./components/HomePage";
import Canvas from "./components/Canvas";
import HashPage from "./components/Create_hash";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home_contain />} />
        <Route path="/HashPage" element={<HashPage />} />
        <Route path="/Canvas" element={<Canvas />} />
      </Routes>
    </Router>
  );
}
export default App;
