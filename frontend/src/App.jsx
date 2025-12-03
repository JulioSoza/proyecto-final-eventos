// FRONTEND - src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetail from './pages/EventDetail';
import AdminEvents from './pages/AdminEvents';
import MyTickets from './pages/MyTickets'; 

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/eventos/:id" element={<EventDetail />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        {/* Mis boletos */}
        <Route path="/mis-boletos" element={<MyTickets />} />
      </Routes>
    </Layout>
  );
}

export default App;
