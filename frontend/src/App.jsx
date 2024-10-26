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
import Params_query from "./components/Params_query";

import { initialState, reducer } from "../src/Reducer/useReducer";

// contextApi
export const UserContext = createContext();

const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Canvas" element={<Canvas />} />
      <Route path="/HashPage" element={<HashPage />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/params_query/:Jwtbyuser" element={<Params_query />} />

      {/* <Route path="*" element={<ErrorPage />} /> */}
    </Routes>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState); // used dispatch to send actions to the reducer.
  return (
    <Router>
      <UserContext.Provider value={{ state, dispatch }}>
        {/*Provider component makes the state and 
        dispatch available to any nested components that need them. 
        for managing global state  */}
        <Navbar />
        <Routing />
      </UserContext.Provider>
    </Router>
  );
}
export default App;
