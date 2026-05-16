import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import KitchenHomePage from "./pages/KitchenHomePage";
import RiwayatPage from "./pages/RiwayatPage";
import SubmitFormPage from "./pages/SubmitFormPage";
import ResultPage from "./pages/ResultPage";





function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/home" element={<KitchenHomePage />} />
      <Route path="/riwayat" element={<RiwayatPage />} />
      <Route path="/submit" element={<SubmitFormPage />} />
      <Route path="/result/:id" element={<ResultPage />} />
    </Routes>
  );
}

export default App;
