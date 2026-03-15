import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import VolunteerDashboard from './pages/dashboard/VolunteerDashboard';
import CoordinatorDashboard from './pages/dashboard/CoordinatorDashboard';
import Home from './pages/Home';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Admin Routes */}
                    <Route
                        path="/dashboard/admin"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Volunteer Routes */}
                    <Route
                        path="/dashboard/volunteer"
                        element={
                            <ProtectedRoute requiredRole="volunteer">
                                <VolunteerDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Event Coordinator Routes */}
                    <Route
                        path="/dashboard/coordinator"
                        element={
                            <ProtectedRoute requiredRole="event_coordinator">
                                <CoordinatorDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
