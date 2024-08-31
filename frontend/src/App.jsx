import React, { useReducer, createContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./components/HomePage";
import Canvas from "./components/Canvas";
import HashPage from "./components/Create_hash";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";

import { initialState, reducer } from "../src/Reducer/useReducer";

// contextApi
export const UserContext = createContext();

const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Canvas" element={<Canvas />} />
      <Route path="/HashPage" element={<HashPage />} />
      {/* <Route path="/about" element={<About />} /> */}
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Profile" element={<Profile />} />

      {/* <Route path="/Logout" element={<Logout />} />
      <Route path="*" element={<ErrorPage />} />  */}

    </Routes>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Router>
      <UserContext.Provider value={{ state, dispatch }}>
        <Navbar />
        <Routing />
      </UserContext.Provider>
    </Router>
  );
}
export default App;
