import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/Admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Utility functions
const formatDate = (date, formatStr) => {
  const d = new Date(date);
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return formatStr
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('EEEE', days[d.getDay()]);
};

const addDaysToDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
//fortmat time
const formatTime = (timeStr) => {
  return timeStr.slice(0, 5); // Lấy HH:mm từ HH:mm:ss
};


const BookingFlow = () => {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState('Tp. Hồ Chí Minh');
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [email, setEmail] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [seats, setSeats] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateOptions, setDateOptions] = useState([]);

  // Danh sách khu vực
  const areas = [
    { name: 'Tp. Hồ Chí Minh', count: 54 },
  ];

  // Danh sách hệ thống rạp
  const cinemaBrands = [
    { name: 'CGV', apiName: 'cgv', logo: 'https://gigamall.vn/data/2019/05/06/11365490_logo-cgv-500x500.jpg' },
    { name: 'Lotte Cinema', apiName: 'lotte', logo: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1w8ob2qht8z5c' },
    { name: 'BHD Star Cineplex', apiName: 'bhd', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrlRNmKqyKLsuQMm-hf3tdLm7q-NXM6O5jkw&s' },
    { name: 'Beta Cineplex', apiName: 'beta', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoc8KFGScSP5BX1eHAEfcEHB1F4ThuZ82tdQ&s' },
    { name: 'Galaxy', apiName: 'galaxy', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb3ALt5L83m1JqcHRFc1hSRK4pBb0n2oulgg&s' },
    { name: 'Mega GS', apiName: 'mega gs', logo: 'https://megags.vn/wp-content/uploads/2020/10/logo-Mega.png' },
  ];

  // Hàm tính giá ghế
  const calculateSeatPrice = (seatType) => {
    switch (seatType) {
      case 2: return 120000;
      case 3: return 150000;
      default: return 85000;
    }
  };

  const getSeatTypeName = (type) => {
    switch (type) {
      case 2: return 'VIP';
      case 3: return 'Đôi';
      default: return 'Thường';
    }
  };

  const calculateTotal = () => {
    const seatsTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const servicesTotal = selectedServices.reduce((sum, s) => sum + (s.price * (s.quantity || 0)), 0);
    return seatsTotal + servicesTotal;
  };

  // Khởi tạo danh sách ngày
  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const date = addDaysToDate(new Date(), i);
      dates.push({
        value: formatDate(date, 'yyyy-MM-dd'),
        label: formatDate(date, 'dd/MM'),
        dayOfWeek: formatDate(date, 'EEEE').slice(0, 3),
      });
    }
    setDateOptions(dates);
  }, []);

  // Lấy danh sách rạp dựa trên khu vực
  useEffect(() => {
    const fetchCinemas = async () => {
      setLoading(true);
      try {
        const brandCinemas = [];
        let districtFilter = selectedArea.replace('Tp. ', '').trim();
        const isHCM = selectedArea === 'Tp. Hồ Chí Minh';
        for (const brand of cinemaBrands) {
          const response = await api.post(isHCM ? '/search/cinemas' : '/search/cinemas-district', {
            cinema_name: brand.apiName,
            ...(isHCM ? {} : { district: districtFilter }),
          });
          if (response.data.cinemas?.status === 200) {
            const cinemasData = response.data.cinemas.message;
            const uniqueCinemas = cinemasData.reduce((acc, cinema) => {
              if (!acc.find(c => c.cinema_id === cinema.cinema_id)) {
                acc.push(cinema);
              }
              return acc;
            }, []);
            if (uniqueCinemas.length > 0) {
              brandCinemas.push({
                name: brand.name,
                logo: brand.logo,
                cinemas: uniqueCinemas,
              });
            }
          }
        }
        setCinemas(brandCinemas);
      } catch (err) {
        console.error('Error fetching cinemas:', err);
        setError('Không thể tải danh sách rạp. Vui lòng thử lại.');
        setCinemas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, [selectedArea]);

  // Lấy danh sách suất chiếu và phim
  useEffect(() => {
    if (selectedCinema && selectedDate) {
      const fetchShowtimesAndMovies = async () => {
        setLoading(true);
        try {
          const cinemaName = selectedCinema.cinema_name.toLowerCase().includes('cgv') ? 'cgv' :
                            selectedCinema.cinema_name.toLowerCase().includes('lotte') ? 'lotte' :
                            selectedCinema.cinema_name.toLowerCase().includes('bhd') ? 'bhd' :
                            selectedCinema.cinema_name.toLowerCase().includes('beta') ? 'beta' :
                            selectedCinema.cinema_name.toLowerCase().includes('galaxy') ? 'galaxy' :
                            selectedCinema.cinema_name.toLowerCase().includes('mega gs') ? 'mega gs' : '';
          const showtimeResponse = await api.post('/Room-showtime-bycinema', {
            cinema_id: selectedCinema.cinema_id,
            schedule_date: selectedDate,
            cinema_name: cinemaName,
          });
          console.log('Showtime Request:', {
            cinema_id: selectedCinema.cinema_id,
            schedule_date: selectedDate,
            cinema_name: cinemaName,
          });
          console.log('Showtime Response:', showtimeResponse.data);

          if (showtimeResponse.data.rooms?.status === 200) {
            const showtimesData = showtimeResponse.data.rooms.message || [];
            setShowtimes(showtimesData);

            if (showtimesData.length > 0) {
              const movieResponse = await api.post('/list-movies', {
                cinema_id: selectedCinema.cinema_id,
                schedule_date: selectedDate,
                limit: 5,
              });
              console.log('Movie Response:', movieResponse.data);

              if (movieResponse.data.movies?.status === 200) {
                setMovies(movieResponse.data.movies.message || []);
              } else {
                setMovies([]);
              }
            } else {
              setMovies([]);
            }
          } else {
            setShowtimes([]);
            setMovies([]);
          }
        } catch (err) {
          console.error('Error fetching showtimes or movies:', err);
          setShowtimes([]);
          setMovies([]);
        } finally {
          setLoading(false);
        }
      };
      fetchShowtimesAndMovies();
    } else {
      setShowtimes([]);
      setMovies([]);
    }
  }, [selectedCinema, selectedDate]);

  // Xử lý chọn suất chiếu
  const handleSelectShowtime = async (showtime) => {
    setLoading(true);
    try {
      const seatsRes = await api.post('/checking-seats', {
        schedule_id: showtime.schedule_id,
        room_id: showtime.room_id,
      });
      if (seatsRes.data?.schedule?.status === 200) {
        const seatsData = seatsRes.data.schedule.message;
        const formattedSeats = seatsData.map(seat => ({
          seat_id: seat.seat_id,
          seat: `${seat.hang}${seat.so}`.toUpperCase(),
          seat_status: seat.seat_status || 'no',
          type: seat.loai,
          price: calculateSeatPrice(seat.loai),
        }));
        setSeats(formattedSeats);
      } else {
        setSeats([]);
      }

      try {
        const servicesRes = await api.get('/list-services/combo');
        setServices(servicesRes.data.services?.message || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setServices([]);
      }

      const movie = movies.find(m => m.movie_id === showtime.movie_id);
      setSelectedShowtime({
        schedule_id: showtime.schedule_id,
        room_id: showtime.room_id,
        schedule_date: selectedDate,
        schedule_start: showtime.schedule_start,
        schedule_end: showtime.schedule_end,
        movie: movie?.movie_name || 'Unknown Movie',
        movie_poster: movie?.movie_poster || 'https://via.placeholder.com/60x90',
      });
    } catch (err) {
      console.error('Error selecting showtime:', err);
      setError('Không thể tải thông tin ghế. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn ghế
  const handleSelectSeat = (seat) => {
    setSelectedSeats(prev => {
      const existingIndex = prev.findIndex(s => s.seat_id === seat.seat_id);
      if (existingIndex >= 0) {
        return prev.filter(s => s.seat_id !== seat.seat_id);
      } else {
        return [...prev, seat];
      }
    });
  };

  // Xử lý chọn dịch vụ
  const handleSelectService = (service, action) => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.service_id === service.service_id);
      if (action === 'increase') {
        return existing
          ? prev.map(s =>
              s.service_id === service.service_id
                ? { ...s, quantity: (s.quantity || 0) + 1 }
                : s
            )
          : [...prev, { ...service, quantity: 1 }];
      } else {
        return existing?.quantity > 1
          ? prev.map(s =>
              s.service_id === service.service_id
                ? { ...s, quantity: s.quantity - 1 }
                : s
            )
          : prev.filter(s => s.service_id !== service.service_id);
      }
    });
  };

  // Xử lý xác nhận đặt vé
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Vui lòng chọn ít nhất một ghế');
      return;
    }
    if (!email) {
      setError('Vui lòng nhập email để nhận vé');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formattedServices = selectedServices.map(service => ({
        service_id: service.service_id,
        quantity: service.quantity || 1,
      }));
      const bookingPromises = selectedSeats.map(seat =>
        api.post('/booking_seat', {
          info: {
            user_id: 1,
            schedule_id: selectedShowtime.schedule_id,
            seat_id: seat.seat_id,
            price: seat.price,
            seat_status: 1,
            room_id: selectedShowtime.room_id,
            services: formattedServices,
            email: email,
          },
        })
      );
      const results = await Promise.all(bookingPromises);
      const failedBookings = results.filter(
        res => !res.data?.ticket || res.data.ticket.status !== 200
      );
      if (failedBookings.length > 0) {
        throw new Error('Một số ghế đặt không thành công');
      }
      navigate('/payment', {
        state: {
          movie: selectedShowtime.movie,
          cinema: selectedCinema,
          schedule: selectedShowtime,
          seats: selectedSeats,
          services: selectedServices,
          total: calculateTotal(),
          bookingResults: results.map(res => res.data.ticket.message),
          email: email,
        },
      });
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Lỗi khi đặt ghế');
    } finally {
      setLoading(false);
    }
  };

  // Giao diện ghế
  const renderSeats = () => {
    if (loading) return <div className="text-center py-4">Đang tải thông tin ghế...</div>;
    if (!seats.length) return <div className="text-center py-4 text-[#aab3c2]">Không có ghế nào để hiển thị</div>;

    const seatsByRow = seats.reduce((acc, seat) => {
      const row = seat.seat[0];
      if (!acc[row]) acc[row] = [];
      acc[row].push(seat);
      return acc;
    }, {});

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-4 bg-[#e6ebf4] text-[#0a2540] font-semibold mb-4 rounded">MÀN HÌNH</div>
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-lg">
            {Object.entries(seatsByRow).map(([row, rowSeats]) => (
              <div key={row} className="flex items-center mb-3">
                <div className="w-8 font-semibold text-center text-[#0a2540]">{row}</div>
                <div className="flex flex-wrap gap-1 flex-1 justify-center">
                  {rowSeats.map(seat => {
                    const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);
                    const isBooked = seat.seat_status === 'yes';
                    const isWaiting = seat.seat_status === 'waiting';
                    const isCouple = seat.type === 3;
                    let seatClass = 'rounded text-xs font-semibold transition-all duration-200 flex items-center justify-center';
                    seatClass += isCouple ? ' w-16 h-8' : ' w-8 h-8';
                    if (isBooked) {
                      seatClass += ' bg-[#b0b8c9] cursor-not-allowed';
                    } else if (isWaiting) {
                      seatClass += ' bg-yellow-300 cursor-not-allowed';
                    } else if (isSelected) {
                      seatClass += ' bg-[#0a57ca] text-white';
                    } else {
                      seatClass += seat.type === 2 ? ' bg-purple-100 hover:bg-purple-200'
                        : seat.type === 3 ? ' bg-pink-100 hover:bg-pink-200'
                        : ' bg-[#e6ebf4] hover:bg-white';
                    }
                    return (
                      <button
                        key={seat.seat_id}
                        className={seatClass}
                        onClick={() => !isBooked && !isWaiting && handleSelectSeat(seat)}
                        disabled={isBooked || isWaiting}
                        title={`Ghế ${seat.seat} - ${getSeatTypeName(seat.type)} - ${seat.price.toLocaleString()} VNĐ`}
                      >
                        {seat.seat.substring(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-6 bg-[#e6ebf4] p-4 rounded-md">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#e6ebf4] mr-2 rounded"></div>
            <span className="text-xs">Thường</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-100 mr-2 rounded"></div>
            <span className="text-xs">VIP</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-4 bg-pink-100 mr-2 rounded"></div>
            <span className="text-xs">Đôi</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#b0b8c9] mr-2 rounded"></div>
            <span className="text-xs">Đã đặt</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#0a57ca] mr-2 rounded"></div>
            <span className="text-xs">Đang chọn</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-300 mr-2 rounded"></div>
            <span className="text-xs">Đang chờ</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <h2 className="text-center text-[#0a2540] text-base font-normal mb-4">Mua vé theo rạp</h2>
      {error && (
        <div className="bg-[#f9d54a] text-[#4a3e00] text-sm font-semibold rounded-md px-4 py-2 mb-3 flex items-center gap-2" role="alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-[#0a57ca] hover:underline"
          >
            Thử lại
          </button>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#0a57ca] mr-3"></div>
              <div>
                <h3 className="font-semibold">Đang xử lý</h3>
                <p className="text-sm text-[#aab3c2]">Đang tải dữ liệu...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {!selectedShowtime ? (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Cột Khu vực */}
          <div className="w-full md:w-[240px] bg-[#e6ebf4] rounded-md p-2 flex flex-col">
            <div className="text-[#aab3c2] text-xs font-normal mb-2 px-3 select-none">Khu vực</div>
            {areas.map(area => (
              <button
                key={area.name}
                className={`flex justify-between items-center text-sm rounded-md px-3 py-2 mb-1 ${
                  selectedArea === area.name
                    ? 'bg-[#0a57ca] text-white font-semibold'
                    : 'text-[#0a2540] font-normal hover:bg-white'
                }`}
                onClick={() => setSelectedArea(area.name)}
                type="button"
              >
                <span>{area.name}</span>
                <span
                  className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                    selectedArea === area.name ? 'bg-white text-[#0a57ca]' : 'bg-[#0a57ca] text-white'
                  }`}
                >
                  {area.count}
                </span>
              </button>
            ))}
          </div>
          {/* Cột Rạp */}
          <div className="w-full md:w-[320px] bg-[#e6ebf4] rounded-md p-4 flex flex-col">
            <div className="text-[#aab3c2] text-xs font-semibold mb-3 px-3 select-none">Rạp</div>
            {cinemas.length > 0 ? (
              cinemas.map(brand => (
                <div key={brand.name} className="mb-4">
                  <div className="flex items-center gap-3 text-[#aab3c2] text-xs font-semibold mb-3 px-3 select-none">
                    <img
                      alt={`${brand.name} logo`}
                      className="w-8 h-8 object-contain rounded-full border border-[#d1d7e3]"
                      height="32"
                      src={brand.logo}
                      width="32"
                    />
                    <span>{brand.name.toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {brand.cinemas.map(cinema => (
                      <button
                        key={cinema.cinema_id}
                        className={`w-full text-sm rounded-md px-3 py-2 text-left transition-colors ${
                          selectedCinema?.cinema_id === cinema.cinema_id
                            ? 'bg-[#0a57ca] text-white font-semibold'
                            : 'text-[#0a2540] font-normal hover:bg-white'
                        }`}
                        onClick={() => setSelectedCinema(cinema)}
                        type="button"
                      >
                        {cinema.cinema_name}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[#aab3c2] text-sm font-normal px-3 py-2">Không có rạp nào</div>
            )}
          </div>
          {/* Cột Suất chiếu */}
          <div className="flex-1">
            <div className="flex bg-[#f0f4f8] rounded-md overflow-hidden mb-2 text-center text-xs font-normal text-[#aab3c2] select-none">
              {dateOptions.map(date => (
                <button
                  key={date.value}
                  className={`flex-1 py-2 ${
                    selectedDate === date.value ? 'bg-[#b0bedf] text-[#0a2540] font-semibold' : ''
                  }`}
                  onClick={() => setSelectedDate(date.value)}
                  type="button"
                >
                  <div>{date.label}</div>
                  <div>{date.dayOfWeek}</div>
                </button>
              ))}
            </div>
            <div className="bg-[#f9d54a] text-[#4a3e00] text-sm font-semibold rounded-md px-4 py-2 mb-3 flex items-center gap-2" role="alert">
              <i className="fas fa-clock"></i>
              Nhấn vào suất chiếu để tiến hành mua vé
            </div>
            {selectedCinema && (
              <div className="bg-[#e6ebf4] rounded-md p-4 mb-4 text-xs text-[#0a2540]">
                <div className="font-semibold mb-1">
                  {selectedCinema.cinema_name}
                  <span className="font-normal text-[#aab3c2]">
                    · {formatDate(selectedDate, 'EEEE, dd/MM/yyyy')}
                  </span>
                </div>
                <div className="text-[#6b7a99] mb-1 leading-tight">
                  {selectedCinema.cinema_address} -
                  <a className="text-[#0a57ca] hover:underline" href="#">Bản đồ</a>
                </div>
              </div>
            )}
            {selectedCinema && selectedDate ? (
              showtimes.length > 0 && movies.length > 0 ? (
                movies.map(movie => {
                  const movieShowtimes = showtimes.filter(showtime => showtime.movie_id === movie.movie_id);
                  if (movieShowtimes.length === 0) return null;
                  return (
                    <div
                      key={movie.movie_id}
                      aria-label={`Movie ${movie.movie_name} showtimes`}
                      className="border border-[#d1d7e3] rounded-md p-3 mb-4 text-xs text-[#0a2540]"
                    >
                      <div className="flex gap-3 mb-2">
                        <img
                          alt={`Poster of movie ${movie.movie_name}`}
                          className="w-[60px] h-[90px] object-cover rounded-sm flex-shrink-0"
                          height="90"
                          src={movie.movie_poster || 'https://via.placeholder.com/60x90'}
                          width="60"
                        />
                        <div className="flex flex-col flex-1">
                          <div className="font-semibold leading-tight">{movie.movie_name}</div>
                          <div className="text-[#6b7a99] leading-tight">
                            {movie.movie_genres} · {movie.movie_cens} · {movie.movie_length} · 
                            <a className="text-[#0a57ca] hover:underline" href="#">Trailer</a>
                          </div>
                          <div className="text-[#6b7a99] text-xs leading-tight mt-1">{movie.movie_description}</div>
                        </div>
                      </div>
                      <div className="font-semibold mb-1">2D Phụ Đề Anh</div>
                      <div className="grid grid-cols-6 gap-1 text-center text-xs font-normal text-[#0a2540]">
                        {movieShowtimes.map(showtime => {
                          const isPast = new Date(`${selectedDate}T${showtime.schedule_start}`) < new Date();
                          return (
                            <button
                              key={showtime.schedule_id}
                              className={`border rounded-sm py-1 ${
                                isPast ? 'border-[#b0b8c9] opacity-50' : 'border-[#0a57ca] font-semibold'
                              }`}
                              disabled={isPast}
                              onClick={() => handleSelectShowtime(showtime)}
                              type="button"
                            >
                              {formatTime(showtime.schedule_start)}                              
                              <br />
                              <span className="text-[10px] font-semibold">
                                {(calculateSeatPrice(1) / 1000).toFixed(0)}K
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#e6ebf4] rounded-md p-4 text-[#aab3c2] text-sm">
                  Không có suất chiếu nào cho ngày này.
                </div>
              )
            ) : (
              <div className="bg-[#e6ebf4] rounded-md p-4 text-[#aab3c2] text-sm">
                Vui lòng chọn rạp và ngày để xem lịch chiếu.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md p-6">
          <button
            onClick={() => {
              setSelectedShowtime(null);
              setSelectedSeats([]);
              setSelectedServices([]);
              setEmail('');
            }}
            className="mb-4 bg-[#e6ebf4] text-[#0a2540] px-4 py-2 rounded-md hover:bg-[#d1d7e3]"
          >
            Quay lại
          </button>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <h3 className="font-semibold text-lg mb-4">Chọn ghế</h3>
              {renderSeats()}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Ghế đã chọn:</h4>
                {selectedSeats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(seat => (
                      <span
                        key={seat.seat_id}
                        className="bg-[#e6ebf4] text-[#0a2540] px-3 py-1 rounded-full text-xs"
                      >
                        {seat.seat} - {getSeatTypeName(seat.type)} ({seat.price.toLocaleString()} VNĐ)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#aab3c2] text-sm">Chưa có ghế nào được chọn</p>
                )}
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="bg-[#e6ebf4] rounded-md p-6 sticky top-4">
                <h3 className="font-semibold text-lg mb-4">Combo bắp nước</h3>
                {services.length > 0 ? (
                  <div className="space-y-4">
                    {services.map(service => (
                      <div key={service.service_id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-sm">{service.name}</h4>
                            <p className="text-xs text-[#6b7a99]">{service.price.toLocaleString()} VNĐ</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSelectService(service, 'decrease')}
                              className="w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-[#d1d7e3] text-sm"
                              disabled={!selectedServices.find(s => s.service_id === service.service_id)?.quantity}
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-sm">
                              {selectedServices.find(s => s.service_id === service.service_id)?.quantity || 0}
                            </span>
                            <button
                              onClick={() => handleSelectService(service, 'increase')}
                              className="w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-[#d1d7e3] text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#aab3c2] text-sm">Không có dịch vụ nào</p>
                )}
                {selectedServices.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">Dịch vụ đã chọn:</h4>
                    <ul className="space-y-1 text-sm">
                      {selectedServices.map(service => (
                        <li key={service.service_id} className="flex justify-between">
                          <span>{service.name} x{service.quantity}</span>
                          <span>{(service.price * service.quantity).toLocaleString()} VNĐ</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between font-semibold mb-2">
                    <span>Tổng cộng:</span>
                    <span>{calculateTotal().toLocaleString()} VNĐ</span>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-[#0a2540] mb-1">Email nhận vé</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-1 focus:ring-[#0a57ca]"
                      placeholder="Nhập email của bạn"
                      required
                    />
                  </div>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={selectedSeats.length === 0}
                    className={`w-full mt-4 py-2 rounded-md text-white font-semibold transition-all duration-200 ${
                      selectedSeats.length === 0 ? 'bg-[#b0b8c9] cursor-not-allowed' : 'bg-[#0a57ca] hover:bg-[#0847a8]'
                    }`}
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFlow;