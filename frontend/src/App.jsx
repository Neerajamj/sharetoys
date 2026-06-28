import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AddToy from './pages/AddToy.jsx';
import ToyDetail from './pages/ToyDetail.jsx';
import Orders from './pages/Orders.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <InstallPrompt />
      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add" element={<AddToy />} />
          <Route path="/toys/:id" element={<ToyDetail />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
    </div>
  );
}
