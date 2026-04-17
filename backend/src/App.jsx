import React, { useState } from 'react';
import AdminDashboard from './pages/adminDashboard';
import CatalogPage from './pages/CatalogPage';
import FilterPage from './pages/filterPage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import LoginPage from './pages/loginPage';
import AddResources from './pages/AddResources';
import LandingPage from './pages/LandingPage';
import LecturerDashboard from './pages/lecturerDashboard';
import FacilitiesPage from './pages/FacilitiesPage';
import BookingsPage from './pages/BookingsPage';
import BookingFormPage from './pages/BookingFormPage';
import TicketsPage from './pages/TicketsPage';
import TicketFormPage from './pages/TicketFormPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      {currentPage === 'landing' && <LandingPage setPage={setCurrentPage} />}
      {currentPage === 'login' && <LoginPage setPage={setCurrentPage} setUser={setUser} />}
      {currentPage === 'catalog' && <CatalogPage setPage={setCurrentPage} user={user} />}
      {currentPage === 'filter' && <FilterPage setPage={setCurrentPage} user={user} />}
      {currentPage === 'admin' && <AdminDashboard setPage={setCurrentPage} user={user} setUser={setUser} />}
      {currentPage === 'technician' && <TechnicianDashboard setPage={setCurrentPage} user={user} setUser={setUser} />}
      {currentPage === 'addresources' && <AddResources setPage={setCurrentPage} user={user} setUser={setUser} />}
      {currentPage === 'lecturer' && <LecturerDashboard setPage={setCurrentPage} user={user} setUser={setUser} />}
      {currentPage === 'facilities' && <FacilitiesPage setPage={setCurrentPage} />}
      {currentPage === 'bookings' && <BookingsPage setPage={setCurrentPage} />}
      {currentPage === 'booking-new' && <BookingFormPage setPage={setCurrentPage} />}
      {currentPage === 'tickets' && <TicketsPage setPage={setCurrentPage} userRole={user?.role} currentUserId={user?.email} />}
      {currentPage === 'tickets-new' && <TicketFormPage setPage={setCurrentPage} />}
    </div>
  );
}

export default App;
