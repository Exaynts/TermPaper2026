import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Глобальные стили
import './index.css';
import './styles/global.css';
import './components/common/Header.css';
import './components/common/Footer.css';

// Компоненты
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import CourseCard from './components/common/CourseCard';

import CourseFilters from './components/courses/CourseFilters';

// Страницы
import HomePage from './components/pages/HomePage';
import AboutUsPage from './components/pages/AboutUsPage';
import ChangePasswordPage from './components/pages/ChangePasswordPage';
import CourseDetailPage from './components/pages/CourseDetailPage';
import CourseListPage from './components/pages/CourseListPage';
import CreateCoursePage from './components/pages/CreateCoursePage';
import CreatedCoursesPage from './components/pages/CreatedCoursesPage';
import EditCoursePage from './components/pages/EditCoursePage';
import FAQPage from './components/pages/FAQPage';
import LoginPage from './components/pages/LoginPage';
import MyCoursesPage from './components/pages/MyCoursesPage';
import ProfilePage from './components/pages/ProfilePage';
import PurchasedCoursesPage from './components/pages/PurchasedCoursesPage';
import RegisterPage from './components/pages/RegisterPage';
import RecycleBinPage from './components/pages/RecycleBinPage';
import SavedCoursesPage from './components/pages/SavedCoursesPage';
import TermsAndConditionsPage from './components/pages/TermsAndConditionsPage';

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
            <Route path="/aboutUs" element={<PageWrapper><AboutUsPage /></PageWrapper>} />
            <Route path="/courses" element={<PageWrapper><CourseListPage /></PageWrapper>} />
            <Route path="/courses/:id" element={<PageWrapper><CourseDetailPage /></PageWrapper>} />
            <Route path="/faq" element={<PageWrapper><FAQPage /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
            <Route path="/terms" element={<PageWrapper><TermsAndConditionsPage /></PageWrapper>} />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <PageWrapper><ProfilePage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/change-password" element={
                <ProtectedRoute>
                    <PageWrapper><ChangePasswordPage /></PageWrapper>
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
            <Route path="/purchased-courses" element={
                <ProtectedRoute>
                    <PageWrapper><PurchasedCoursesPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/recycle-bin" element={
                <ProtectedRoute>
                    <PageWrapper><RecycleBinPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/create-course" element={
                <ProtectedRoute>
                    <PageWrapper><CreateCoursePage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/created-courses" element={
                <ProtectedRoute>
                    <PageWrapper><CreatedCoursesPage /></PageWrapper>
                </ProtectedRoute>
            } />
            <Route path="/edit-course/:id" element={
                <ProtectedRoute>
                    <PageWrapper><EditCoursePage /></PageWrapper>
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