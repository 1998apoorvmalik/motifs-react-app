// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AllMotifsPage from "./components/AllMotifsPage/AllMotifsPage";
import ExpandedItemView from "./components/ExpandedItemView/ExpandedItemView";
import ExpandedStructureView from "./components/ExpandedStructureView";
import NewMotifsPage from "./components/NewMotifsPage/NewMotifsPage";
import HelpPage from "./components/HelpPage/HelpPage";

const App: React.FC = () => {
    return (
        <Router basename={process.env.REACT_APP_BASENAME}>
            <Routes>
                <Route path="/" element={<AllMotifsPage />} />
                <Route path="/new" element={<NewMotifsPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/item/:id" element={<ExpandedItemView />} />
                <Route
                    path="/structure/:id"
                    element={<ExpandedStructureView />}
                />
            </Routes>
        </Router>
    );
};

export default App;
