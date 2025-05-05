import React, { useState, useEffect } from "react";

export default function AccountManagement() {
  const [user, setUser] = useState({
    email: "",
    username: "",
    fullname: "",
    birthday: "",
    gender: "1",
    city: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const email = storedUser?.email || "ngohieukien15@gmail.com";

  useEffect(() => {
    if (!email) {
      setError("Không có thông tin người dùng. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/user/info-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const result = await response.json();
        if (result.user?.status === 200 && Array.isArray(result.user.message)) {
          const userData = result.user.message[0];
          setUser({
            email: userData.email || "",
            username: userData.username || "",
            fullname: userData.fullname || "",
            birthday: userData.birthday?.substring(0, 10) || "",
            gender: userData.gender?.toString() || "1",
            city: userData.city || "",
            phone: userData.phone || "",
          });
        } else {
          setError("Không tìm thấy thông tin người dùng.");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setError("Có lỗi xảy ra khi lấy thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/user/update/user/${email}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user.username,
            fullname: user.fullname,
            birthday: user.birthday,
            gender: user.gender,
            city: user.city,
            phone: user.phone,
          }),
        }
      );

      const result = await response.json();
      if (result.user?.status === 200) {
        alert("Cập nhật thành công!");
        setIsEditing(false);
      } else {
        alert("Cập nhật thất bại: " + (result.user?.message || "Không rõ lỗi"));
      }
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu:", err);
      alert("Có lỗi xảy ra khi gửi yêu cầu: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Đang tải dữ liệu...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="p-6 bg-blue-600 text-white text-center text-3xl font-bold">
        Quản lý tài khoản
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-10 space-y-8">
          {/* Header + Nút chỉnh sửa */}
          <div className="flex items-center justify-between px-4">
            <div className="text-2xl font-semibold text-gray-700">
              Thông tin người dùng
            </div>
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-base font-semibold"
              >
                Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={handleSaveClick}
                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-base font-semibold"
              >
                Lưu thay đổi
              </button>
            )}
          </div>

          {/* Nội dung hiển thị và chỉnh sửa (cùng bố cục) */}
          <div className="grid grid-cols-2 gap-6 text-base text-gray-800 px-4">
            <div>
              <label className="block font-medium">Email:</label>
              <div className="mt-1">{user.email}</div>
            </div>

            <div>
              <label className="block font-medium">Tên đăng nhập:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <div className="mt-1">{user.username}</div>
              )}
            </div>

            <div>
              <label className="block font-medium">Họ và tên:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullname"
                  value={user.fullname}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <div className="mt-1">{user.fullname}</div>
              )}
            </div>

            <div>
              <label className="block font-medium">Ngày sinh:</label>
              {isEditing ? (
                <input
                  type="date"
                  name="birthday"
                  value={user.birthday}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <div className="mt-1">
                  {new Date(user.birthday).toLocaleDateString()}
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium">Giới tính:</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={user.gender}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="1">Nam</option>
                  <option value="0">Nữ</option>
                </select>
              ) : (
                <div className="mt-1">{user.gender === "1" ? "Nam" : "Nữ"}</div>
              )}
            </div>

            <div>
              <label className="block font-medium">Số điện thoại:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <div className="mt-1">{user.phone}</div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block font-medium">Thành phố:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={user.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <div className="mt-1">{user.city}</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
