import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

const tabs = [
  { key: "now", label: "Đang chiếu" },
  { key: "soon", label: "Sắp chiếu" },
];

const promotions = [
  {
    image: "https://www.galaxycine.vn/media/2025/4/18/1135_1744965700799.jpg",
    title: "Ưu đãi Galaxy Cinema",
    description:
      "Ưu đãi hấp dẫn cho thành viên! Xem phim rẻ hơn, nhận quà mỗi tuần.",
  },
  {
    image: "https://www.galaxycine.vn/media/2025/4/18/1135_1744960764165.jpg",
    title: "Mega Ưu Đãi Galaxy Cine+",
    description:
      "Chỉ 69K, có ngay vé xem phim kèm nước + bắp tại rạp toàn quốc.",
  },
  {
    image: "https://www.galaxycine.vn/media/2025/3/31/1135_1743392552365.jpg",
    title: "Khuyến mãi cuối tuần",
    description: "Thứ 6, Thứ 7, Chủ nhật, giảm 20% giá vé cho mọi suất chiếu!",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const promotionRef = useRef();
  const slideRef = useRef(null);
  const [activeTab, setActiveTab] = useState("now");
  const [movies, setMovies] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const isHovering = useRef(false);

  // Lấy danh sách phim từ API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/Admin/list-all-movies",
          { limit: 16 }
        );

        if (response.data?.movies?.status === 200) {
          const movieList = response.data.movies.message.map((movie) => ({
            id: movie.movie_id,
            title: movie.movie_name,
            poster: movie.movie_poster || "/img/default-movie.jpg",
            description: movie.movie_description,
            category: movie.category || "now",
            release_date: movie.release_date || "N/A",
          }));

          const slideData = movieList.map((movie) => ({
            poster: movie.poster,
            title: movie.title,
            id: movie.id,
            release_date: movie.release_date,
          }));

          setMovies(movieList);
          setSlides(slideData);
        } else {
          setError("Không thể tải danh sách phim");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Khởi tạo vị trí slide đầu tiên
  useEffect(() => {
    const slider = slideRef.current;
    if (slider) {
      slider.scrollLeft = 0;
    }
  }, [slides]);

  // Logic tự động cuộn slide
  useEffect(() => {
    const slider = slideRef.current;
    if (!slider || slides.length <= 1) return;

    let timeoutId;

    const autoScroll = () => {
      if (isHovering.current) {
        timeoutId = setTimeout(autoScroll, 3000);
        return;
      }

      const slideWidth = slider.querySelector("div")?.offsetWidth + 16 || 144;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      let nextScroll = slider.scrollLeft + slideWidth;

      if (nextScroll >= maxScroll) {
        nextScroll = 0;
      }

      slider.scrollTo({
        left: nextScroll,
        behavior: "smooth",
      });

      const newIndex = Math.round(nextScroll / slideWidth);
      setCurrentSlideIndex(newIndex);

      timeoutId = setTimeout(autoScroll, 3000);
    };

    const startAutoScroll = () => {
      timeoutId = setTimeout(autoScroll, 3000);
    };

    const stopAutoScroll = () => {
      clearTimeout(timeoutId);
    };

    startAutoScroll();

    const handleMouseEnter = () => {
      isHovering.current = true;
      stopAutoScroll();
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      startAutoScroll();
    };

    slider.addEventListener("mouseenter", handleMouseEnter);
    slider.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      slider.removeEventListener("mouseenter", handleMouseEnter);
      slider.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [slides]);

  // Cập nhật chỉ số slide hiện tại
  useEffect(() => {
    const slider = slideRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const slideWidth = slider.querySelector("div")?.offsetWidth + 16 || 144;
      const newIndex = Math.round(slider.scrollLeft / slideWidth);
      setCurrentSlideIndex(newIndex);
    };

    slider.addEventListener("scroll", handleScroll);
    return () => slider.removeEventListener("scroll", handleScroll);
  }, [slides]);

  // Lọc phim theo tab
  const filteredMovies = movies.filter((m) => m.category === activeTab);
  const filteredSlides = slides.filter((s) => {
    const movie = movies.find((m) => m.id === s.id);
    return movie && movie.category === activeTab;
  });

  // Xử lý đặt vé nhanh
  const handleQuickBooking = (movieTitle, movieId) => {
    navigate("/booking", {
      state: { movieId, movie: movieTitle },
    });
    window.scrollTo(0, 0);
  };

  // Trạng thái tải và lỗi
  if (loading) {
    return (
      <div className="text-center py-16 text-white text-lg animate-pulse">
        <span className="inline-block animate-twinkle">✨</span> Đang tải
        phim...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-400 text-lg">Lỗi: {error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-galaxy space-y-12 px-4 md:px-8 py-8">
      {/* Tabs */}
      <div className="flex items-center justify-center space-x-6 border-b-2 border-gray-800 pb-3 mt-8">
        <span className="font-bold text-lg text-white">PHIM</span>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-2 text-base font-medium transition-all duration-300 ${
              activeTab === tab.key ? "tab-active" : "tab-inactive"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Slide (Horizontal Scroll) */}
      <div className="relative max-w-5xl mx-auto">
        {filteredSlides.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-lg">
            Không có phim nào trong danh mục này
          </div>
        ) : (
          <div
            ref={slideRef}
            className="overflow-x-auto whitespace-nowrap scroll-smooth space-x-4 flex no-scrollbar py-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {filteredSlides.map((slide, idx) => (
              <div
                key={idx}
                className="inline-block w-32 flex-shrink-0 slide-item"
              >
                <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                  <img
                    src={slide.poster}
                    alt={slide.title}
                    className="w-full h-64 object-cover cursor-pointer"
                    loading="lazy"
                    onClick={() => handleQuickBooking(slide.title, slide.id)}
                    onError={(e) => {
                      e.target.src = "/img/default-movie.jpg";
                    }}
                  />
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {slide.release_date !== "N/A"
                        ? new Date(slide.release_date).toLocaleDateString(
                            "vi-VN",
                            { day: "2-digit", month: "2-digit" }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Dots */}
        {filteredSlides.length > 1 && (
          <div className="flex justify-center mt-4 space-x-3">
            {filteredSlides.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex
                    ? "bg-yellow-400 scale-125"
                    : "bg-gray-600"
                }`}
                onClick={() => {
                  const slider = slideRef.current;
                  const slideWidth =
                    slider.querySelector("div")?.offsetWidth + 16 || 144;
                  slider.scrollTo({
                    left: idx * slideWidth,
                    behavior: "smooth",
                  });
                  setCurrentSlideIndex(idx);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {filteredMovies.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400 text-lg">
            Không có phim nào trong danh mục này
          </div>
        ) : (
          filteredMovies.map((m) => (
            <div key={m.id} className="movie-card">
              <div className="relative h-80 w-full overflow-hidden">
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/img/default-movie.jpg";
                  }}
                />
              </div>
              <div className="p-4 flex flex-col gap-3">
                <h3 className="text-base font-semibold text-white truncate">
                  {m.title}
                </h3>
                <button
                  onClick={() => handleQuickBooking(m.title, m.id)}
                  className="movie-button text-sm font-medium py-2 px-6 rounded-lg transition-all shadow-md mx-auto"
                >
                  Mua vé ngay
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Xem thêm */}
      <div className="text-center">
        <Link
          to={`/movies/${activeTab}`}
          className="inline-block px-6 py-3 border-2 border-yellow-400 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300"
        >
          Xem thêm
        </Link>
      </div>

      {/* Promotions */}
      <div className="mt-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-yellow-400 text-center">
          Tin Khuyến Mãi
        </h2>
        <div
          ref={promotionRef}
          className="overflow-x-auto whitespace-nowrap scroll-smooth space-x-4 flex no-scrollbar py-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {promotions.map((promo, index) => (
            <div
              key={index}
              className="inline-block promo-card w-80 flex-shrink-0"
            >
              <img
                src={promo.image}
                alt={promo.title}
                className="rounded-t-xl w-full h-48 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/img/default-promo.jpg";
                }}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-yellow-400 truncate">
                  {promo.title}
                </h3>
                <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                  {promo.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Đặt Vé Nhanh */}
      <div className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          Đặt Vé Nhanh
        </h2>
        <div className="bg-gray-900 rounded-xl shadow-lg p-8 flex justify-center gap-6">
          <button
            onClick={() => handleQuickBooking(movies[0]?.title, movies[0]?.id)}
            className="quick-booking-button"
            disabled={!movies[0]}
          >
            Đặt Vé
          </button>
        </div>
      </div>
    </div>
  );
}
