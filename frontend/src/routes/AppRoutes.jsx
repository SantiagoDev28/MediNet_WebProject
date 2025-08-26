import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../features/auth/components/LoginForm";


const AppRoutes = () => {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default AppRoutes;