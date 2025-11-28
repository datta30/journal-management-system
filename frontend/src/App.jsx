import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ViewPaper from './pages/ViewPaper';
import Dashboard from './pages/Dashboard';
import Papers from './pages/Papers';
import PaperDetail from './pages/PaperDetail';
import SubmitPaper from './pages/SubmitPaper';
import MyPapers from './pages/MyPapers';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import Users from './pages/Users';
import PublishedPapers from './pages/PublishedPapers';
import Layout from './components/Layout';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/published" element={<PublishedPapers />} />
          <Route path="/paper/view/:id" element={<ViewPaper />} />

          {/* Protected Routes */}
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Author Routes */}
            <Route path="my-papers" element={<MyPapers />} />
            <Route path="submit-paper" element={<SubmitPaper />} />
            <Route path="paper/:id" element={<PaperDetail />} />
            <Route path="paper/:id/edit" element={<SubmitPaper />} />
            
            {/* Reviewer Routes */}
            <Route path="reviews" element={
              <PrivateRoute roles={['REVIEWER', 'EDITOR', 'ADMIN']}>
                <Reviews />
              </PrivateRoute>
            } />
            <Route path="review/:id" element={
              <PrivateRoute roles={['REVIEWER', 'EDITOR', 'ADMIN']}>
                <ReviewDetail />
              </PrivateRoute>
            } />
            
            {/* Editor/Admin Routes */}
            <Route path="papers" element={
              <PrivateRoute roles={['EDITOR', 'ADMIN']}>
                <Papers />
              </PrivateRoute>
            } />
            <Route path="users" element={
              <PrivateRoute roles={['ADMIN']}>
                <Users />
              </PrivateRoute>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
