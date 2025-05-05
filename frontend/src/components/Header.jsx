import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import "./Header.css";

const cinemas = [
  { name: "Đồng Đa", address: "890 Trần Hưng Đạo, Quận 5, Tp. Hồ Chí Minh" },
  { name: "Beta Quang Trung", address: "645 Quang Trung, Gò Vấp" },
  { name: "Beta Trần Quang Khải", address: "62 Trần Quang Khải, Q1" },
  { name: "Beta Ung Văn Khiêm", address: "26 Ung Văn Khiêm, Bình Thạnh" },
  { name: "Cinestar Hai Bà Trưng", address: "135 Hai Bà Trưng, Q1" },
  { name: "Cinestar Quốc Thanh", address: "271 Nguyễn Trãi, Q1" },
  { name: "Mega GS Cao Thắng", address: "19 Cao Thắng, Quận 3" },
  { name: "Mega GS Lý Chính Thắng", address: "212 Lý Chính Thắng, Quận 3" },
];

export default function Header({ onLoginClick, onRegisterClick }) {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCinemaBox, setShowCinemaBox] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allMovies, setAllMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [cinemaSearch, setCinemaSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchMovies = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/Admin/list-movies",
          {
            limit: 50,
            category: "now",
          }
        );
        if (res.data?.movies?.status === 200) {
          const list = res.data.movies.message.map((m) => ({
            id: m.movie_id,
            name: m.movie_name,
            poster: m.poster || m.poster_url || "",
          }));
          setAllMovies(list);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách phim:", err);
      }
    };
    fetchMovies();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest("#account-button") &&
        !e.target.closest("#account-dropdown")
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    const button = document.getElementById("account-button");
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setDropdownOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    const results = allMovies.filter((movie) =>
      movie.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSelectSuggestion = (movie) => {
    setSearchTerm("");
    setSearchResults([]);
    navigate(`/movies/detail/${movie.id}`);
  };

  const filteredCinemas = cinemas.filter(
    (c) =>
      c.name.toLowerCase().includes(cinemaSearch.toLowerCase()) ||
      c.address.toLowerCase().includes(cinemaSearch.toLowerCase())
  );

  return (
    <div className="relative">
      <header className="bg-galaxy-header shadow p-4 flex items-center justify-between relative z-50">
        <div className="flex items-center space-x-6">
          <Link to="/">
            <img src={logo} alt="Galaxy Logo" className="logo-rounded h-10" />
          </Link>
          <span className="text-sm text-gray-300">
            {new Date().getFullYear()}
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/booking" className="nav-link hover:text-orange-400">
            Mua Vé
          </Link>
          <Link to="/movies/now" className="nav-link hover:text-orange-400">
            Phim Đang Chiếu
          </Link>
          <Link to="/movies/soon" className="nav-link hover:text-orange-400">
            Phim Sắp Chiếu
          </Link>
          <button
            className="nav-link hover:text-orange-400"
            onClick={() => setShowCinemaBox((prev) => !prev)}
          >
            Rạp
          </button>
          <Link to="/news" className="nav-link hover:text-orange-400">
            Tin Tức
          </Link>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:block relative w-1/4 mx-4">
          <div className="flex space-x-1">
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
            />
            <button
              onClick={handleSearch}
              className="px-4 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Tìm
            </button>
          </div>

          {searchTerm && searchResults.length > 0 && (
            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleSelectSuggestion(movie)}
                  className="flex items-center p-2 hover:bg-orange-100 cursor-pointer space-x-3"
                >
                  {movie.poster && (
                    <img
                      src={movie.poster}
                      alt={movie.name}
                      className="w-10 h-14 object-cover rounded"
                    />
                  )}
                  <span className="text-black">{movie.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-galaxy-header p-4 md:hidden space-y-4 z-40">
            <div className="relative mb-4">
              <div className="flex space-x-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Tìm
                </button>
              </div>

              {searchTerm && searchResults.length > 0 && (
                <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => handleSelectSuggestion(movie)}
                      className="flex items-center p-2 hover:bg-orange-100 cursor-pointer space-x-3"
                    >
                      {movie.poster && (
                        <img
                          src={movie.poster}
                          alt={movie.name}
                          className="w-10 h-14 object-cover rounded"
                        />
                      )}
                      <span className="text-black">{movie.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/booking"
              className="block text-white"
              onClick={toggleMobileMenu}
            >
              Mua Vé
            </Link>
            <Link
              to="/movies/now"
              className="block text-white"
              onClick={toggleMobileMenu}
            >
              Phim Đang Chiếu
            </Link>
            <Link
              to="/movies/soon"
              className="block text-white"
              onClick={toggleMobileMenu}
            >
              Phim Sắp Chiếu
            </Link>
            <button
              className="block text-white w-full text-left"
              onClick={() => {
                setShowCinemaBox(true);
                toggleMobileMenu();
              }}
            >
              Rạp
            </button>
            <Link
              to="/news"
              className="block text-white"
              onClick={toggleMobileMenu}
            >
              Tin Tức
            </Link>
          </div>
        )}

        <div className="relative hidden md:block">
          {user ? (
            <div className="flex items-center space-x-4">
              <button
                id="account-button"
                onClick={toggleDropdown}
                className="text-sm text-white hover:text-orange-400"
              >
                Xin chào, {user.email}
              </button>

              {dropdownOpen && (
                <div
                  id="account-dropdown"
                  className="fixed w-56 bg-white rounded-md shadow-lg z-[9999]"
                  style={{
                    top: dropdownPosition.top,
                    right: dropdownPosition.right,
                  }}
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    Quản lý Tài Khoản
                  </Link>
                  <Link
                    to="/booking-history"
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    Lịch Sử Đặt Vé
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Đăng Xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <button onClick={onLoginClick} className="auth-button auth-login">
                Đăng Nhập
              </button>
              <button
                onClick={onRegisterClick}
                className="auth-button auth-register"
              >
                Đăng Ký
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hộp chọn rạp */}
      {showCinemaBox && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-30"
            onClick={() => setShowCinemaBox(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
            <div className="w-full max-w-3xl bg-white rounded-md shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Chọn Rạp</h2>
                <button
                  onClick={() => setShowCinemaBox(false)}
                  className="text-gray-600 hover:text-red-500 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center mb-4 space-x-2">
                <input
                  type="text"
                  placeholder="Tìm rạp..."
                  value={cinemaSearch}
                  onChange={(e) => setCinemaSearch(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
                {filteredCinemas.map((cinema, idx) => (
                  <div
                    key={idx}
                    className="p-3 border-b hover:bg-orange-100 rounded-md cursor-pointer"
                    onClick={() => {
                      setShowCinemaBox(false);
                      // Có thể thêm navigation hoặc lưu rạp đã chọn vào state/context
                    }}
                  >
                    <div className="font-semibold text-gray-800">
                      {cinema.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {cinema.address}
                    </div>
                  </div>
                ))}
                {filteredCinemas.length === 0 && (
                  <div className="text-center text-gray-500">
                    Không tìm thấy rạp phù hợp.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
