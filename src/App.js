import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Game from "./pages/Game";
import Home from "./pages/Home";
import { GameProvider } from "./context/GameContext";
import "./App.css";

function App() {
  return (
    <Router>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </GameProvider>
    </Router>
  );
}

export default App;
