// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AllMotifsPage from "./components/AllMotifsPage/AllMotifsPage";
import ExpandedMotifView from "./components/ExpandedMotifPage/ExpandedMotifView";
import ExpandedStructureView from "./components/ExpandedStructureView";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AllMotifsPage />} />
        <Route path="/motif/:id" element={<ExpandedMotifView />} />
        <Route path="/structure/:id" element={<ExpandedStructureView />} />
      </Routes>
    </Router>
  );
};

export default App;
