
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import LoginRegisterForm from "./components/LoginRegisterForm.jsx";
import ChatInterface from "./components/ChatInterface.jsx";

const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
});

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [groupOptionsData, setGroupOptionsData] = useState(null);
  // Thêm state để theo dõi số lượng tin nhắn chưa đọc
  const [unreadCounts, setUnreadCounts] = useState({});

  const notificationSound = new Audio("/sounds/notification.mp3");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
      socket.emit("join", storedUsername);
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      if (isLoggedIn && username) {
        socket.emit("join", username);
      }
    });
    socket.on("message", (msg) => {
      const currentRoomId = isGroupChat
        ? selectedRecipient
        : [username, selectedRecipient].sort().join("-");

      // Cập nhật số lượng tin nhắn chưa đọc nếu tin nhắn không thuộc phòng hiện tại
      if (msg.room !== currentRoomId && msg.isNew) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.room]: (prev[msg.room] || 0) + 1,
        }));
        // Phát âm thanh thông báo cho tin nhắn mới
        if (msg.isNew) {
          // Phát âm thanh
          notificationSound.play().catch((err) => {
            console.error("Lỗi phát âm thanh:", err);
          });
        } 
      }

      // Cập nhật danh sách tin nhắn nếu tin nhắn thuộc phòng hiện tại
      if (msg.room === currentRoomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    socket.on("users", (onlineUsers) => {
      setUsers(onlineUsers);
    });
    socket.on("groups", (allGroups) => {
      setGroups(allGroups);
    });
    socket.on("messageHistory", (history) => {
      setMessages(history);
    });
    socket.on("groupDeleted", (deletedGroupId) => {
      if (selectedRecipient === deletedGroupId) {
        setSelectedRecipient(null);
        setIsGroupChat(false);
        setMessages([]);
      }
      // Xóa số lượng tin nhắn chưa đọc cho nhóm bị xóa
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[deletedGroupId];
        return newCounts;
      });
    });
    socket.on("connect_error", () => {
      setIsLoggedIn(false);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("users");
      socket.off("groups");
      socket.off("messageHistory");
      socket.off("groupDeleted");
      socket.off("connect_error");
    };
  }, [username, selectedRecipient, isGroupChat, isLoggedIn]);

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
          alert(data.message);
        }
      } catch (error) {
        alert("Lỗi server: " + error);
      }
    } else {
      alert("Vui lòng nhập cả tên người dùng và mật khẩu");
    }
  };

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
    setUnreadCounts({}); // Đặt lại số lượng tin nhắn chưa đọc khi đăng xuất
    socket.connect();
  };

  const sendMessage = (msg, recipient, isGroup) => {
    if (msg.trim() && recipient) {
      socket.emit("sendMessage", { recipient, message: msg, isGroup });
    }
  };

  const createGroup = (groupName, groupMembers) => {
    if (groupName.trim() && groupMembers.length > 0) {
      socket.emit("createGroup", { groupName, members: [...groupMembers] });
    }
  };

  const deleteGroup = (groupId) => {
    socket.emit("deleteGroup", groupId);
  };

  const addMemberToGroup = (groupId, newMember) => {
    socket.emit("addMemberToGroup", { groupId, newMember });
  };

  const kickMemberFromGroup = (groupId, memberToKick) => {
    socket.emit("kickMemberFromGroup", { groupId, memberToKick });
  };

  const selectChat = (recipient, isGroup) => {
    setSelectedRecipient(recipient);
    setIsGroupChat(isGroup);
    setMessages([]);
    const room = isGroup ? recipient : [username, recipient].sort().join("-");
    socket.emit("getMessageHistory", { room, isGroup });
    // Đặt lại số lượng tin nhắn chưa đọc cho phòng được chọn
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[room];
      return newCounts;
    });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    return (
      parts[0][0].toUpperCase() + (parts[0][1] ? parts[0][1].toUpperCase() : "")
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (!isLoggedIn) {
        isRegistering ? register() : login();
      }
    }
  };

  return (
    <div className="bg-gray-100 h-screen w-full flex items-center justify-center p-4 sm:p-6">
      <style>
        {`
        body { font-family: 'Inter', sans-serif; }
        .chat-container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .message-bubble { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .online-indicator { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .scroll-smooth { scroll-behavior: smooth; }
        `}
      </style>

      {!isLoggedIn ? (
        <LoginRegisterForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          isRegistering={isRegistering}
          setIsRegistering={setIsRegistering}
          onLogin={login}
          onRegister={register}
          handleKeyPress={handleKeyPress}
        />
      ) : (
        <ChatInterface
          username={username}
          users={users}
          groups={groups}
          selectedRecipient={selectedRecipient}
          isGroupChat={isGroupChat}
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          logout={logout}
          selectChat={selectChat}
          createGroup={createGroup}
          deleteGroup={deleteGroup}
          addMemberToGroup={addMemberToGroup}
          kickMemberFromGroup={kickMemberFromGroup}
          getInitials={getInitials}
          showCreateGroup={showCreateGroup}
          setShowCreateGroup={setShowCreateGroup}
          groupName={groupName}
          setGroupName={setGroupName}
          groupMembers={groupMembers}
          setGroupMembers={setGroupMembers}
          showGroupOptions={showGroupOptions}
          setShowGroupOptions={setShowGroupOptions}
          groupOptionsData={groupOptionsData}
          setGroupOptionsData={setGroupOptionsData}
          unreadCounts={unreadCounts} // Truyền unreadCounts vào ChatInterface
        />
      )}
    </div>
  );
}

export default App;
