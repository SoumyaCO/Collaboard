import React, { useReducer, createContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
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
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Profile" element={<Profile />} />

      {/* <Route path="*" element={<ErrorPage />} /> */}
    </Routes>
  );
};

const AppContent = () => {
  const location = useLocation(); // Get the current location

  // check if the current path is not "/Canvas"
  const notshowNavbar = location.pathname !== "/Canvas";

  return (
    <>
      {notshowNavbar && <Navbar />} {/* Conditiona for  render Navbar */}
      <Routing />
    </>
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
        <AppContent />
      </UserContext.Provider>
    </Router>
  );
}
export default App;
