import React, { useState } from "react";

const RegisterModal = ({ isOpen, onClose, onSwitch }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const payload = {
      username,
      email,
      password,
      birthday,
    };

    try {
      const response = await fetch("http://localhost:5000/user/sigin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.user?.status === 200) {
        alert("Đăng ký thành công!");
        onClose();
      } else {
        setErrorMessage(data?.user?.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      id="register-modal"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg animate-fadeIn relative">
        <h2 className="text-2xl font-bold mb-4 text-center text-orange-500">
          Đăng Ký
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm">Họ và tên:</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Email:</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Ngày sinh:</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              required
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          {errorMessage && (
            <div className="text-red-600 text-sm text-center">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            Đăng Ký
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          Đã có tài khoản?{" "}
          <button
            onClick={onSwitch}
            className="text-orange-500 hover:underline"
          >
            Đăng nhập
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

export default RegisterModal;
