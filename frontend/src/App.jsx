import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import MedecinDashboard from "./pages/MedecinDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Users from "./pages/Users";

function App() {

    return (

        <Routes>

            <Route path="/" element={<Login />} />

            <Route
                path="/admin"
                element={<AdminDashboard />}
            />

            <Route
                path="/medecin"
                element={<MedecinDashboard />}
            />

            <Route
                path="/patient"
                element={<PatientDashboard />}
            />
            <Route 
                path="/users" 
                element={<Users />} 
            />

        </Routes>

    );

}

export default App;