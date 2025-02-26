import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login"; 
import Dashboard from "./pages/Dashboard";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import './global.css';  // 🔹 Importando o CSS global
import Admin from "./pages/Adm";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<Sobre />} />
      <Route path="/contact" element={<Contato />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
