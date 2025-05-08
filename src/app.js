import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Komponen
import SignLogin from './components/signLogin';
import Dashboard from './components/dashboard';
import CustomerProfile from './components/personalisasiProfile';
import OrgPersonalisasiProfile from './components/orgPersonalisasiProfile';
import OrderPage from './components/OrderPage';
import {userService} from './services/apiService';

const CustomerRoute = ({ children }) => {
    return userService.isCustomer() ? children : <Navigate to="/dashboard" />;
};

const PrivateRoute = ({ children }) => {
    return userService.isLoggedIn() ? children : <Navigate to="/registration-or-login" />;
};

function App() {
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Cek status login saat komponen dimuat
        const checkAuthStatus = async () => {
            try {
                if (userService.isLoggedIn()) {
                    // Validasi token dengan mengambil profil
                    await userService.getProfile();
                }
            } catch (error) {
                // Jika token tidak valid, logout
                userService.logout();
            } finally {
                setLoading(false);
            }
        };
        
        checkAuthStatus();
    }, []);
    
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                {/* Dashboard sebagai halaman default */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                
                {/* Dashboard bisa diakses tanpa login */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Halaman auth */}
                <Route path="/registration-or-login" element={
                    userService.isLoggedIn() ? <Navigate to="/dashboard" /> : <SignLogin />
                } />
                
                {/* Halaman yang perlu auth */}
                <Route path="/profile" element={
                    <CustomerRoute>
                        <CustomerProfile />
                    </CustomerRoute>
                } />

                {/* Halaman organisasi */}
                <Route path="/org-profile" element={<OrgPersonalisasiProfile />} />

                {/* Halaman pesanan */}
                <Route path="/orders" element={
                    <PrivateRoute>
                        <OrderPage />
                    </PrivateRoute>
                } />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;