import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import Reusable Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Page Views
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import PropertyDetails from './pages/PropertyDetails';
import AddEditProperty from './pages/AddEditProperty';
import VisitBooking from './pages/VisitBooking';
import LoanCalculatorPage from './pages/LoanCalculatorPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          {/* Top responsive sticky navbar */}
          <Navbar />
          
          {/* Main page layout wrapper */}
          <main style={{ flex: '1 0 auto', paddingBottom: '3rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<PropertyDetails />} />
              <Route path="/add-property" element={<AddEditProperty />} />
              <Route path="/edit-property/:id" element={<AddEditProperty />} />
              <Route path="/bookings" element={<VisitBooking />} />
              <Route path="/calculator" element={<LoanCalculatorPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          
          {/* Bottom decorative glass footer */}
          <Footer />

        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
