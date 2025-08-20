import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, username, getInitials }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" id="messagesContainer">
      {messages.map((msg, index) => (
        <div 
          key={index} 
          className={`flex items-start space-x-3 message-bubble ${
            msg.user === username ? "justify-end" : ""
          }`}
        >
          {msg.user !== username && (
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">{getInitials(msg.user)}</span>
            </div>
          )}
          <div className="flex flex-col space-y-1 max-w-xs">
            {/* {msg.user !== username && (
              <span className="font-medium text-xs text-gray-700 ml-1">{msg.user}</span>
            )} */}
            <div className={`rounded-2xl rounded-${msg.user === username ? 'tr' : 'tl'}-md px-4 py-2 shadow-sm ${
              msg.user === username ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-white"
            }`}>
              <p className={`break-words ${msg.user === username ? "text-white" : "text-gray-800"}`}>
                {msg.text}
              </p>
            </div>
            {/* <span className={`text-xs text-gray-500 ${msg.user === username ? "mr-2 text-right" : "ml-2"}`}>
              {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span> */}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
