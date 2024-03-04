import WhiteBoard from "./components/WhiteBoard";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./views/homepage/homePage";
import { useEffect } from "react";
import { Auth } from "./Auth/keycloack";

export function App() {
  useEffect(() => {
    Auth();
  }, []);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/newBoard" element={<WhiteBoard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
