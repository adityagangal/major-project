import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import EnrollmentForm from './pages/EnrollmentForm';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Credit Transfer System</h1>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard/:studentAddress" element={<StudentDashboard />} />
            <Route path="/enroll" element={<EnrollmentForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
