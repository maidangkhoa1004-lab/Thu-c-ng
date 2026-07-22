import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import HomePage from "./HomePage";
import AddPet from "./AddPet";
import PetProfile from "./PetProfile";
import VaccinationPage from "./VaccinationPage";
import HealthLogPage from "./HealthLogPage";
import BookAppointment from "./BookAppointment";
import AdminDashboard from "./AdminDashboard";
import AdminAppointments from "./AdminAppointments";
import AdminUsers from "./AdminUsers";
import AdminRecords from "./AdminRecords";
import RequireAuth from "./RequireAuth";
import RequireAdmin from "./RequireAdmin";
import "./App.css";

function App() {
  return (

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/pets" element={<RequireAuth><AddPet /></RequireAuth>} />
        <Route path="/pet-profile" element={<RequireAuth><PetProfile /></RequireAuth>} />
        <Route path="/vaccines" element={<RequireAuth><VaccinationPage /></RequireAuth>} />
        <Route path="/health-logs" element={<RequireAuth><HealthLogPage /></RequireAuth>} />
        <Route path="/book-appointment" element={<RequireAuth><BookAppointment /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/appointments" element={<RequireAdmin><AdminAppointments /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
        <Route path="/admin/records" element={<RequireAdmin><AdminRecords /></RequireAdmin>} />

      </Routes>

  );
}

export default App;
