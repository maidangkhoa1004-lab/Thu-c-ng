import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import HomePage from "./HomePage";
import AddPet from "./AddPet";
import PetProfile from "./PetProfile";
import VaccinationPage from "./VaccinationPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/pets" element={<AddPet />} />
        <Route path="/pet-profile" element={<PetProfile />} />
        <Route path="/vaccines" element={<VaccinationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;