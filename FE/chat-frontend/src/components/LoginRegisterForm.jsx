import React from "react";

const LoginRegisterForm = ({
  username,
  setUsername,
  password,
  setPassword,
  isRegistering,
  setIsRegistering,
  onLogin,
  onRegister,
  handleKeyPress
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {isRegistering ? "Đăng ký" : "Đăng nhập"}
      </h2>
      <div className="w-full space-y-4">
        <input
          type="text"
          placeholder="Tên người dùng"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <button
          onClick={isRegistering ? onRegister : onLogin}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-semibold"
        >
          {isRegistering ? "Đăng ký" : "Đăng nhập"}
        </button>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full text-gray-600 bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          {isRegistering ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
        </button>
      </div>
    </div>
  );
};

export default LoginRegisterForm;
