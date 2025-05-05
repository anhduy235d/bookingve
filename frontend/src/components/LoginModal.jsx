import React, { useState } from "react";

const LoginModal = ({ isOpen, onClose, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data?.user?.status === 200) {
        //luu user
        localStorage.setItem("user", JSON.stringify({ email }));

        alert(data.user.message || "Đăng nhập thành công!");
        onClose();
        window.location.reload();
      } else {
        setError(data?.user?.message || "Đăng nhập thất bại.");
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      id="login-modal"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg animate-fadeIn relative">
        <h2 className="text-2xl font-bold mb-4 text-center text-orange-500">
          Đăng Nhập
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm">Email:</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Mật khẩu:</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              loading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          Chưa có tài khoản?{" "}
          <button
            onClick={onSwitch}
            className="text-orange-500 hover:underline"
          >
            Đăng ký
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-600 hover:text-red-500 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
