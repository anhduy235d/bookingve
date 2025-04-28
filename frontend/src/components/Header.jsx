import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png"; // Đường dẫn đến file logo
import "./Header.css";

export default function Header({ onLoginClick, onRegisterClick }) {
  return (
    <header className="bg-galaxy-header shadow p-4 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link to="/">
          <img src={logo} alt="Galaxy Logo" className="logo-rounded" />
        </Link>
        <span className="text-sm text-gray-300"></span>
      </div>

      <nav className="space-x-6">
        <Link to="/movies/now" className="nav-link">
          Phim Đang Chiếu
        </Link>
        <Link to="/movies/soon" className="nav-link">
          Phim Sắp Chiếu
        </Link>
        <Link to="/cinemas" className="nav-link">
          Rạp
        </Link>
        <Link to="/news" className="nav-link">
          Tin Tức
        </Link>
      </nav>

      <div className="space-x-4">
        <button onClick={onLoginClick} className="auth-button auth-login">
          Đăng Nhập
        </button>
        <button onClick={onRegisterClick} className="auth-button auth-register">
          Đăng Ký
        </button>
      </div>
    </header>
  );
}
