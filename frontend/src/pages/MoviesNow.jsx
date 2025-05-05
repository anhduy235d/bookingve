// src/pages/MoviesNow.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css"; // Import chung style Home để đồng bộ

export default function MoviesNow() {
  const navigate = useNavigate();
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/Admin/list-all-movies",
          { limit: 100 }
        );
        if (res.data?.movies?.status === 200) {
          setAllMovies(
            res.data.movies.message.map((m) => ({
              id: m.movie_id,
              title: m.movie_name,
              poster:
                m.movie_poster ||
                m.poster ||
                m.poster_url ||
                "/public/img/default-movie.jpg",
              description: m.movie_description || "Chưa có mô tả.",
              category: m.category || "now",
            }))
          );
        } else {
          throw new Error("Server trả về status khác 200");
        }
      } catch (e) {
        console.error("[MoviesNow] fetchAll error:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Lọc chỉ phim đang chiếu
  const nowMovies = allMovies.filter((m) => m.category === "now");
  // Lọc theo search
  const filtered = nowMovies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="text-center py-16 text-white animate-pulse">
        Đang tải phim...
      </div>
    );
  if (error)
    return <div className="text-center py-16 text-red-400">Lỗi: {error}</div>;

  return (
    <div className="min-h-screen bg-galaxy px-4 md:px-8 py-8 space-y-12">
      <h1 className="text-3xl font-bold text-yellow-400 text-center">
        Phim Đang Chiếu
      </h1>

      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Tìm kiếm phim..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2 border rounded focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">
            Không tìm thấy phim phù hợp.
          </div>
        ) : (
          filtered.map((movie) => (
            <div key={movie.id} className="movie-card">
              <div className="h-80 overflow-hidden">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.target.src = "/public/img/default-movie.jpg")
                  }
                />
              </div>
              <div className="p-4 flex flex-col gap-3">
                <h3 className="text-base font-semibold text-white truncate">
                  {movie.title}
                </h3>
                <button
                  onClick={() =>
                    navigate("/booking", {
                      state: {
                        movieId: movie.id,
                        movieTitle: movie.title,
                      },
                    })
                  }
                  className="movie-button"
                >
                  Mua Vé
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
