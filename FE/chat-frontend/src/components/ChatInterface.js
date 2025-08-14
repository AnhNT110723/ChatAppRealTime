// src/components/ChatInterface.js
// This component displays the main chat interface, including user lists and message area.

import React, { useState } from "react";

const ChatInterface = ({
  username,
  users,
  groups,
  messages,
  sendMessage,
  logout,
  selectChat,
  selectedRecipient,
  isGroupChat,
}) => {
  const [message, setMessage] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);

  const handleSendMessage = () => {
    sendMessage(selectedRecipient, message, isGroupChat);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  
  const createGroup = () => {
    if (groupName.trim() && groupMembers.length > 0) {
      // Logic for creating group will be handled here (using a function passed from App.js)
      setShowCreateGroup(false);
      setGroupName("");
      setGroupMembers([]);
    }
  };

  const toggleGroupMember = (member) => {
    setGroupMembers((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 w-full max-w-4xl">
      {/* Sidebar for users and groups */}
      <div className="w-full sm:w-64 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bạn bè online</h2>
        <ul className="space-y-2 mb-6">
          {users
            .filter((u) => u.username !== username)
            .map((user) => (
              <li
                key={user.id}
                onClick={() => selectChat(user.username, false)}
                className={`cursor-pointer text-gray-700 hover:bg-gray-100 p-2 rounded ${
                  selectedRecipient === user.username && !isGroupChat
                    ? "bg-blue-100"
                    : ""
                }`}
              >
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {user.username}
              </li>
            ))}
        </ul>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Nhóm</h2>
        <ul className="space-y-2">
          {groups.map((group) => (
            <li
              key={group.id}
              onClick={() => selectChat(group.id, true)}
              className={`cursor-pointer text-gray-700 hover:bg-gray-100 p-2 rounded ${
                selectedRecipient === group.id && isGroupChat ? "bg-blue-100" : ""
              }`}
            >
              {group.name} ({group.members.length} thành viên)
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 mt-4"
        >
          Tạo nhóm mới
        </button>
        <button
          onClick={logout}
          className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 mt-4"
        >
          Đăng xuất
        </button>
      </div>

      {/* Main chat area */}
      <div className="flex-1 bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Chat với{" "}
            {isGroupChat
              ? groups.find((g) => g.id === selectedRecipient)?.name
              : selectedRecipient}
          </h1>
          <div className="h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
            {messages.map((msg, index) => (
              <div key={index} className="mb-3 flex flex-col">
                <span className="font-semibold text-gray-800">
                  {msg.user === "Hệ thống" ? (
                    <span className="text-gray-500 italic">{msg.text}</span>
                  ) : (
                    <>
                      <span className="text-blue-700">{msg.user}</span>:{" "}
                      {msg.text}
                    </>
                  )}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
          {selectedRecipient && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nhập tin nhắn"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Gửi
              </button>
            </div>
          )}
        </div>
      </div>
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Tạo nhóm mới</h2>
            <input
              type="text"
              placeholder="Tên nhóm"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-3 border rounded mb-4"
            />
            <h3 className="font-semibold mb-2">Chọn thành viên</h3>
            <ul className="space-y-2 mb-4">
              {users
                .filter((u) => u.username !== username)
                .map((user) => (
                  <li key={user.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groupMembers.includes(user.username)}
                      onChange={() => toggleGroupMember(user.username)}
                      className="mr-2"
                    />
                    {user.username}
                  </li>
                ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={createGroup}
                className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Tạo
              </button>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
