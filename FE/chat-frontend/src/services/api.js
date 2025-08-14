// src/services/api.js
// This file handles all communication with your Node.js backend.

const API_BASE_URL = "http://localhost:5000";

/**
 * Handles user login.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - A promise that resolves with user data or rejects with an error.
 */
export const loginUser = async (username, password) => {
  if (!username.trim() || !password.trim()) {
    throw new Error("Vui lòng nhập cả tên người dùng và mật khẩu");
  }

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Đăng nhập thất bại");
  }

  return data;
};

/**
 * Handles user registration.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - A promise that resolves with a success message or rejects with an error.
 */
export const registerUser = async (username, password) => {
  if (!username.trim() || !password.trim()) {
    throw new Error("Vui lòng nhập cả tên người dùng và mật khẩu");
  }

  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Đăng ký thất bại");
  }

  return data;
};

