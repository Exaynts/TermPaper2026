import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Глобальные стили (только глобальные и компоненты шапки/подвала)
import './index.css';
import './styles/global.css';
import './styles/Header.css';
import './styles/Footer.css';

// Компоненты
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Страницы
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ProfilePage from './components/pages/ProfilePage';
import CourseListPage from './components/pages/CourseListPage';
import CourseDetailPage from './components/pages/CourseDetailPage';
import MyCoursesPage from './components/pages/MyCoursesPage';
import SavedCoursesPage from './components/pages/SavedCoursesPage';

// Компонент-обёртка для страниц с Header и Footer
const PageWrapper = ({ children }) => {
    return (
        <>
            <Header />
            <main className="main">
                {children}
            </main>
            <Footer />
        </>
    );
};

// Компонент защищённого маршрута (только авторизованные)
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        );
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Компонент публичного маршрута (редирект на главную, если уже авторизован)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        );
    }
    return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// Основной компонент с маршрутами
function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/courses" element={<PageWrapper><CourseListPage /></PageWrapper>} />
            <Route path="/courses/:id" element={<PageWrapper><CourseDetailPage /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <PageWrapper><ProfilePage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/my-courses" element={
                <ProtectedRoute>
                    <PageWrapper><MyCoursesPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/saved-courses" element={
                <ProtectedRoute>
                    <PageWrapper><SavedCoursesPage /></PageWrapper>
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;