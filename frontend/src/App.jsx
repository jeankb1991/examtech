import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ExamRoom from './pages/ExamRoom';

// Componente para proteger rotas por cargo (role)
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('examtech_token');
  const user = JSON.parse(localStorage.getItem('examtech_user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Se o usuário tentar acessar algo fora do seu cargo, manda para o dashboard correto
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'professor') return <Navigate to="/professor" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rota Privada Admin */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        {/* Rota Privada Professor */}
        <Route 
          path="/professor" 
          element={
            <PrivateRoute allowedRoles={['professor']}>
              <ProfessorDashboard />
            </PrivateRoute>
          } 
        />

        {/* Rotas Privadas Aluno */}
        <Route 
          path="/student" 
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/exam/:examId" 
          element={
            <PrivateRoute allowedRoles={['student']}>
              <ExamRoom />
            </PrivateRoute>
          } 
        />

        {/* Redirecionamento padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
