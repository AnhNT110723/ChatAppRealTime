// src/hooks/useChatSocket.js
// This custom hook encapsulates all Socket.IO logic,
// making the main App component cleaner and more focused.

import { useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
});

const useChatSocket = (
  username,
  isLoggedIn,
  selectedRecipient,
  isGroupChat,
  setMessages,
  setUsers,
  setGroups
) => {
  useEffect(() => {
    // Connect to the socket and emit a join event if already logged in.
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (isLoggedIn && username) {
        socket.emit("join", username);
      }
    });

    // Handle incoming messages
    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      const currentRoomId = isGroupChat
        ? selectedRecipient
        : [username, selectedRecipient].sort().join("-");

      if (msg.room === currentRoomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Handle online users list
    socket.on("users", (onlineUsers) => {
      console.log("Received users:", onlineUsers);
      setUsers(onlineUsers);
    });

    // Handle group list updates
    socket.on("groups", (allGroups) => {
      console.log("Received groups:", allGroups);
      setGroups(allGroups);
    });

    // Handle message history for a specific chat
    socket.on("messageHistory", (history) => {
      console.log("Received message history:", history);
      setMessages(history);
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });

    // Cleanup function to remove event listeners on unmount
    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("users");
      socket.off("groups");
      socket.off("messageHistory");
      socket.off("connect_error");
    };
  }, [username, isLoggedIn, selectedRecipient, isGroupChat, setMessages, setUsers, setGroups]);

  // Expose socket and key functions from the hook
  return {
    socket,
    sendMessage: (recipient, message, isGroup) => {
      if (message.trim() && recipient) {
        socket.emit("sendMessage", {
          recipient,
          message,
          isGroup,
        });
      }
    },
    createGroup: (groupName, members) => {
      if (groupName.trim() && members.length > 0) {
        socket.emit("createGroup", { groupName, members });
      }
    },
    getMessageHistory: (room, isGroup) => {
      socket.emit("getMessageHistory", { room, isGroup });
    },
    logout: () => {
      localStorage.removeItem("username");
      socket.disconnect();
      socket.connect();
    }
  };
};

export default useChatSocket;
