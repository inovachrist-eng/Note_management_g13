import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home"
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import MagicLinkVerify from "./pages/MagicLinkVerify";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/magic-link" element={<MagicLinkVerify />} />


                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}