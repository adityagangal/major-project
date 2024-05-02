import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstituteDashboard from './pages/InstituteDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <main className="App-main">
          <Routes>
            <Route path="/" element={
              <div className="centered-container">
                <LoginPage />
              </div>
            } />
            <Route path="/register" element={
              <div className="centered-container">
                <RegisterPage />
              </div>
            } />
            <Route path="/studentDashboard/:studentAddress" element={<StudentDashboard />} />
            <Route path="/instituteDashboard/:instituteAddress" element={<InstituteDashboard />} />
            <Route path='/admin' element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;