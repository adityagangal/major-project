import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';

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
            <Route path="/dashboard/" element={<StudentDashboard />} />
            <Route path="/enroll" element={<EnrollmentForm />} />  
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;