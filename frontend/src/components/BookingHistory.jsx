import React, { useState, useEffect } from "react";

const BookingHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookingHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/Admin/info-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: 9, user_id: 1 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.sticket && data.sticket.status === 200) {
        setTickets(data.sticket.message);
      } else {
        setError("Không có dữ liệu hoặc lỗi từ server");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  const formatCurrency = (amount) => amount.toLocaleString("vi-VN");

  return (
    <div
      style={{
        maxWidth: "800px",
        minHeight: "80vh", // đảm bảo giao diện cao hơn
        margin: "2rem auto",
        padding: "1rem",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Lịch sử vé đã đặt
      </h1>

      {loading && <p style={{ textAlign: "center" }}>Đang tải lịch sử vé...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && !error && tickets.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                Tên người dùng
              </th>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                Số ghế
              </th>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                Tên phim
              </th>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                Giá vé
              </th>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                Giá thực phẩm
              </th>
              <th style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                Tổng cộng
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr key={index}>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                  {ticket.username}
                </td>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                  {ticket.seat}
                </td>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                  {ticket.movie_name}
                </td>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                  {formatCurrency(ticket.ticket_price)} VND
                </td>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                  {formatCurrency(ticket.price_food)} VND
                </td>
                <td style={{ padding: "0.75rem", border: "1px solid #ddd" }}>
                  {formatCurrency(ticket.totally)} VND
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && tickets.length === 0 && (
        <p style={{ textAlign: "center" }}>Chưa có vé nào được đặt.</p>
      )}
    </div>
  );
};

export default BookingHistory;
