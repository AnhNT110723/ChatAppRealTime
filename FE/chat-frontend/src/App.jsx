import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// The socket.io connection is initialized outside the component to avoid re-creation on re-renders.
const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
});

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);

  const messagesEndRef = useRef(null);

  // This effect runs once on mount to check for a logged-in user in localStorage.
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
      socket.emit("join", storedUsername);
    }
  }, []);

  // This effect handles all real-time socket events.
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (isLoggedIn && username) {
        socket.emit("join", username);
      }
    });

    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      // Check if the received message belongs to the current chat room
      const currentRoomId = isGroupChat
        ? selectedRecipient
        : [username, selectedRecipient].sort().join("-");

      if (msg.room === currentRoomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("users", (onlineUsers) => {
      console.log("Received users:", onlineUsers);
      setUsers(onlineUsers);
    });

    socket.on("groups", (allGroups) => {
      console.log("Received groups:", allGroups);
      setGroups(allGroups);
    });

    socket.on("messageHistory", (history) => {
      console.log("Received message history:", history);
      setMessages(history);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
      setIsLoggedIn(false);
    });

    // Clean up event listeners on component unmount or state change
    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("users");
      socket.off("groups");
      socket.off("messageHistory");
      socket.off("connect_error");
    };
  }, [username, selectedRecipient, isGroupChat, isLoggedIn]);

  // This effect automatically scrolls to the latest message.
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle user login
  const login = async () => {
    if (username.trim() && password.trim()) {
      try {
        const response = await fetch("http://localhost:5000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
          setIsLoggedIn(true);
          localStorage.setItem("username", username);
          socket.emit("join", username);
          setPassword("");
        } else {
          // Use a message box instead of alert()
          alert(data.message);
        }
      } catch (error) {
        alert("Lỗi server: " + error);
      }
    } else {
      alert("Vui lòng nhập cả tên người dùng và mật khẩu");
    }
  };

  // Handle user registration
  const register = async () => {
    if (username.trim() && password.trim()) {
      try {
        const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Đăng ký thành công, hãy đăng nhập");
          setIsRegistering(false);
          setPassword("");
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Lỗi server: " + error);
      }
    }
  };

  // Handle user logout
  const logout = () => {
    localStorage.removeItem("username");
    socket.disconnect();
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setUsers([]);
    setGroups([]);
    setMessages([]);
    setSelectedRecipient(null);
    socket.connect();
  };

  // Handle sending a message
  const sendMessage = () => {
    if (message.trim() && selectedRecipient) {
      const room = isGroupChat
        ? selectedRecipient
        : [username, selectedRecipient].sort().join("-");
      console.log("Sending message:", { recipient: selectedRecipient, message, isGroup: isGroupChat, room });
      socket.emit("sendMessage", {
        recipient: selectedRecipient,
        message,
        isGroup: isGroupChat,
      });
      setMessage("");
    }
  };

  // Handle creating a new group
  const createGroup = () => {
    if (groupName.trim() && groupMembers.length > 0) {
      socket.emit("createGroup", { groupName, members: [...groupMembers, username] }); // Add current user to group
      setShowCreateGroup(false);
      setGroupName("");
      setGroupMembers([]);
    }
  };

  // Handle selecting a chat
  const selectChat = (recipient, isGroup) => {
    setSelectedRecipient(recipient);
    setIsGroupChat(isGroup);
    setMessages([]);
    const room = isGroup ? recipient : [username, recipient].sort().join("-");
    socket.emit("getMessageHistory", { room, isGroup });
  };

  // Toggle group member selection in the modal
  const toggleGroupMember = (member) => {
    setGroupMembers((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    );
  };

  // Handle keyboard events (e.g., Enter key)
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (!isLoggedIn) {
        isRegistering ? register() : login();
      } else {
        sendMessage();
      }
    }
  };

  const getRecipientName = () => {
    if (!selectedRecipient) return "Chọn một cuộc trò chuyện";
    if (isGroupChat) {
      const group = groups.find((g) => g.id === selectedRecipient);
      return group ? group.name : "Nhóm không tồn tại";
    }
    return selectedRecipient;
  };
  
  // A utility function to generate a two-letter initial for an avatar
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    return parts[0][0].toUpperCase() + (parts[0][1] ? parts[0][1].toUpperCase() : "");
  };

  return (
    <div className="bg-gray-100 h-screen w-full flex items-center justify-center p-4 sm:p-6">
      <style>
        {`
        body {
          font-family: 'Inter', sans-serif;
        }
        .chat-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .message-bubble {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .online-indicator {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        `}
      </style>
      
      {!isLoggedIn ? (
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
              onClick={isRegistering ? register : login}
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
      ) : (
        <div className="flex h-full w-full max-w-6xl rounded-xl overflow-hidden shadow-2xl">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.4 0-2.73-.35-3.89-.98L7 19.5l.5-1.11C6.85 17.73 6.5 16.4 6.5 15c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5S15.04 20 12 20z"/>
                    <circle cx="9" cy="15" r="1"/>
                    <circle cx="12" cy="15" r="1"/>
                    <circle cx="15" cy="15" r="1"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">ChatApp</h1>
                  <p className="text-sm text-gray-500">Realtime Chat</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {/* Online Users List */}
                <h3 className="text-gray-500 text-sm font-semibold p-2">Bạn bè online</h3>
                {users
                  .filter((u) => u.username !== username)
                  .map((user) => (
                    <div 
                      key={user.id} 
                      onClick={() => selectChat(user.username, false)}
                      className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                        selectedRecipient === user.username && !isGroupChat ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{getInitials(user.username)}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white online-indicator"></div>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="font-semibold text-gray-800">{user.username}</h3>
                        <p className="text-sm text-green-600">Đang hoạt động</p>
                      </div>
                    </div>
                ))}
                
                {/* Groups List */}
                <h3 className="text-gray-500 text-sm font-semibold p-2 mt-4">Nhóm</h3>
                {groups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => selectChat(group.id, true)}
                    className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                      selectedRecipient === group.id && isGroupChat ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.996 2.996 0 0 0 17.06 7H16c-.8 0-1.54.37-2.01.99l-2.54 7.63H14v6h6zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H6l-2.54-7.63A2.996 2.996 0 0 0 .56 6H0v2h.56L2 14v8h6z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="font-semibold text-gray-800">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.members.length} thành viên</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* User Profile and Actions */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center space-x-3">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{getInitials(username)}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 ml-3">
                    <h3 className="font-semibold text-gray-800">{username}</h3>
                    <p className="text-sm text-green-600">Đang hoạt động</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setShowCreateGroup(true)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Tạo nhóm mới"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M16 11h-3V8c0-.55-.45-1-1-1s-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                    </button>
                    <button
                        onClick={logout}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Đăng xuất"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                    </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col chat-container">
            {/* Chat Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{getInitials(getRecipientName())}</span>
                    </div>
                    {/* Only show online indicator for single chats */}
                    {!isGroupChat && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white online-indicator"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">{getRecipientName()}</h2>
                    <p className="text-sm text-green-600">
                      {isGroupChat ? `Nhóm gồm ${groups.find(g => g.id === selectedRecipient)?.members.length} thành viên` : "Đang hoạt động"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" id="messagesContainer">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex items-start space-x-3 message-bubble ${
                    msg.user === username ? "justify-end" : ""
                  }`}
                >
                  <div className="flex flex-col space-y-1 max-w-xs">
                    {msg.user !== username && (
                      <span className="font-medium text-xs text-gray-700 ml-1">{msg.user}</span>
                    )}
                    <div className={`rounded-2xl rounded-${msg.user === username ? 'tr' : 'tl'}-md px-4 py-2 shadow-sm ${
                      msg.user === username
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : "bg-white"
                    }`}>
                      <p className={`break-words ${msg.user === username ? "text-white" : "text-gray-800"}`}>
                        {msg.text}
                      </p>
                    </div>
                    <span className={`text-xs text-gray-500 ${msg.user === username ? "mr-2 text-right" : "ml-2"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {selectedRecipient ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-500 italic">
                  Vui lòng chọn một người dùng hoặc nhóm để bắt đầu trò chuyện.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            <ul className="space-y-2 mb-4 max-h-40 overflow-y-auto border p-2 rounded">
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
                className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold"
              >
                Tạo
              </button>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400 font-semibold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
