import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import Home_contain from "./components/HomePage";
import Canvas from "./components/Canvas";
import HashPage from "./components/Create_hash";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home_contain />} />
        <Route path="/HashPage" element={<HashPage />} />
        <Route path="/Canvas" element={<Canvas />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
      </Routes>
    </Router>
  );
}
export default App;
