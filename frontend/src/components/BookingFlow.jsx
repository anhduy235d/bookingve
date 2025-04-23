import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/Admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm định dạng ngày
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

// Hàm thêm ngày
const addDaysToDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const BookingFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedCinemaBrand, setSelectedCinemaBrand] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [email, setEmail] = useState('');

  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [seats, setSeats] = useState([]);
  const [services, setServices] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [availableCinemas, setAvailableCinemas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));
  const [dateOptions, setDateOptions] = useState([]);

  const cinemaBrands = [
    { id: 'cgv', name: 'CGV', logo: 'https://gigamall.vn/data/2019/05/06/11365490_logo-cgv-500x500.jpg' },
    { id: 'lotte', name: 'Lotte Cinema', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2v8qmH8190xnZrUdMYUMy31maLk1wb9rneg&s' },
    { id: 'bhd', name: 'BHD Star Cineplex', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Logo_BHD_Star_Cineplex.png' },
  ];

  const districts = [
    'Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Quận Bình Thạnh',
    'Quận Gò Vấp', 'Quận Tân Bình', 'Thủ Đức'
  ];

  const getSeatTypeName = (type) => {
    switch(type) {
      case 2: return 'VIP';
      case 3: return 'Đôi';
      default: return 'Thường';
    }
  };

  const calculateSeatPrice = (seatType) => {
    switch(seatType) {
      case 2: return 120000;
      case 3: return 150000;
      default: return 85000;
    }
  };

  const calculateTotal = () => {
    const seatsTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const servicesTotal = selectedServices.reduce((sum, s) => sum + (s.price * (s.quantity || 0)), 0);
    return seatsTotal + servicesTotal;
  };

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = addDaysToDate(new Date(), i);
      dates.push({
        value: formatDate(date, 'yyyy-MM-dd'),
        label: formatDate(date, 'dd/MM'),
        dayOfWeek: formatDate(date, 'EEEE'),
      });
    }
    setDateOptions(dates);
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post('/list-movies', { limit: 50 });
        if (response.data.movies?.status === 200) {
          setMovies(response.data.movies.message);
        } else {
          throw new Error(response.data.movies?.message || 'Không thể lấy danh sách phim');
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách phim:', err);
        setError(err.message || 'Không thể tải danh sách phim. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (step >= 2 && selectedMovie && selectedDate) {
      const fetchAvailableCinemas = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.post('/cinemas-movies', {
            movie_id: selectedMovie.movie_id,
            schedule_date: selectedDate,
          });
          if (response.data.cinemas?.status === 200) {
            setAvailableCinemas(response.data.cinemas.message);
          } else {
            throw new Error(response.data.cinemas?.message || 'Không thể lấy danh sách rạp');
          }
        } catch (err) {
          console.error('Lỗi khi lấy danh sách rạp:', err);
          setError(err.message || 'Không thể tải danh sách rạp. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      };
      fetchAvailableCinemas();
    }
  }, [step, selectedMovie, selectedDate]);

  useEffect(() => {
    if (step === 5 && selectedCinema && selectedMovie && selectedDate && selectedCinemaBrand) {
      const fetchShowtimes = async () => {
        setLoading(true);
        setError(null);
        try {
          const cinemaInfo = availableCinemas.find(c => c.cinema_id === selectedCinema.cinema_id);
          if (!cinemaInfo) {
            throw new Error('Không tìm thấy thông tin rạp trong danh sách rạp khả dụng');
          }
          const request = {
            cinema_id: cinemaInfo.cinema_id,
            schedule_date: selectedDate,
            cinema_name: selectedCinemaBrand.name.toLowerCase(),
          };
          const response = await api.post('/Room-showtime-bycinema', request);
          if (response.data.rooms?.status === 200) {
            // Lọc suất chiếu theo movie_id
            const fetchedShowtimes = response.data.rooms.message.filter(
              showtime => showtime.movie_id === selectedMovie.movie_id
            );
            setShowtimes(fetchedShowtimes);
            if (fetchedShowtimes.length === 0) {
              setError(`Không có suất chiếu nào cho ${selectedMovie.movie_name} tại ${selectedCinema.cinema_name} vào ngày ${formatDate(selectedDate, 'dd/MM/yyyy')}.`);
            }
          } else {
            throw new Error(response.data.rooms?.message || 'Không thể lấy danh sách suất chiếu');
          }
        } catch (err) {
          console.error('Lỗi khi lấy suất chiếu:', err);
          setError(err.message || 'Không thể tải danh sách suất chiếu. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      };
      fetchShowtimes();
    }
  }, [step, selectedCinema, selectedMovie, selectedDate, selectedCinemaBrand, availableCinemas]);

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setSelectedCinemaBrand(null);
    setSelectedDistrict(null);
    setSelectedCinema(null);
    setStep(2);
  };

  const handleSelectCinemaBrand = (brand) => {
    setSelectedCinemaBrand(brand);
    setSelectedDistrict(null);
    setSelectedCinema(null);
    setCinemas([]);
    setStep(3);
  };

  const handleSelectDistrict = async (district) => {
    setSelectedDistrict(district);
    setSelectedCinema(null);
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/search/cinemas-district', {
        cinema_name: selectedCinemaBrand.name.toLowerCase(),
        district: district,
      });
      if (response.data.cinemas?.status === 200) {
        const districtCinemas = response.data.cinemas.message;
        setCinemas(districtCinemas);
        setStep(4);
      } else {
        throw new Error(response.data.cinemas?.message || 'Không thể lấy danh sách rạp');
      }
    } catch (err) {
      console.error('Lỗi khi lấy rạp:', err);
      setError(err.message || 'Không thể tải danh sách rạp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCinema = (cinema) => {
    setSelectedCinema(cinema);
    setStep(5);
  };

  const handleSelectShowtime = async (showtime) => {
    setLoading(true);
    setError(null);
    try {
      const scheduleId = showtime.schedule_id;

      const seatsRes = await api.post('/checking-seats', {
        schedule_id: scheduleId,
        room_id: showtime.room_id,
      });

      if (!seatsRes.data?.schedule || seatsRes.data.schedule.status !== 200) {
        throw new Error(seatsRes.data?.schedule?.message || 'Dữ liệu ghế không hợp lệ');
      }

      const seatsData = seatsRes.data.schedule.message;
      const formattedSeats = seatsData.map(seat => ({
        seat_id: seat.seat_id,
        seat: `${seat.hang}${seat.so}`.toUpperCase(),
        seat_status: seat.seat_status || 'no',
        type: seat.loai,
        price: calculateSeatPrice(seat.loai),
      }));

      setSeats(formattedSeats);
      setSelectedSchedule({
        schedule_id: scheduleId,
        room_id: showtime.room_id,
        schedule_date: selectedDate,
        schedule_start: showtime.schedule_start,
        schedule_end: showtime.schedule_end,
      });

      try {
        const servicesRes = await api.get('/list-services/combo');
        setServices(servicesRes.data.services?.message || []);
      } catch (err) {
        console.error('Lỗi khi lấy dịch vụ:', err);
        setServices([]);
      }

      setStep(6);
    } catch (err) {
      console.error('Lỗi khi chọn suất chiếu:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi chọn suất chiếu');
    } finally {
      setLoading(false);
    }
  };

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
        quantity: service.quantity || 1
      }));

      const bookingPromises = selectedSeats.map(seat => 
        api.post('/booking_seat', {
          info: {
            user_id: 1,
            schedule_id: selectedSchedule.schedule_id,
            seat_id: seat.seat_id,
            price: seat.price,
            seat_status: 1,
            room_id: selectedSchedule.room_id,
            services: formattedServices,
            email: email
          }
        })
      );

      const results = await Promise.all(bookingPromises);

      const failedBookings = results.filter(
        res => !res.data?.ticket || res.data.ticket.status !== 200
      );

      if (failedBookings.length > 0) {
        const errorMessages = failedBookings.map(
          res => res.data?.ticket?.message || 'Lỗi không xác định'
        );
        throw new Error(`Đặt ghế không thành công: ${errorMessages.join(', ')}`);
      }

      navigate('/payment', {
        state: { 
          movie: selectedMovie,
          cinema: selectedCinema,
          schedule: selectedSchedule,
          seats: selectedSeats,
          services: selectedServices,
          total: calculateTotal(),
          bookingResults: results.map(res => res.data.ticket.message),
          email: email
        }
      });

    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.ticket?.message || err.message || 'Lỗi khi đặt ghế');
      
      if (err.response?.data?.ticket?.message?.includes('waiting list')) {
        setSeats(prevSeats => 
          prevSeats.map(seat => 
            selectedSeats.some(s => s.seat_id === seat.seat_id)
              ? { ...seat, seat_status: 'waiting' }
              : seat
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);

      if (prevStep <= 5) setSelectedSchedule(null);
      if (prevStep <= 4) setSelectedCinema(null);
      if (prevStep <= 3) {
        setSelectedDistrict(null);
        setCinemas([]);
      }
      if (prevStep <= 2) setSelectedCinemaBrand(null);
      if (prevStep <= 1) setSelectedMovie(null);

      setSelectedSeats([]);
      setSelectedServices([]);
      setEmail('');
      setError(null);
    }
  };

  const renderSeats = () => {
    if (loading) return <div className="text-center py-4">Đang tải thông tin ghế...</div>;
    if (!seats.length) return <div className="text-center py-4 text-red-500">Không có ghế nào để hiển thị</div>;

    const seatsByRow = seats.reduce((acc, seat) => {
      const row = seat.seat[0];
      if (!acc[row]) acc[row] = [];
      acc[row].push(seat);
      return acc;
    }, {});

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-4 bg-gray-200 text-gray-800 font-bold mb-4 rounded">MÀN HÌNH</div>
        
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-lg">
            {Object.entries(seatsByRow).map(([row, rowSeats]) => (
              <div key={row} className="flex items-center mb-3">
                <div className="w-8 font-bold text-center text-gray-700">{row}</div>
                <div className="flex flex-wrap gap-1 flex-1 justify-center">
                  {rowSeats.map(seat => {
                    const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);
                    const isBooked = seat.seat_status === 'yes';
                    const isWaiting = seat.seat_status === 'waiting';
                    const isCouple = seat.type === 3;
                    
                    let seatClass = 'rounded text-xs font-medium transition-all duration-200 flex items-center justify-center';
                    seatClass += isCouple ? ' w-16 h-8' : ' w-8 h-8';
                    if (isBooked) {
                      seatClass += ' bg-gray-300 cursor-not-allowed';
                    } else if (isWaiting) {
                      seatClass += ' bg-yellow-300 cursor-not-allowed';
                    } else if (isSelected) {
                      seatClass += ' bg-blue-600 text-white';
                    } else {
                      seatClass += seat.type === 2 ? ' bg-purple-100 hover:bg-purple-200' 
                                : seat.type === 3 ? ' bg-pink-100 hover:bg-pink-200' 
                                : ' bg-gray-100 hover:bg-gray-200';
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
        
        <div className="flex flex-wrap justify-center gap-4 mt-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 mr-2 rounded"></div>
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
            <div className="w-4 h-4 bg-gray-300 mr-2 rounded"></div>
            <span className="text-xs">Đã đặt</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 mr-2 rounded"></div>
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Mua vé theo rạp</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-lg mb-4">Khu vực Hồ Chí Minh</h3>
            <ul className="space-y-2">
              {districts.map(district => (
                <li key={district}>
                  <button
                    className={`w-full text-left py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-200
                      ${selectedDistrict === district ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => handleSelectDistrict(district)}
                    disabled={step < 3}
                  >
                    <span>{district}</span>
                    <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {district === 'Quận 1' ? '3' : district === 'Quận 7' ? '4' : ''}
                      {district === 'Quận 3' ? '1' : district === 'Quận 10' ? '1' : ''}
                      {district === 'Quận Gò Vấp' ? '1' : district === 'Quận Bình Thạnh' ? '2' : ''}
                      {district === 'Quận Tân Bình' ? '1' : district === 'Thủ Đức' ? '4' : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full md:w-3/4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  if (step === 6) setStep(5);
                }} 
                className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
              >
                Thử lại
              </button>
            </div>
          )}

          {loading ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-sm shadow-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mr-3"></div>
                  <div>
                    <h3 className="font-bold">Đang xử lý</h3>
                    <p className="text-sm text-gray-600">
                      {step === 5 ? 'Đang tải suất chiếu...' : 'Đang đặt vé...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {step > 1 && (
                <div className="mb-4">
                  <button
                    onClick={handleGoBack}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    Quay lại
                  </button>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Chọn phim</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {movies.map(movie => (
                      <div 
                        key={movie.movie_id}
                        className={`group relative rounded-lg overflow-hidden cursor-pointer shadow hover:shadow-md transition-all duration-200
                          ${selectedMovie?.movie_id === movie.movie_id ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleSelectMovie(movie)}
                      >
                        <div className="aspect-[2/3] bg-gray-100 relative">
                          <img 
                            src={movie.movie_poster || 'https://via.placeholder.com/300x450'} 
                            alt={movie.movie_name}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/300x450'}
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                            <h3 className="text-white font-semibold text-sm truncate">{movie.movie_name}</h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Chọn hệ thống rạp</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {cinemaBrands.map(brand => (
                      <div
                        key={brand.id}
                        className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 flex items-center gap-3
                          ${selectedCinemaBrand?.id === brand.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => handleSelectCinemaBrand(brand)}
                      >
                        <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain" />
                        <h3 className="font-semibold">{brand.name}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Chọn quận - {selectedCinemaBrand.name}</h2>
                  <p className="text-gray-500">Vui lòng chọn quận từ danh sách bên trái.</p>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Chọn rạp - {selectedCinemaBrand.name} - {selectedDistrict}</h2>
                  {cinemas.length > 0 ? (
                    <div className="space-y-3">
                      {cinemas.map(cinema => (
                        <div
                          key={cinema.cinema_id}
                          className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 flex items-center gap-3
                            ${selectedCinema?.cinema_id === cinema.cinema_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                          onClick={() => handleSelectCinema(cinema)}
                        >
                          <img 
                            src={cinemaBrands.find(brand => cinema.cinema_name.toLowerCase().includes(brand.name.toLowerCase()))?.logo || 'https://via.placeholder.com/40'} 
                            alt={cinema.cinema_name} 
                            className="w-10 h-10 object-contain"
                          />
                          <div>
                            <h3 className="font-semibold">{cinema.cinema_name}</h3>
                            <p className="text-sm text-gray-600">{cinema.cinema_address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Không có rạp nào trong khu vực này.</p>
                  )}
                </div>
              )}

              {step === 5 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold">{selectedMovie.movie_name}</h2>
                    <p className="text-gray-600">{selectedCinema.cinema_name}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {dateOptions.map(date => (
                        <button
                          key={date.value}
                          className={`py-2 px-4 rounded-lg whitespace-nowrap transition-all duration-200 border
                            ${selectedDate === date.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white hover:bg-gray-100'}`}
                          onClick={() => setSelectedDate(date.value)}
                        >
                          <div className="text-center">
                            <p className="text-sm">{date.dayOfWeek.slice(0, 3)}</p>
                            <p className="text-lg font-semibold">{date.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải suất chiếu...</p>
                      </div>
                    ) : showtimes.length > 0 ? (
                      <div className="space-y-4">
                        {showtimes.map(showtime => (
                          <div key={showtime.schedule_id} className="border rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <img 
                                src={cinemaBrands.find(brand => selectedCinema.cinema_name.toLowerCase().includes(brand.name.toLowerCase()))?.logo || 'https://via.placeholder.com/40'} 
                                alt={selectedCinema.cinema_name} 
                                className="w-8 h-8 object-contain mr-2"
                              />
                              <h3 className="font-semibold">{selectedCinema.cinema_name} - Phòng {showtime.room_name}</h3>
                            </div>
                            <div className="border-t pt-2">
                              <p className="text-sm text-gray-600 mb-2">{selectedMovie.movie_name} - 2D Phụ đề</p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="py-2 px-4 border rounded-lg hover:bg-gray-100 transition-all duration-200"
                                  onClick={() => handleSelectShowtime(showtime)}
                                >
                                  <span className="font-semibold">{showtime.schedule_start} - {showtime.schedule_end}</span>
                                  <span className="text-sm text-gray-500 ml-2">{calculateSeatPrice(1).toLocaleString()} VNĐ</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600 font-medium">
                          Không có suất chiếu nào cho {selectedMovie.movie_name} tại {selectedCinema.cinema_name} vào ngày {formatDate(selectedDate, 'dd/MM/yyyy')}.
                        </p>
                        <p className="text-gray-500 mt-2">
                          Vui lòng chọn ngày khác hoặc quay lại để chọn rạp/phim khác.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold">{selectedMovie.movie_name}</h2>
                    <p className="text-gray-600">
                      {selectedCinema.cinema_name} • {formatDate(selectedDate, 'dd/MM/yyyy')} • {selectedSchedule.schedule_start}
                    </p>
                  </div>

                  <div className="lg:flex gap-8">
                    <div className="lg:w-2/3 mb-8 lg:mb-0">
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-lg mb-4">Chọn ghế</h3>
                        {renderSeats()}

                        <div className="mt-6">
                          <h4 className="font-semibold mb-2">Ghế đã chọn:</h4>
                          {selectedSeats.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedSeats.map(seat => (
                                <span key={seat.seat_id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                                  {seat.seat} - {getSeatTypeName(seat.type)} ({seat.price.toLocaleString()} VNĐ)
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Chưa có ghế nào được chọn</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-1/3">
                      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                        <h3 className="font-semibold text-lg mb-4">Combo bắp nước</h3>

                        {services.length > 0 ? (
                          <div className="space-y-4">
                            {services.map(service => (
                              <div key={service.service_id} className="border-b pb-4 last:border-b-0">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium text-sm">{service.name}</h4>
                                    <p className="text-xs text-gray-600">{service.price.toLocaleString()} VNĐ</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => handleSelectService(service, 'decrease')}
                                      className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm"
                                      disabled={!selectedServices.find(s => s.service_id === service.service_id)?.quantity}
                                    >
                                      -
                                    </button>
                                    <span className="w-6 text-center text-sm">
                                      {selectedServices.find(s => s.service_id === service.service_id)?.quantity || 0}
                                    </span>
                                    <button 
                                      onClick={() => handleSelectService(service, 'increase')}
                                      className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Không có dịch vụ nào</p>
                        )}

                        {selectedServices.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium text-sm mb-2">Dịch vụ đã chọn:</h4>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email nhận vé</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-blue-500"
                              placeholder="Nhập email của bạn"
                              required
                            />
                          </div>

                          <button
                            onClick={handleConfirmBooking}
                            disabled={selectedSeats.length === 0}
                            className={`w-full mt-4 py-2 rounded-lg text-white font-medium transition-all duration-200
                              ${selectedSeats.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                          >
                            Thanh toán
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;