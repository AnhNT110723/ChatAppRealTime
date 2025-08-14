// src/components/LoginRegisterForm.js
// This component handles the UI for user login and registration.

import React from "react";
// The import path has been corrected to handle the file structure.
import { loginUser, registerUser } from "../services/api";

const LoginRegisterForm = ({
  username,
  setUsername,
  password,
  setPassword,
  isRegistering,
  setIsRegistering,
  setIsLoggedIn
}) => {

  const handleLogin = async () => {
    try {
      await loginUser(username, password);
      setIsLoggedIn(true);
      localStorage.setItem("username", username);
      setPassword("");
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await registerUser(username, password);
      console.log("Đăng ký thành công, hãy đăng nhập");
      setIsRegistering(false);
      setPassword("");
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      isRegistering ? handleRegister() : handleLogin();
    }
  };

  return (
    <div className="flex-1 bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isRegistering ? "Đăng ký" : "Đăng nhập"}
        </h2>
        <input
          type="text"
          placeholder="Tên người dùng"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <button
          onClick={isRegistering ? handleRegister : handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {isRegistering ? "Đăng ký" : "Đăng nhập"}
        </button>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full bg-gray-300 p-3 rounded-lg hover:bg-gray-400"
        >
          {isRegistering ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
        </button>
      </div>
    </div>
  );
};

export default LoginRegisterForm;
